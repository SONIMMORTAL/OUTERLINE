'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
    const supabase = await createClient()
    
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
      console.warn('Supabase product insert warning:', prodError.message)
      return { success: false, error: prodError.message, data: newProduct }
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

      await (supabase.from('product_variants') as any).insert(variantsToInsert)
    }

    revalidatePath('/admin/products')
    revalidatePath('/collections/all')
    revalidatePath('/')
    return { success: true, data: newProduct }
  } catch (err: any) {
    console.error('Error creating product:', err)
    return { success: false, error: err?.message || 'Failed to create product' }
  }
}

export async function updateProduct(productId: string, updates: any) {
  try {
    const supabase = await createClient()
    await (supabase.from('products') as any).update(updates).eq('id', productId)
    revalidatePath('/admin/products')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient()
    await (supabase.from('product_variants') as any).delete().eq('product_id', productId)
    await (supabase.from('products') as any).delete().eq('id', productId)
    revalidatePath('/admin/products')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function updateProductStatus(productId: string, active: boolean, featured: boolean) {
  try {
    const supabase = await createClient()
    await (supabase.from('products') as any).update({ 
      is_drop_active: active, 
      is_featured: featured 
    }).eq('id', productId)
    revalidatePath('/admin/products')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

export async function updateVariantStock(variantId: string, quantity: number) {
  try {
    const supabase = await createClient()
    await (supabase.from('product_variants') as any).update({ inventory_quantity: quantity }).eq('id', variantId)
    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}
