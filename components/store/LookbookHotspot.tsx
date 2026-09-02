'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

interface HotspotProps {
  x: number
  y: number
  product: {
    title: string
    price: number
    slug: string
    image: string
    sizes: string[]
  }
}

export function LookbookHotspot({ x, y, product }: HotspotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')

  const handleAddToCart = () => {
    // Add to cart logic using Zustand store
    console.log(`Added ${product.title} (Size: ${selectedSize}) to cart`)
    setIsOpen(false)
  }

  return (
    <div 
      className="absolute z-20"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Hotspot Dot */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative w-6 h-6 flex items-center justify-center group"
      >
        <span className="absolute inset-0 bg-[#0A192F] rounded-full opacity-40 animate-ping" />
        <span className="relative w-3 h-3 bg-[#0A192F] rounded-full shadow-[0_0_10px_rgba(249,248,246,0.8)] transition-transform group-hover:scale-150" />
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-[#F3F3F3] border border-[#E5E5E5] rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="relative h-48 w-full bg-[#F9F9F9]">
              {product.image ? (
                <Image src={product.image} alt={product.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#F9F9F9] to-[#E5E5E5]" />
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 p-1.5 bg-[#FFFFFF]/50 hover:bg-[#FFFFFF] rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-4 h-4 text-[#0A192F]" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-serif text-[#0A192F] text-lg truncate">{product.title}</h4>
                <p className="text-[#666666] text-sm">${product.price.toFixed(2)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[#0A192F]">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-8 h-8 text-xs font-medium border rounded transition-colors ${
                        selectedSize === size 
                          ? 'border-[#0A192F] bg-[#0A192F] text-[#FFFFFF]' 
                          : 'border-[#E5E5E5] text-[#666666] hover:border-[#666666]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full py-2.5 bg-[#0A192F] text-[#FFFFFF] text-xs font-serif tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors hover:bg-[#000000]"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
