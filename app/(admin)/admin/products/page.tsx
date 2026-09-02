import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from './ProductsClient'
import { mockProducts } from '@/lib/mock-data'
import { requireAdmin } from '@/lib/auth/admin'

export default async function ProductsPage() {
  await requireAdmin()
  let products: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false })
      
    if (data && data.length > 0) {
      products = data
    }
  } catch (err) {
    // Database schema pending
  }

  if (!products || products.length === 0) {
    products = mockProducts.map((p: any) => ({
      ...p,
      is_drop_active: p.is_drop_active !== undefined ? p.is_drop_active : true,
      is_featured: p.is_featured !== undefined ? p.is_featured : true,
      compare_at_price: p.compare_at_price || null,
      editorial_story: p.editorial_story || 'Engineered with NYC street heritage and heavyweight luxury construction.'
    }))
  }
    
  return <ProductsClient initialProducts={products} />
}
