'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingBag, Plus, Minus, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store/cart'
import Link from 'next/link'

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const { 
    isOpen, 
    closeCart, 
    items, 
    updateQuantity, 
    removeItem, 
    totalPrice, 
    freeShippingProgress 
  } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const progress = freeShippingProgress()
  const currentTotal = totalPrice()
  const amountToFreeShipping = Math.max(0, 150 - currentTotal)
  const isFreeShipping = progress >= 100

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md bg-[#FFFFFF] border-l border-[#E5E5E5] p-0 flex flex-col text-[#0A192F]">
        <SheetHeader className="p-6 border-b border-[#E5E5E5]">
          <SheetTitle className="font-serif tracking-[0.2em] text-lg text-[#0A192F]">YOUR BAG</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className="w-16 h-16 text-[#E5E5E5] mb-6 mx-auto" strokeWidth={1} />
              <p className="text-[#666666] mb-8 tracking-wide">Your bag is empty.</p>
              <button
                onClick={closeCart}
                className="px-8 py-3 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.2em] uppercase text-sm hover:bg-[#000000] transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Free Shipping Bar */}
            <div className="p-4 bg-[#F9F9F9] border-b border-[#E5E5E5]">
              <div className="flex items-center justify-between text-xs tracking-widest uppercase mb-2">
                <span className="text-[#666666]">
                  {isFreeShipping 
                    ? 'You have free shipping!' 
                    : `Add $${amountToFreeShipping.toFixed(2)} for free shipping`}
                </span>
                {isFreeShipping && <Check className="w-4 h-4 text-[#0A192F]" />}
              </div>
              <div className="h-1 bg-[#E5E5E5] w-full rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#0A192F]"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <Link href={`/products/${item.slug}`} onClick={closeCart} className="shrink-0">
                      <div className="relative w-20 h-24 rounded overflow-hidden bg-[#F3F3F3]">
                        <Image
                          src={item.image}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link href={`/products/${item.slug}`} onClick={closeCart}>
                            <h3 className="font-serif text-sm leading-tight text-[#0A192F] hover:text-[#666666] transition-colors">
                              {item.productTitle}
                            </h3>
                          </Link>
                          <span className="text-sm font-medium whitespace-nowrap">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-[#F3F3F3] text-[#666666] uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border border-[#E5E5E5]">
                            {item.color}
                          </span>
                          <span className="bg-[#F3F3F3] text-[#666666] uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border border-[#E5E5E5]">
                            {item.size}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#E5E5E5] rounded-sm bg-[#F9F9F9]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-[#666666] hover:text-[#0A192F] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs text-[#0A192F]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-[#666666] hover:text-[#0A192F] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#666666] hover:text-red-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#FFFFFF] border-t border-[#E5E5E5]">
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-[#666666] uppercase tracking-widest">Subtotal</span>
                <span className="font-medium text-lg">${currentTotal.toFixed(2)}</span>
              </div>
              <p className="text-[#666666] text-xs text-center mb-4">
                Shipping & taxes calculated at checkout
              </p>
              <Link 
                href="/checkout"
                onClick={closeCart}
                className="w-full py-4 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.2em] uppercase text-sm hover:bg-[#000000] transition-colors flex items-center justify-center text-center block"
              >
                CHECKOUT
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
