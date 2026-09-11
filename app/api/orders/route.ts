import { NextResponse, after } from 'next/server'
import { getCatalogProducts } from '@/lib/catalog'
import { calculateOrderTotals } from '@/lib/pricing'
import { redeemDiscount, releaseDiscount } from '@/lib/discounts-store'
import { countRecentOrders, createOrder, type NewOrderItem } from '@/lib/orders'
import { buildPayPalPaymentUrl } from '@/lib/paypal'
import { sendNewOrderNotifications } from '@/lib/order-notifications'
import { normalizePhone } from '@/lib/phone'
import { US_STATE_TAX_RATES } from '@/lib/taxes'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/
const MAX_LINE_ITEMS = 25
const MAX_QUANTITY_PER_ITEM = 10
const RECENT_ORDER_LIMIT = 3
const RECENT_ORDER_WINDOW_MINUTES = 15

class CheckoutError extends Error {}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function skuFor(slug: string, color: string, size: string): string {
  return `${slug}-${color}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-')
}

// Places a pending PayPal order. The browser only says what is in the cart; prices, the discount,
// shipping, and tax are all computed here.
export async function POST(req: Request) {
  let claimedDiscountId: string | null = null

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') throw new CheckoutError('Invalid checkout request.')

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

    const catalog = await getCatalogProducts()
    const items: NewOrderItem[] = lines.map((line) => {
      const product = catalog.find((p) => p.id === line.productId) || catalog.find((p) => p.slug === line.slug)
      if (!product) throw new CheckoutError('An item in your cart is no longer available. Please remove it and try again.')

      const quantity = Number(line.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
        throw new CheckoutError(`Please choose a quantity from 1 to ${MAX_QUANTITY_PER_ITEM} for ${product.title}.`)
      }

      const size = text(line.size, 10)
      const color = text(line.color, 60)
      const variants = product.product_variants ?? []
      if (variants.length > 0 && (!variants.some((v) => v.size === size) || !variants.some((v) => v.color === color))) {
        throw new CheckoutError(`${product.title} is not available in ${color} / ${size}. Please update your cart.`)
      }

      return {
        product_title: product.title,
        product_slug: product.slug,
        variant_ref: text(line.id, 120) || null,
        sku: skuFor(product.slug, color, size),
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
      payment_method: 'paypal',
      items,
    })
    claimedDiscountId = null // the saved order now owns the discount use

    const paymentUrl = buildPayPalPaymentUrl(order)
    after(() => sendNewOrderNotifications(order, paymentUrl))

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      paymentUrl,
      totals,
    })
  } catch (err) {
    if (claimedDiscountId) await releaseDiscount(claimedDiscountId)
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('Order creation failed:', err)
    return NextResponse.json(
      { error: 'We could not place your order. Please try again or contact Support@outerlineusa.com.' },
      { status: 500 }
    )
  }
}
