import { NextResponse } from 'next/server'
import { expireUnpaidOrders, findCustomerOrder } from '@/lib/orders'
import { buildPayPalPaymentUrl } from '@/lib/paypal'

// Customers look up one order with the email AND order number from their confirmation.
// POST keeps the email out of URLs and server logs.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const orderNumber = Number(String(body.orderNumber ?? '').replace(/\D/g, ''))

  if (!email || !Number.isInteger(orderNumber) || orderNumber <= 0) {
    return NextResponse.json({ error: 'Enter the email and order number from your confirmation.' }, { status: 400 })
  }

  try {
    // So an unpaid order past its hold shows as cancelled rather than still payable.
    await expireUnpaidOrders()
    const order = await findCustomerOrder(email, orderNumber)
    if (!order) {
      return NextResponse.json({ order: null })
    }

    return NextResponse.json({
      order: {
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        payment_method: order.payment_method,
        subtotal: order.subtotal,
        discount_applied: order.discount_applied,
        discount_code: order.discount_code,
        shipping_amount: order.shipping_amount,
        tax_amount: order.tax_amount,
        total_amount: order.total_amount,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        shipping_city: order.shipping_address?.city ?? null,
        shipping_state: order.shipping_address?.state ?? null,
        payment_url: order.status === 'pending' ? buildPayPalPaymentUrl(order) : null,
        payment_expires_at: order.status === 'pending' ? order.payment_expires_at : null,
        items: order.order_items.map((item) => ({
          product_title: item.product_title,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      },
    })
  } catch (err) {
    console.error('Order lookup failed:', err)
    return NextResponse.json({ error: 'We could not look up your order right now. Please try again.' }, { status: 500 })
  }
}
