import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/admin'
import { mockProducts, type Product, type ProductVariant } from '@/lib/mock-data'

// The storefront catalog.
//   * Launch products keep their curated photo galleries in lib/mock-data.ts, while the database controls
//     their name, price, category, collection, copy, visibility, and stock (rows loaded by scripts/seed-catalog.mjs).
//     Once their photos are changed in the admin, the uploaded photos replace the curated gallery.
//   * Products created in the admin or imported from Stripe come entirely from the database.
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
export const CATEGORY_SLUGS = ['hoodies', 'tees', 'bottoms', 'headwear', 'accessories']

export interface DatabaseVariantRow {
  id: string
  sku: string
  size: string | null
  color: string | null
  inventory_quantity: number | null
  // Added by migration 005; absent (treated as active) before it runs.
  is_active?: boolean
}

export interface DatabaseProductRow {
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

// Call after any catalog change so the storefront and admin show it.
export function revalidateCatalog() {
  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath('/collections/[category]', 'page')
  revalidatePath('/products/[slug]', 'page')
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

const isActiveVariant = (variant: DatabaseVariantRow) => variant.is_active !== false

// Launch rows are seeded with the launch photo list, so any difference means the admin replaced the photos.
function hasCustomPhotos(launch: Product, row: DatabaseProductRow): boolean {
  const photos = row.images ?? []
  return photos.length > 0 && (photos.length !== launch.images.length || photos.some((photo, i) => photo !== launch.images[i]))
}

function mergeLaunchProduct(launch: Product, row: DatabaseProductRow, variantRows: DatabaseVariantRow[]): Product {
  const launchIndex = (variant: { color: string; size: string }) => {
    const index = launch.product_variants.findIndex((m) => m.color === variant.color && m.size === variant.size)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }
  const customPhotos = hasCustomPhotos(launch, row)
  const collection = row.collection || launch.collection

  // Keep the launch ordering of colors and sizes; variants added in the admin go last.
  const variants = variantRows
    .map((v) => toVariant(v, customPhotos ? undefined : launch.product_variants.find((m) => m.color === v.color && m.size === v.size)))
    .sort((a, b) => launchIndex(a) - launchIndex(b))

  return {
    ...launch,
    id: row.id,
    title: row.title || launch.title,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    category: row.category || launch.category,
    collection,
    collection_slug: slugify(collection),
    description: row.description || launch.description,
    editorial_story: row.editorial_story || launch.editorial_story,
    ...(customPhotos ? { model_image: null, images: row.images!, images_back: [], images_by_color: undefined } : {}),
    product_variants: variants,
  }
}

function fromDatabaseRow(row: DatabaseProductRow, variantRows: DatabaseVariantRow[]): Product {
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
    product_variants: variantRows.map((v) => toVariant(v)),
  }
}

const launchProductFor = (slug: string) => mockProducts.find((product) => product.slug === slug)

// The product as the storefront shows it, including hidden colors (used to build the Stripe catalog).
export function toCatalogProduct(row: DatabaseProductRow): Product {
  const variants = row.product_variants ?? []
  const launch = launchProductFor(row.slug)
  return launch ? mergeLaunchProduct(launch, row, variants) : fromDatabaseRow(row, variants)
}

// Photos for one colorway: its curated front/back shots when the product has them, otherwise the product photos.
export function colorPhotos(product: Product, color: string): string[] {
  const curated = product.images_by_color?.[color]
  const photos = [
    curated?.model_front,
    curated?.render_front,
    curated?.model_back,
    curated?.render_back,
    ...product.product_variants.filter((v) => v.color === color).flatMap((v) => [v.image, v.image_back]),
  ].filter((photo): photo is string => Boolean(photo))
  return photos.length > 0 ? [...new Set(photos)] : product.images
}

async function loadDatabaseProducts(): Promise<DatabaseProductRow[] | null> {
  try {
    const { data, error } = await createServiceClient()
      .from('products')
      // product_variants(*) rather than a column list, so the catalog keeps working before migration 005 adds is_active.
      .select('id, title, slug, price, compare_at_price, category, collection, description, editorial_story, images, is_drop_active, created_at, product_variants(*)')
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

  // Colors archived in Stripe are hidden. A product whose colors are all hidden is hidden too.
  const visibleVariants = (row: DatabaseProductRow) => (row.product_variants ?? []).filter(isActiveVariant)
  const isVisible = (row: DatabaseProductRow) =>
    row.is_drop_active && (!row.product_variants?.length || visibleVariants(row).length > 0)

  // A launch product without a database row still displays; checkout refuses it until it is seeded.
  const launch = mockProducts.flatMap((product) => {
    const row = bySlug.get(product.slug)
    if (!row) return [product]
    return isVisible(row) ? [mergeLaunchProduct(product, row, visibleVariants(row))] : []
  })

  const published = rows
    .filter((row) => isVisible(row) && !launchSlugs.has(row.slug) && !RETIRED_SEED_SLUGS.has(row.slug) && row.images?.length)
    .map((row) => fromDatabaseRow(row, visibleVariants(row)))

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
