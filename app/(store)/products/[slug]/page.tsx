import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductDetailClient } from '@/components/store/ProductDetailClient'
import { getCatalogProduct } from '@/lib/catalog'

// Stock and sold-out sizes must be current on every visit.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getCatalogProduct(slug)
  return {
    // The root layout's title template appends "| OUTERLINE"
    title: product?.title ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: product?.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getCatalogProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-[#666666] mb-8 font-medium tracking-wide">
        <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <Link href={`/collections/${product.collection_slug || product.category}`} className="hover:text-[#0A192F] transition-colors capitalize">
          {product.collection || product.category}
        </Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-[#0A192F]">{product.title}</span>
      </nav>

      <ProductDetailClient product={product} variants={product.product_variants || []} />
    </div>
  )
}
