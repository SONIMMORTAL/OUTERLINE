import { createClient } from '@supabase/supabase-js'
import { mockProducts, type Product } from '@/lib/mock-data'

// Demo rows from supabase/seed.sql. The curated launch catalog in lib/mock-data.ts replaced them,
// so they stay hidden even if that seed was applied to the database.
const RETIRED_SEED_SLUGS = new Set([
  'been-brooklyn-two-tone-tee',
  'grey-baller-stripe-tee',
  'pink-doe-sha-hoodie',
  'so-ny-hoodie',
  'so-ny-tee',
])
const BALLER_SLUGS = ['been-brooklyn-baller', 'baller', 'baller-merch', 'grey-baller']
const CATEGORY_SLUGS = ['hoodies', 'tees', 'bottoms', 'headwear', 'accessories']

interface DatabaseVariantRow {
  id: string
  size: string | null
  color: string | null
  image?: string | null
  image_back?: string | null
  inventory_quantity: number | null
}

interface DatabaseProductRow {
  id: string
  title: string
  slug: string
  price: number | string
  compare_at_price: number | string | null
  category: string
  collection: string | null
  description: string | null
  editorial_story: string | null
  images: string[] | null
  specs?: string[] | null
  model_image?: string | null
  images_back?: string[] | null
  product_variants?: DatabaseVariantRow[] | null
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

function fromDatabaseRow(row: DatabaseProductRow): Product {
  const collection = row.collection || 'Outerline'
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    category: row.category,
    collection,
    collection_slug: slugify(collection),
    description: row.description || '',
    specs: row.specs ?? [],
    editorial_story: row.editorial_story || '',
    model_image: row.model_image ?? null,
    images: row.images ?? [],
    images_back: row.images_back ?? [],
    product_variants: (row.product_variants ?? []).map((v) => ({
      id: v.id,
      size: v.size ?? '',
      color: v.color ?? '',
      image: v.image ?? '',
      image_back: v.image_back ?? '',
      inventory_quantity: v.inventory_quantity ?? 0,
    })),
  }
}

// Storefront catalog: products published from the admin (newest first), then the curated launch catalog.
// Launch products win on slug conflicts so a database duplicate never replaces their full photo galleries.
export async function getCatalogProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return mockProducts

  try {
    const supabase = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_drop_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Catalog query failed; showing launch catalog only:', error.message)
      return mockProducts
    }

    const launchSlugs = new Set(mockProducts.map((p) => p.slug))
    const published = ((data ?? []) as DatabaseProductRow[])
      .filter((row) => !launchSlugs.has(row.slug) && !RETIRED_SEED_SLUGS.has(row.slug) && row.images?.length)
      .map(fromDatabaseRow)

    return [...published, ...mockProducts]
  } catch (err) {
    console.warn('Catalog query failed; showing launch catalog only:', err)
    return mockProducts
  }
}

export function filterProductsByCollection(products: Product[], slug: string): Product[] {
  if (slug === 'all') return products
  if (CATEGORY_SLUGS.includes(slug)) return products.filter((p) => p.category === slug)
  if (BALLER_SLUGS.includes(slug)) {
    return products.filter(
      (p) => p.collection_slug === 'been-brooklyn-baller' || p.slug.includes('baller') || p.title.toLowerCase().includes('baller')
    )
  }
  // Baller pieces are part of the wider Been Brooklyn line.
  if (slug === 'been-brooklyn') return products.filter((p) => p.collection_slug.startsWith('been-brooklyn'))
  return products.filter((p) => p.collection_slug === slug)
}
