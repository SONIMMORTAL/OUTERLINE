'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/auth/admin'
import { getOrder, updateOrder, type OrderRecord } from '@/lib/orders'
import { isOrderStatus } from '@/lib/order-status'
import { isCarrier } from '@/lib/carriers'
import { sendOrderPaidNotifications, sendShippedEmail, sendVendorPurchaseOrder } from '@/lib/order-notifications'

type ActionResult = { success: true; order: OrderRecord } | { success: false; error: string }

const PAID_STATUSES = ['paid', 'processing', 'fulfilled']

async function adminAction(work: () => Promise<OrderRecord>): Promise<ActionResult> {
  try {
    if (!(await getAdminSession())) {
      return { success: false, error: 'Your admin session has expired. Please log in again.' }
    }
    const order = await work()
    revalidatePath('/admin/orders')
    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true, order }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Something went wrong.' }
  }
}

// Customer emails for manual changes: payment received, and shipped with tracking.
function notifyCustomer(before: OrderRecord | null, order: OrderRecord) {
  if (order.status === 'paid' && !PAID_STATUSES.includes(before?.status ?? '')) {
    after(() => sendOrderPaidNotifications(order, { source: 'admin' }))
  }
  if (order.status === 'fulfilled' && before?.status !== 'fulfilled') {
    after(() => sendShippedEmail(order))
  }
}

// Cancelling returns the order's stock and discount use; reopening a cancelled order reserves them again.
export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  return adminAction(async () => {
    if (!isOrderStatus(status)) throw new Error('Unknown order status.')
    const before = await getOrder(orderId)
    const order = await updateOrder(orderId, { status })
    notifyCustomer(before, order)
    return order
  })
}

export async function updateOrderTracking(orderId: string, trackingNumber: string, carrier: string): Promise<ActionResult> {
  return adminAction(() => updateOrder(orderId, {
    tracking_number: trackingNumber.trim().slice(0, 64) || null,
    carrier: isCarrier(carrier) ? carrier : null,
  }))
}

// For payments PayPal did not report automatically: records the transaction ID and marks the order Paid.
export async function recordOrderPayment(orderId: string, paymentReference: string): Promise<ActionResult> {
  return adminAction(async () => {
    const before = await getOrder(orderId)
    if (!before) throw new Error('Order not found.')
    const reference = paymentReference.trim().slice(0, 100) || null
    const needsPayment = before.status === 'pending' || before.status === 'cancelled'
    const order = await updateOrder(orderId, needsPayment ? { status: 'paid', payment_reference: reference } : { payment_reference: reference })
    notifyCustomer(before, order)
    return order
  })
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<ActionResult> {
  return adminAction(() => updateOrder(orderId, { admin_notes: notes.trim().slice(0, 4000) || null }))
}

export async function notifyVendor(orderId: string): Promise<ActionResult> {
  return adminAction(async () => {
    const order = await getOrder(orderId)
    if (!order) throw new Error('Order not found.')
    if (order.status !== 'paid' && order.status !== 'processing') {
      throw new Error('Only paid orders can be sent to the vendor.')
    }
    await sendVendorPurchaseOrder(order)
    return updateOrder(orderId, { vendor_notified: true, vendor_notified_at: new Date().toISOString() })
  })
}
