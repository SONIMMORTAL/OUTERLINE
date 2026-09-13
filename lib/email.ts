import { Resend, type CreateEmailOptions } from 'resend'

// Resend's shared test sender. It only delivers to the Resend account owner's own inbox, so shoppers never
// receive anything sent from it. Real mail needs a verified domain (outerlineusa.com) and RESEND_FROM_EMAIL.
const TEST_SENDER = 'Outerline <onboarding@resend.dev>'

let client: Resend | null = null

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key || !key.startsWith('re_') || key === 're_your_resend_api_key') return null
  client ??= new Resend(key)
  return client
}

export function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || TEST_SENDER
}

// Why customer email can't be delivered right now, or null when it is set up.
export function emailSetupProblem(): string | null {
  if (!getResend()) {
    return 'RESEND_API_KEY is not set on the server, so no emails are sent.'
  }
  if (/@resend\.dev>?$/i.test(fromAddress())) {
    return 'Emails go out from Resend\'s test address (onboarding@resend.dev), which only delivers to the Resend account owner. Verify outerlineusa.com in Resend → Domains, then set RESEND_FROM_EMAIL (e.g. "Outerline <hello@outerlineusa.com>").'
  }
  return null
}

type EmailMessage = Omit<CreateEmailOptions, 'from'>

// Resend reports failures (unverified domain, bad recipient, rate limits) in the response instead of throwing,
// so they must be checked or they vanish silently.
export async function sendEmail(message: EmailMessage): Promise<void> {
  const resend = getResend()
  if (!resend) throw new Error('RESEND_API_KEY is not set on the server.')

  const { error } = await resend.emails.send({ ...message, from: fromAddress() } as CreateEmailOptions)
  if (error) throw new Error(`Resend rejected the email to ${message.to}: ${error.message}`)
}
