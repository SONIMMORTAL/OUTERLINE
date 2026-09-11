import { SITE_URL } from '@/lib/site'

// PayPal Standard "Pay Now" link. PayPal shows the invoice (OL-1001) on the payment, and the admin
// marks the order Paid once the money arrives.
const PAYPAL_BUSINESS_EMAIL = process.env.PAYPAL_BUSINESS_EMAIL || '1truesurvivor@gmail.com'

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
    return: `${SITE_URL}/orders`,
    cancel_return: `${SITE_URL}/orders`,
  })
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`
}
