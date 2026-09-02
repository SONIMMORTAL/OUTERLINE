import { requireAdmin } from '@/lib/auth/admin'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  await requireAdmin()
  return <SettingsClient />
}
