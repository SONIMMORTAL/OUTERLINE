import type Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/admin'
import { absoluteImageUrl, getStripe, isStripeLiveMode, toCents } from '@/lib/stripe'
import { skuFor, sortVariants } from '@/lib/inventory'
import {
  colorPhotos,
  revalidateCatalog,
  slugify,
  toCatalogProduct,
  type DatabaseProductRow
} from '@/lib/catalog'

// Keeps the Stripe product catalog and the site catalog in step. Each colorway of a site product is one Stripe
// product named "<title> <color>", e.g. "Been Brooklyn Baller Tee Black/Red".
//   * Site → Stripe: saving a product in the admin creates or updates its Stripe products (pushProductToStripe).
//   * Stripe → site: product webhooks copy name, price, description, photos, and archived state back, and a product
//     created in Stripe goes live on the site (handleStripeProductEvent).
// Every sync stores a snapshot of the Stripe product, so a webhook only applies fields changed in Stripe since then
// and the site's own writes coming back are ignored.

// Color of a product created in Stripe without one in its name.
const SINGLE_COLOR = 'Standard'
// Stripe has no inventory, so products created there start with this stock per size; change it in the admin.
export const STRIPE_IMPORT_STOCK = 10
const MAX_STRIPE_IMAGES = 8
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PRODUCT_SELECT = 'id, title, slug, price, compare_at_price, category, collection, description, editorial_story, images, is_drop_active, created_at, product_variants(*)'

interface StripeSnapshot {
  name: string
  price_cents: number | null
  description: string
  images: string[]
  active: boolean
}

interface LinkRow {
  stripe_product_id: string
  product_id: string
  color: string
  livemode: boolean
  synced: Partial<StripeSnapshot>
}

export type SyncAction = 'linked' | 'imported' | 'updated' | 'unchanged' | 'ignored'

export interface SyncOutcome {
  action: SyncAction
  detail: string
}

// Counts Stripe products created or adopted during one sync run.
export interface PushStats {
  created: number
  adopted: number
}

export interface StripeSyncSummary {
  counts: Record<SyncAction, number>
  createdInStripe: number
  notes: string[]
}

const outcome = (action: SyncAction, detail: string): SyncOutcome => ({ action, detail })
const db = () => createServiceClient()
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
const sameList = (a: readonly string[] = [], b: readonly string[] = []) => a.length === b.length && a.every((v, i) => v === b[i])

function checkDb(error: { message: string; code?: string } | null, action: string) {
  if (!error) return
  if (error.code === 'PGRST205' || error.code === '42P01' || /stripe_product_links|is_active/.test(error.message)) {
    throw new Error(`${action}: the database is missing the Stripe sync tables. Run supabase/migrations/005_stripe_catalog_sync.sql in the Supabase SQL Editor.`)
  }
  throw new Error(`${action}: ${error.message}`)
}

function ignoreMissing(err: unknown) {
  if ((err as { code?: string })?.code !== 'resource_missing') throw err
}

function oneTimeUsdPrice(product: Stripe.Product): Stripe.Price | null {
  const price = product.default_price
  if (!price || typeof price === 'string') return null
  return price.currency === 'usd' && price.type === 'one_time' && price.unit_amount != null ? price : null
}

function snapshotOf(product: Stripe.Product): StripeSnapshot {
  return {
    name: product.name,
    price_cents: oneTimeUsdPrice(product)?.unit_amount ?? null,
    description: product.description ?? '',
    images: product.images,
    active: product.active,
  }
}

const stripeName = (title: string, color: string) => (color === SINGLE_COLOR ? title : `${title} ${color}`)
const colorsOf = (row: DatabaseProductRow) => [...new Set(sortVariants(row.product_variants ?? []).map((v) => v.color).filter(Boolean))] as string[]
const isColorActive = (row: DatabaseProductRow, color: string) =>
  (row.product_variants ?? []).some((v) => v.color === color && v.is_active !== false)

// The photos a colorway's Stripe product should show, as full URLs.
function stripePhotos(row: DatabaseProductRow, color: string): string[] {
  return colorPhotos(toCatalogProduct(row), color)
    .map(absoluteImageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, MAX_STRIPE_IMAGES)
}

// An active Stripe product with this name that isn't linked yet, e.g. one made by hand in the Stripe dashboard.
async function findUnlinkedStripeProduct(name: string): Promise<Stripe.Product | null> {
  const linkedIds = new Set((await loadLinks()).map((link) => link.stripe_product_id))
  for await (const product of getStripe().products.list({ active: true, limit: 100, expand: ['data.default_price'] })) {
    if (!linkedIds.has(product.id) && normalize(product.name) === normalize(name)) return product
  }
  return null
}

async function retrieveProduct(id: string): Promise<Stripe.Product | null> {
  try {
    return await getStripe().products.retrieve(id, { expand: ['default_price'] })
  } catch (err) {
    ignoreMissing(err)
    return null
  }
}

async function loadProduct(productId: string): Promise<DatabaseProductRow | null> {
  const { data, error } = await db().from('products').select(PRODUCT_SELECT).eq('id', productId).maybeSingle()
  checkDb(error, 'Loading the product')
  return data as DatabaseProductRow | null
}

async function loadAllProducts(): Promise<DatabaseProductRow[]> {
  const { data, error } = await db().from('products').select(PRODUCT_SELECT).order('created_at', { ascending: true })
  checkDb(error, 'Loading products')
  return (data ?? []) as DatabaseProductRow[]
}

async function loadLinks(filter: { productId?: string; stripeProductId?: string } = {}): Promise<LinkRow[]> {
  let query = db().from('stripe_product_links').select('*').eq('livemode', isStripeLiveMode())
  if (filter.productId) query = query.eq('product_id', filter.productId)
  if (filter.stripeProductId) query = query.eq('stripe_product_id', filter.stripeProductId)
  const { data, error } = await query
  checkDb(error, 'Loading Stripe links')
  return (data ?? []) as LinkRow[]
}

async function saveLink(productId: string, color: string, stripeProduct: Stripe.Product) {
  const { error } = await db().from('stripe_product_links').upsert({
    stripe_product_id: stripeProduct.id,
    product_id: productId,
    color,
    livemode: stripeProduct.livemode,
    synced: snapshotOf(stripeProduct),
  })
  checkDb(error, 'Saving the Stripe link')
}

async function deleteLink(stripeProductId: string) {
  const { error } = await db().from('stripe_product_links').delete().eq('stripe_product_id', stripeProductId)
  checkDb(error, 'Removing the Stripe link')
}

// ─── Site → Stripe ──────────────────────────────────────────────────────────────────────────────────────────────

// Makes each colorway's Stripe product match the site product. A published color without one adopts a same-named
// Stripe product made in the dashboard, or gets a new one. Photos already in Stripe are only replaced when they were
// changed in the admin (photosChanged).
export async function pushProductToStripe(
  productId: string,
  { photosChanged = false, stats }: { photosChanged?: boolean; stats?: PushStats } = {}
): Promise<void> {
  const row = await loadProduct(productId)
  if (!row) return

  const stripe = getStripe()
  const links = await loadLinks({ productId })
  const colors = colorsOf(row)

  // A colorway that no longer exists on the site is archived in Stripe.
  for (const link of links.filter((l) => !colors.includes(l.color))) {
    await stripe.products.update(link.stripe_product_id, { active: false }).catch(ignoreMissing)
    await deleteLink(link.stripe_product_id)
  }

  for (const color of colors) {
    const desired = {
      name: stripeName(row.title, color),
      priceCents: toCents(row.price),
      description: row.description ?? '',
      images: stripePhotos(row, color),
      active: row.is_drop_active && isColorActive(row, color),
      metadata: { outerline_product_id: row.id, outerline_color: color },
    }

    const link = links.find((l) => l.color === color)
    let current = link ? await retrieveProduct(link.stripe_product_id) : null
    if (link && !current) await deleteLink(link.stripe_product_id)

    // Hidden products and colors are only added to Stripe once they are published.
    if (!current && !desired.active) continue
    if (!current) {
      current = await findUnlinkedStripeProduct(desired.name)
      if (current && stats) stats.adopted++
    }

    if (!current) {
      const stripeProduct = await stripe.products.create({
        name: desired.name,
        active: true,
        images: desired.images,
        metadata: desired.metadata,
        ...(desired.description ? { description: desired.description } : {}),
        default_price_data: { currency: 'usd', unit_amount: desired.priceCents },
        expand: ['default_price'],
      })
      await saveLink(row.id, color, stripeProduct)
      if (stats) stats.created++
      continue
    }

    const update: Stripe.ProductUpdateParams = {}
    if (current.name !== desired.name) update.name = desired.name
    if ((current.description ?? '') !== desired.description) update.description = desired.description
    if ((photosChanged || current.images.length === 0) && desired.images.length > 0 && !sameList(current.images, desired.images)) {
      update.images = desired.images
    }
    if (current.active !== desired.active) update.active = desired.active
    if (current.metadata.outerline_product_id !== row.id || current.metadata.outerline_color !== color) {
      update.metadata = desired.metadata
    }
    const oldPrice = current.default_price
    if (oneTimeUsdPrice(current)?.unit_amount !== desired.priceCents) {
      update.default_price = (await stripe.prices.create({ product: current.id, currency: 'usd', unit_amount: desired.priceCents })).id
    }

    let synced = current
    if (Object.keys(update).length > 0) {
      synced = await stripe.products.update(current.id, { ...update, expand: ['default_price'] })
      // Stripe prices can't be edited or deleted; the replaced one is archived once it is no longer the default.
      const oldPriceId = typeof oldPrice === 'string' ? oldPrice : oldPrice?.id
      if (update.default_price && oldPriceId) await stripe.prices.update(oldPriceId, { active: false })
    }
    if (link?.stripe_product_id !== synced.id || JSON.stringify(link.synced) !== JSON.stringify(snapshotOf(synced))) {
      await saveLink(row.id, color, synced)
    }
  }
}

// Before a product is deleted on the site. Stripe keeps products that have prices, so they are archived.
export async function archiveStripeProducts(productId: string): Promise<void> {
  for (const link of await loadLinks({ productId })) {
    await getStripe().products.update(link.stripe_product_id, { active: false }).catch(ignoreMissing)
  }
}

// ─── Stripe → site ──────────────────────────────────────────────────────────────────────────────────────────────

// Archiving a colorway in Stripe hides that color; archiving the last visible one hides the whole product.
async function setColorVisibility(row: DatabaseProductRow, color: string, visible: boolean): Promise<boolean> {
  const otherColorVisible = colorsOf(row).some((c) => c !== color && isColorActive(row, c))
  if (!visible && !otherColorVisible) {
    if (!row.is_drop_active) return false
    const { error } = await db().from('products').update({ is_drop_active: false }).eq('id', row.id)
    checkDb(error, 'Hiding the product')
    return true
  }

  const variantsChange = (row.product_variants ?? []).some((v) => v.color === color && (v.is_active !== false) !== visible)
  if (variantsChange) {
    const { error } = await db().from('product_variants').update({ is_active: visible }).eq('product_id', row.id).eq('color', color)
    checkDb(error, `Updating ${color}`)
  }
  const publish = visible && !row.is_drop_active
  if (publish) {
    const { error } = await db().from('products').update({ is_drop_active: true }).eq('id', row.id)
    checkDb(error, 'Publishing the product')
  }
  return variantsChange || publish
}

// "<title> <color>" gives the title. Otherwise the whole name is the title, but only for a single-color product.
function titleFromStripeName(name: string, color: string, colorCount: number): string | null {
  const suffix = ` ${color}`
  if (color !== SINGLE_COLOR && normalize(name).endsWith(normalize(suffix))) {
    return name.trim().slice(0, -suffix.length).trim() || null
  }
  return colorCount <= 1 ? name.trim() : null
}

async function applyStripeProduct(stripeProduct: Stripe.Product, link: LinkRow): Promise<SyncOutcome> {
  const row = await loadProduct(link.product_id)
  if (!row) {
    await deleteLink(link.stripe_product_id)
    return outcome('ignored', 'its site product was deleted')
  }

  const now = snapshotOf(stripeProduct)
  const changed = (key: keyof StripeSnapshot) => JSON.stringify(link.synced[key]) !== JSON.stringify(now[key])
  const colors = colorsOf(row)
  const updates: Record<string, unknown> = {}

  if (changed('price_cents') && now.price_cents && now.price_cents !== toCents(row.price)) {
    updates.price = now.price_cents / 100
  }
  if (changed('name')) {
    const title = titleFromStripeName(now.name, link.color, colors.length)
    if (title && title !== row.title) updates.title = title
  }
  if (changed('description') && now.description !== (row.description ?? '')) {
    updates.description = now.description
  }
  // Stripe photos belong to one colorway, so they only replace the photos of a single-color product.
  if (changed('images') && colors.length <= 1 && now.images.length > 0 && !sameList(now.images, stripePhotos(row, link.color))) {
    updates.images = now.images
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await db().from('products').update(updates).eq('id', row.id)
    checkDb(error, 'Updating the product')
  }
  const visibilityChanged = changed('active') && (await setColorVisibility(row, link.color, now.active))
  await saveLink(row.id, link.color, stripeProduct)

  if (Object.keys(updates).length === 0 && !visibilityChanged) return outcome('unchanged', row.slug)

  // The product's other colorways follow (a new price or title applies to every color).
  await pushProductToStripe(row.id)
  revalidateCatalog()
  const fields = [...Object.keys(updates), ...(visibilityChanged ? [now.active ? 'shown' : 'hidden'] : [])]
  return outcome('updated', `${row.slug} (${fields.join(', ')})`)
}

function guessCategory(name: string): string {
  if (/hood|sweat|crew/i.test(name)) return 'hoodies'
  if (/\btee\b|shirt|tank|jersey/i.test(name)) return 'tees'
  if (/pant|short|jogger|bottom/i.test(name)) return 'bottoms'
  if (/\bhat\b|\bcap\b|beanie|headwear|durag/i.test(name)) return 'headwear'
  return 'accessories'
}

function guessCollection(name: string): string {
  if (/brooklyn|baller/i.test(name)) return 'Been Brooklyn'
  if (/new york|\bny\b|\bsony\b/i.test(name)) return 'So New York'
  return 'Outerline'
}

async function addColorway(row: DatabaseProductRow, color: string): Promise<void> {
  const sizes = [...new Set(sortVariants(row.product_variants ?? []).map((v) => v.size).filter(Boolean))] as string[]
  const { error } = await db().from('product_variants').insert(
    (sizes.length > 0 ? sizes : ['OS']).map((size) => ({
      product_id: row.id,
      color,
      size,
      sku: skuFor(row.slug, color, size),
      inventory_quantity: STRIPE_IMPORT_STOCK,
      vendor_id: 'PRIMARY_NYC_VENDOR',
    }))
  )
  checkDb(error, `Adding ${color}`)
}

// A Stripe product the site doesn't know yet: link it to the product and color it names, add it as a new color of
// an existing product, or create a new live product.
async function linkOrImport(stripeProduct: Stripe.Product, stats?: PushStats): Promise<SyncOutcome> {
  const rows = await loadAllProducts()
  const links = await loadLinks()
  const isLinked = (productId: string, color: string) => links.some((l) => l.product_id === productId && l.color === color)

  // Products the site created carry their product id; the webhook can arrive before the link is saved.
  const { outerline_product_id: ownerId, outerline_color: ownerColor } = stripeProduct.metadata
  const owner = ownerId && UUID_PATTERN.test(ownerId) ? rows.find((r) => r.id === ownerId) : undefined
  if (owner && ownerColor && colorsOf(owner).includes(ownerColor)) {
    if (isLinked(owner.id, ownerColor)) return outcome('ignored', `${stripeProduct.name}: ${owner.slug} ${ownerColor} already has a Stripe product`)
    await saveLink(owner.id, ownerColor, stripeProduct)
    return outcome('linked', `${owner.slug} (${ownerColor})`)
  }

  const price = oneTimeUsdPrice(stripeProduct)
  const cleanName = stripeProduct.name.trim().replace(/\s+/g, ' ')
  const name = normalize(cleanName)

  // "<existing title> <color>". Longest titles first, so "Been Brooklyn Baller Tee" wins over shorter titles.
  for (const row of [...rows].sort((a, b) => b.title.length - a.title.length)) {
    const title = normalize(row.title)
    const colors = colorsOf(row)
    let color: string | undefined
    if (name === title) {
      if (colors.length !== 1) return outcome('ignored', `"${cleanName}" matches ${row.slug} but doesn't name a color`)
      color = colors[0]
    } else if (name.startsWith(`${title} `) && !cleanName.slice(title.length + 1).includes(' ')) {
      color = cleanName.slice(title.length + 1)
    }
    if (!color) continue

    const existing = colors.find((c) => normalize(c) === normalize(color))
    if (existing) {
      if (isLinked(row.id, existing)) return outcome('ignored', `"${cleanName}": ${row.slug} ${existing} already has a Stripe product`)
      await saveLink(row.id, existing, stripeProduct)
      await pushProductToStripe(row.id, { stats })
      return outcome('linked', `${row.slug} (${existing})`)
    }

    if (!stripeProduct.active || !price?.unit_amount) return outcome('ignored', `"${cleanName}" needs a price and must be active`)
    await addColorway(row, color)
    await saveLink(row.id, color, stripeProduct)
    await pushProductToStripe(row.id, { stats })
    revalidateCatalog()
    return outcome('imported', `new color ${color} on ${row.slug}`)
  }

  if (!stripeProduct.active) return outcome('ignored', `"${cleanName}" is archived`)
  if (!price?.unit_amount) return outcome('ignored', `"${cleanName}" has no one-time USD price yet`)

  // A trailing "Black/Red" style word is the color.
  const [, parsedTitle, parsedColor] = cleanName.match(/^(.*\S)\s+(\S+\/\S+)$/) ?? [null, cleanName, SINGLE_COLOR]
  const takenSlugs = new Set(rows.map((r) => r.slug))
  const baseSlug = slugify(parsedTitle) || 'product'
  let slug = baseSlug
  for (let n = 2; takenSlugs.has(slug); n++) slug = `${baseSlug}-${n}`

  const { data: created, error } = await db()
    .from('products')
    .insert({
      title: parsedTitle,
      slug,
      description: stripeProduct.description ?? '',
      editorial_story: '',
      category: guessCategory(cleanName),
      collection: guessCollection(cleanName),
      price: price.unit_amount / 100,
      compare_at_price: null,
      images: stripeProduct.images,
      is_drop_active: true,
      is_featured: false,
    })
    .select('id')
    .single()

  if (error?.code === '23505') {
    // Stripe sends product.created and product.updated together; give the other delivery a moment to finish importing.
    for (let attempt = 0; attempt < 10; attempt++) {
      if ((await loadLinks({ stripeProductId: stripeProduct.id })).length > 0) return outcome('ignored', `"${cleanName}" was already imported`)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  checkDb(error, `Importing "${cleanName}"`)

  const { error: variantError } = await db().from('product_variants').insert({
    product_id: created!.id,
    color: parsedColor,
    size: 'OS',
    sku: skuFor(slug, parsedColor, 'OS'),
    inventory_quantity: STRIPE_IMPORT_STOCK,
    vendor_id: 'PRIMARY_NYC_VENDOR',
  })
  checkDb(variantError, `Adding stock for "${cleanName}"`)

  await saveLink(created!.id, parsedColor, stripeProduct)
  await pushProductToStripe(created!.id, { stats })
  revalidateCatalog()
  return outcome('imported', `${slug} at $${(price.unit_amount / 100).toFixed(2)}${stripeProduct.images.length ? '' : ' (hidden on the site until it has a photo)'}`)
}

// product.created / product.updated / product.deleted webhooks.
export async function handleStripeProductEvent(event: Stripe.Event): Promise<SyncOutcome> {
  const eventProduct = event.data.object as Stripe.Product
  // Events can arrive out of order, so act on the product as it is now.
  const stripeProduct = event.type === 'product.deleted' ? null : await retrieveProduct(eventProduct.id)
  const [link] = await loadLinks({ stripeProductId: eventProduct.id })

  if (!stripeProduct) {
    if (!link) return outcome('ignored', 'deleted product was not on the site')
    // A deleted Stripe product is treated like an archived one, then forgotten.
    const archived = await applyStripeProduct({ ...eventProduct, active: false }, link)
    await deleteLink(link.stripe_product_id)
    return archived
  }
  return link ? applyStripeProduct(stripeProduct, link) : linkOrImport(stripeProduct)
}

// The admin "Sync with Stripe" button: brings in every Stripe product, then adds missing colorways to Stripe.
export async function syncCatalogWithStripe(): Promise<StripeSyncSummary> {
  const counts: Record<SyncAction, number> = { linked: 0, imported: 0, updated: 0, unchanged: 0, ignored: 0 }
  const stats: PushStats = { created: 0, adopted: 0 }
  const notes: string[] = []

  for await (const stripeProduct of getStripe().products.list({ limit: 100, expand: ['data.default_price'] })) {
    const [link] = await loadLinks({ stripeProductId: stripeProduct.id })
    // Linking one color can adopt and update its sibling colors, which then show up here already linked. The listed
    // copy predates that update, so compare against the product as it is now.
    const current = link ? await retrieveProduct(stripeProduct.id) : stripeProduct
    const result = !current
      ? outcome('ignored', `${stripeProduct.name} was deleted during the sync`)
      : link ? await applyStripeProduct(current, link) : await linkOrImport(current, stats)
    counts[result.action]++
    if (result.action === 'ignored' || result.action === 'imported') notes.push(result.detail)
  }

  for (const row of await loadAllProducts()) {
    await pushProductToStripe(row.id, { stats })
  }
  revalidateCatalog()
  counts.linked += stats.adopted
  counts.unchanged = Math.max(0, counts.unchanged - stats.adopted)
  return { counts, createdInStripe: stats.created, notes }
}
