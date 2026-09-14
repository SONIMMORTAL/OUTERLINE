'use client'

import { useRef } from 'react'
import { getImageProps } from 'next/image'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.15,
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }
    },
  }

  // Art direction: the wide photo for landscape screens and the tall one for portrait screens (phones, tablets held upright).
  // A <picture> downloads only the photo that is shown, so it can load eagerly at high priority.
  const photo = { alt: 'Outerline NYC — We Belong Here', fill: true, sizes: '100vw', quality: 95, loading: 'eager', fetchPriority: 'high' } as const
  const { props: { srcSet: portraitSrcSet } } = getImageProps({ ...photo, src: '/NEW HRO MOBILE.png' })
  const { props: landscapePhoto } = getImageProps({ ...photo, src: '/NEW HRO.png' })

  return (
    // Starts below the fixed header and fills the rest of the smallest visible viewport (svh ignores mobile browser toolbars),
    // so the whole photo and the button show on first load without scrolling. min-h keeps room for the copy on landscape phones.
    <section
      ref={sectionRef}
      className="relative mt-(--header-height) h-[calc(100svh_-_var(--header-height))] min-h-[26rem] w-full flex flex-col justify-end overflow-hidden bg-[#0A192F]"
    >
      {/* High-Resolution Hero Photography featuring the neon "We belong here" sign */}
      <div className="absolute inset-0 z-0">
        {/* Screens rarely match the photo's shape, so part of it is cropped. The object positions keep the neon sign
            and the model in frame and crop the pavement first. */}
        <picture>
          <source media="(orientation: portrait)" srcSet={portraitSrcSet} sizes={photo.sizes} />
          <img
            {...landscapePhoto}
            alt={photo.alt}
            className="object-cover landscape:object-[50%_35%] portrait:object-[50%_45%]"
          />
        </picture>

        {/* Illuminated night-lights ambiance & glow (Brighter NYC night look) */}
        {/* Soft atmospheric gradient allowing lights to shine through */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Luminous streetlights & neon sign radiant highlights */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-cyan-400/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

        {/* Subtle luminous vignette for copy contrast without crushing image brightness */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Editorial Copy Block — Lower-Left Corner. Padding and headline shrink on short screens so the copy leaves the sign visible. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-start text-left space-y-4 px-6 sm:px-12 md:px-16 lg:px-24 pb-[clamp(2.5rem,8svh,5rem)] max-w-2xl"
      >
        {/* Location / Brand Header */}
        <motion.p
          variants={item}
          className="font-condensed font-medium text-xs sm:text-sm uppercase tracking-[0.3em] text-[#FAF6EE]/85"
        >
          BROOKLYN, NEW YORK
        </motion.p>

        {/* Editorial Headline */}
        <motion.h1
          variants={item}
          className="font-bodoni font-medium text-[length:clamp(2.25rem,min(7vw,8svh),4.375rem)] text-[#FAF6EE] leading-[1.05] tracking-tight drop-shadow-sm"
        >
          DEFINED &amp; <span className="font-bodoni italic font-normal text-[#FAF6EE]">UNCONFINED</span>
        </motion.h1>

        {/* CTA Link */}
        <motion.div variants={item} className="pt-4">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-3 w-fit bg-[#FAF6EE] text-[#0A192F] px-7 sm:px-9 py-3.5 sm:py-4 font-condensed font-bold text-xs sm:text-sm uppercase tracking-[0.22em] shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:bg-white transition-colors group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF6EE]"
          >
            <span>SHOP THE COLLECTION</span>
            <span aria-hidden="true" className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Discreet Lower-Right Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-12 right-6 sm:right-12 md:right-16 z-10 hidden sm:flex items-center gap-2 text-[#FAF6EE]/60 cursor-pointer font-condensed text-[11px] tracking-[0.25em] uppercase hover:text-[#FAF6EE] transition-colors"
        onClick={() => {
          const hero = sectionRef.current
          if (hero) window.scrollTo({ top: hero.getBoundingClientRect().bottom + window.scrollY, behavior: 'smooth' })
        }}
      >
        <span>SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-[#FAF6EE]/80" />
        </motion.div>
      </motion.div>
    </section>
  )
}
