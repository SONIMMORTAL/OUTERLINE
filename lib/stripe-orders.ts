import type Stripe from 'stripe'
import {
  appendAdminNote,
  findOrderByPaymentReference,
  getOrder,
  markOrderPaid,
  type OrderRecord
} from '@/lib/orders'
import { sendAdminSms, sendOrderPaidNotifications } from '@/lib/order-notifications'
import { getStripe, toCents } from '@/lib/stripe'

// Applies Stripe payment results to orders. Used by the webhook and by the checkout success page, so an order is
// confirmed even when the webhook is slow; mark_order_paid only reports 'paid' once, so nobody is notified twice.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface StripeOutcome {
  result: string
  orderId: string | null
}

const idOf = (value: string | { id: string } | null | undefined) => (typeof value === 'string' ? value : value?.id ?? null)

export async function findSessionOrder(session: Stripe.Checkout.Session): Promise<OrderRecord | null> {
  const orderId = session.client_reference_id || session.metadata?.order_id
  return orderId && UUID_PATTERN.test(orderId) ? getOrder(orderId) : null
}

// Charges and disputes only carry the PaymentIntent. Paid orders store it as their payment reference;
// otherwise the PaymentIntent's metadata names the order.
export async function findPaymentIntentOrder(paymentIntent: string | Stripe.PaymentIntent | null): Promise<OrderRecord | null> {
  const paymentIntentId = idOf(paymentIntent)
  if (!paymentIntentId) return null
  const order = await findOrderByPaymentReference(paymentIntentId)
  if (order) return order
  const intent = typeof paymentIntent === 'string' ? await getStripe().paymentIntents.retrieve(paymentIntentId) : paymentIntent
  const orderId = intent?.metadata?.order_id
  return orderId && UUID_PATTERN.test(orderId) ? getOrder(orderId) : null
}

export async function confirmCheckoutPayment(session: Stripe.Checkout.Session): Promise<StripeOutcome> {
  const order = await findSessionOrder(session)
  if (!order) return { result: 'ignored: no matching order', orderId: null }
  if (session.payment_status !== 'paid') return { result: `not paid (${session.payment_status})`, orderId: order.id }

  const amountLabel = `$${((session.amount_total ?? 0) / 100).toFixed(2)} ${(session.currency ?? '').toUpperCase()}`.trim()
  if (session.currency !== 'usd' || session.amount_total !== toCents(order.total_amount)) {
    await appendAdminNote(order.id, `Stripe payment of ${amountLabel} (session ${session.id}) does not match the order total of $${order.total_amount.toFixed(2)} USD. Not marked paid; check Stripe.`)
    await sendAdminSms(`OUTERLINE ALERT: Stripe payment ${amountLabel} for order #${order.order_number} doesn't match its $${order.total_amount.toFixed(2)} total. Check Stripe before shipping.`)
    return { result: 'amount mismatch', orderId: order.id }
  }

  const result = await markOrderPaid(order.id, idOf(session.payment_intent) ?? session.id)
  if (result === 'paid' || result === 'paid_out_of_stock') {
    const paidOrder = (await getOrder(order.id)) ?? order
    await sendOrderPaidNotifications(paidOrder, { source: 'stripe', outOfStock: result === 'paid_out_of_stock' })
  }
  return { result, orderId: order.id }
}
