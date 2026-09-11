import { ProductsClient } from './ProductsClient'
import { mockProducts } from '@/lib/mock-data'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/admin'

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'OS']

export default async function ProductsPage() {
  await requireAdmin()
  let products: any[] = []

  try {
    const { data, error } = await createServiceClient()
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)

    products = (data ?? []).map((product: any) => ({
      ...product,
      product_variants: [...(product.product_variants ?? [])].sort((a: any, b: any) =>
        String(a.color).localeCompare(String(b.color)) || SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
      ),
    }))
  } catch (err) {
    console.error('Admin products unavailable:', err)
  }

  // Until the catalog is loaded into the database (scripts/seed-catalog.mjs), show the launch products read-only.
  if (products.length === 0) {
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
