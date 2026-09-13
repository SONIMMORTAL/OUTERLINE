import Stripe from 'stripe'
import { SITE_URL } from '@/lib/site'
import type { OrderRecord } from '@/lib/orders'

// Stripe Checkout (Stripe's hosted payment page) for card, Apple Pay, and Google Pay payments.
// The order is saved and its stock reserved first; the Checkout Session charges exactly the order total and
// closes when the payment hold ends. Stripe reports the result to /api/webhooks/stripe, which marks the order Paid.

// Stripe allows a session to stay open from 30 minutes to 24 hours.
const MIN_SESSION_MINUTES = 31
const MAX_DESCRIPTION_LENGTH = 500

let client: Stripe | null = null

export function isStripeConfigured(): boolean {
  return /^(sk|rk)_(test|live)_[A-Za-z0-9]{20,}$/.test(process.env.STRIPE_SECRET_KEY ?? '')
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) throw new Error('STRIPE_SECRET_KEY is missing or invalid.')
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { maxNetworkRetries: 2 })
  return client
}

export function isCheckoutSessionId(reference: string | null | undefined): reference is string {
  return Boolean(reference?.startsWith('cs_'))
}

export const toCents = (value: unknown) => Math.round(Number(value) * 100)

function absoluteImageUrl(image: string): string | null {
  if (/^https:\/\//i.test(image)) return image
  if (!image.startsWith('/')) return null
  return new URL(encodeURI(image), SITE_URL).toString()
}

function orderDescription(order: OrderRecord): string {
  const money = (value: number) => `$${value.toFixed(2)}`
  const parts = order.order_items.map((item) => `${item.product_title} (${item.size} / ${item.color}) x${item.quantity}`)
  if (order.discount_applied > 0) parts.push(`${order.discount_code} -${money(order.discount_applied)}`)
  parts.push(`Shipping ${order.shipping_amount === 0 ? 'FREE' : money(order.shipping_amount)}`)
  parts.push(`Tax ${money(order.tax_amount)}`)
  const description = parts.join(' · ')
  return description.length > MAX_DESCRIPTION_LENGTH ? `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…` : description
}

// One line for the whole order, so Stripe charges exactly what the site calculated (discount, shipping, and tax included).
export async function createCheckoutSession(order: OrderRecord, origin: string): Promise<Stripe.Checkout.Session> {
  const image = order.order_items.map((item) => item.image && absoluteImageUrl(item.image)).find(Boolean)
  const holdEndsAt = order.payment_expires_at ? Date.parse(order.payment_expires_at) : 0
  const expiresAt = Math.max(holdEndsAt, Date.now() + MIN_SESSION_MINUTES * 60 * 1000)
  const metadata = { order_id: order.id, order_number: String(order.order_number) }

  return getStripe().checkout.sessions.create(
    {
      mode: 'payment',
      submit_type: 'pay',
      client_reference_id: order.id,
      customer_email: order.customer_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: toCents(order.total_amount),
            product_data: {
              name: `Outerline order #${order.order_number}`,
              description: orderDescription(order),
              ...(image ? { images: [image] } : {}),
            },
          },
        },
      ],
      payment_intent_data: {
        description: `Outerline order #${order.order_number}`,
        metadata,
      },
      metadata,
      expires_at: Math.floor(expiresAt / 1000),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=${order.id}`,
    },
    { idempotencyKey: `checkout-session-${order.id}` }
  )
}

// The Stripe payment page URL while the customer can still pay, otherwise null.
export async function getOpenCheckoutUrl(sessionId: string): Promise<string | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  return session.status === 'open' ? session.url : null
}

// Closes an unpaid Checkout Session. Returns false if it was already paid, so the order must not be cancelled.
export async function closeCheckoutSession(sessionId: string): Promise<boolean> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.status === 'complete') return false
  if (session.status === 'open') await stripe.checkout.sessions.expire(sessionId)
  return true
}
