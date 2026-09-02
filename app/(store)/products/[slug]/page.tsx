import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductDetailClient } from '@/components/store/ProductDetailClient'
import { mockProducts } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return {
    title: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | OUTERLINE`,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  let product: any = null
  
  try {
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('slug', slug)
      .single()
    if (data) product = data
  } catch (err) {
    // schema not created
  }

  if (!product) {
    product = mockProducts.find(p => p.slug === slug)
  }

  if (!product) {
    notFound()
  }

  const images = product.images || []
  const mainImage = images[0]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
