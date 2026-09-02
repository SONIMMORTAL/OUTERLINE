import { Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import { AnimatedSection } from '@/components/store/AnimatedSection'
import { HeroSection } from '@/components/store/HeroSection'

import { mockProducts, collections } from '@/lib/mock-data'

export default async function HomePage() {
  const supabase = await createClient()

  const collectionCards = [
    { name: 'Been Brooklyn', slug: 'been-brooklyn', image: '/BEEN BROOKLYN BLACK SWEATER model.png', subtitle: 'Heavyweight Fleece & Borough Pride' },
    { name: 'So New York', slug: 'so-new-york', image: '/SONY WHITE & PINKMODEL.png', subtitle: 'Kinetic NYC Streetwear Essential' },
  ]

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Shop By Collection */}
      <section className="bg-[#FFFFFF] py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-12">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl md:text-4xl text-[#0A192F]">SHOP BY COLLECTION</h2>
              <p className="text-[#666666]">Explore our defined narratives.</p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {collectionCards.map((card) => (
                <Link key={card.slug} href={`/collections/${card.slug}`} className="group block relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[4/5] overflow-hidden bg-[#F3F3F3] rounded-xl border border-[#E5E5E5]">
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/70 transition-colors duration-500" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/80 font-mono font-medium">{card.subtitle}</span>
                    <h3 className="font-serif text-3xl md:text-4xl text-white tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                      {card.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 4. Products Grouped By Collection */}
      <section className="bg-[#F9F9F9] py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-24">
          {collections.map((collection, idx) => {
            const collectionProducts = mockProducts.filter(p => p.collection_slug === collection.slug).slice(0, 4)
            if (collectionProducts.length === 0) return null

            return (
              <AnimatedSection key={collection.slug} delay={0.1 * idx} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-4">
                  <div className="space-y-2">
                    <h2 className="font-serif text-3xl md:text-4xl text-[#0A192F] uppercase">{collection.name}</h2>
                    <p className="text-[#666666]">{collection.description}</p>
                  </div>
                  <Link 
                    href={`/collections/${collection.slug}`}
                    className="text-[#0A192F] text-[10px] uppercase tracking-widest font-medium hover:text-[#0A192F] transition-colors pb-1 border-b border-[#0A192F] hover:border-[#0A192F] w-fit"
                  >
                    VIEW ALL
                  </Link>
                </div>
                
                <div className={collectionProducts.length <= 2 
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl" 
                  : "grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8"
                }>
                  {collectionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </section>

      {/* 5. Brand Story */}
      <section id="brand-story" className="bg-[#FFFFFF] py-24 md:py-32 px-4 sm:px-6 lg:px-8 w-full border-t border-[#E5E5E5]">
        <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            ABOUT OUTER LINE
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-[#0A192F] tracking-wide">
            THE DYNAMIC DUO
          </h2>
          <p className="text-[#666666] text-base md:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            Outerline is founded by two individuals (aka: The Dynamic Duo) who's passionate about creativity and New York City. We embody the spirit, style, and pride of each of the five boroughs in our clothing with a unique style. We aim to bring innovative and fresh look to New York streetwear. They say when New York sneezes the world catches a cold and we're looking to be an infectious brand.
          </p>
        </AnimatedSection>
      </section>
    </div>
  )
}
