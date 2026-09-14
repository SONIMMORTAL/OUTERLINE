'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  ArrowLeft,
  ExternalLink,
  Check,
  Tag,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { calculateOrderTotals } from '@/lib/pricing'
import { US_STATE_TAX_RATES } from '@/lib/taxes'
import { DELIVERY_ESTIMATE, PAYMENT_HOLD_LABEL } from '@/lib/store-policies'
import { normalizePhone } from '@/lib/phone'

/* ==========================================================================
   Payment Method Configuration
   Both methods save the order as "Awaiting Payment" and reserve its stock first.
   PayPal: the shopper gets an order number and a PayPal link.
   Card: the shopper goes straight to Stripe's payment page and returns to /checkout/success.
   Card payments show only when NEXT_PUBLIC_STRIPE_ENABLED=true (set once Stripe keys and the webhook are configured).
   ========================================================================== */
type PaymentMethod = 'paypal' | 'stripe'
const PAYPAL_ENABLED = true
const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true'

const STATE_CODES = Object.keys(US_STATE_TAX_RATES).sort()
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/
// How long to wait for the browser to leave for Stripe before offering a link to tap instead.
const SLOW_REDIRECT_MS = 4000

const inputBaseClass = 'w-full bg-[#F9F9F9] border text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:bg-[#FFFFFF] transition-all'
const inputClass = `${inputBaseClass} border-[#E5E5E5] focus:border-[#0A192F]`
const invalidInputClass = `${inputBaseClass} border-red-500 focus:border-red-600`
const labelClass = 'text-[10px] uppercase tracking-widest text-[#666666] font-semibold'

interface PlacedOrder {
  orderNumber: number
  paymentUrl: string
  total: number
  email: string
  name: string
}

interface CheckoutDetails {
  name: string
  email: string
  phone: string
  address: { line1: string; line2: string; city: string; state: string; zip: string }
}

// field is the input to highlight, or null for problems the server reports about the whole order.
interface CheckoutProblem {
  field: string | null
  message: string
}

// The same checks the server makes, so the shopper sees what to fix next to the button instead of a click that seems to do nothing.
function findCheckoutProblem({ name, email, phone, address }: CheckoutDetails): CheckoutProblem | null {
  if (!name.trim()) return { field: 'checkout-name', message: 'Please enter your full name.' }
  if (!EMAIL_PATTERN.test(email.trim())) return { field: 'checkout-email', message: 'Please enter a valid email address.' }
  if (phone.trim() && !normalizePhone(phone)) return { field: 'checkout-phone', message: 'Please enter a valid phone number, or leave it blank.' }
  if (!address.line1.trim()) return { field: 'checkout-line1', message: 'Please enter your street address.' }
  if (!address.city.trim()) return { field: 'checkout-city', message: 'Please enter your city.' }
  if (!US_STATE_TAX_RATES[address.state]) return { field: 'checkout-state', message: 'Please choose your state.' }
  if (!ZIP_PATTERN.test(address.zip.trim())) return { field: 'checkout-zip', message: 'Please enter a valid 5-digit ZIP code.' }
  return null
}

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>('paypal')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
  })
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formError, setFormError] = useState<CheckoutProblem | null>(null)
  const [slowPaymentUrl, setSlowPaymentUrl] = useState<string | null>(null)
  const slowRedirectTimer = useRef<number | undefined>(undefined)

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const { items, totalPrice, clearCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
    useCartStore.persist.rehydrate()

    // Back from Stripe without paying: the cart is untouched, so release the held order and let them try again.
    const cancelledOrderId = new URLSearchParams(window.location.search).get('cancelled')
    if (cancelledOrderId) {
      window.history.replaceState(null, '', '/checkout')
      if (STRIPE_ENABLED) setSelectedMethod('stripe')
      toast.info('Card payment cancelled. Your cart is still here.')
      fetch('/api/checkout/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: cancelledOrderId }),
      }).catch(() => {})
    }

    // The browser's Back button can restore this page mid-redirect; don't leave the button spinning.
    const resetAfterBack = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      window.clearTimeout(slowRedirectTimer.current)
      setSlowPaymentUrl(null)
      setIsProcessing(false)
    }
    window.addEventListener('pageshow', resetAfterBack)
    return () => window.removeEventListener('pageshow', resetAfterBack)
  }, [])

  if (!mounted) return null

  const totals = calculateOrderTotals({
    subtotal: totalPrice(),
    discountPercentage: appliedDiscount?.percentage ?? 0,
    state: shippingAddress.state,
  })

  // Order Confirmation Screen
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4 pt-32 pb-16">
        <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 md:p-10 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666]">Order #{placedOrder.orderNumber}</p>
            <h1 className="font-serif text-2xl text-[#0A192F]">Your order is reserved</h1>
            <p className="text-sm text-[#666666] leading-relaxed">
              Thank you, <span className="font-semibold text-[#0A192F]">{placedOrder.name}</span>. Complete your PayPal payment of{' '}
              <span className="font-semibold text-[#0A192F]">${placedOrder.total.toFixed(2)}</span> within {PAYMENT_HOLD_LABEL} to confirm it and keep your sizes reserved.
            </p>
          </div>

          <a
            href={placedOrder.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#0070BA] text-[#FFFFFF] font-semibold tracking-wide text-sm hover:bg-[#005EA6] transition-colors rounded-lg shadow-md flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Pay ${placedOrder.total.toFixed(2)} with PayPal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4 text-left space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0A192F]">What Happens Next</p>
            <ol className="text-xs text-[#666666] space-y-1.5 leading-relaxed list-decimal list-inside">
              <li>Pay on PayPal. Your payment is matched to invoice <span className="font-mono font-semibold text-[#0A192F]">OL-{placedOrder.orderNumber}</span> and confirmed automatically.</li>
              <li>We confirm the payment and prepare your order.</li>
              <li>Once it ships, standard delivery takes {DELIVERY_ESTIMATE} and tracking appears on your order page.</li>
            </ol>
          </div>

          <p className="text-[11px] text-[#666666]">
            Save your order number. Check its status anytime with <span className="font-mono">{placedOrder.email}</span> and #{placedOrder.orderNumber}.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 px-6 py-3 border border-[#0A192F] text-[#0A192F] font-serif tracking-widest text-xs uppercase hover:bg-[#0A192F] hover:text-white transition-colors"
            >
              Order Status
            </Link>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest text-xs uppercase hover:bg-[#000000] transition-colors"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center px-4 py-24">
        <h1 className="font-serif text-3xl text-[#0A192F] mb-4">Your cart is empty</h1>
        <p className="text-[#666666] text-sm mb-8">Add items to your cart before checking out.</p>
        <Link
          href="/collections/all"
          className="px-8 py-3.5 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest text-xs uppercase hover:bg-[#000000] transition-colors"
        >
          SHOP NOW
        </Link>
      </div>
    )
  }

  const handleApplyPromoCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setPromoError('')
    if (!promoCodeInput.trim()) {
      setPromoError('Please enter a promo code.')
      return
    }

    setIsApplyingPromo(true)
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput.trim() })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.valid && data.percentage) {
        setAppliedDiscount({ code: data.code, percentage: data.percentage })
        toast.success(`Promo code "${data.code}" applied: ${data.percentage}% off.`)
        setPromoCodeInput('')
      } else {
        setPromoError(data.error || 'Invalid or expired promo code.')
      }
    } catch {
      setPromoError('Could not check that promo code. Please try again.')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedDiscount(null)
    setPromoError('')
    toast.info('Promo code removed.')
  }

  const fieldProps = (id: string) => ({
    id,
    className: formError?.field === id ? invalidInputClass : inputClass,
    'aria-invalid': formError?.field === id || undefined,
    'aria-describedby': formError?.field === id ? 'checkout-error' : undefined,
  })

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isProcessing || !selectedMethod) return
    const paymentMethod = selectedMethod

    // Some autofill tools and password managers fill fields without React noticing, so use what is actually in the form.
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '')
    const details: CheckoutDetails = {
      name: field('name'),
      email: field('email'),
      phone: field('tel'),
      address: {
        line1: field('address-line1'),
        line2: field('address-line2'),
        city: field('city'),
        state: field('state'),
        zip: field('zip'),
      },
    }
    setCustomerName(details.name)
    setCustomerEmail(details.email)
    setCustomerPhone(details.phone)
    setShippingAddress(details.address)

    const problem = findCheckoutProblem(details)
    setFormError(problem)
    if (problem?.field) {
      const input = document.getElementById(problem.field)
      input?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      input?.focus({ preventScroll: true })
    }
    if (problem) return

    window.clearTimeout(slowRedirectTimer.current)
    setSlowPaymentUrl(null)
    setIsProcessing(true)
    let redirecting = false
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          customerName: details.name,
          customerEmail: details.email,
          customerPhone: details.phone,
          shippingAddress: details.address,
          discountCode: appliedDiscount?.code || '',
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            slug: item.slug,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError({ field: null, message: data.error || 'We could not place your order. Please try again.' })
        return
      }

      if (paymentMethod === 'stripe') {
        // The cart is cleared on /checkout/success, so it survives if the shopper backs out of Stripe.
        redirecting = true
        window.location.assign(data.paymentUrl)
        // Some in-app browsers and blockers stop the redirect; give the shopper a link to tap rather than a spinner forever.
        slowRedirectTimer.current = window.setTimeout(() => setSlowPaymentUrl(data.paymentUrl), SLOW_REDIRECT_MS)
        return
      }

      setPlacedOrder({
        orderNumber: data.orderNumber,
        paymentUrl: data.paymentUrl,
        total: data.totals.total,
        email: details.email.trim(),
        name: details.name.trim(),
      })
      clearCart()
      window.scrollTo({ top: 0 })
    } catch {
      setFormError({ field: null, message: 'Network error. Please check your connection and try again.' })
    } finally {
      if (!redirecting) setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-24 sm:pt-[100px] md:pt-[116px]">
      {/* Breadcrumb */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-xs text-[#666666] font-medium tracking-wide">
            <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="text-[#0A192F]">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Left Column — Customer Info + Payment */}
          <form
            onSubmit={handlePlaceOrder}
            onInput={() => { if (formError) setFormError(null) }}
            noValidate
            className="lg:col-span-3 space-y-8"
          >
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} aria-label="Go back" className="p-2 hover:bg-[#F3F3F3] rounded-md transition-colors">
                <ArrowLeft className="w-4 h-4 text-[#0A192F]" />
              </button>
              <h1 className="font-serif text-2xl md:text-3xl text-[#0A192F] tracking-tight">Secure Checkout</h1>
            </div>

            {/* Customer Information */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-3">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="checkout-name" className={labelClass}>Full Name *</label>
                  <input
                    {...fieldProps('checkout-name')}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="checkout-email" className={labelClass}>Email Address *</label>
                  <input
                    {...fieldProps('checkout-email')}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="checkout-phone" className={labelClass}>Phone (Optional, for delivery questions)</label>
                  <input
                    {...fieldProps('checkout-phone')}
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(718) 555-0123"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-3">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="checkout-line1" className={labelClass}>Address Line 1 *</label>
                  <input
                    {...fieldProps('checkout-line1')}
                    name="address-line1"
                    type="text"
                    autoComplete="address-line1"
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="checkout-line2" className={labelClass}>Apt / Suite (Optional)</label>
                  <input
                    {...fieldProps('checkout-line2')}
                    name="address-line2"
                    type="text"
                    autoComplete="address-line2"
                    value={shippingAddress.line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                    placeholder="Apt 4B"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-city" className={labelClass}>City *</label>
                    <input
                      {...fieldProps('checkout-city')}
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Brooklyn"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-state" className={labelClass}>State *</label>
                    <select
                      {...fieldProps('checkout-state')}
                      name="state"
                      autoComplete="address-level1"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    >
                      <option value="">Select</option>
                      {STATE_CODES.map((code) => (
                        <option key={code} value={code} title={US_STATE_TAX_RATES[code].name}>{code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-zip" className={labelClass}>ZIP *</label>
                    <input
                      {...fieldProps('checkout-zip')}
                      name="zip"
                      type="text"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      placeholder="11201"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#888888]">We currently ship within the United States.</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-3">
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {PAYPAL_ENABLED && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('paypal')}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === 'paypal'
                        ? 'border-[#0A192F] bg-[#0A192F]/5'
                        : 'border-[#E5E5E5] hover:border-[#0A192F]/40 bg-[#FFFFFF]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedMethod === 'paypal' ? 'border-[#0A192F]' : 'border-[#CCCCCC]'
                    }`}>
                      {selectedMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#003087]" />
                        <span className="text-sm font-semibold text-[#0A192F]">PayPal</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-semibold uppercase tracking-wider">Recommended</span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-0.5">Pay with PayPal balance, linked bank, or card. You&apos;ll get your order number first.</p>
                    </div>
                  </button>
                )}

                {STRIPE_ENABLED && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('stripe')}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === 'stripe'
                        ? 'border-[#0A192F] bg-[#0A192F]/5'
                        : 'border-[#E5E5E5] hover:border-[#0A192F]/40 bg-[#FFFFFF]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedMethod === 'stripe' ? 'border-[#0A192F]' : 'border-[#CCCCCC]'
                    }`}>
                      {selectedMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#635BFF]" />
                        <span className="text-sm font-semibold text-[#0A192F]">Credit / Debit Card</span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-0.5">Card, Apple Pay, or Google Pay on Stripe&apos;s secure payment page.</p>
                    </div>
                  </button>
                )}
              </div>

              {formError && (
                <p
                  id="checkout-error"
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                >
                  {formError.message}
                </p>
              )}

              {selectedMethod && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.15em] uppercase text-sm hover:bg-[#000000] disabled:opacity-50 transition-all rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {selectedMethod === 'stripe' ? 'Opening Secure Payment...' : 'Placing Order...'}
                    </span>
                  ) : (
                    <span>
                      {selectedMethod === 'paypal' && 'Place Order & Pay with PayPal'}
                      {selectedMethod === 'stripe' && 'Pay with Card'}
                      {' — $'}{totals.total.toFixed(2)}
                    </span>
                  )}
                </button>
              )}

              {slowPaymentUrl && isProcessing && (
                <p className="text-center text-xs text-[#666666]">
                  Payment page not opening?{' '}
                  <a href={slowPaymentUrl} className="font-semibold text-[#0A192F] underline">Tap here to continue to secure payment</a>
                </p>
              )}
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-[11px] text-[#666666]">
                Your personal information is protected. Payment is handled by {STRIPE_ENABLED ? 'PayPal or Stripe' : 'PayPal'}; we never see or store your payment details.
              </p>
            </div>
          </form>

          {/* Right Column — Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-6 lg:sticky lg:top-28">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-3">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-20 rounded overflow-hidden bg-[#F3F3F3] shrink-0">
                      <Image src={item.image} alt={item.productTitle} fill className="object-cover" sizes="64px" />
                      <span className="absolute top-0.5 right-0.5 bg-[#0A192F] text-[#FFFFFF] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-xs font-semibold text-[#0A192F] leading-tight">{item.productTitle}</h4>
                        <p className="text-[10px] text-[#666666] mt-0.5">{item.color} / {item.size}</p>
                      </div>
                      <span className="text-xs font-medium text-[#0A192F]">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-[#E5E5E5] pt-4 space-y-2">
                <label htmlFor="promo-code" className="text-[10px] uppercase tracking-widest text-[#0A192F] font-bold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0A192F]" />
                  <span>Promo Code / Coupon</span>
                </label>

                {!appliedDiscount ? (
                  <form onSubmit={handleApplyPromoCode} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        id="promo-code"
                        type="text"
                        placeholder="e.g. THANK YOU"
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value.toUpperCase())
                          setPromoError('')
                        }}
                        className="flex-1 bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs font-mono uppercase rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#0A192F] focus:bg-white transition-all placeholder:text-[#999999]"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingPromo || !promoCodeInput.trim()}
                        className="px-4 py-2.5 bg-[#0A192F] text-[#FFFFFF] rounded-lg text-xs font-serif uppercase tracking-wider hover:bg-[#000000] disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                      >
                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p role="alert" className="text-[10px] text-red-600 font-mono">{promoError}</p>
                    )}
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <span className="text-xs font-mono font-bold text-emerald-800 uppercase">
                          {appliedDiscount.code}
                        </span>
                        <span className="text-[10px] text-emerald-700 ml-1.5 font-medium">
                          ({appliedDiscount.percentage}% OFF APPLIED)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromoCode}
                      className="p-1 rounded text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition-colors"
                      title="Remove promo code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E5E5] pt-4 space-y-2">
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>Subtotal</span>
                  <span className="text-[#0A192F] font-medium font-mono">${totals.subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-xs text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Discount ({appliedDiscount.code} - {appliedDiscount.percentage}%)
                    </span>
                    <span className="font-mono font-semibold">-${totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Standard Shipping ({DELIVERY_ESTIMATE})
                  </span>
                  <span className={`font-medium ${totals.shippingAmount === 0 ? 'text-green-600' : 'text-[#0A192F]'}`}>
                    {totals.shippingAmount === 0 ? 'FREE' : `$${totals.shippingAmount.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>{totals.taxLabel}</span>
                  <span className="text-[#0A192F] font-medium font-mono">${totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#0A192F] pt-2 border-t border-[#E5E5E5]">
                  <span className="uppercase tracking-widest text-xs">Total</span>
                  <span className="text-lg font-mono">${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[10px] text-[#999999] leading-relaxed space-y-1 pt-2 border-t border-[#E5E5E5]">
                <p>By placing this order, you agree to our <Link href="/policies/returns" className="underline hover:text-[#0A192F]">Return Policy</Link> and <Link href="/policies/shipping" className="underline hover:text-[#0A192F]">Shipping Policy</Link>.</p>
                <p>All sales are final. Returns accepted only for defective or incorrectly shipped items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
