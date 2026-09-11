'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  ExternalLink
} from 'lucide-react'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/order-status'
import { trackingUrl } from '@/lib/carriers'
import { DELIVERY_ESTIMATE } from '@/lib/store-policies'

interface LookupOrder {
  order_number: number
  status: OrderStatus
  created_at: string
  payment_method: string
  subtotal: number
  discount_applied: number
  discount_code: string | null
  shipping_amount: number
  tax_amount: number
  total_amount: number
  tracking_number: string | null
  carrier: string | null
  shipping_city: string | null
  shipping_state: string | null
  payment_url: string | null
  payment_expires_at: string | null
  items: { product_title: string; size: string | null; color: string | null; quantity: number; unit_price: number }[]
}

const STATUS_STYLES: Record<OrderStatus, { className: string; Icon: typeof Clock; message: string }> = {
  pending: { className: 'bg-amber-100 text-amber-900', Icon: Clock, message: 'We have not received your PayPal payment yet.' },
  paid: { className: 'bg-emerald-100 text-emerald-800', Icon: CreditCard, message: 'Payment received. We are getting your order ready.' },
  processing: { className: 'bg-blue-100 text-blue-800', Icon: Package, message: 'Your order is being prepared for shipment.' },
  fulfilled: { className: 'bg-green-100 text-green-800', Icon: Truck, message: `Your order has shipped. Standard delivery takes ${DELIVERY_ESTIMATE}.` },
  cancelled: { className: 'bg-gray-100 text-gray-700', Icon: XCircle, message: 'This order was cancelled. Contact support with any questions.' },
}

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`

export default function OrderStatusPage() {
  const [emailInput, setEmailInput] = useState('')
  const [orderNumberInput, setOrderNumberInput] = useState('')
  const [order, setOrder] = useState<LookupOrder | null>(null)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotFound(false)
    setOrder(null)

    if (!emailInput.trim() || !orderNumberInput.trim()) {
      setError('Enter both the email and the order number from your confirmation.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/orders/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), orderNumber: orderNumberInput.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'We could not look up your order. Please try again.')
      } else if (!data.order) {
        setNotFound(true)
      } else {
        setOrder(data.order)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const status = order ? STATUS_STYLES[order.status] ?? STATUS_STYLES.pending : null
  const link = order ? trackingUrl(order.carrier, order.tracking_number) : null

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-28 sm:pt-32 md:pt-36 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Order Status</span>
        </nav>

        {/* Header */}
        <div className="space-y-3 border-b border-[#E5E5E5] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            CUSTOMER PORTAL
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F]">
            ORDER STATUS &amp; TRACKING
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-2xl">
            Check payment, shipping, and tracking for your order using the details from your order confirmation.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handleSearch} className="space-y-4">
            <h2 className="text-xs uppercase font-mono tracking-widest font-semibold text-[#0A192F]">
              FIND YOUR ORDER
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label htmlFor="lookup-email" className="sr-only">Order email</label>
                <input
                  id="lookup-email"
                  type="email"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="EMAIL USED AT CHECKOUT"
                  className="w-full bg-white border border-[#E5E5E5] text-xs font-mono px-4 py-3.5 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                  required
                />
              </div>
              <div className="sm:col-span-6 flex gap-2">
                <label htmlFor="lookup-order" className="sr-only">Order number</label>
                <input
                  id="lookup-order"
                  type="text"
                  inputMode="numeric"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="ORDER # (E.G. 1001)"
                  className="w-full bg-white border border-[#E5E5E5] text-xs font-mono px-4 py-3.5 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#0A192F] text-white px-6 py-3.5 rounded font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'FINDING...' : 'FIND'}</span>
                </button>
              </div>
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          </form>
        </div>

        {notFound && (
          <div className="border border-[#E5E5E5] rounded-2xl p-10 text-center space-y-4 bg-[#FAFAFA]">
            <div className="w-12 h-12 rounded-full bg-[#0A192F]/5 text-[#0A192F] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0A192F]">NO MATCHING ORDER</h3>
            <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
              Check that the email and order number match your confirmation exactly. Still stuck? Email{' '}
              <a href="mailto:Support@outerlineusa.com" className="text-[#0A192F] underline font-semibold">Support@outerlineusa.com</a>.
            </p>
          </div>
        )}

        {order && status && (
          <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-serif font-bold text-lg text-[#0A192F]">ORDER #{order.order_number}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${status.className}`}>
                    <status.Icon className="w-3 h-3" />
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#666666]">
                  Placed {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {order.shipping_city && ` · Shipping to ${order.shipping_city}, ${order.shipping_state}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#888888] block">Total</span>
                <span className="font-serif text-xl font-bold text-[#0A192F]">{money(order.total_amount)}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] p-4">
                {order.status === 'fulfilled' ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> : <status.Icon className="w-4 h-4 text-[#0A192F] mt-0.5 shrink-0" />}
                <div className="space-y-3 text-xs text-[#333333]">
                  <p>{status.message}</p>
                  {order.payment_url && (
                    <a
                      href={order.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#0070BA] text-white font-semibold hover:bg-[#005EA6] transition-colors"
                    >
                      Pay {money(order.total_amount)} with PayPal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {order.payment_url && order.payment_expires_at && (
                    <p className="text-[11px] text-[#666666]">
                      Pay by {new Date(order.payment_expires_at).toLocaleString()} or the order is released. Payments are confirmed automatically.
                    </p>
                  )}
                  {order.tracking_number && (
                    <p className="font-mono">
                      {order.carrier} tracking:{' '}
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#0A192F] underline font-semibold">
                          {order.tracking_number}
                        </a>
                      ) : order.tracking_number}
                    </p>
                  )}
                </div>
              </div>

              <div className="divide-y divide-[#F0F0F0]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-medium text-[#0A192F] block">{item.product_title}</span>
                      <span className="text-[#666666] font-mono text-[11px]">
                        Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#0A192F]">
                      {money(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E5E5E5] bg-[#F9F9F9] rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </div>
                {order.discount_applied > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Discount ({order.discount_code})</span>
                    <span>-{money(order.discount_applied)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#666666]">
                  <span>Shipping</span>
                  <span>{order.shipping_amount === 0 ? 'FREE' : money(order.shipping_amount)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Tax</span>
                  <span>{money(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E5E5E5] font-bold text-[#0A192F] text-sm">
                  <span>Total</span>
                  <span>{money(order.total_amount)}</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-[#888888]">
                Questions? Email{' '}
                <a href="mailto:Support@outerlineusa.com" className="text-[#0A192F] underline font-semibold">Support@outerlineusa.com</a>
                {' '}with your order number.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
