import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/admin'
import {
  appendAdminNote,
  extendPaymentHold,
  findOrderByNumber,
  findOrderByPaymentReference,
  getOrder,
  markOrderPaid,
  type OrderRecord
} from '@/lib/orders'
import { PAYPAL_BUSINESS_EMAIL, isPayPalSandbox, parseInvoiceOrderNumber, verifyPayPalNotification } from '@/lib/paypal'
import { sendAdminSms, sendOrderPaidNotifications } from '@/lib/order-notifications'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PENDING_PAYMENT_HOLD_DAYS = 7
const NOTED_STATUSES = ['Refunded', 'Reversed', 'Canceled_Reversal', 'Denied', 'Failed', 'Expired', 'Voided']

const acknowledge = () => new NextResponse(null, { status: 200 })
const retryLater = () => new NextResponse(null, { status: 500 })
const cents = (value: unknown) => Math.round(Number(value) * 100)

interface Outcome {
  result: string
  orderId: string | null
}

// PayPal Instant Payment Notification listener.
// Answers 200 for anything handled or deliberately ignored, and 500 only for temporary failures so PayPal retries.
export async function POST(req: Request) {
  const rawBody = await req.text()
  const params = new URLSearchParams(rawBody)
  const txnId = params.get('txn_id')
  const paymentStatus = params.get('payment_status')

  let verified: boolean
  try {
    verified = await verifyPayPalNotification(rawBody)
  } catch (err) {
    console.error('[paypal] Verification request failed; PayPal will retry:', err)
    return retryLater()
  }

  if (!verified) {
    console.warn('[paypal] Ignoring a notification PayPal did not verify', { txnId, paymentStatus })
    return acknowledge()
  }
  if (params.get('test_ipn') === '1' && !isPayPalSandbox()) {
    console.warn('[paypal] Ignoring a sandbox notification in live mode', { txnId })
    return acknowledge()
  }
  if (!txnId || !paymentStatus) {
    return acknowledge()
  }

  try {
    const result = await recordAndApply(params, txnId, paymentStatus)
    console.log(`[paypal] ${txnId} ${paymentStatus}: ${result}`)
    return acknowledge()
  } catch (err) {
    console.error('[paypal] Processing failed; PayPal will retry:', err)
    return retryLater()
  }
}

async function recordAndApply(params: URLSearchParams, txnId: string, paymentStatus: string): Promise<string> {
  const supabase = createServiceClient()
  const amount = Number(params.get('mc_gross'))

  const { data: inserted, error: insertError } = await supabase
    .from('payment_events')
    .insert({
      provider: 'paypal',
      event_id: txnId,
      event_status: paymentStatus,
      verified: true,
      amount: Number.isFinite(amount) ? amount : null,
      currency: params.get('mc_currency'),
      payload: Object.fromEntries(params.entries()),
    })
    .select('id')
    .single()

  let eventRowId = inserted?.id as string | undefined
  if (insertError) {
    if (insertError.code !== '23505') throw new Error(insertError.message)
    // PayPal resent a notification we already have. Skip it unless the earlier attempt never finished.
    const { data: existing } = await supabase
      .from('payment_events')
      .select('id, result')
      .eq('provider', 'paypal')
      .eq('event_id', txnId)
      .eq('event_status', paymentStatus)
      .single()
    if (existing?.result) return `duplicate (${existing.result})`
    eventRowId = existing?.id
  }

  const outcome = await applyNotification(params, txnId, paymentStatus)
  if (eventRowId) {
    await supabase.from('payment_events').update({ result: outcome.result, order_id: outcome.orderId }).eq('id', eventRowId)
  }
  return outcome.result
}

async function findOrder(params: URLSearchParams): Promise<OrderRecord | null> {
  const orderNumber = parseInvoiceOrderNumber(params.get('invoice'))
  if (orderNumber) {
    const order = await findOrderByNumber(orderNumber)
    if (order) return order
  }
  const custom = params.get('custom')
  if (custom && UUID_PATTERN.test(custom)) {
    const order = await getOrder(custom)
    if (order) return order
  }
  const parentTxnId = params.get('parent_txn_id')
  return parentTxnId ? findOrderByPaymentReference(parentTxnId) : null
}

async function applyNotification(params: URLSearchParams, txnId: string, paymentStatus: string): Promise<Outcome> {
  const receivers = [params.get('receiver_email'), params.get('business')]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase())
  const merchantId = process.env.PAYPAL_MERCHANT_ID
  if (!receivers.includes(PAYPAL_BUSINESS_EMAIL) && !(merchantId && params.get('receiver_id') === merchantId)) {
    return { result: 'ignored: paid to a different PayPal account', orderId: null }
  }

  const order = await findOrder(params)
  if (!order) return { result: 'ignored: no matching order', orderId: null }

  const amountLabel = `$${Math.abs(Number(params.get('mc_gross')) || 0).toFixed(2)} ${params.get('mc_currency') ?? ''}`.trim()

  if (paymentStatus === 'Completed') {
    if (params.get('mc_currency') !== 'USD' || cents(params.get('mc_gross')) !== cents(order.total_amount)) {
      await appendAdminNote(order.id, `PayPal payment ${txnId} of ${amountLabel} does not match the order total of $${order.total_amount.toFixed(2)} USD. Not marked paid; check PayPal.`)
      await sendAdminSms(`OUTERLINE ALERT: PayPal payment ${amountLabel} for order #${order.order_number} doesn't match its $${order.total_amount.toFixed(2)} total. Check PayPal before shipping.`)
      return { result: 'amount mismatch', orderId: order.id }
    }

    const result = await markOrderPaid(order.id, txnId)
    if (result === 'paid' || result === 'paid_out_of_stock') {
      const paidOrder = (await getOrder(order.id)) ?? order
      await sendOrderPaidNotifications(paidOrder, { source: 'paypal', outOfStock: result === 'paid_out_of_stock' })
      revalidatePath('/admin/orders')
      revalidatePath('/admin')
    }
    return { result, orderId: order.id }
  }

  if (paymentStatus === 'Pending') {
    await appendAdminNote(order.id, `PayPal payment ${txnId} of ${amountLabel} is pending (${params.get('pending_reason') || 'no reason given'}). Stock stays reserved until PayPal completes it.`)
    if (order.status === 'pending') {
      await extendPaymentHold(order.id, new Date(Date.now() + PENDING_PAYMENT_HOLD_DAYS * 24 * 60 * 60 * 1000))
    }
    return { result: 'pending noted', orderId: order.id }
  }

  if (NOTED_STATUSES.includes(paymentStatus)) {
    const parent = params.get('parent_txn_id')
    const label = paymentStatus.replace('_', ' ').toLowerCase()
    await appendAdminNote(order.id, `PayPal ${label}: ${txnId}${parent ? ` (original payment ${parent})` : ''}, ${amountLabel}.`)
    if (paymentStatus === 'Refunded' || paymentStatus === 'Reversed') {
      await sendAdminSms(`OUTERLINE: PayPal ${label} of ${amountLabel} on order #${order.order_number}. Update the order in the admin.`)
    }
    return { result: `${label} noted`, orderId: order.id }
  }

  return { result: `ignored status ${paymentStatus}`, orderId: order.id }
}
