import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  productTitle: string
  slug: string
  sku: string
  size: string
  color: string
  price: number
  compareAtPrice?: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  freeShippingProgress: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...currentItems, { ...item, quantity: 1 }],
            isOpen: true,
          })
        }
      },
      
      removeItem: (variantId) => {
        set({
          items: get().items.filter((i) => i.id !== variantId),
        })
      },
      
      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId)
          return
        }
        
        set({
          items: get().items.map((i) =>
            i.id === variantId ? { ...i, quantity } : i
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      
      freeShippingProgress: () => {
        const threshold = 150
        const total = get().totalPrice()
        if (total >= threshold) return 100
        return (total / threshold) * 100
      },
    }),
    {
      name: 'outerline-cart',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      skipHydration: true, // Handle hydration manually if needed, but since we use typeof window check it's partially safe. We can keep it false and ensure client-side rendering where used, or use a custom hook to avoid hydration mismatch.
    }
  )
)
