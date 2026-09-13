'use server'

import { getAdminSession } from '@/lib/auth/admin'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/components/emails/CustomerWelcome'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Sends the real subscriber welcome email, so the admin sees exactly what shoppers get (or Resend's error).
export async function sendTestEmail(to: string): Promise<{ success: true } | { success: false; error: string }> {
  if (!(await getAdminSession())) {
    return { success: false, error: 'Your admin session has expired. Please log in again.' }
  }
  const recipient = to.trim()
  if (!EMAIL_PATTERN.test(recipient)) {
    return { success: false, error: 'Enter a valid email address.' }
  }

  try {
    await sendEmail(welcomeEmail(recipient, 'THANK YOU'))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'The email could not be sent.' }
  }
}
