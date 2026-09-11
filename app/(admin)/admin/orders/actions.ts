'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/auth/admin'
import { getOrder, updateOrder, type OrderRecord } from '@/lib/orders'
import { isOrderStatus } from '@/lib/order-status'
import { isCarrier } from '@/lib/carriers'
import { sendShippedEmail, sendVendorPurchaseOrder } from '@/lib/order-notifications'

type ActionResult = { success: true; order: OrderRecord } | { success: false; error: string }

async function adminAction(work: () => Promise<OrderRecord>): Promise<ActionResult> {
  try {
    if (!(await getAdminSession())) {
      return { success: false, error: 'Your admin session has expired. Please log in again.' }
    }
    const order = await work()
    revalidatePath('/admin/orders')
    revalidatePath('/admin')
    return { success: true, order }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Something went wrong.' }
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  return adminAction(async () => {
    if (!isOrderStatus(status)) throw new Error('Unknown order status.')
    const before = await getOrder(orderId)
    const order = await updateOrder(orderId, { status })
    if (status === 'fulfilled' && before?.status !== 'fulfilled') {
      after(() => sendShippedEmail(order))
    }
    return order
  })
}

export async function updateOrderTracking(orderId: string, trackingNumber: string, carrier: string): Promise<ActionResult> {
  return adminAction(() => updateOrder(orderId, {
    tracking_number: trackingNumber.trim().slice(0, 64) || null,
    carrier: isCarrier(carrier) ? carrier : null,
  }))
}

// Records the PayPal transaction ID and, for an unpaid order, marks it Paid.
export async function recordOrderPayment(orderId: string, paymentReference: string): Promise<ActionResult> {
  return adminAction(async () => {
    const current = await getOrder(orderId)
    if (!current) throw new Error('Order not found.')
    return updateOrder(orderId, {
      payment_reference: paymentReference.trim().slice(0, 100) || null,
      ...(current.status === 'pending' ? { status: 'paid' as const } : {}),
    })
  })
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<ActionResult> {
  return adminAction(() => updateOrder(orderId, { admin_notes: notes.trim().slice(0, 2000) || null }))
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
