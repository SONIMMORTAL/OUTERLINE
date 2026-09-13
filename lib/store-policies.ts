// Customer-facing purchase terms shown next to "Add to Cart". Keep in sync with /policies/shipping and /policies/returns.
export const DELIVERY_ESTIMATE = '3–7 business days'
export const FREE_SHIPPING_THRESHOLD = 100
export const DEFECT_CLAIM_WINDOW_DAYS = 10

// Unpaid orders hold their stock and discount use this long, then cancel automatically. A card order's
// Stripe payment page closes at the same time.
export const PAYMENT_HOLD_MINUTES = 60
export const PAYMENT_HOLD_LABEL = '1 hour'

// Per cart line; enforced by the cart and by the orders API.
export const MAX_QUANTITY_PER_ITEM = 10
