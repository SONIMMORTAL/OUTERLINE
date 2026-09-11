import { SITE_URL } from '@/lib/site'

// PayPal Standard "Pay Now" links. PayPal reports each payment to /api/webhooks/paypal (Instant Payment
// Notification), which verifies it with PayPal and marks the order Paid.
// Set PAYPAL_SANDBOX=true to test with sandbox accounts.

export const PAYPAL_BUSINESS_EMAIL = (process.env.PAYPAL_BUSINESS_EMAIL || '1truesurvivor@gmail.com').toLowerCase()
export const PAYPAL_NOTIFY_URL = `${SITE_URL}/api/webhooks/paypal`

const SANDBOX = process.env.PAYPAL_SANDBOX === 'true'
const CHECKOUT_URL = SANDBOX ? 'https://www.sandbox.paypal.com/cgi-bin/webscr' : 'https://www.paypal.com/cgi-bin/webscr'
const VERIFY_URL = SANDBOX ? 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr' : 'https://ipnpb.paypal.com/cgi-bin/webscr'

export function isPayPalSandbox(): boolean {
  return SANDBOX
}

export function buildPayPalPaymentUrl(order: { id: string; order_number: number; total_amount: number }): string {
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: PAYPAL_BUSINESS_EMAIL,
    currency_code: 'USD',
    amount: order.total_amount.toFixed(2),
    item_name: `Outerline Order #${order.order_number}`,
    invoice: `OL-${order.order_number}`,
    custom: order.id,
    no_shipping: '1',
    notify_url: PAYPAL_NOTIFY_URL,
    return: `${SITE_URL}/orders`,
    cancel_return: `${SITE_URL}/orders`,
  })
  return `${CHECKOUT_URL}?${params.toString()}`
}

export function parseInvoiceOrderNumber(invoice: string | null): number | null {
  const match = invoice?.trim().match(/^OL-(\d+)$/i)
  return match ? Number(match[1]) : null
}

// Sends the notification back to PayPal unchanged (prefixed with cmd=_notify-validate), as PayPal requires.
// Returns true only for VERIFIED. Throws on network/HTTP errors so the listener answers 500 and PayPal retries.
export async function verifyPayPalNotification(rawBody: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development' && process.env.PAYPAL_IPN_SKIP_VERIFY === 'true') {
    console.warn('[paypal] PAYPAL_IPN_SKIP_VERIFY is on: accepting an unverified notification (development only)')
    return true
  }

  const response = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Outerline-IPN-Listener/1.0',
    },
    body: `cmd=_notify-validate&${rawBody}`,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`PayPal verification returned HTTP ${response.status}`)
  }
  return (await response.text()).trim() === 'VERIFIED'
}
