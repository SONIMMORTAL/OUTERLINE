import { requireAdmin } from '@/lib/auth/admin'
import { emailSetupProblem, fromAddress } from '@/lib/email'
import { SettingsClient } from './SettingsClient'
import { EmailDeliveryCard } from './EmailDeliveryCard'

export default async function SettingsPage() {
  await requireAdmin()
  return (
    <SettingsClient>
      <EmailDeliveryCard sender={fromAddress()} problem={emailSetupProblem()} />
    </SettingsClient>
  )
}
