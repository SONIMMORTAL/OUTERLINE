import Link from 'next/link'
import { after } from 'next/server'
import { Check, Clock } from 'lucide-react'
import { getOrder, type OrderRecord } from '@/lib/orders'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { confirmCheckoutPayment } from '@/lib/stripe-orders'
import { DELIVERY_ESTIMATE } from '@/lib/store-policies'
import ClearCart from './ClearCart'

export const metadata = {
  title: 'Order Confirmation',
  robots: { index: false },
}

interface PaidCheckout {
  order: OrderRecord
  paid: boolean
}

// Stripe returns here with ?session_id=cs_... The session, not the query string, decides what the shopper sees.
async function loadCheckout(sessionId: string | undefined): Promise<PaidCheckout | null> {
  if (!sessionId?.startsWith('cs_') || !isStripeConfigured()) return null
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const order = session.client_reference_id ? await getOrder(session.client_reference_id) : null
    if (!order || session.status !== 'complete') return null

    const paid = session.payment_status === 'paid'
    if (paid && (order.status === 'pending' || order.status === 'cancelled')) {
      // Confirm now in case the webhook is slow. Whichever runs second finds the order already paid.
      after(() => confirmCheckoutPayment(session).catch((err) => console.error('[stripe] Success-page confirmation failed:', err)))
    }
    return { order, paid }
  } catch (err) {
    console.error('[stripe] Could not load the checkout session:', err)
    return null
  }
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  const checkout = await loadCheckout(session_id)
  const order = checkout?.order
  const processing = checkout?.paid === false

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4 pt-32 pb-16">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 md:p-10 shadow-xl space-y-6 text-center">
        {checkout && <ClearCart />}

        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${processing ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
          {processing ? <Clock className="w-8 h-8 text-amber-600" /> : <Check className="w-8 h-8 text-green-600" />}
        </div>

        {order ? (
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666]">Order #{order.order_number}</p>
            <h1 className="font-serif text-2xl text-[#0A192F]">{processing ? 'Payment processing' : 'Payment received'}</h1>
            <p className="text-sm text-[#666666] leading-relaxed">
              Thank you, <span className="font-semibold text-[#0A192F]">{order.customer_name}</span>.{' '}
              {processing
                ? <>Your payment of <span className="font-semibold text-[#0A192F]">${order.total_amount.toFixed(2)}</span> is still clearing. Your items are reserved, and we&apos;ll email you once it goes through.</>
                : <>We received your payment of <span className="font-semibold text-[#0A192F]">${order.total_amount.toFixed(2)}</span> and are getting your order ready.</>}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h1 className="font-serif text-2xl text-[#0A192F]">Thank you</h1>
            <p className="text-sm text-[#666666] leading-relaxed">
              If you completed your payment, a confirmation is on its way to your email. You can check your order anytime with your email and order number.
            </p>
          </div>
        )}

        {order && (
          <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4 text-left space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0A192F]">What Happens Next</p>
            <ol className="text-xs text-[#666666] space-y-1.5 leading-relaxed list-decimal list-inside">
              <li>{processing ? 'Once your payment clears, a confirmation goes to' : 'A confirmation is sent to'} <span className="font-mono text-[#0A192F]">{order.customer_email}</span>.</li>
              <li>We prepare your order and ship it to {order.shipping_address?.city}, {order.shipping_address?.state}.</li>
              <li>Standard delivery takes {DELIVERY_ESTIMATE}, and tracking appears on your order page.</li>
            </ol>
          </div>
        )}

        {order && (
          <p className="text-[11px] text-[#666666]">
            Save your order number. Check its status anytime with <span className="font-mono">{order.customer_email}</span> and #{order.order_number}.
          </p>
        )}

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
