import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'

export const metadata = {
  title: 'About Us | Outerline NYC',
  description: 'The story behind Outerline NYC, founded by the Dynamic Duo embodying the pride of New York City and the five Boroughs.',
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
              BRAND STORY &amp; ETHOS
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A192F] leading-tight">
              DEFINED &amp; UNCONFINED
            </h1>
            
            {/* Exact User Bio Capitalized */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#F9F9F9] border border-[#E5E5E5] relative shadow-sm">
              <span className="text-4xl text-[#0A192F]/20 font-serif absolute top-3 left-4 leading-none">&ldquo;</span>
              <p className="font-serif text-lg md:text-xl text-[#0A192F] leading-relaxed relative z-10 pt-2 pb-2">
                Founded by the Dynamic Duo, embodying the spirit, style, and pride of each of the five Boroughs in modern New York streetwear. Outerline is founded by two individuals (aka: the Dynamic Duo) who's passionate about creativity and New York City. We embody the spirit, style, and pride of each of the five Boroughs in our clothing with unique designs. We aim to bring innovative and a fresh look to New York streetwear. They say &ldquo; when New York sneezes the world catches a cold &rdquo; and we're looking to be an infectious brand.
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
                COMMUNITY REVIEWS
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-[#0A192F] border border-[#1E293B] p-8 flex flex-col justify-between text-white">
              {/* Subtle background ambient gradients */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Top card header */}
              <div className="relative z-10 space-y-3 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/60">
                    EST. NYC 2026
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono uppercase tracking-wider text-white/80">
                    ARCHIVAL EDITION
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
                  OUTERLINE NYC
                </h3>
                <p className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                  DEFINED &amp; UNCONFINED
                </p>
              </div>

              {/* Center Insignia */}
              <div className="relative z-10 py-6 space-y-4">
                <div className="border border-white/15 rounded-xl p-5 bg-white/[0.03] backdrop-blur-sm space-y-3">
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/50 block">
                    THE FIVE BOROUGHS OF NEW YORK
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/90">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      BROOKLYN
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      MANHATTAN
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      QUEENS
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      THE BRONX
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      STATEN ISLAND
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Embodying the authentic grit, cultural influence, and creative spirit of New York City in heavyweight, statement streetwear.
                </p>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between text-[11px] font-mono text-white/60">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>40.7128° N, 74.0060° W</span>
                </div>
                <span className="text-white/80 font-serif tracking-widest uppercase text-[10px]">
                  THE DYNAMIC DUO
                </span>
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
