import { requireAdmin } from '@/lib/auth/admin'
import { listDiscounts, type StoredDiscount } from '@/lib/discounts-store'
import { DiscountsClient } from './DiscountsClient'

export default async function AdminDiscountsPage() {
  await requireAdmin()

  let discounts: StoredDiscount[] = []
  let loadError: string | null = null
  try {
    discounts = await listDiscounts()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Could not load discount codes.'
  }

  return <DiscountsClient initialDiscounts={discounts} loadError={loadError} />
}
