import { cache } from 'react'
import { createServiceClient } from '@/lib/supabase/admin'
import { mockProducts, type Product, type ProductVariant } from '@/lib/mock-data'

// The storefront catalog.
//   * Launch products keep their curated photo galleries in lib/mock-data.ts, while the database controls
//     their price, copy, visibility, and stock (rows loaded by scripts/seed-catalog.mjs).
//   * Products created in the admin come entirely from the database.
// Products and variants have no public access, so this reads with the secret key (server only).

// Demo rows from supabase/seed.sql. The curated launch catalog replaced them, so they stay hidden.
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
  sku: string
  size: string | null
  color: string | null
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
  is_drop_active: boolean
  product_variants?: DatabaseVariantRow[] | null
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

function toVariant(row: DatabaseVariantRow, media?: ProductVariant): ProductVariant {
  return {
    id: row.id,
    sku: row.sku,
    size: row.size ?? '',
    color: row.color ?? '',
    image: media?.image ?? '',
    image_back: media?.image_back ?? '',
    inventory_quantity: Math.max(0, row.inventory_quantity ?? 0),
  }
}

function mergeLaunchProduct(launch: Product, row: DatabaseProductRow): Product {
  const launchIndex = (variant: { color: string; size: string }) => {
    const index = launch.product_variants.findIndex((m) => m.color === variant.color && m.size === variant.size)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }

  // Keep the launch ordering of colors and sizes; variants added in the admin go last.
  const variants = (row.product_variants ?? [])
    .map((v) => toVariant(v, launch.product_variants.find((m) => m.color === v.color && m.size === v.size)))
    .sort((a, b) => launchIndex(a) - launchIndex(b))

  return {
    ...launch,
    id: row.id,
    title: row.title || launch.title,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    description: row.description || launch.description,
    editorial_story: row.editorial_story || launch.editorial_story,
    product_variants: variants,
  }
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
    specs: [],
    editorial_story: row.editorial_story || '',
    model_image: null,
    images: row.images ?? [],
    images_back: [],
    product_variants: (row.product_variants ?? []).map((v) => toVariant(v)),
  }
}

async function loadDatabaseProducts(): Promise<DatabaseProductRow[] | null> {
  try {
    const { data, error } = await createServiceClient()
      .from('products')
      .select('id, title, slug, price, compare_at_price, category, collection, description, editorial_story, images, is_drop_active, created_at, product_variants(id, sku, size, color, inventory_quantity)')
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('Catalog query failed; showing launch catalog without live stock:', error.message)
      return null
    }
    return (data ?? []) as DatabaseProductRow[]
  } catch (err) {
    console.warn('Catalog query failed; showing launch catalog without live stock:', err)
    return null
  }
}

// Always fresh — use this where stock must be exact (the orders API).
export async function loadCatalogProducts(): Promise<Product[]> {
  const rows = await loadDatabaseProducts()
  if (!rows) return mockProducts

  const bySlug = new Map(rows.map((row) => [row.slug, row]))
  const launchSlugs = new Set(mockProducts.map((p) => p.slug))

  // A launch product without a database row still displays; checkout refuses it until it is seeded.
  const launch = mockProducts.flatMap((product) => {
    const row = bySlug.get(product.slug)
    if (!row) return [product]
    return row.is_drop_active ? [mergeLaunchProduct(product, row)] : []
  })

  const published = rows
    .filter((row) => row.is_drop_active && !launchSlugs.has(row.slug) && !RETIRED_SEED_SLUGS.has(row.slug) && row.images?.length)
    .map(fromDatabaseRow)

  return [...published, ...launch]
}

// Deduplicated per request for pages (metadata + page body share one query).
export const getCatalogProducts = cache(loadCatalogProducts)

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  return (await getCatalogProducts()).find((product) => product.slug === slug) ?? null
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
