import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowUpRight, Heart, MessageSquare, Play, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Social Hub | Outerline NYC',
  description: 'Connect with Outerline NYC across Instagram, TikTok, X, and YouTube. Streetwear drop updates, NYC community fits, and behind-the-scenes.',
}

export default function SocialPage() {
  const socialChannels = [
    {
      name: 'Instagram',
      handle: '@outerlinenyc',
      desc: 'Lookbooks, editorial model shoots, drop countdowns, and NYC street style.',
      url: 'https://instagram.com/outerlinenyc',
      stat: 'Daily Stories & Drops',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      handle: '@outerlinenyc',
      desc: 'Behind-the-scenes Brooklyn tailoring, fleece wear-tests, and viral styling clips.',
      url: 'https://tiktok.com/@outerlinenyc',
      stat: 'Streetwear Videos & Fits',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      handle: '@outerlinenyc',
      desc: 'Real-time drop alerts, restock announcements, and conversation with the creators.',
      url: 'https://twitter.com/outerlinenyc',
      stat: 'Drop Alerts & Announcements',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      handle: '@outerlinenyc',
      desc: 'High-production visual editorials, NYC borough mini-documentaries, and lookbooks.',
      url: 'https://youtube.com/@outerlinenyc',
      stat: 'Editorial & Campaign Films',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ]

  const feedItems = [
    {
      image: '/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png',
      caption: 'Been Brooklyn heavyweight hoodie in blackout. Engineered for the borough. 10oz fleece.',
      handle: '@outerlinenyc',
      tag: 'DROP 01',
      likes: '1.4k',
      comments: '128'
    },
    {
      image: '/SONY WHITE & PINKMODEL.png',
      caption: 'So New York kinetic pink & white palette. Summer drop energy live on the store.',
      handle: '@outerlinenyc',
      tag: 'EDITORIAL',
      likes: '2.1k',
      comments: '204'
    },
    {
      image: '/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png',
      caption: 'Crafted in NYC. When New York sneezes, the world catches a cold. We embody the culture.',
      handle: '@outerlinenyc',
      tag: 'COMMUNITY',
      likes: '980',
      comments: '87'
    },
    {
      image: '/BEEN BROOKLYN BLACK SWEATER model.png',
      caption: 'Five boroughs swagger. Heavyweight 3-end fleece with clean drape.',
      handle: '@outerlinenyc',
      tag: 'STREETWEAR',
      likes: '3.2k',
      comments: '315'
    }
  ]

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Social Pages</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            OFFICIAL SOCIAL HUB
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0A192F]">
            FOLLOW THE MOVEMENT
          </h1>
          <p className="text-[#666666] text-base md:text-lg leading-relaxed">
            Stay plugged in for exclusive drop dates, behind-the-scenes design stories in Brooklyn, and community street style.
          </p>
        </div>

        {/* Social Platforms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialChannels.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 md:p-8 rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#0A192F] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0A192F] text-white flex items-center justify-center">
                      {channel.icon}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#0A192F] group-hover:underline">
                        {channel.name}
                      </h3>
                      <span className="text-xs font-mono text-[#666666]">{channel.handle}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#888888] group-hover:text-[#0A192F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {channel.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#0A192F] font-semibold bg-[#F9F9F9] px-2.5 py-1 rounded border border-[#E5E5E5]">
                  {channel.stat}
                </span>
                <span className="text-xs font-serif uppercase tracking-widest text-[#0A192F] font-semibold group-hover:underline">
                  Connect &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Curated Social Feed Grid */}
        <div className="space-y-8 border-t border-[#E5E5E5] pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#0A192F] font-mono font-semibold">
                CURATED STREAM
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0A192F]">
                LATEST STREET STYLE &amp; LOOKS
              </h2>
            </div>
            <Link
              href="/testimonials"
              className="text-xs uppercase tracking-widest text-[#0A192F] font-medium hover:underline pb-1"
            >
              Share Your Fit In Testimonials &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {feedItems.map((item, idx) => (
              <div key={idx} className="group rounded-xl border border-[#E5E5E5] overflow-hidden bg-[#FAFAFA] flex flex-col">
                <div className="relative aspect-[4/5] bg-[#F0F0F0] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-mono uppercase px-2 py-0.5 rounded">
                    {item.tag}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-[#333333] leading-relaxed line-clamp-2">
                    {item.caption}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#888888] pt-2 border-t border-[#E5E5E5]">
                    <span className="font-mono text-[#0A192F]">{item.handle}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" /> {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {item.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Support Notice */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#0A192F] text-white text-center space-y-3">
          <p className="font-serif text-xl md:text-2xl">
            Have a collaboration inquiry, sizing question, or press request?
          </p>
          <p className="text-xs text-white/80 font-mono">
            Direct email: <a href="mailto:support@outerline.com" className="text-white underline font-semibold">Support@outerline.com</a> • Customer service responds within 48–72 hours
          </p>
        </div>

      </div>
    </div>
  )
}
