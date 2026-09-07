import { requireAdmin } from '@/lib/auth/admin'
import { CountdownClient } from './CountdownClient'

export const metadata = {
  title: 'Drop Countdown & Announcement | Admin Suite',
  description: 'Manage the countdown message and drop schedule on the Outerline storefront.'
}

export default async function CountdownAdminPage() {
  await requireAdmin()
  return <CountdownClient />
}
