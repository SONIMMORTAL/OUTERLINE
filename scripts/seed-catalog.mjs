// Loads the launch catalog (lib/mock-data.ts) into Supabase `products` and `product_variants`.
// Only inserts what is missing: existing prices, copy, visibility, and stock counts are never changed,
// so it is safe to re-run after adding a product or colorway to lib/mock-data.ts.
//
//   node --env-file=.env.local scripts/seed-catalog.mjs --stock=20 --dry-run   # preview
//   node --env-file=.env.local scripts/seed-catalog.mjs --stock=20             # insert missing rows

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=')
    return [key, value ?? true]
  })
)
const DRY_RUN = Boolean(args['dry-run'])
const STOCK = Number(args.stock ?? 0)

if (!Number.isInteger(STOCK) || STOCK < 0) {
  console.error('--stock must be a whole number of 0 or more')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key || key.startsWith('sb_publishable_') || key === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and the secret SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env.local).')
  process.exit(1)
}

// Same format as skuFor in lib/inventory.ts.
const skuFor = (slug, color, size) => `${slug}-${color}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-')

async function loadLaunchCatalog() {
  const source = fs.readFileSync(path.join(process.cwd(), 'lib/mock-data.ts'), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  })
  const catalogModule = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
  return catalogModule.mockProducts
}

async function rest(pathAndQuery, init = {}) {
  const response = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${pathAndQuery} -> ${response.status} ${text}`)
  return text ? JSON.parse(text) : null
}

const launchProducts = await loadLaunchCatalog()
const existing = await rest('products?select=id,slug,product_variants(id,color,size)')
const bySlug = new Map(existing.map((product) => [product.slug, product]))

let createdProducts = 0
let createdVariants = 0

for (const product of launchProducts) {
  let row = bySlug.get(product.slug)

  if (!row) {
    const fields = {
      title: product.title,
      slug: product.slug,
      description: product.description,
      editorial_story: product.editorial_story,
      price: product.price,
      compare_at_price: product.compare_at_price ?? null,
      category: product.category,
      collection: product.collection,
      images: product.images,
      is_drop_active: true,
      is_featured: false,
    }
    if (DRY_RUN) {
      row = { id: '(new)', product_variants: [] }
    } else {
      ;[row] = await rest('products', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(fields) })
      row.product_variants = []
    }
    createdProducts++
    console.log(`+ product ${product.slug} ($${product.price})`)
  }

  const existingKeys = new Set((row.product_variants ?? []).map((v) => `${v.color}|${v.size}`))
  const missing = product.product_variants.filter((v) => !existingKeys.has(`${v.color}|${v.size}`))
  if (missing.length === 0) continue

  const variants = missing.map((v) => ({
    product_id: row.id,
    color: v.color,
    size: v.size,
    sku: skuFor(product.slug, v.color, v.size),
    inventory_quantity: STOCK,
  }))
  if (!DRY_RUN) {
    await rest('product_variants', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(variants) })
  }
  createdVariants += variants.length
  console.log(`+ ${variants.length} variants for ${product.slug} at ${STOCK} each`)
}

console.log(
  `${DRY_RUN ? 'Dry run: would create' : 'Created'} ${createdProducts} products and ${createdVariants} variants. Existing rows were left unchanged.`
)
