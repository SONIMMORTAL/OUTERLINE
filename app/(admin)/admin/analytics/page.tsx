import { requireAdmin } from '@/lib/auth/admin'
import { AnalyticsClient } from './AnalyticsClient'

export default async function AnalyticsPage() {
  await requireAdmin()
  return <AnalyticsClient />
}
