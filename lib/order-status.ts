// Order status vocabulary shared by the admin, the customer order page, and the server.

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'fulfilled', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting Payment',
  paid: 'Paid',
  processing: 'Processing',
  fulfilled: 'Shipped',
  cancelled: 'Cancelled',
}

// Payment has been received for these, so they count toward revenue.
export const REVENUE_STATUSES: readonly OrderStatus[] = ['paid', 'processing', 'fulfilled']

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}
