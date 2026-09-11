import { calculateTax } from '@/lib/taxes'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/store-policies'

// Used by the checkout page for display and by the orders API as the source of truth,
// so the total a shopper sees is always the total they are charged.

const NY_SHIPPING = 8
const OUT_OF_STATE_SHIPPING = 10

export interface OrderTotals {
  subtotal: number
  discountPercentage: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  taxLabel: string
  total: number
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}

export function calculateOrderTotals({
  subtotal,
  discountPercentage = 0,
  state,
}: {
  subtotal: number
  discountPercentage?: number
  state?: string
}): OrderTotals {
  const cleanSubtotal = roundCents(subtotal)
  const discountAmount = roundCents(cleanSubtotal * (discountPercentage / 100))
  const discountedSubtotal = Math.max(0, cleanSubtotal - discountAmount)
  const normalizedState = (state || '').trim().toUpperCase()

  const shippingAmount = cleanSubtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : normalizedState === 'NY' || !normalizedState ? NY_SHIPPING : OUT_OF_STATE_SHIPPING
  const tax = calculateTax(discountedSubtotal, normalizedState || 'NY')

  return {
    subtotal: cleanSubtotal,
    discountPercentage,
    discountAmount,
    shippingAmount,
    taxAmount: tax.taxAmount,
    taxLabel: tax.label,
    total: roundCents(discountedSubtotal + shippingAmount + tax.taxAmount),
  }
}
