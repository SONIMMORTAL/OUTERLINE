'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store/cart'
import Link from 'next/link'
import { toast } from 'sonner'
import { calculateTax, US_STATE_TAX_RATES } from '@/lib/taxes'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

const UPSELL_PRODUCTS = [
  {
    productId: '3',
    productTitle: 'Been Brooklyn Baller Tee',
    slug: 'been-brooklyn-baller-tee',
    sku: 'BB-BT-001',
    price: 35,
    image: '/BEEN BROOKLYN BALLER BLK&BLUE .png',
    defaultColor: 'BLACK/BLUE',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    productId: '1',
    productTitle: 'Been Brooklyn Hoodie',
    slug: 'been-brooklyn-hoodie',
    sku: 'BB-HD-001',
    price: 55,
    image: '/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png',
    defaultColor: 'BLACK/BLACK',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    productId: '8',
    productTitle: 'So New York Emoji Tee',
    slug: 'so-new-york-emoji-tee',
    sku: 'SNY-EM-001',
    price: 35,
    image: '/SO NY white Tee BLK letters Front.png',
    defaultColor: 'WHITE/BLACK',
    sizes: ['S', 'M', 'L', 'XL']
  }
]

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    '3': 'L',
    '1': 'L',
    '8': 'L'
  })
  
  // Shipping estimator state
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false)
  const [shippingState, setShippingState] = useState('NY')
  const [shippingZip, setShippingZip] = useState('')
  const [shippingEstimated, setShippingEstimated] = useState(false)

  const { 
    isOpen, 
    closeCart, 
    items, 
    updateQuantity, 
    removeItem, 
    addItem,
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

  // Calculate estimated shipping & sales taxes
  const taxInfo = calculateTax(currentTotal, shippingState)
  const estimatedTax = taxInfo.taxAmount
  const estimatedShippingCost = isFreeShipping ? 0 : (shippingState === 'NY' ? 8 : 10)
  const estimatedGrandTotal = currentTotal + estimatedShippingCost + estimatedTax

  const handleQuickAdd = (upsell: typeof UPSELL_PRODUCTS[0]) => {
    const size = selectedSizes[upsell.productId] || 'L'
    const variantId = `${upsell.productId}-${upsell.defaultColor}-${size}`

    addItem({
      id: variantId,
      productId: upsell.productId,
      productTitle: upsell.productTitle,
      slug: upsell.slug,
      sku: `${upsell.sku}-${size}`,
      size: size,
      color: upsell.defaultColor,
      price: upsell.price,
      image: upsell.image,
    })

    toast.success(`Added ${upsell.productTitle} (${size}) to cart!`)
  }

  const handleEstimateShipping = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingZip.trim()) {
      toast.error('Please enter a valid zip code.')
      return
    }
    setShippingEstimated(true)
    toast.success(`Shipping rate updated for ${shippingState} ${shippingZip}`)
  }

  // Filter out upsells that are already in cart
  const availableUpsells = UPSELL_PRODUCTS.filter(
    u => !items.some(item => item.productId === u.productId)
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md bg-[#FFFFFF] border-l border-[#E5E5E5] p-0 flex flex-col text-[#0A192F]">
        <SheetHeader className="p-5 border-b border-[#E5E5E5] flex flex-row items-center justify-between">
          <SheetTitle className="font-serif tracking-[0.2em] text-lg text-[#0A192F]">YOUR CART</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingCart className="w-16 h-16 text-[#E5E5E5] mb-6 mx-auto" strokeWidth={1} />
              <p className="text-[#666666] mb-8 tracking-wide">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="px-8 py-3 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.2em] uppercase text-sm hover:bg-[#000000] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Scrollable Area: Cart Items + Upsells */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 p-3 rounded-lg border border-[#E5E5E5] bg-[#FFFFFF]"
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
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link href={`/products/${item.slug}`} onClick={closeCart}>
                              <h3 className="font-serif text-sm leading-tight text-[#0A192F] hover:text-[#666666] transition-colors">
                                {item.productTitle}
                              </h3>
                            </Link>
                            <span className="text-sm font-semibold whitespace-nowrap text-[#0A192F]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="bg-[#F3F3F3] text-[#666666] uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border border-[#E5E5E5]">
                              {item.color}
                            </span>
                            <span className="bg-[#F3F3F3] text-[#666666] uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border border-[#E5E5E5]">
                              {item.size}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0F0F0]">
                          <div className="flex items-center border border-[#E5E5E5] rounded bg-[#F9F9F9]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-[#666666] hover:text-[#0A192F] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium text-[#0A192F]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-[#666666] hover:text-[#0A192F] transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#888888] hover:text-red-500 transition-colors p-1 cursor-pointer"
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

              {/* Upsell Section (Featured as requested: arrow down to checkout) */}
              {availableUpsells.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-widest text-[#0A192F]">
                      <Sparkles className="w-3.5 h-3.5 text-[#0A192F]" />
                      <span>{!isFreeShipping ? 'UPSELL: UNLOCK FREE SHIPPING' : 'YOU MAY ALSO LIKE'}</span>
                    </div>
                    {!isFreeShipping && (
                      <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-mono font-medium">
                        +${amountToFreeShipping.toFixed(0)} to ship free
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {availableUpsells.slice(0, 2).map((upsell) => {
                      const activeSize = selectedSizes[upsell.productId] || 'L'
                      return (
                        <div 
                          key={upsell.productId}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#0A192F]/40 transition-colors"
                        >
                          <div className="relative w-14 h-16 rounded overflow-hidden bg-white shrink-0 border border-[#E5E5E5]">
                            <Image
                              src={upsell.image}
                              alt={upsell.productTitle}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-xs text-[#0A192F] truncate font-medium">
                              {upsell.productTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-[#0A192F]">
                                ${upsell.price.toFixed(2)}
                              </span>
                              {/* Quick Size Selection */}
                              <div className="flex items-center gap-1">
                                {upsell.sizes.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedSizes(prev => ({ ...prev, [upsell.productId]: s }))}
                                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                                      activeSize === s 
                                        ? 'bg-[#0A192F] text-white border-[#0A192F]' 
                                        : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#0A192F]'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuickAdd(upsell)}
                            className="px-3 py-2 bg-[#0A192F] text-white text-[10px] uppercase font-serif tracking-widest rounded hover:bg-black transition-colors shrink-0 cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer & Calculations (Anchored at Bottom) */}
            <div className="p-4 md:p-5 bg-[#FFFFFF] border-t border-[#E5E5E5] space-y-3.5 shadow-lg">
              
              {/* 1. Free Shipping Progress Bar — Directly Above Totals & Checkout */}
              <div className="p-3 bg-[#F9F9F9] rounded-lg border border-[#E5E5E5] space-y-2">
                <div className="flex items-center justify-between text-xs tracking-wider uppercase font-semibold">
                  <span className="text-[#0A192F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0A192F]" />
                    {isFreeShipping 
                      ? '🎉 YOU UNLOCKED FREE SHIPPING!' 
                      : `ADD $${amountToFreeShipping.toFixed(2)} FOR FREE SHIPPING`}
                  </span>
                  {isFreeShipping && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                </div>
                <div className="h-1.5 bg-[#E5E5E5] w-full rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${isFreeShipping ? 'bg-green-600' : 'bg-[#0A192F]'}`}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#666666]">
                  <span>Free shipping on all orders over $150</span>
                  <span className="font-mono font-medium">{progress.toFixed(0)}%</span>
                </div>
              </div>

              {/* 2. Shipping & Tax Estimator Accordion */}
              <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={() => setIsEstimatorOpen(!isEstimatorOpen)}
                  className="w-full flex items-center justify-between p-2.5 text-xs uppercase tracking-widest text-[#0A192F] font-medium hover:bg-[#F3F3F3] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#0A192F]" />
                    Estimate Shipping &amp; Taxes ({shippingState})
                  </span>
                  {isEstimatorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isEstimatorOpen && (
                  <form onSubmit={handleEstimateShipping} className="p-3 border-t border-[#E5E5E5] space-y-3 bg-[#FFFFFF]">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#666666] block mb-1">
                          Destination State
                        </label>
                        <select
                          value={shippingState}
                          onChange={(e) => {
                            setShippingState(e.target.value)
                            setShippingEstimated(true)
                          }}
                          className="w-full text-xs p-2 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                        >
                          {Object.keys(US_STATE_TAX_RATES).map((st) => (
                            <option key={st} value={st}>
                              {st} — {US_STATE_TAX_RATES[st].name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#666666] block mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="e.g. 11201"
                          value={shippingZip}
                          onChange={(e) => {
                            setShippingZip(e.target.value)
                            if (e.target.value.length >= 5) {
                              setShippingEstimated(true)
                            }
                          }}
                          className="w-full text-xs p-2 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#F9F9F9] border border-[#E5E5E5] text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#666666]">Standard Shipping:</span>
                        <span className="font-semibold text-[#0A192F]">
                          {isFreeShipping ? 'FREE' : `$${estimatedShippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666666]">Sales Tax:</span>
                        <span className="font-semibold text-[#0A192F]">
                          {taxInfo.label} (${estimatedTax.toFixed(2)})
                        </span>
                      </div>
                      <p className="text-[10px] text-green-700 font-medium pt-1 border-t border-[#E5E5E5]">
                        Estimated Delivery: 3–7 business days to {shippingState} {shippingZip || '(Enter Zip)'}
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* 3. Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#666666]">
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span className="font-medium text-[#0A192F] font-mono">${currentTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-wider">Estimated Shipping (3–7 Days)</span>
                  <span className={`font-medium font-mono ${isFreeShipping ? 'text-green-600' : 'text-[#0A192F]'}`}>
                    {isFreeShipping ? 'FREE' : `$${estimatedShippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-wider">{taxInfo.label}</span>
                  <span className="font-medium text-[#0A192F] font-mono">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5] text-sm font-semibold text-[#0A192F]">
                  <span className="uppercase tracking-widest text-xs">Estimated Total</span>
                  <span className="text-lg font-mono">${estimatedGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-[#888888] text-[10px] text-center">
                Standard Shipping: 3–7 business days. Taxes calculated based on destination.
              </p>

              <Link 
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 bg-[#0A192F] text-[#FFFFFF] font-brand tracking-[0.16em] uppercase text-xs font-bold hover:bg-[#000000] transition-colors flex items-center justify-center text-center block rounded cursor-pointer shadow-sm"
              >
                CHECKOUT &bull; ${estimatedGrandTotal.toFixed(2)}
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
