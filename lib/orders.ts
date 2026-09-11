import { createServiceClient } from '@/lib/supabase/admin'
import { redeemDiscount, releaseDiscountByCode } from '@/lib/discounts-store'
import type { OrderStatus } from '@/lib/order-status'

// Orders live in the Supabase `orders` and `order_items` tables. No public access — server only.

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface OrderItemRecord {
  id: string
  product_title: string
  product_slug: string | null
  sku: string | null
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  image: string | null
}

export interface OrderRecord {
  id: string
  order_number: number
  customer_name: string | null
  customer_email: string
  customer_phone: string | null
  shipping_address: ShippingAddress | null
  subtotal: number
  discount_applied: number
  discount_code: string | null
  shipping_amount: number
  tax_amount: number
  total_amount: number
  status: OrderStatus
  payment_method: string
  payment_reference: string | null
  paid_at: string | null
  vendor_notified: boolean
  vendor_notified_at: string | null
  tracking_number: string | null
  carrier: string | null
  admin_notes: string | null
  created_at: string
  order_items: OrderItemRecord[]
}

export interface NewOrderItem {
  product_title: string
  product_slug: string
  variant_ref: string | null
  sku: string
  size: string
  color: string
  quantity: number
  unit_price: number
  image: string | null
}

export interface NewOrder {
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: ShippingAddress
  subtotal: number
  discount_applied: number
  discount_code: string | null
  shipping_amount: number
  tax_amount: number
  total_amount: number
  payment_method: string
  items: NewOrderItem[]
}

export interface OrderUpdate {
  status?: OrderStatus
  tracking_number?: string | null
  carrier?: string | null
  payment_reference?: string | null
  admin_notes?: string | null
  vendor_notified?: boolean
  vendor_notified_at?: string | null
}

const ORDER_SELECT = '*, order_items(*)'

// Postgres numeric columns can arrive as strings; everything downstream expects numbers.
function normalizeOrder(order: OrderRecord): OrderRecord {
  return {
    ...order,
    subtotal: Number(order.subtotal) || 0,
    discount_applied: Number(order.discount_applied) || 0,
    shipping_amount: Number(order.shipping_amount) || 0,
    tax_amount: Number(order.tax_amount) || 0,
    total_amount: Number(order.total_amount) || 0,
    order_items: (order.order_items ?? []).map((item) => ({ ...item, unit_price: Number(item.unit_price) || 0 })),
  }
}

// ilike treats % and _ as wildcards; escape them so an email only matches itself.
function exactEmailPattern(email: string): string {
  return email.trim().replace(/[\\%_]/g, (c) => `\\${c}`)
}

export async function listOrders(limit = 500): Promise<OrderRecord[]> {
  const { data, error } = await createServiceClient()
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Could not load orders: ${error.message}`)
  return ((data ?? []) as OrderRecord[]).map(normalizeOrder)
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  const { data, error } = await createServiceClient().from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle()
  if (error) throw new Error(`Could not load the order: ${error.message}`)
  return data ? normalizeOrder(data as OrderRecord) : null
}

// Customers need both the email and the order number, so one of them alone reveals nothing.
export async function findCustomerOrder(email: string, orderNumber: number): Promise<OrderRecord | null> {
  const { data, error } = await createServiceClient()
    .from('orders')
    .select(ORDER_SELECT)
    .eq('order_number', orderNumber)
    .ilike('customer_email', exactEmailPattern(email))
    .maybeSingle()
  if (error) throw new Error(`Could not look up the order: ${error.message}`)
  return data ? normalizeOrder(data as OrderRecord) : null
}

export async function countRecentOrders(email: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString()
  const { count, error } = await createServiceClient()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .ilike('customer_email', exactEmailPattern(email))
    .gte('created_at', since)
  if (error) throw new Error(`Could not check recent orders: ${error.message}`)
  return count ?? 0
}

export async function createOrder(order: NewOrder): Promise<OrderRecord> {
  const supabase = createServiceClient()
  const { items, ...fields } = order

  const { data: saved, error } = await supabase
    .from('orders')
    .insert({ ...fields, status: 'pending', vendor_notified: false })
    .select('*')
    .single()
  if (error || !saved) throw new Error(`Could not save the order: ${error?.message}`)

  const { data: savedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(items.map((item) => ({ ...item, order_id: saved.id })))
    .select('*')
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', saved.id)
    throw new Error(`Could not save the order items: ${itemsError.message}`)
  }

  return normalizeOrder({ ...(saved as OrderRecord), order_items: (savedItems ?? []) as OrderItemRecord[] })
}

export async function updateOrder(id: string, update: OrderUpdate): Promise<OrderRecord> {
  const current = await getOrder(id)
  if (!current) throw new Error('Order not found.')

  const patch: Record<string, unknown> = { ...update }
  if (update.status === 'paid' && !current.paid_at) {
    patch.paid_at = new Date().toISOString()
  }

  const { error } = await createServiceClient().from('orders').update(patch).eq('id', id)
  if (error) throw new Error(`Could not update the order: ${error.message}`)

  // A cancelled order gives its discount use back; reopening it claims the use again.
  if (update.status && update.status !== current.status && current.discount_code) {
    if (update.status === 'cancelled') {
      await releaseDiscountByCode(current.discount_code)
    } else if (current.status === 'cancelled') {
      await redeemDiscount(current.discount_code)
    }
  }

  return { ...current, ...patch } as OrderRecord
}
