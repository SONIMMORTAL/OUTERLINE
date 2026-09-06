'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const ANNOUNCEMENTS = [
  { text: 'FREE DOMESTIC SHIPPING ON ALL ORDERS OVER $100', link: '/collections/all' },
  { text: "USE CODE 'THANK YOU' FOR 15% OFF AT CHECKOUT", link: '/collections/all' },
  { text: 'LIMITED STREETWEAR RELEASE • NYC FIVE BOROUGHS HERITAGE', link: '/collections/all' },
]

export function TopAnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const current = ANNOUNCEMENTS[currentIndex]

  return (
    <div className="w-full bg-[#000000] text-[#FFFFFF] border-b border-white/10 z-50 h-8 sm:h-9 flex items-center justify-center px-4 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2 text-center"
        >
          <Link
            href={current.link}
            className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-white/90 hover:text-white transition-colors group font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>{current.text}</span>
            <ChevronRight className="w-3 h-3 text-white/50 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
