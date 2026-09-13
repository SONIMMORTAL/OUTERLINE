import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import type Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/admin'
import { appendAdminNote, extendPaymentHold, updateOrder } from '@/lib/orders'
import { sendAdminSms } from '@/lib/order-notifications'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import {
  confirmCheckoutPayment,
  findPaymentIntentOrder,
  findSessionOrder,
  type StripeOutcome
} from '@/lib/stripe-orders'

const PENDING_PAYMENT_HOLD_DAYS = 7

const money = (cents: number | null | undefined) => `$${((cents ?? 0) / 100).toFixed(2)}`

// Stripe webhook listener. Answers 2xx for anything handled or deliberately ignored, 400 for a bad signature,
// and 500 only for temporary failures so Stripe retries.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret?.startsWith('whsec_') || !isStripeConfigured()) {
    console.error('[stripe] STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is not set; Stripe will retry')
    return new NextResponse(null, { status: 500 })
  }

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, req.headers.get('stripe-signature') ?? '', secret)
  } catch (err) {
    console.warn('[stripe] Rejected a webhook with an invalid signature:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const result = await recordAndApply(event)
    console.log(`[stripe] ${event.id} ${event.type}: ${result}`)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe] Processing failed; Stripe will retry:', err)
    return new NextResponse(null, { status: 500 })
  }
}

function eventAmount(event: Stripe.Event): { amount: number | null; currency: string | null } {
  const object = event.data.object as { amount_total?: number | null; amount?: number; currency?: string | null }
  const cents = object.amount_total ?? object.amount
  return { amount: typeof cents === 'number' ? cents / 100 : null, currency: object.currency?.toUpperCase() ?? null }
}

async function recordAndApply(event: Stripe.Event): Promise<string> {
  const supabase = createServiceClient()
  const { amount, currency } = eventAmount(event)

  const { data: inserted, error: insertError } = await supabase
    .from('payment_events')
    .insert({
      provider: 'stripe',
      event_id: event.id,
      event_status: event.type,
      verified: true,
      amount,
      currency,
      payload: event.data.object,
    })
    .select('id')
    .single()

  let eventRowId = inserted?.id as string | undefined
  if (insertError) {
    if (insertError.code !== '23505') throw new Error(insertError.message)
    // Stripe resent an event we already have. Skip it unless the earlier attempt never finished.
    const { data: existing } = await supabase
      .from('payment_events')
      .select('id, result')
      .eq('provider', 'stripe')
      .eq('event_id', event.id)
      .eq('event_status', event.type)
      .single()
    if (existing?.result) return `duplicate (${existing.result})`
    eventRowId = existing?.id
  }

  const outcome = await applyEvent(event)
  if (eventRowId) {
    await supabase.from('payment_events').update({ result: outcome.result, order_id: outcome.orderId }).eq('id', eventRowId)
  }
  return outcome.result
}

async function applyEvent(event: Stripe.Event): Promise<StripeOutcome> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object
      if (session.payment_status === 'unpaid') return notePendingPayment(session)
      const outcome = await confirmCheckoutPayment(session)
      if (outcome.result === 'paid' || outcome.result === 'paid_out_of_stock') {
        revalidatePath('/admin/orders')
        revalidatePath('/admin')
      }
      return outcome
    }
    case 'checkout.session.async_payment_failed':
      return releaseUnpaidOrder(event.data.object, 'The bank payment for this Stripe checkout failed.')
    case 'checkout.session.expired':
      return releaseUnpaidOrder(event.data.object, 'Stripe checkout expired without payment.')
    case 'charge.refunded':
      return noteRefund(event.data.object)
    case 'charge.dispute.created':
      return noteDispute(event.data.object)
    default:
      return { result: `ignored event ${event.type}`, orderId: null }
  }
}

// Bank debits and similar methods finish checkout before the money arrives. Keep the stock held while they clear.
async function notePendingPayment(session: Stripe.Checkout.Session): Promise<StripeOutcome> {
  const order = await findSessionOrder(session)
  if (!order) return { result: 'ignored: no matching order', orderId: null }
  await appendAdminNote(order.id, `Stripe payment of ${money(session.amount_total)} is processing (session ${session.id}). Stock stays reserved until it clears.`)
  if (order.status === 'pending') {
    await extendPaymentHold(order.id, new Date(Date.now() + PENDING_PAYMENT_HOLD_DAYS * 24 * 60 * 60 * 1000))
  }
  return { result: 'pending noted', orderId: order.id }
}

async function releaseUnpaidOrder(session: Stripe.Checkout.Session, reason: string): Promise<StripeOutcome> {
  const order = await findSessionOrder(session)
  if (!order) return { result: 'ignored: no matching order', orderId: null }
  if (order.status !== 'pending') return { result: `ignored: order is ${order.status}`, orderId: order.id }

  await updateOrder(order.id, { status: 'cancelled' })
  await appendAdminNote(order.id, `${reason} Order cancelled; stock and promo code released.`)
  revalidatePath('/')
  revalidatePath('/admin/orders')
  return { result: 'cancelled', orderId: order.id }
}

async function noteRefund(charge: Stripe.Charge): Promise<StripeOutcome> {
  const order = await findPaymentIntentOrder(charge.payment_intent)
  if (!order) return { result: 'ignored: no matching order', orderId: null }

  const label = charge.refunded ? 'full refund' : 'partial refund'
  await appendAdminNote(order.id, `Stripe ${label}: ${money(charge.amount_refunded)} of ${money(charge.amount)} refunded (charge ${charge.id}).`)
  await sendAdminSms(`OUTERLINE: Stripe ${label} of ${money(charge.amount_refunded)} on order #${order.order_number}. Update the order in the admin.`)
  return { result: `${label} noted`, orderId: order.id }
}

async function noteDispute(dispute: Stripe.Dispute): Promise<StripeOutcome> {
  const order = await findPaymentIntentOrder(dispute.payment_intent)
  if (!order) return { result: 'ignored: no matching order', orderId: null }

  const dueBy = dispute.evidence_details?.due_by
    ? ` Respond by ${new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString('en-US')}.`
    : ''
  await appendAdminNote(order.id, `Stripe dispute opened: ${money(dispute.amount)}, reason "${dispute.reason}" (dispute ${dispute.id}).${dueBy}`)
  await sendAdminSms(`OUTERLINE ALERT: card dispute of ${money(dispute.amount)} on order #${order.order_number} (${dispute.reason}). Respond in the Stripe dashboard.${dueBy}`)
  return { result: 'dispute noted', orderId: order.id }
}
