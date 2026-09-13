import { NextResponse, after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { loadCatalogProducts } from '@/lib/catalog'
import { calculateOrderTotals } from '@/lib/pricing'
import { redeemDiscount, releaseDiscount } from '@/lib/discounts-store'
import {
  appendAdminNote,
  countRecentOrders,
  createOrder,
  expireUnpaidOrders,
  OutOfStockError,
  setPaymentReference,
  updateOrder,
  type NewOrderItem,
  type OrderRecord
} from '@/lib/orders'
import { buildPayPalPaymentUrl } from '@/lib/paypal'
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe'
import { SITE_URL } from '@/lib/site'
import type { PaymentMethod } from '@/lib/order-status'
import { sendOrderReservedEmail } from '@/lib/order-notifications'
import { normalizePhone } from '@/lib/phone'
import { US_STATE_TAX_RATES } from '@/lib/taxes'
import { findVariant, skuFor } from '@/lib/inventory'
import { MAX_QUANTITY_PER_ITEM, PAYMENT_HOLD_MINUTES } from '@/lib/store-policies'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_LINE_ITEMS = 25
const RECENT_ORDER_LIMIT = 3
const RECENT_ORDER_WINDOW_MINUTES = 15

class CheckoutError extends Error {}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Where Stripe sends the shopper back. Local development returns to the dev server instead of the live site.
function checkoutOrigin(req: Request): string {
  return process.env.NODE_ENV === 'production' ? SITE_URL : new URL(req.url).origin
}

// Opens a Stripe payment page for the order. If Stripe refuses, the order is cancelled so its stock and promo code go back.
async function startCardPayment(order: OrderRecord, req: Request): Promise<string | null> {
  try {
    const session = await createCheckoutSession(order, checkoutOrigin(req))
    if (!session.url) throw new Error(`Checkout Session ${session.id} has no URL`)
    await setPaymentReference(order.id, session.id)
    return session.url
  } catch (err) {
    console.error(`Stripe checkout could not start for order #${order.order_number}:`, err)
    await updateOrder(order.id, { status: 'cancelled' })
    await appendAdminNote(order.id, 'Stripe checkout could not be started. Order cancelled; stock and promo code released.')
    return null
  }
}

// Places a pending order paid by PayPal or by card through Stripe. The browser only says what is in the cart;
// prices, stock, the discount, shipping, and tax are all decided here. Stock is reserved until the payment hold expires.
export async function POST(req: Request) {
  let claimedDiscountId: string | null = null
  let items: NewOrderItem[] = []

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') throw new CheckoutError('Invalid checkout request.')

    const paymentMethod: PaymentMethod = body.paymentMethod === 'stripe' ? 'stripe' : 'paypal'
    if (paymentMethod === 'stripe' && !isStripeConfigured()) {
      throw new CheckoutError('Card payments are not available right now. Please choose PayPal.')
    }

    const customerName = text(body.customerName, 120)
    const customerEmail = text(body.customerEmail, 254).toLowerCase()
    const rawPhone = text(body.customerPhone, 32)
    const address = typeof body.shippingAddress === 'object' && body.shippingAddress ? body.shippingAddress : {}
    const shippingAddress = {
      line1: text(address.line1, 200),
      line2: text(address.line2, 200),
      city: text(address.city, 100),
      state: text(address.state, 20).toUpperCase(),
      zip: text(address.zip, 10),
      country: 'US',
    }

    if (!customerName) throw new CheckoutError('Please enter your full name.')
    if (!EMAIL_PATTERN.test(customerEmail)) throw new CheckoutError('Please enter a valid email address.')
    const customerPhone = rawPhone ? normalizePhone(rawPhone) : null
    if (rawPhone && !customerPhone) throw new CheckoutError('Please enter a valid phone number, or leave it blank.')
    if (!shippingAddress.line1 || !shippingAddress.city) throw new CheckoutError('Please enter your full shipping address.')
    if (!US_STATE_TAX_RATES[shippingAddress.state]) throw new CheckoutError('Please choose your state.')
    if (!ZIP_PATTERN.test(shippingAddress.zip)) throw new CheckoutError('Please enter a valid ZIP code.')

    const lines: Record<string, unknown>[] = Array.isArray(body.items) ? body.items : []
    if (lines.length === 0) throw new CheckoutError('Your cart is empty.')
    if (lines.length > MAX_LINE_ITEMS) throw new CheckoutError('Too many items for one order. Please contact Support@outerlineusa.com for bulk orders.')

    if ((await countRecentOrders(customerEmail, RECENT_ORDER_WINDOW_MINUTES)) >= RECENT_ORDER_LIMIT) {
      return NextResponse.json(
        { error: 'You have placed several orders in the last few minutes. Please wait a moment or contact Support@outerlineusa.com.' },
        { status: 429 }
      )
    }

    // Release stock held by checkouts that were never paid before checking what is available.
    await expireUnpaidOrders()
    const catalog = await loadCatalogProducts()

    items = lines.map((line) => {
      const product = catalog.find((p) => p.id === line.productId) || catalog.find((p) => p.slug === line.slug)
      if (!product) throw new CheckoutError('An item in your cart is no longer available. Please remove it and try again.')

      const quantity = Number(line.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
        throw new CheckoutError(`Please choose a quantity from 1 to ${MAX_QUANTITY_PER_ITEM} for ${product.title}.`)
      }

      const size = text(line.size, 10)
      const color = text(line.color, 60)
      const variant = findVariant(product.product_variants ?? [], color, size)
      if (!variant || !UUID_PATTERN.test(variant.id)) {
        throw new CheckoutError(`${product.title} in ${color} / ${size} is not available. Please update your cart.`)
      }
      if (variant.inventory_quantity < quantity) {
        throw new CheckoutError(variant.inventory_quantity > 0
          ? `Only ${variant.inventory_quantity} left of ${product.title} in ${color} / ${size}. Please update your cart.`
          : `${product.title} in ${color} / ${size} is sold out. Please update your cart.`)
      }

      return {
        variant_id: variant.id,
        product_title: product.title,
        product_slug: product.slug,
        variant_ref: text(line.id, 120) || null,
        sku: variant.sku || skuFor(product.slug, color, size),
        size,
        color,
        quantity,
        unit_price: product.price,
        image: product.images[0] ?? null,
      }
    })

    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

    let discountPercentage = 0
    let discountCode: string | null = null
    const requestedCode = text(body.discountCode, 40)
    if (requestedCode) {
      const discount = await redeemDiscount(requestedCode)
      if (!discount) throw new CheckoutError('That promo code is invalid, expired, or fully used. Remove it to continue.')
      claimedDiscountId = discount.id
      discountPercentage = discount.percentage
      discountCode = discount.code
    }

    const totals = calculateOrderTotals({ subtotal, discountPercentage, state: shippingAddress.state })
    const order = await createOrder({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      subtotal: totals.subtotal,
      discount_applied: totals.discountAmount,
      discount_code: discountCode,
      shipping_amount: totals.shippingAmount,
      tax_amount: totals.taxAmount,
      total_amount: totals.total,
      payment_method: paymentMethod,
      payment_expires_at: new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000).toISOString(),
      items,
    })
    claimedDiscountId = null // the saved order now owns the discount use
    revalidatePath('/') // homepage sold-out badges

    let paymentUrl: string
    if (paymentMethod === 'stripe') {
      const url = await startCardPayment(order, req)
      if (!url) {
        return NextResponse.json(
          { error: 'We could not open the card payment page. Please try again, choose PayPal, or contact Support@outerlineusa.com.' },
          { status: 502 }
        )
      }
      paymentUrl = url
    } else {
      paymentUrl = buildPayPalPaymentUrl(order)
      // Card shoppers go straight to Stripe, so only PayPal orders need the "complete your payment" email.
      after(() => sendOrderReservedEmail(order, paymentUrl))
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      paymentUrl,
      paymentExpiresAt: order.payment_expires_at,
      totals,
    })
  } catch (err) {
    if (claimedDiscountId) await releaseDiscount(claimedDiscountId)
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    if (err instanceof OutOfStockError) {
      const item = items.find((i) => i.variant_id === err.variantId)
      return NextResponse.json(
        { error: item ? `${item.product_title} in ${item.color} / ${item.size} just sold out. Please update your cart.` : 'An item in your cart just sold out. Please update your cart.' },
        { status: 409 }
      )
    }
    console.error('Order creation failed:', err)
    return NextResponse.json(
      { error: 'We could not place your order. Please try again or contact Support@outerlineusa.com.' },
      { status: 500 }
    )
  }
}
