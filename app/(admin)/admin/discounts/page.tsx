import { requireAdmin } from '@/lib/auth/admin'
import { getLocalDiscounts } from '@/lib/discounts-store'
import { DiscountsClient } from './DiscountsClient'

export default async function AdminDiscountsPage() {
  await requireAdmin()
  const discounts = getLocalDiscounts()
  return <DiscountsClient initialDiscounts={discounts} />
}
