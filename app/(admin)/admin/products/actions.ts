'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSession } from '@/lib/auth/admin'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Admin logins use a signed cookie rather than Supabase Auth, so the anon client is blocked by RLS.
// Every action verifies the admin session, then writes with the service-role client.
async function getWriteClient() {
  if (!(await getAdminSession())) {
    throw new Error('Your admin session has expired. Please log in again.')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server.')
  }
  return createAdminClient()
}

function assertDatabaseProduct(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error('This is a built-in launch product. Change it in lib/mock-data.ts instead.')
  }
}

function revalidateStorefront() {
  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath('/collections/[category]', 'page')
  revalidatePath('/products/[slug]', 'page')
}

export async function createProduct(productData: {
  title: string
  slug: string
  description?: string
  editorial_story?: string
  category: string
  collection?: string
  price: number
  compare_at_price?: number | null
  is_drop_active: boolean
  is_featured: boolean
  images: string[]
  variants?: {
    size: string
    color: string
    sku: string
    inventory_quantity: number
    vendor_id?: string
  }[]
}) {
  try {
    const supabase = await getWriteClient()

    const { data: newProduct, error: prodError } = await (supabase
      .from('products') as any)
      .insert({
        title: productData.title,
        slug: productData.slug,
        description: productData.description || '',
        editorial_story: productData.editorial_story || '',
        category: productData.category,
        collection: productData.collection || 'Brooklyn Heritage',
        price: productData.price,
        compare_at_price: productData.compare_at_price || null,
        is_drop_active: productData.is_drop_active,
        is_featured: productData.is_featured,
        images: productData.images,
      })
      .select()
      .single()

    if (prodError) {
      const message = prodError.code === '23505'
        ? `A product with the URL slug "${productData.slug}" already exists.`
        : prodError.message
      return { success: false, error: message }
    }

    if (newProduct && productData.variants && productData.variants.length > 0) {
      const variantsToInsert = productData.variants.map((v) => ({
        product_id: (newProduct as any).id,
        size: v.size,
        color: v.color,
        sku: v.sku || `${productData.slug}-${v.size}-${v.color}`.toUpperCase(),
        inventory_quantity: v.inventory_quantity || 0,
        vendor_id: v.vendor_id || 'PRIMARY_NYC_VENDOR',
      }))

      const { data: variants, error: variantError } = await (supabase.from('product_variants') as any)
        .insert(variantsToInsert)
        .select()

      if (variantError) {
        revalidateStorefront()
        return {
          success: false,
          error: `Product saved, but its variants were rejected: ${variantError.message}`,
          data: newProduct,
        }
      }
      ;(newProduct as any).product_variants = variants
    }

    revalidateStorefront()
    return { success: true, data: newProduct }
  } catch (err: any) {
    console.error('Error creating product:', err)
    return { success: false, error: err?.message || 'Failed to create product' }
  }
}

export async function updateProduct(productId: string, updates: any) {
  try {
    assertDatabaseProduct(productId)
    const supabase = await getWriteClient()
    const { error } = await (supabase.from('products') as any).update(updates).eq('id', productId)
    if (error) return { success: false, error: error.message }
    revalidateStorefront()
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function deleteProduct(productId: string) {
  try {
    assertDatabaseProduct(productId)
    const supabase = await getWriteClient()
    await (supabase.from('product_variants') as any).delete().eq('product_id', productId)
    const { error } = await (supabase.from('products') as any).delete().eq('id', productId)
    if (error) return { success: false, error: error.message }
    revalidateStorefront()
    return { success: true }
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
    revalidateStorefront()
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function updateVariantStock(variantId: string, quantity: number) {
  try {
    assertDatabaseProduct(variantId)
    const supabase = await getWriteClient()
    const { error } = await (supabase.from('product_variants') as any).update({ inventory_quantity: quantity }).eq('id', variantId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}
