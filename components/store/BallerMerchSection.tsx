'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Colorway {
  name: string
  label: string
  frontImage: string
  backImage: string
  accentColor: string
  accentBorder: string
  hoodieImage: string
  teeImage: string
}

const COLORWAYS: Colorway[] = [
  {
    name: 'black-blue',
    label: 'Black & Blue',
    frontImage: '/BEEN BROOKLYN BALLER BLK&BLUE .png',
    backImage: '/BEEN BROOKLYN BALLER BLK&BLUE back.png',
    accentColor: 'bg-blue-600',
    accentBorder: 'border-blue-500',
    hoodieImage: '/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png',
    teeImage: '/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png',
  },
  {
    name: 'black-red',
    label: 'Black & Red',
    frontImage: '/BEEN BROOKLYN BALLER BLK&RED.png',
    backImage: '/BEEN BROOKLYN BALLER BLK&RE back.png',
    accentColor: 'bg-red-600',
    accentBorder: 'border-red-500',
    hoodieImage: '/outer-line-models-uniform-1200x1500/exec-4e2f213c-0849-4984-ba90-acae102dcee5-4x5.png',
    teeImage: '/outer-line-models-uniform-1200x1500/exec-ef9b1dd7-b53d-4f43-8c23-cec3246c4ce4-4x5.png',
  },
  {
    name: 'white-blue',
    label: 'White & Blue',
    frontImage: '/BEEN BROOKLYN BALLER White&Blue.png',
    backImage: '/BEEN BROOKLYN BALLER White&Blueback.png',
    accentColor: 'bg-sky-400',
    accentBorder: 'border-sky-400',
    hoodieImage: '/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie.jpg',
    teeImage: '/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/grey_baller_blue_stripe_wht_tee.jpg',
  },
  {
    name: 'white-red',
    label: 'White & Red',
    frontImage: '/BEEN BROOKLYN BALLER White&RED.png',
    backImage: '/BEEN BROOKLYN BALLER White&red back.png',
    accentColor: 'bg-rose-500',
    accentBorder: 'border-rose-400',
    hoodieImage: '/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_hoodie.jpg',
    teeImage: '/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/grey_baller_red_stripe_wht_tee.jpg',
  },
]

export function BallerMerchSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [showBack, setShowBack] = useState(false)

  const activeColorway = COLORWAYS[activeIdx]

  return (
    <section className="bg-[#07111E] text-white py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-[#16273e] relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] uppercase font-mono tracking-[0.25em] text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              EXCLUSIVE DROP // BALLER MERCH
            </div>
            <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.12em] uppercase text-white leading-tight">
              BROOKLYN BALLER
            </h2>
            <p className="text-white/70 max-w-2xl text-sm sm:text-base leading-relaxed">
              From Da Beginning. Heavyweight collegiate athletic stripes and the iconic Brooklyn Baller animated mascot. Engineered with premium fleece and ring-spun cotton.
            </p>
          </div>

          <Link
            href="/collections/baller"
            className="px-6 py-3.5 bg-white text-[#07111E] hover:bg-white/90 font-mono text-xs uppercase tracking-[0.2em] font-semibold transition-colors rounded-sm flex items-center gap-2 w-fit shadow-lg shadow-black/40"
          >
            SHOP BALLER MERCH &rarr;
          </Link>
        </div>

        {/* Interactive Baller Mascot & Garment Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Mascot Character Feature (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 relative overflow-hidden backdrop-blur-sm">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-[0.2em] text-white/60 uppercase">
                MASCOT EDITION
              </span>
              <button
                onClick={() => setShowBack(!showBack)}
                className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded transition-colors"
              >
                {showBack ? 'VIEW FRONT' : 'VIEW BACK'}
              </button>
            </div>

            {/* Mascot Image Display */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square max-w-md flex items-center justify-center py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeColorway.name}-${showBack ? 'back' : 'front'}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={showBack ? activeColorway.backImage : activeColorway.frontImage}
                    alt={`Brooklyn Baller Mascot ${activeColorway.label}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Colorway Selection Pills */}
            <div className="w-full mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">COLORWAY</span>
                <span className="text-[11px] font-mono font-medium text-white uppercase">{activeColorway.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {COLORWAYS.map((c, idx) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setActiveIdx(idx)
                      setShowBack(false)
                    }}
                    className={`py-2 px-1 rounded border text-center transition-all text-[11px] font-mono uppercase tracking-wider flex flex-col items-center gap-1.5 ${
                      activeIdx === idx
                        ? 'bg-white/20 border-white text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.accentColor}`} />
                    <span className="text-[9px] leading-tight truncate w-full px-0.5">{c.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Garment Product Cards (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Product 1: Baller Hoodie */}
              <div className="group rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/25 transition-all duration-300 p-5 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-black/40 mb-4 border border-white/5">
                    <Image
                      src={activeColorway.hoodieImage}
                      alt="Been Brooklyn Baller Hoodie"
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#07111E]/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase border border-white/10 text-white">
                      $55
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-1">
                    HEAVYWEIGHT FLEECE
                  </span>
                  <h3 className="font-brand text-xl font-bold uppercase tracking-wider text-white group-hover:text-white/90">
                    Baller Hoodie
                  </h3>
                  <p className="text-white/60 text-xs mt-1.5 line-clamp-2">
                    Heritage collegiate athletic stripes meet modern Brooklyn streetwear tailoring. 10 oz fleece with double-needle seams.
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-white/10">
                  <Link
                    href="/products/been-brooklyn-baller-hoodie"
                    className="w-full block py-2.5 text-center bg-white text-[#07111E] hover:bg-white/90 font-mono text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors rounded"
                  >
                    SHOP HOODIE &rarr;
                  </Link>
                </div>
              </div>

              {/* Product 2: Baller Tee */}
              <div className="group rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/25 transition-all duration-300 p-5 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-black/40 mb-4 border border-white/5">
                    <Image
                      src={activeColorway.teeImage}
                      alt="Been Brooklyn Baller Tee"
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#07111E]/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase border border-white/10 text-white">
                      $35
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-1">
                    COMBED RINGSPUN COTTON
                  </span>
                  <h3 className="font-brand text-xl font-bold uppercase tracking-wider text-white group-hover:text-white/90">
                    Baller Tee
                  </h3>
                  <p className="text-white/60 text-xs mt-1.5 line-clamp-2">
                    Iconic Been Brooklyn Baller typography and character print on premium 4.3 oz ringspun cotton with side-seams.
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-white/10">
                  <Link
                    href="/products/been-brooklyn-baller-tee"
                    className="w-full block py-2.5 text-center bg-white text-[#07111E] hover:bg-white/90 font-mono text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors rounded"
                  >
                    SHOP TEE &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Quality Specs Banner */}
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Collegiate Ribbed Stripes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Heavyweight 10oz &amp; 4.3oz Tailoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Free Shipping Over $100</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
