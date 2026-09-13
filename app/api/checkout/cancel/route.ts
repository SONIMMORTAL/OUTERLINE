import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { appendAdminNote, getOrder, updateOrder } from '@/lib/orders'
import { closeCheckoutSession, isCheckoutSessionId, isStripeConfigured } from '@/lib/stripe'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// A shopper who backs out of Stripe's payment page returns to /checkout?cancelled=<order id>. Close that payment page
// and release the order's stock and promo code now, instead of holding them until the payment hold ends.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const orderId = typeof body.orderId === 'string' ? body.orderId : ''
  if (!UUID_PATTERN.test(orderId)) {
    return NextResponse.json({ cancelled: false }, { status: 400 })
  }

  try {
    const order = await getOrder(orderId)
    if (!order || order.status !== 'pending' || order.payment_method !== 'stripe' || !isStripeConfigured()) {
      return NextResponse.json({ cancelled: false })
    }
    if (isCheckoutSessionId(order.payment_reference) && !(await closeCheckoutSession(order.payment_reference))) {
      return NextResponse.json({ cancelled: false }) // paid after all; the webhook confirms it
    }

    await updateOrder(order.id, { status: 'cancelled' })
    await appendAdminNote(order.id, 'Customer left Stripe checkout without paying. Order cancelled; stock and promo code released.')
    revalidatePath('/')
    revalidatePath('/admin/orders')
    return NextResponse.json({ cancelled: true })
  } catch (err) {
    console.error('Could not cancel an abandoned Stripe checkout:', err)
    return NextResponse.json({ cancelled: false }, { status: 500 })
  }
}
