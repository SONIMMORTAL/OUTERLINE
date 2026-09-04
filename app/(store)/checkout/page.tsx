'use client'

import React, { useState, useEffect } from 'react'
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
  Smartphone,
  ArrowLeft,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import { calculateTax } from '@/lib/taxes'

/* ==========================================================================
   Payment Method Configuration
   Toggle these flags to enable/disable payment methods.
   When Stripe is ready, set STRIPE_ENABLED = true.
   ========================================================================== */
const PAYPAL_ENABLED = true
const CASHAPP_ENABLED = true
const STRIPE_ENABLED = false // Enable after Stripe URL verification

// PayPal merchant recipient email
const PAYPAL_EMAIL = '1truesurvivor@gmail.com'
const PAYPAL_ME_LINK = '' // Optional custom PayPal.me handle

// Cash App $cashtag for the seller
const CASHAPP_TAG = '' // e.g. '$OuterlineNYC'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'cashapp' | 'stripe' | null>('paypal')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [copiedTag, setCopiedTag] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { items, totalPrice, clearCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
    useCartStore.persist.rehydrate()
  }, [])

  if (!mounted) return null

  const currentTotal = totalPrice()
  const isFreeShipping = currentTotal >= 150
  const normalizedState = (shippingAddress.state || 'NY').trim().toUpperCase()
  const shippingCost = isFreeShipping ? 0 : (normalizedState === 'NY' || !shippingAddress.state ? 8 : 10)
  const taxInfo = calculateTax(currentTotal, normalizedState)
  const taxAmount = taxInfo.taxAmount
  const orderTotal = currentTotal + shippingCost + taxAmount

  if (items.length === 0 && !orderSubmitted) {
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

  const handleCopyTag = () => {
    if (CASHAPP_TAG) {
      navigator.clipboard.writeText(CASHAPP_TAG)
      setCopiedTag(true)
      toast.success('Cash App tag copied!')
      setTimeout(() => setCopiedTag(false), 2000)
    }
  }

  const handlePayPalCheckout = async () => {
    if (!customerEmail || !customerName) {
      toast.error('Please enter your name and email to proceed.')
      return
    }

    setIsProcessing(true)

    // Fire notifications to 1outerline@gmail.com and 718-600-7410
    try {
      await fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress,
          items,
          totalAmount: orderTotal,
          paymentMethod: 'PayPal'
        })
      })
    } catch (err) {
      console.error('Notify dispatch error:', err)
    }

    // Construct official PayPal checkout payment URL
    const itemNames = items.map(i => `${i.productTitle} (${i.size}/${i.color})`).join(', ')
    const paypalStandardUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(PAYPAL_EMAIL)}&currency_code=USD&amount=${orderTotal.toFixed(2)}&item_name=${encodeURIComponent(`Outerline NYC: ${itemNames}`)}&no_shipping=2`

    // Open PayPal in new window/tab
    window.open(paypalStandardUrl, '_blank')

    setTimeout(() => {
      setOrderSubmitted(true)
      setIsProcessing(false)
    }, 1000)
  }

  const handleCashAppCheckout = async () => {
    if (!customerEmail || !customerName) {
      toast.error('Please fill in your name and email before proceeding.')
      return
    }

    setIsProcessing(true)

    try {
      await fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress,
          items,
          totalAmount: orderTotal,
          paymentMethod: 'Cash App'
        })
      })
    } catch (err) {
      console.error('Notify dispatch error:', err)
    }

    setTimeout(() => {
      setOrderSubmitted(true)
      setIsProcessing(false)
    }, 500)
  }

  const handleStripeCheckout = async () => {
    if (!customerEmail) {
      toast.error('Please enter your email.')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ variantId: item.id, quantity: item.quantity })),
          customerEmail,
          discountCode: ''
        })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Checkout failed.')
      }
    } catch {
      toast.error('Failed to connect to payment processor.')
    }
    setIsProcessing(false)
  }

  // Order Confirmation Screen
  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 md:p-10 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif text-2xl text-[#0A192F]">Order Submitted</h1>
          <p className="text-sm text-[#666666] leading-relaxed">
            Thank you, <span className="font-semibold text-[#0A192F]">{customerName}</span>! Your order for{' '}
            <span className="font-semibold text-[#0A192F]">${orderTotal.toFixed(2)}</span> has been received.
          </p>

          <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4 text-left space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0A192F]">What Happens Next</p>
            <ul className="text-xs text-[#666666] space-y-1.5 leading-relaxed">
              <li>1. Complete your payment to <span className="font-mono font-semibold text-[#0A192F]">{PAYPAL_EMAIL}</span> via PayPal if not already completed.</li>
              <li>2. Send a confirmation email to <a href="mailto:support@outerline.com" className="font-mono text-[#0A192F] underline">Support@outerline.com</a> with your name and order items.</li>
              <li>3. We'll verify your payment and ship within 3–7 business days.</li>
              <li>4. You'll receive tracking information once your order ships.</li>
            </ul>
          </div>

          <div className="bg-[#0A192F]/5 border border-[#0A192F]/15 rounded-lg p-4 text-left">
            <p className="text-xs font-semibold text-[#0A192F] mb-1">📧 Important</p>
            <p className="text-xs text-[#666666] leading-relaxed">
              Please include <span className="font-mono font-semibold text-[#0A192F]">"Order: {customerName}"</span> in your payment note/memo so we can match your payment to your order.
            </p>
          </div>

          <Link
            href="/"
            onClick={() => clearCart()}
            className="inline-block px-8 py-3.5 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest text-xs uppercase hover:bg-[#000000] transition-colors"
          >
            RETURN TO STORE
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-16 md:pt-20">
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
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 hover:bg-[#F3F3F3] rounded-md transition-colors">
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
                  <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">Email Address *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
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
                  <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">Address Line 1 *</label>
                  <input
                    type="text"
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})}
                    placeholder="123 Main Street"
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">Apt / Suite (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.line2}
                    onChange={(e) => setShippingAddress({...shippingAddress, line2: e.target.value})}
                    placeholder="Apt 4B"
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      placeholder="Brooklyn"
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      placeholder="NY"
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">ZIP *</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                      placeholder="11201"
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-3">
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* PayPal Option */}
                {PAYPAL_ENABLED && (
                  <button
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
                      <p className="text-[11px] text-[#666666] mt-0.5">Pay securely with PayPal balance, linked bank, or card</p>
                    </div>
                  </button>
                )}

                {/* Cash App Option */}
                {CASHAPP_ENABLED && (
                  <button
                    onClick={() => setSelectedMethod('cashapp')}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === 'cashapp'
                        ? 'border-[#0A192F] bg-[#0A192F]/5'
                        : 'border-[#E5E5E5] hover:border-[#0A192F]/40 bg-[#FFFFFF]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedMethod === 'cashapp' ? 'border-[#0A192F]' : 'border-[#CCCCCC]'
                    }`}>
                      {selectedMethod === 'cashapp' && <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#00D632]" />
                        <span className="text-sm font-semibold text-[#0A192F]">Cash App</span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-0.5">Send payment via Cash App to complete your order</p>
                    </div>
                  </button>
                )}

                {/* Stripe Option (disabled until verified) */}
                {STRIPE_ENABLED && (
                  <button
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
                      <p className="text-[11px] text-[#666666] mt-0.5">Secure card payment via Stripe</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Payment Method Details */}
              {selectedMethod === 'cashapp' && CASHAPP_TAG && (
                <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#0A192F]">Cash App Payment Instructions</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg">
                      <span className="text-sm font-mono font-bold text-[#00D632]">{CASHAPP_TAG}</span>
                    </div>
                    <button
                      onClick={handleCopyTag}
                      className="px-3 py-2 text-xs bg-[#0A192F] text-[#FFFFFF] rounded-lg hover:bg-[#000000] transition-colors flex items-center gap-1.5"
                    >
                      {copiedTag ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTag ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Send <span className="font-semibold text-[#0A192F]">${orderTotal.toFixed(2)}</span> to the Cash App tag above. Include your name in the payment note.
                  </p>
                </div>
              )}

              {/* Place Order Button */}
              {selectedMethod && (
                <button
                  onClick={() => {
                    if (selectedMethod === 'paypal') handlePayPalCheckout()
                    else if (selectedMethod === 'cashapp') handleCashAppCheckout()
                    else if (selectedMethod === 'stripe') handleStripeCheckout()
                  }}
                  disabled={isProcessing || !customerEmail || !customerName}
                  className="w-full py-4 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.15em] uppercase text-sm hover:bg-[#000000] disabled:opacity-50 transition-all rounded-lg shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span>
                      {selectedMethod === 'paypal' && 'Pay with PayPal'}
                      {selectedMethod === 'cashapp' && 'Complete Order via Cash App'}
                      {selectedMethod === 'stripe' && 'Pay with Card'}
                      {' — $'}{orderTotal.toFixed(2)}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-[11px] text-[#666666]">
                Your personal information is protected. We never store payment details on our servers.
              </p>
            </div>
          </div>

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

              <div className="border-t border-[#E5E5E5] pt-4 space-y-2">
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>Subtotal</span>
                  <span className="text-[#0A192F] font-medium">${currentTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Standard Shipping (3–7 business days)
                  </span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-[#0A192F]'}`}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>{taxInfo.label}</span>
                  <span className="text-[#0A192F] font-medium font-mono">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#0A192F] pt-2 border-t border-[#E5E5E5]">
                  <span className="uppercase tracking-widest text-xs">Total</span>
                  <span className="text-lg font-mono">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Policies reminder */}
              <div className="text-[10px] text-[#999999] leading-relaxed space-y-1 pt-2 border-t border-[#E5E5E5]">
                <p>By placing this order, you agree to our <Link href="/policies/returns" className="underline hover:text-[#0A192F]">Return Policy</Link> and <Link href="/policies/shipping" className="underline hover:text-[#0A192F]">Shipping Policy</Link>.</p>
                <p>All sales are final. Returns accepted only for defective items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
