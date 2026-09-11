import { OrdersClient } from './OrdersClient'
import { requireAdmin } from '@/lib/auth/admin'
import { expireUnpaidOrders, listOrders, type OrderRecord } from '@/lib/orders'

export default async function OrdersPage() {
  await requireAdmin()

  let orders: OrderRecord[] = []
  let loadError: string | null = null
  try {
    // Cancel unpaid orders past their hold first, so their stock is back on sale.
    await expireUnpaidOrders()
    orders = await listOrders()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Could not load orders.'
  }

  return <OrdersClient initialOrders={orders} loadError={loadError} />
}
