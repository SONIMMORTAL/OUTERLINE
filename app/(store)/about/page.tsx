import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, MapPin } from 'lucide-react'

export const metadata = {
  title: 'About Us | Outerline NYC',
  description: 'The story behind Outerline NYC, founded by the dynamic duo embodying the pride of New York City and the five boroughs.',
}

export default function AboutPage() {
  const boroughs = [
    { name: 'Brooklyn', desc: 'Home of the heavyweight fleece and iconic grit.', tag: 'Been Brooklyn' },
    { name: 'Manhattan', desc: 'The kinetic heartbeat of SoHo street couture.', tag: 'So New York' },
    { name: 'Queens', desc: 'Diverse hustle and unmatched borough swagger.', tag: 'Borough Wide' },
    { name: 'The Bronx', desc: 'Birthplace of hip hop and raw expressive style.', tag: 'The Origin' },
    { name: 'Staten Island', desc: 'Unbroken pride and grounded NYC roots.', tag: 'Five Borough Strong' },
  ]

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">About Us</span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-b border-[#E5E5E5] pb-16">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
              BRAND STORY & ETHOS
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A192F] leading-tight">
              DEFINED &amp; UNCONFINED
            </h1>
            
            {/* Exact User Bio */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#F9F9F9] border border-[#E5E5E5] relative shadow-sm">
              <span className="text-4xl text-[#0A192F]/20 font-serif absolute top-3 left-4 leading-none">&ldquo;</span>
              <p className="font-serif text-lg md:text-xl text-[#0A192F] leading-relaxed relative z-10 pt-2 pb-2">
                Outerline is founded by two individuals (aka: the dynamic duo) who's passionate about creativity and New York City. We embody the spirit, style, and pride of each of the five boroughs in our clothing with unique designs. We aim to bring innovative and a fresh look to New York streetwear. They say &ldquo; when New York sneezes the world catches a cold &rdquo; and we're looking to be an infectious brand.
              </p>
              <p className="font-mono font-bold tracking-widest text-[#0A192F] text-base mt-3">
                GOD BLESS YOU!!!
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/collections/all"
                className="px-8 py-3.5 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.2em] uppercase text-xs hover:bg-[#000000] transition-colors"
              >
                SHOP THE DROPS
              </Link>
              <Link
                href="/testimonials"
                className="px-8 py-3.5 border border-[#0A192F] text-[#0A192F] font-serif tracking-[0.2em] uppercase text-xs hover:bg-[#0A192F] hover:text-white transition-colors"
              >
                COMMUNITY TESTIMONIALS
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-[#F3F3F3] border border-[#E5E5E5]">
              <Image
                src="/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png"
                alt="Outerline NYC - The Dynamic Duo Model Shoot"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/80">BROOKLYN STUDIO</span>
                <p className="font-serif text-lg">Heavyweight Fleece &amp; Borough Identity</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Five Boroughs */}
        <div className="space-y-8 border-b border-[#E5E5E5] pb-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#0A192F] font-mono font-semibold">
              NYC HERITAGE
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#0A192F]">THE FIVE BOROUGHS</h2>
            <p className="text-[#666666] text-sm leading-relaxed">
              Every cut, colorway, and silhouette pays homage to the distinctive swagger and resilience of New York City.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {boroughs.map((b) => (
              <div key={b.name} className="p-5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] flex flex-col justify-between hover:border-[#0A192F] transition-colors">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-[#666666] bg-white px-2 py-0.5 rounded border border-[#E5E5E5] inline-block">
                    {b.tag}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#0A192F]">{b.name}</h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{b.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#E5E5E5]/60 flex items-center gap-1 text-[11px] text-[#0A192F] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  NYC Borough
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
