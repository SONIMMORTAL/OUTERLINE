import { createServiceClient } from '@/lib/supabase/admin'
import { redeemDiscount, releaseDiscountByCode } from '@/lib/discounts-store'
import type { OrderStatus } from '@/lib/order-status'

// Orders live in the Supabase `orders` and `order_items` tables. No public access — server only.
// Stock is reserved per order by Postgres functions (supabase/migrations/004_inventory_paypal.sql).

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
  variant_id: string | null
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
  payment_expires_at: string | null
  inventory_reserved: boolean
  vendor_notified: boolean
  vendor_notified_at: string | null
  tracking_number: string | null
  carrier: string | null
  admin_notes: string | null
  created_at: string
  order_items: OrderItemRecord[]
}

export interface NewOrderItem {
  variant_id: string
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
  payment_expires_at: string
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

export type MarkPaidResult = 'paid' | 'already_paid' | 'paid_out_of_stock' | 'not_found'

export class OutOfStockError extends Error {
  variantId: string

  constructor(variantId: string) {
    super(`Variant ${variantId} is out of stock`)
    this.variantId = variantId
  }
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

export async function findOrderByNumber(orderNumber: number): Promise<OrderRecord | null> {
  const { data, error } = await createServiceClient()
    .from('orders')
    .select(ORDER_SELECT)
    .eq('order_number', orderNumber)
    .maybeSingle()
  if (error) throw new Error(`Could not load the order: ${error.message}`)
  return data ? normalizeOrder(data as OrderRecord) : null
}

export async function findOrderByPaymentReference(reference: string): Promise<OrderRecord | null> {
  const { data, error } = await createServiceClient()
    .from('orders')
    .select(ORDER_SELECT)
    .eq('payment_reference', reference)
    .limit(1)
    .maybeSingle()
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

// Saves a pending order and reserves stock for every line, all or nothing.
export async function createOrder(order: NewOrder): Promise<OrderRecord> {
  const supabase = createServiceClient()
  const { items, ...fields } = order

  const { data: saved, error } = await supabase
    .from('orders')
    .insert({ ...fields, status: 'pending', vendor_notified: false })
    .select('*')
    .single()
  if (error || !saved) throw new Error(`Could not save the order: ${error?.message}`)

  const discard = async () => {
    await supabase.from('order_items').delete().eq('order_id', saved.id)
    await supabase.from('orders').delete().eq('id', saved.id)
  }

  const { data: savedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(items.map((item) => ({ ...item, order_id: saved.id })))
    .select('*')
  if (itemsError) {
    await discard()
    throw new Error(`Could not save the order items: ${itemsError.message}`)
  }

  const { error: reserveError } = await supabase.rpc('reserve_order_stock', { p_order_id: saved.id })
  if (reserveError) {
    await discard()
    const soldOut = reserveError.message.match(/OUT_OF_STOCK:([0-9a-f-]{36})/i)
    if (soldOut) throw new OutOfStockError(soldOut[1])
    throw new Error(`Could not reserve stock: ${reserveError.message}`)
  }

  return normalizeOrder({
    ...(saved as OrderRecord),
    inventory_reserved: true,
    order_items: (savedItems ?? []) as OrderItemRecord[],
  })
}

export async function markOrderPaid(id: string, reference: string | null): Promise<MarkPaidResult> {
  const { data, error } = await createServiceClient().rpc('mark_order_paid', { p_order_id: id, p_reference: reference })
  if (error) throw new Error(`Could not mark the order paid: ${error.message}`)
  return data as MarkPaidResult
}

// Cancels unpaid orders past their hold, returning stock and discount uses. Safe to call often.
export async function expireUnpaidOrders(): Promise<number> {
  const { data, error } = await createServiceClient().rpc('expire_unpaid_orders')
  if (error) {
    console.error('Could not expire unpaid orders:', error.message)
    return 0
  }
  return Number(data) || 0
}

export async function appendAdminNote(id: string, note: string): Promise<void> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('orders').select('admin_notes').eq('id', id).maybeSingle()
  if (error || !data) return
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const admin_notes = [data.admin_notes, `[${stamp} UTC] ${note}`].filter(Boolean).join('\n')
  await supabase.from('orders').update({ admin_notes }).eq('id', id)
}

export async function extendPaymentHold(id: string, until: Date): Promise<void> {
  await createServiceClient()
    .from('orders')
    .update({ payment_expires_at: until.toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
}

export async function updateOrder(id: string, update: OrderUpdate): Promise<OrderRecord> {
  const current = await getOrder(id)
  if (!current) throw new Error('Order not found.')

  const supabase = createServiceClient()
  const { status, ...fields } = update
  const patch: Record<string, unknown> = { ...fields }

  if (status && status !== current.status) {
    if (status === 'paid') {
      // Handles re-reserving stock and the discount use when a cancelled order gets paid.
      const result = await markOrderPaid(id, fields.payment_reference ?? null)
      if (result === 'not_found') throw new Error('Order not found.')
    } else if (status === 'cancelled') {
      const { error } = await supabase.rpc('release_order_stock', { p_order_id: id })
      if (error) throw new Error(`Could not return the stock: ${error.message}`)
      if (current.discount_code) await releaseDiscountByCode(current.discount_code)
      patch.status = status
    } else {
      if (current.status === 'cancelled') {
        const { error } = await supabase.rpc('reserve_order_stock', { p_order_id: id })
        if (error) {
          throw new Error(/OUT_OF_STOCK/.test(error.message)
            ? 'Not enough stock to reopen this order. Restock the items first.'
            : `Could not reserve stock: ${error.message}`)
        }
        if (current.discount_code) await redeemDiscount(current.discount_code)
      }
      patch.status = status
    }
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from('orders').update(patch).eq('id', id)
    if (error) throw new Error(`Could not update the order: ${error.message}`)
  }

  return (await getOrder(id)) ?? current
}
