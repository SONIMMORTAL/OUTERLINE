'use server'

import { createAdminClient, getServiceRoleKeyError } from '@/lib/supabase/admin'
import { mockProducts } from '@/lib/mock-data'
import { getAdminSession } from '@/lib/auth/admin'
import { CATEGORY_SLUGS, revalidateCatalog } from '@/lib/catalog'
import { skuFor, sortVariants } from '@/lib/inventory'
import { isStripeConfigured } from '@/lib/stripe'
import {
  archiveStripeProducts,
  pushProductToStripe,
  syncCatalogWithStripe,
  type StripeSyncSummary
} from '@/lib/stripe-catalog'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface ProductFields {
  title: string
  description?: string
  editorial_story?: string
  category: string
  collection?: string
  price: number
  compare_at_price?: number | null
  images: string[]
}

export interface VariantInput {
  size: string
  color: string
  sku?: string
  inventory_quantity: number
}

// Admin logins use a signed cookie rather than Supabase Auth, so the anon client is blocked by RLS.
// Every action verifies the admin session, then writes with the service-role client.
async function getWriteClient() {
  if (!(await getAdminSession())) {
    throw new Error('Your admin session has expired. Please log in again.')
  }
  const keyError = getServiceRoleKeyError()
  if (keyError) {
    throw new Error(keyError)
  }
  return createAdminClient()
}

function assertDatabaseProduct(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error('This is a built-in launch product. Change it in lib/mock-data.ts instead.')
  }
}

// Returns the cleaned columns, or throws a message for the admin.
function productColumns(fields: ProductFields) {
  const title = fields.title?.trim()
  const price = Number(fields.price)
  const compareAt = fields.compare_at_price == null || fields.compare_at_price === 0 ? null : Number(fields.compare_at_price)
  const images = (fields.images ?? []).map((image) => String(image).trim()).filter(Boolean)

  if (!title) throw new Error('Enter a product name.')
  if (!Number.isFinite(price) || price <= 0) throw new Error('Enter a price greater than $0.')
  if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt <= 0)) throw new Error('The compare-at price must be greater than $0, or left blank.')
  if (!CATEGORY_SLUGS.includes(fields.category)) throw new Error('Choose a category.')
  if (images.length === 0) throw new Error('Add at least one product photo.')

  return {
    title,
    description: fields.description?.trim() ?? '',
    editorial_story: fields.editorial_story?.trim() ?? '',
    category: fields.category,
    collection: fields.collection?.trim() || 'Outerline',
    price: Math.round(price * 100) / 100,
    compare_at_price: compareAt === null ? null : Math.round(compareAt * 100) / 100,
    images,
  }
}

function variantRows(productId: string, slug: string, variants: VariantInput[]) {
  return variants.map((v) => ({
    product_id: productId,
    size: v.size,
    color: v.color.trim(),
    sku: v.sku?.trim() || skuFor(slug, v.color.trim(), v.size),
    inventory_quantity: Math.max(0, Math.floor(Number(v.inventory_quantity) || 0)),
    vendor_id: 'PRIMARY_NYC_VENDOR',
  }))
}

// The site save has already succeeded; a Stripe problem is reported to the admin but never undoes it.
async function updateStripe(task: () => Promise<unknown>): Promise<string | undefined> {
  if (!isStripeConfigured()) return undefined
  try {
    await task()
    return undefined
  } catch (err) {
    console.error('Stripe catalog sync failed:', err)
    return `Saved on the site, but Stripe was not updated: ${err instanceof Error ? err.message : String(err)}`
  }
}

async function loadAdminProduct(supabase: ReturnType<typeof createAdminClient>, productId: string) {
  const { data } = await (supabase.from('products') as any).select('*, product_variants(*)').eq('id', productId).maybeSingle()
  return data ? { ...data, product_variants: sortVariants(data.product_variants ?? []) } : null
}

export async function createProduct(productData: ProductFields & {
  slug: string
  is_drop_active: boolean
  is_featured: boolean
  variants?: VariantInput[]
}) {
  try {
    const supabase = await getWriteClient()
    const columns = productColumns(productData)
    const slug = productData.slug?.trim() || columns.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

    const { data: newProduct, error: prodError } = await (supabase
      .from('products') as any)
      .insert({
        ...columns,
        slug,
        is_drop_active: productData.is_drop_active,
        is_featured: productData.is_featured,
      })
      .select()
      .single()

    if (prodError) {
      const message = prodError.code === '23505'
        ? `A product with the URL slug "${slug}" already exists.`
        : prodError.message
      return { success: false, error: message }
    }

    if (productData.variants && productData.variants.length > 0) {
      const { error: variantError } = await (supabase.from('product_variants') as any)
        .insert(variantRows(newProduct.id, slug, productData.variants))

      if (variantError) {
        revalidateCatalog()
        return {
          success: false,
          error: `Product saved, but its variants were rejected: ${variantError.message}`,
          data: await loadAdminProduct(supabase, newProduct.id),
        }
      }
    }

    revalidateCatalog()
    const warning = await updateStripe(() => pushProductToStripe(newProduct.id))
    return { success: true, data: await loadAdminProduct(supabase, newProduct.id), warning }
  } catch (err: any) {
    console.error('Error creating product:', err)
    return { success: false, error: err?.message || 'Failed to create product' }
  }
}

// The admin edit screen: product details and photos, which colors are shown, and new sizes or colors.
export async function updateProduct(productId: string, changes: {
  fields: ProductFields
  colorVisibility?: Record<string, boolean>
  newVariants?: VariantInput[]
}) {
  try {
    assertDatabaseProduct(productId)
    const supabase = await getWriteClient()
    const existing = await loadAdminProduct(supabase, productId)
    if (!existing) return { success: false, error: 'This product no longer exists. Refresh the page.' }

    const columns = productColumns(changes.fields)
    const photosChanged = JSON.stringify(columns.images) !== JSON.stringify(existing.images ?? [])

    const { error } = await (supabase.from('products') as any).update(columns).eq('id', productId)
    if (error) return { success: false, error: error.message }

    for (const [color, visible] of Object.entries(changes.colorVisibility ?? {})) {
      const { error: visibilityError } = await (supabase.from('product_variants') as any)
        .update({ is_active: visible })
        .eq('product_id', productId)
        .eq('color', color)
      if (visibilityError) {
        revalidateCatalog()
        return {
          success: false,
          error: `Details saved, but showing/hiding ${color} failed: ${visibilityError.message}. Run supabase/migrations/005_stripe_catalog_sync.sql if it hasn't been run.`,
          data: await loadAdminProduct(supabase, productId),
        }
      }
    }

    const existingKeys = new Set((existing.product_variants ?? []).map((v: any) => `${v.color}|${v.size}`.toLowerCase()))
    const additions = (changes.newVariants ?? []).filter((v) => v.color.trim())
    const duplicate = additions.find((v, i) =>
      existingKeys.has(`${v.color.trim()}|${v.size}`.toLowerCase()) ||
      additions.findIndex((o) => `${o.color.trim()}|${o.size}`.toLowerCase() === `${v.color.trim()}|${v.size}`.toLowerCase()) !== i
    )
    if (duplicate) {
      revalidateCatalog()
      return {
        success: false,
        error: `Details saved, but ${duplicate.color} / ${duplicate.size} already exists. Change its stock in the product's variant list instead.`,
        data: await loadAdminProduct(supabase, productId),
      }
    }
    if (additions.length > 0) {
      const { error: variantError } = await (supabase.from('product_variants') as any)
        .insert(variantRows(productId, existing.slug, additions))
      if (variantError) {
        revalidateCatalog()
        return {
          success: false,
          error: `Details saved, but the new sizes were rejected: ${variantError.message}`,
          data: await loadAdminProduct(supabase, productId),
        }
      }
    }

    revalidateCatalog()
    const warning = await updateStripe(() => pushProductToStripe(productId, { photosChanged }))
    return { success: true, data: await loadAdminProduct(supabase, productId), warning }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not save the product.' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    assertDatabaseProduct(productId)
    const supabase = await getWriteClient()
    const { data: target } = await (supabase.from('products') as any).select('slug').eq('id', productId).maybeSingle()
    if (target && mockProducts.some((p) => p.slug === target.slug)) {
      return { success: false, error: 'Launch products keep their photo galleries in code, so they can be hidden but not deleted. Use Hide instead.' }
    }
    // Archive first: deleting the product also deletes its Stripe links.
    const warning = await updateStripe(() => archiveStripeProducts(productId))
    await (supabase.from('product_variants') as any).delete().eq('product_id', productId)
    const { error } = await (supabase.from('products') as any).delete().eq('id', productId)
    if (error) return { success: false, error: error.message }
    revalidateCatalog()
    return { success: true, warning }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function updateProductStatus(productId: string, active: boolean, featured: boolean) {
  try {
    assertDatabaseProduct(productId)
    const supabase = await getWriteClient()
    const { error } = await (supabase.from('products') as any).update({
      is_drop_active: active,
      is_featured: featured
    }).eq('id', productId)
    if (error) return { success: false, error: error.message }
    revalidateCatalog()
    const warning = await updateStripe(() => pushProductToStripe(productId))
    return { success: true, warning }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function updateVariantStock(variantId: string, quantity: number) {
  try {
    assertDatabaseProduct(variantId)
    const supabase = await getWriteClient()
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { success: false, error: 'Stock must be a whole number of 0 or more.' }
    }
    const { error } = await (supabase.from('product_variants') as any).update({ inventory_quantity: quantity }).eq('id', variantId)
    if (error) return { success: false, error: error.message }
    revalidateCatalog()
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

// The "Sync with Stripe" button: links matching products, imports new Stripe products, and adds missing colors to Stripe.
export async function syncWithStripe(): Promise<{ success: true; summary: StripeSyncSummary } | { success: false; error: string }> {
  try {
    await getWriteClient()
    if (!isStripeConfigured()) {
      return { success: false, error: 'Stripe is not connected: STRIPE_SECRET_KEY is missing on the server.' }
    }
    return { success: true, summary: await syncCatalogWithStripe() }
  } catch (err) {
    console.error('Stripe catalog sync failed:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Stripe sync failed.' }
  }
}
