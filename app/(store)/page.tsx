import { Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ProductCard from '@/components/store/ProductCard'
import { AnimatedSection } from '@/components/store/AnimatedSection'
import { HeroSection } from '@/components/store/HeroSection'

import { mockProducts, collections } from '@/lib/mock-data'

export default async function HomePage() {
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
              <h2 className="font-brand text-3xl md:text-4xl font-bold tracking-[0.12em] text-[#0A192F] uppercase">SHOP BY COLLECTION</h2>
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
                    <h3 className="font-brand text-3xl md:text-4xl font-bold text-white tracking-[0.1em] uppercase group-hover:translate-x-1 transition-transform duration-300">
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
                    <h2 className="font-brand text-3xl md:text-4xl font-bold tracking-[0.12em] text-[#0A192F] uppercase">{collection.name}</h2>
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

      {/* 5. Community & Testimonial Preview */}
      <section className="bg-[#FFFFFF] py-20 px-4 sm:px-6 lg:px-8 w-full border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-12">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#0A192F] font-mono font-semibold">
                COMMUNITY & STREET REVIEWS
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#0A192F] uppercase">TESTIMONIALS & FITS</h2>
              <p className="text-[#666666]">Real feedback, customer videos, and NYC street style.</p>
            </div>
            <Link 
              href="/testimonials"
              className="text-[#0A192F] text-[10px] uppercase tracking-widest font-medium hover:text-[#000000] transition-colors pb-1 border-b border-[#0A192F] w-fit"
            >
              VIEW ALL & SHARE YOUR FIT &rarr;
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(5)}
                  </div>
                  <p className="font-serif italic text-[#0A192F] text-sm leading-relaxed">
                    &ldquo;The Been Brooklyn Hoodie weight is insane. True heavyweight fleece, premium eyelets, and fits clean with cargos. Best streetwear pickup of the year.&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]/60 text-xs">
                  <div>
                    <span className="font-semibold text-[#0A192F] block">Marcus T.</span>
                    <span className="text-[10px] text-[#888888]">Brooklyn, NY • Verified Buyer</span>
                  </div>
                  <span className="text-[10px] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5E5E5] text-[#0A192F] font-medium">
                    Been Brooklyn Hoodie
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(5)}
                  </div>
                  <p className="font-serif italic text-[#0A192F] text-sm leading-relaxed">
                    &ldquo;Customer support answered all my sizing questions within a couple hours. Fast 4-day shipping to Queens and the print quality on the Baller Tee is top tier.&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]/60 text-xs">
                  <div>
                    <span className="font-semibold text-[#0A192F] block">Aaliyah K.</span>
                    <span className="text-[10px] text-[#888888]">Queens, NY • Verified Buyer</span>
                  </div>
                  <span className="text-[10px] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5E5E5] text-[#0A192F] font-medium">
                    Baller Tee
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(5)}
                  </div>
                  <p className="font-serif italic text-[#0A192F] text-sm leading-relaxed">
                    &ldquo;You can feel the five boroughs pride in every piece. The fabric is heavy, durable, and gets compliments whenever I am out in SoHo.&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]/60 text-xs">
                  <div>
                    <span className="font-semibold text-[#0A192F] block">Devon R.</span>
                    <span className="text-[10px] text-[#888888]">Manhattan, NYC • Verified Buyer</span>
                  </div>
                  <span className="text-[10px] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5E5E5] text-[#0A192F] font-medium">
                    So New York Hoodie
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 6. Brand Story & Dynamic Duo Bio */}
      <section id="brand-story" className="bg-[#FFFFFF] py-24 md:py-32 px-4 sm:px-6 lg:px-8 w-full border-t border-[#E5E5E5]">
        <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            ABOUT OUTER LINE
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-[#0A192F] tracking-wide">
            THE DYNAMIC DUO
          </h2>
          <p className="text-[#333333] text-base md:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            Outerline is founded by two individuals (aka: the dynamic duo) who's passionate about creativity and New York City. We embody the spirit, style, and pride of each of the five boroughs in our clothing with unique designs. We aim to bring innovative and a fresh look to New York streetwear. They say &ldquo; when New York sneezes the world catches a cold &rdquo; and we're looking to be an infectious brand. GOD BLESS YOU!!!
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/about"
              className="px-8 py-3.5 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.2em] uppercase text-xs hover:bg-[#000000] transition-colors"
            >
              LEARN OUR STORY
            </Link>
            <Link
              href="/testimonials"
              className="px-8 py-3.5 border border-[#0A192F] text-[#0A192F] font-serif tracking-[0.2em] uppercase text-xs hover:bg-[#0A192F] hover:text-white transition-colors"
            >
              COMMUNITY FITS
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
