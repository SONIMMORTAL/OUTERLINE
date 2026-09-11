import React from 'react'
import { Resend } from 'resend'
import { sendSMS, sendVendorPO } from '@/lib/twilio'
import { trackingUrl } from '@/lib/carriers'
import { SITE_URL } from '@/lib/site'
import { DELIVERY_ESTIMATE } from '@/lib/store-policies'
import OrderConfirmation from '@/components/emails/OrderConfirmation'
import VendorPurchaseOrder from '@/components/emails/VendorPurchaseOrder'
import type { OrderRecord } from '@/lib/orders'

// Set DISABLE_ORDER_NOTIFICATIONS=true to place test orders without texting or emailing anyone.
function notificationsDisabled(): boolean {
  return process.env.DISABLE_ORDER_NOTIFICATIONS === 'true'
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  return key && key.startsWith('re_') && key !== 're_your_resend_api_key' ? new Resend(key) : null
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'Outerline <onboarding@resend.dev>'
}

function adminPhone(): string {
  return process.env.ADMIN_PHONE_NUMBER || '+17186007410'
}

function escapeHtml(value: unknown): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(value ?? '').replace(/[&<>"']/g, (c) => entities[c])
}

const money = (value: number) => `$${value.toFixed(2)}`
const itemCount = (order: OrderRecord) => order.order_items.reduce((sum, item) => sum + item.quantity, 0)

async function settle(label: string, tasks: Promise<unknown>[]) {
  const results = await Promise.allSettled(tasks)
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(`${label} failed:`, result.reason)
    } else if (result.value && typeof result.value === 'object' && 'error' in result.value && result.value.error) {
      console.error(`${label} failed:`, result.value.error)
    }
  }
}

function adminPaidOrderHtml(order: OrderRecord, outOfStock: boolean): string {
  const address = order.shipping_address
  const items = order.order_items
    .map((i) => `<li><strong>${escapeHtml(i.product_title)}</strong> — ${escapeHtml(i.size)} / ${escapeHtml(i.color)} × ${i.quantity} @ ${money(i.unit_price)}</li>`)
    .join('')

  return `
    <h2>Paid: Outerline order #${order.order_number}</h2>
    ${outOfStock ? '<p style="color:#b91c1c"><strong>Stock problem:</strong> this payment arrived after the order was cancelled and the items are no longer in stock. Refund or restock before shipping.</p>' : ''}
    <p><strong>Payment:</strong> ${money(order.total_amount)} via PayPal${order.payment_reference ? ` (transaction ${escapeHtml(order.payment_reference)})` : ''}</p>
    <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)} &lt;${escapeHtml(order.customer_email)}&gt;${order.customer_phone ? ` · ${escapeHtml(order.customer_phone)}` : ''}</p>
    <p><strong>Ship to:</strong><br/>
      ${escapeHtml(address?.line1)}${address?.line2 ? `<br/>${escapeHtml(address.line2)}` : ''}<br/>
      ${escapeHtml(address?.city)}, ${escapeHtml(address?.state)} ${escapeHtml(address?.zip)}
    </p>
    <ul>${items}</ul>
    <p>
      Subtotal ${money(order.subtotal)}<br/>
      ${order.discount_applied > 0 ? `Discount (${escapeHtml(order.discount_code)}) -${money(order.discount_applied)}<br/>` : ''}
      Shipping ${order.shipping_amount === 0 ? 'FREE' : money(order.shipping_amount)}<br/>
      Tax ${money(order.tax_amount)}<br/>
      <strong>Total ${money(order.total_amount)}</strong>
    </p>
    <p>Fulfill it in the admin: <a href="${SITE_URL}/admin/orders">${SITE_URL}/admin/orders</a></p>
  `
}

// Sent when an order is placed: the customer's order number and PayPal link. Admins hear about it once it's paid.
export async function sendOrderReservedEmail(order: OrderRecord, paymentUrl: string): Promise<void> {
  const resend = getResend()
  if (notificationsDisabled()) {
    console.log(`[order notifications disabled] reserved email for order #${order.order_number}`)
    return
  }
  if (!resend) return

  await settle('Order confirmation email', [resend.emails.send({
    from: fromAddress(),
    to: order.customer_email,
    subject: `Outerline order #${order.order_number} — complete your payment`,
    react: React.createElement(OrderConfirmation, { order, paymentUrl }),
  })])
}

export async function sendOrderPaidNotifications(
  order: OrderRecord,
  { source, outOfStock = false }: { source: 'paypal' | 'admin'; outOfStock?: boolean }
): Promise<void> {
  if (notificationsDisabled()) {
    console.log(`[order notifications disabled] paid notifications for order #${order.order_number} (${source})`)
    return
  }

  const tasks: Promise<unknown>[] = []
  const address = order.shipping_address
  const count = itemCount(order)

  // An admin marking the order paid already knows; only automatic confirmations text the admin.
  if (source === 'paypal') {
    tasks.push(sendSMS(
      adminPhone(),
      `OUTERLINE PAID order #${order.order_number}: ${money(order.total_amount)} via PayPal (${count} item${count === 1 ? '' : 's'}) from ${order.customer_name}. Ship to ${address?.city}, ${address?.state}.` +
        (outOfStock ? ' WARNING: paid after cancellation and stock is gone. Refund or restock.' : '')
    ))
  }

  const resend = getResend()
  if (resend) {
    if (source === 'paypal' && process.env.ADMIN_EMAIL) {
      tasks.push(resend.emails.send({
        from: fromAddress(),
        to: process.env.ADMIN_EMAIL,
        subject: `${outOfStock ? 'ACTION NEEDED — ' : ''}Paid order #${order.order_number} — ${money(order.total_amount)}`,
        html: adminPaidOrderHtml(order, outOfStock),
      }))
    }
    if (!outOfStock) {
      tasks.push(resend.emails.send({
        from: fromAddress(),
        to: order.customer_email,
        subject: `Payment received — Outerline order #${order.order_number}`,
        html: `
          <h2>Payment received for order #${order.order_number}</h2>
          <p>Hi ${escapeHtml(order.customer_name)},</p>
          <p>We received your payment of ${money(order.total_amount)}. Your order is being prepared, and standard delivery takes ${DELIVERY_ESTIMATE} once it ships.</p>
          <p>Check your order anytime at <a href="${SITE_URL}/orders">${SITE_URL}/orders</a> with your email and order number.</p>
          <p>Questions? Support@outerlineusa.com</p>
        `,
      }))
    }
  }

  await settle('Paid order notification', tasks)
}

export async function sendAdminSms(message: string): Promise<void> {
  if (notificationsDisabled()) {
    console.log(`[order notifications disabled] admin SMS: ${message}`)
    return
  }
  await settle('Admin SMS', [sendSMS(adminPhone(), message)])
}

export async function sendShippedEmail(order: OrderRecord): Promise<void> {
  const resend = getResend()
  if (notificationsDisabled() || !resend) return

  const link = trackingUrl(order.carrier, order.tracking_number)
  const tracking = order.tracking_number
    ? `<p>Tracking (${escapeHtml(order.carrier)}): ${link ? `<a href="${escapeHtml(link)}">${escapeHtml(order.tracking_number)}</a>` : escapeHtml(order.tracking_number)}</p>`
    : ''

  await settle('Shipping email', [resend.emails.send({
    from: fromAddress(),
    to: order.customer_email,
    subject: `Your Outerline order #${order.order_number} has shipped`,
    html: `
      <h2>Order #${order.order_number} is on its way</h2>
      <p>Hi ${escapeHtml(order.customer_name)},</p>
      <p>Your Outerline order has shipped. Standard delivery takes ${DELIVERY_ESTIMATE}.</p>
      ${tracking}
      <p>Check your order anytime at <a href="${SITE_URL}/orders">${SITE_URL}/orders</a> with your email and order number.</p>
      <p>Questions? Support@outerlineusa.com</p>
    `,
  })])
}

export async function sendVendorPurchaseOrder(order: OrderRecord): Promise<void> {
  if (notificationsDisabled()) {
    console.log(`[order notifications disabled] vendor PO for order #${order.order_number}`)
    return
  }

  const lines = order.order_items.map((i) => `${i.sku || i.product_title} ${i.size}/${i.color} x${i.quantity}`)
  const tasks: Promise<unknown>[] = [sendVendorPO(order.order_number, lines)]

  const resend = getResend()
  if (resend && process.env.VENDOR_EMAIL) {
    tasks.push(resend.emails.send({
      from: fromAddress(),
      to: process.env.VENDOR_EMAIL,
      subject: `PO: Outerline order #${order.order_number}`,
      react: React.createElement(VendorPurchaseOrder, {
        orderNumber: order.order_number,
        customerName: order.customer_name || order.customer_email,
        orderDate: new Date(order.created_at).toLocaleDateString('en-US'),
        shippingAddress: { ...order.shipping_address, postal_code: order.shipping_address?.zip, country: 'US' },
        items: order.order_items.map((i) => ({ qty: i.quantity, sku: i.sku, product: i.product_title, size: i.size, color: i.color })),
      }),
    }))
  }

  await settle('Vendor purchase order', tasks)
}
