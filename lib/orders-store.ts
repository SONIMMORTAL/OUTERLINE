import fs from 'fs'
import path from 'path'

export interface StoredOrder {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  total_amount: number
  subtotal: number
  discount_applied: number
  status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled'
  payment_method: string
  shipping_address: any
  order_items: any[]
  vendor_notified: boolean
  vendor_notified_at?: string
  tracking_number?: string
  carrier?: string
  created_at: string
}

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json')

export function getLocalOrders(): StoredOrder[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return []
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8')
    return JSON.parse(raw) || []
  } catch (err) {
    return []
  }
}

export function saveLocalOrder(order: Partial<StoredOrder>): StoredOrder {
  const existing = getLocalOrders()
  const nextOrderNumber = existing.length > 0 ? Math.max(...existing.map(o => o.order_number || 1000)) + 1 : 1001
  
  const newOrder: StoredOrder = {
    id: order.id || `ord_${Date.now().toString(36)}`,
    order_number: nextOrderNumber,
    customer_name: order.customer_name || 'Customer',
    customer_email: order.customer_email || 'client@outerline.nyc',
    customer_phone: order.customer_phone || '',
    total_amount: Number(order.total_amount) || 0,
    subtotal: Number(order.subtotal || order.total_amount) || 0,
    discount_applied: Number(order.discount_applied) || 0,
    status: order.status || 'pending',
    payment_method: order.payment_method || 'Manual',
    shipping_address: order.shipping_address || {},
    order_items: order.order_items || [],
    vendor_notified: !!order.vendor_notified,
    vendor_notified_at: order.vendor_notified_at,
    tracking_number: order.tracking_number || '',
    carrier: order.carrier || 'Standard',
    created_at: order.created_at || new Date().toISOString()
  }

  const updated = [newOrder, ...existing]
  try {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true })
    fs.writeFileSync(dataFilePath, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write orders.json:', err)
  }

  return newOrder
}
