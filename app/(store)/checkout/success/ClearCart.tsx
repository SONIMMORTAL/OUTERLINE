'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'

// Empties the saved cart once Stripe sends the shopper back after paying.
export default function ClearCart() {
  useEffect(() => {
    Promise.resolve(useCartStore.persist.rehydrate()).then(() => useCartStore.getState().clearCart())
  }, [])
  return null
}
