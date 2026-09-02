import { createClient } from '@/lib/supabase/server'
import { OrdersClient } from './OrdersClient'
import { requireAdmin } from '@/lib/auth/admin'
import { getLocalOrders } from '@/lib/orders-store'

export default async function OrdersPage() {
  await requireAdmin()
  let orders: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      
    if (data && data.length > 0) {
      orders = data
    }
  } catch (err) {
    // Database schema pending
  }

  if (orders.length === 0) {
    orders = getLocalOrders()
  }

  return <OrdersClient initialOrders={orders} />
}
