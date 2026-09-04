'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

const NAV_LINKS = [
  { name: 'SHOP ALL', href: '/collections/all' },
  { name: 'BEEN BROOKLYN', href: '/collections/been-brooklyn' },
  { name: 'SO NEW YORK', href: '/collections/so-new-york' },
  { name: 'TESTIMONIALS', href: '/testimonials' },
  { name: 'SOCIAL', href: '/social' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { scrollY } = useScroll()
  const { openCart, items } = useCartStore()
  
  useEffect(() => {
    setMounted(true)
    useCartStore.persist.rehydrate()
  }, [])

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  const cartItemCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#E5E5E5] shadow-xs' 
            : 'bg-[#FFFFFF]/85 backdrop-blur-md border-b border-[#E5E5E5]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-[#0A192F] p-2 -ml-2 hover:bg-[#F3F3F3] rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Logo / Home Button */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link 
              href="/" 
              className="flex items-center gap-3 group transition-transform duration-200 hover:scale-105"
              aria-label="Outerline Home - Return to Homepage"
            >
              <img 
                src="/OUTERLINE LOGO.png" 
                alt="Outerline Logo" 
                className="h-9 md:h-12 w-auto object-contain transition-opacity group-hover:opacity-90" 
              />
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="uppercase tracking-widest text-xs text-[#666666] hover:text-[#0A192F] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-[#0A192F] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </Link>
            ))}
          </div>

          {/* Cart */}
          <div className="flex items-center justify-end">
            <button
              onClick={openCart}
              className="relative p-2 text-[#0A192F] hover:text-[#666666] transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1 right-0 w-4 h-4 md:w-4.5 md:h-4.5 bg-[#0A192F] text-[#FFFFFF] text-[9px] md:text-[10px] font-bold flex items-center justify-center rounded-full"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FFFFFF] flex flex-col"
          >
            <div className="px-4 h-16 flex items-center justify-between border-b border-[#E5E5E5]">
              <img src="/OUTERLINE LOGO.png" alt="Outerline Logo" className="h-8 w-auto object-contain" />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#0A192F] p-2 -mr-2"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-brand font-bold tracking-[0.16em] text-[#0A192F] hover:text-[#0A192F] transition-colors uppercase"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
