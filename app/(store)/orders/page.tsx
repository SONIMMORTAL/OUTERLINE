'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Package, 
  Search, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShoppingBag,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  productTitle: string
  size: string
  color: string
  quantity: number
  price: number
  image?: string
}

interface StoredOrder {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  total_amount: number
  subtotal: number
  discount_applied: number
  status: string
  payment_method: string
  shipping_address: any
  order_items: OrderItem[]
  tracking_number?: string
  carrier?: string
  created_at: string
}

export default function OrderHistoryPage() {
  const [emailInput, setEmailInput] = useState('')
  const [orderNumberInput, setOrderNumberInput] = useState('')
  const [orders, setOrders] = useState<StoredOrder[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Preload saved lookup email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('outerline_customer_lookup_email')
      if (savedEmail) {
        setEmailInput(savedEmail)
        fetchOrders(savedEmail)
      }
    }
  }, [])

  const fetchOrders = async (email: string, orderNum?: string) => {
    if (!email && !orderNum) return
    setIsLoading(true)
    setSearched(true)

    try {
      const params = new URLSearchParams()
      if (email) params.set('email', email.trim())
      if (orderNum) params.set('orderNumber', orderNum.trim())

      const res = await fetch(`/api/orders/history?${params.toString()}`)
      const data = await res.json()

      if (res.ok && data.orders) {
        setOrders(data.orders)
        if (email) {
          localStorage.setItem('outerline_customer_lookup_email', email.trim())
        }
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to lookup orders:', err)
      toast.error('Unable to fetch orders. Please verify your email and try again.')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim() && !orderNumberInput.trim()) {
      toast.error('Please enter the email address used for your order.')
      return
    }
    fetchOrders(emailInput.trim(), orderNumberInput.trim())
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'fulfilled' || s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-mono uppercase tracking-wider font-semibold">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          Delivered
        </span>
      )
    }
    if (s === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono uppercase tracking-wider font-semibold">
          <Truck className="w-3 h-3 text-blue-600" />
          In Transit
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono uppercase tracking-wider font-semibold">
        <Clock className="w-3 h-3 text-amber-700" />
        Processing / Confirmed
      </span>
    )
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-28 sm:pt-32 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Order History</span>
        </nav>

        {/* Header */}
        <div className="space-y-3 border-b border-[#E5E5E5] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            CUSTOMER PORTAL
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F]">
            ORDER HISTORY &amp; TRACKING
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-2xl">
            View your recent purchases, track fulfillment and delivery milestones, or review order receipts across the five Boroughs.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handleSearch} className="space-y-4">
            <h2 className="text-xs uppercase font-mono tracking-widest font-semibold text-[#0A192F]">
              LOOK UP YOUR PAST ORDERS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ENTER ORDER EMAIL (REQUIRED)"
                  className="w-full bg-white border border-[#E5E5E5] text-xs font-mono px-4 py-3.5 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                  required
                />
              </div>
              <div className="sm:col-span-5 flex gap-2">
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="ORDER # (OPTIONAL)"
                  className="w-full bg-white border border-[#E5E5E5] text-xs font-mono px-4 py-3.5 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#0A192F] text-white px-6 py-3.5 rounded font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'FINDING...' : 'SEARCH'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#666666]">
              Enter the email address you provided at checkout to retrieve your complete order record.
            </p>
          </form>
        </div>

        {/* Results Area */}
        {isLoading && (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#666666]">
              Searching Outerline archives...
            </p>
          </div>
        )}

        {!isLoading && searched && orders && orders.length === 0 && (
          <div className="border border-[#E5E5E5] rounded-2xl p-10 text-center space-y-4 bg-[#FAFAFA]">
            <div className="w-12 h-12 rounded-full bg-[#0A192F]/5 text-[#0A192F] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0A192F]">NO ORDERS FOUND</h3>
            <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any orders matching <strong>{emailInput}</strong>. Please ensure this is the exact email address entered during checkout.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link
                href="/collections/all"
                className="px-6 py-3 bg-[#0A192F] text-white text-xs font-serif uppercase tracking-widest rounded hover:bg-black transition-colors"
              >
                Shop New Drops
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border border-[#0A192F] text-[#0A192F] text-xs font-serif uppercase tracking-widest rounded hover:bg-[#0A192F] hover:text-white transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-widest font-semibold text-[#0A192F]">
                PAST ORDERS ({orders.length})
              </h2>
              <span className="text-xs font-mono text-[#666666]">
                Showing orders for {emailInput}
              </span>
            </div>

            <div className="space-y-6">
              {orders.map((order) => {
                const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })

                return (
                  <div 
                    key={order.id} 
                    className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white hover:border-[#0A192F]/40 transition-all shadow-xs"
                  >
                    {/* Order Top Bar */}
                    <div className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-lg text-[#0A192F]">
                            ORDER #{order.order_number || order.id.slice(-6).toUpperCase()}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs font-mono text-[#666666]">
                          Placed on {dateStr} • Payment: {order.payment_method}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-[#888888] block">
                          TOTAL PAID
                        </span>
                        <span className="font-serif text-xl font-bold text-[#0A192F]">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 space-y-4">
                      <div className="divide-y divide-[#F0F0F0]">
                        {(order.order_items || []).map((item, idx) => (
                          <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                            <div className="space-y-1">
                              <span className="font-medium text-[#0A192F] block">
                                {item.productTitle}
                              </span>
                              <span className="text-[#666666] font-mono text-[11px]">
                                Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                              </span>
                            </div>
                            <span className="font-mono text-sm font-semibold text-[#0A192F]">
                              ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Financial breakdown */}
                      <div className="pt-4 border-t border-[#E5E5E5] bg-[#F9F9F9] rounded-xl p-4 space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-[#666666]">
                          <span>Subtotal</span>
                          <span>${Number(order.subtotal || order.total_amount).toFixed(2)}</span>
                        </div>
                        {order.discount_applied > 0 && (
                          <div className="flex justify-between text-green-700 font-semibold">
                            <span>Discount Applied (15% OFF)</span>
                            <span>-${Number(order.discount_applied).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[#666666]">
                          <span>Shipping (Orders over $100)</span>
                          <span>{Number(order.subtotal || order.total_amount) >= 100 ? 'FREE' : '$10.00'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#E5E5E5] font-bold text-[#0A192F] text-sm">
                          <span>Final Total</span>
                          <span>${Number(order.total_amount).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Tracking / Shipping Details */}
                      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[#666666] gap-2">
                        {order.tracking_number ? (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded">
                            <Truck className="w-3.5 h-3.5 text-blue-700" />
                            <span className="font-mono">
                              Carrier: {order.carrier || 'USPS'} • Tracking: {order.tracking_number}
                            </span>
                          </div>
                        ) : (
                          <p className="font-mono text-[11px] text-[#888888]">
                            Tracking number will be assigned upon carrier dispatch (3–7 business days).
                          </p>
                        )}

                        <div className="text-[11px] font-mono text-[#888888]">
                          Questions? Email{' '}
                          <a href="mailto:Support@outerlineusa.com" className="text-[#0A192F] underline font-semibold">
                            Support@outerlineusa.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
