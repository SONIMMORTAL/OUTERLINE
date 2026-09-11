import { notFound } from 'next/navigation'
import ProductCard from '@/components/store/ProductCard'

import { collections, type Collection, type Product } from '@/lib/mock-data'
import { getCatalogProducts, filterProductsByCollection } from '@/lib/catalog'

// Sold-out badges must reflect current stock.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const formattedTitle = category === 'been-brooklyn-baller' || category === 'baller' || category === 'baller-merch' || category === 'grey-baller'
    ? 'Been Brooklyn Baller'
    : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    // The root layout's title template appends "| OUTERLINE"
    title: formattedTitle,
    description: `Shop our latest ${formattedTitle} collection.`
  }
}

const VALID_CATEGORIES = [
  'hoodies', 'tees', 'all',
  'so-new-york', 'been-brooklyn', 'been-brooklyn-baller', 'baller', 'baller-merch', 'grey-baller',
  'bottoms', 'headwear', 'accessories'
]

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const slug = category.toLowerCase()

  if (!VALID_CATEGORIES.includes(slug)) {
    notFound()
  }

  const products = filterProductsByCollection(await getCatalogProducts(), slug)

  const categoryName = slug === 'all'
    ? 'All Collections'
    : (slug === 'been-brooklyn-baller' || slug === 'baller' || slug === 'baller-merch' || slug === 'grey-baller'
        ? 'Been Brooklyn Baller'
        : slug.split('-').join(' '))

  // On "all", group by collection; anything published outside the named collections lands in a final group.
  const groupedProducts: { collection: Collection; products: Product[] }[] = []
  if (slug === 'all') {
    const grouped = new Set<string>()
    for (const collection of collections) {
      const items = filterProductsByCollection(products, collection.slug).filter(p => !grouped.has(p.slug))
      items.forEach(p => grouped.add(p.slug))
      if (items.length > 0) groupedProducts.push({ collection, products: items })
    }
    const ungrouped = products.filter(p => !grouped.has(p.slug))
    if (ungrouped.length > 0) {
      groupedProducts.push({
        collection: { name: 'More From Outerline', slug: 'more', description: 'New arrivals from across the Outerline line.', image: '' },
        products: ungrouped,
      })
    }
  }

  return (
    <div className="w-full flex flex-col pt-28 sm:pt-32 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col space-y-3 mb-14 border-b border-[#E5E5E5] pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#0A192F]/60 font-semibold">
            {slug === 'all' ? 'OUTERLINE LOOKBOOK' : 'OUTERLINE COLLECTION'}
          </span>
        </div>
        <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.14em] text-[#0A192F] uppercase leading-tight">
          {categoryName}
        </h1>
        <p className="text-[#666666] text-xs font-mono tracking-[0.15em] uppercase">
          {products.length} {products.length === 1 ? 'Garment' : 'Garments'} Available
        </p>
      </div>

      {slug === 'all' && groupedProducts.length > 0 ? (
        <div className="flex flex-col space-y-24">
          {groupedProducts.map((group, index) => (
            <div key={group.collection.slug} className="flex flex-col space-y-8">
              {index > 0 && <hr className="border-[#E5E5E5] my-8" />}
              <div className="flex flex-col space-y-3">
                <span className="text-[#0A192F] text-[10px] uppercase font-mono tracking-[0.25em] font-semibold">Collection</span>
                <h2 className="font-brand text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.12em] text-[#0A192F] uppercase">{group.collection.name}</h2>
                <p className="text-[#666666] max-w-2xl text-sm leading-relaxed">{group.collection.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-[#F9F9F9] rounded-lg border border-[#E5E5E5]">
          <h2 className="font-serif text-2xl text-[#000000]">Nothing to see here yet.</h2>
          <p className="text-[#666666]">Check back later for new drops in this category.</p>
        </div>
      )}
    </div>
  )
}
