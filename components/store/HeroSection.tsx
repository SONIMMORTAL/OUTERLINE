'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function HeroSection() {
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

  return (
    <section className="relative h-screen w-full flex flex-col justify-end overflow-hidden bg-[#0A192F]">
      {/* High-Resolution Hero Photography featuring the neon "We belong here" sign */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Hero Photography */}
        <Image
          src="/NEW HRO.png"
          alt="Outerline NYC — We Belong Here"
          fill
          priority
          quality={95}
          className="hidden md:block object-cover object-center"
          sizes="100vw"
        />

        {/* Mobile Hero Photography (Optimized Vertical Portrait) */}
        <Image
          src="/NEW HRO MOBILE.png"
          alt="Outerline NYC — We Belong Here"
          fill
          priority
          quality={95}
          className="block md:hidden object-cover object-center"
          sizes="100vw"
        />

        {/* Continuous smooth luxury gradient with zero vertical split lines */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Editorial Copy Block — Lower-Left Corner */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-start text-left space-y-4 px-6 sm:px-12 md:px-16 lg:px-24 pb-14 sm:pb-16 md:pb-20 max-w-2xl"
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
          className="font-bodoni font-medium text-4xl sm:text-5xl md:text-6xl lg:text-[70px] text-[#FAF6EE] leading-[1.05] tracking-tight drop-shadow-sm"
        >
          DEFINED &amp; <span className="font-bodoni italic font-normal text-[#FAF6EE]">UNCONFINED</span>
        </motion.h1>
        
        {/* CTA Link */}
        <motion.div variants={item} className="pt-2">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-3 font-condensed font-semibold text-xs sm:text-sm uppercase tracking-[0.25em] text-[#FAF6EE] hover:text-white transition-all group pb-1.5 border-b border-[#FAF6EE]/50 hover:border-[#FAF6EE] w-fit"
          >
            <span>SHOP THE COLLECTION</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
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
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
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
