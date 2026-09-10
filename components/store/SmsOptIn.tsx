'use client'

import Link from 'next/link'
import { SMS_CONSENT_TEXT } from '@/lib/sms-consent'

interface SmsOptInProps {
  idPrefix: string
  phone: string
  onPhoneChange: (phone: string) => void
  consent: boolean
  onConsentChange: (consent: boolean) => void
  tone?: 'light' | 'dark'
}

// Optional mobile number with an unchecked consent box. The disclosure appears as soon as a number is typed.
export function SmsOptIn({ idPrefix, phone, onPhoneChange, consent, onConsentChange, tone = 'light' }: SmsOptInProps) {
  const dark = tone === 'dark'

  return (
    <div className="space-y-2 text-left">
      <label htmlFor={`${idPrefix}-phone`} className="sr-only">
        Mobile number for text alerts (optional)
      </label>
      <input
        id={`${idPrefix}-phone`}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={dark ? 'MOBILE NUMBER FOR TEXT ALERTS (OPTIONAL)' : 'Mobile number for texts (optional)'}
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        className={
          dark
            ? 'w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs font-mono px-4 py-3 rounded-lg focus:outline-none focus:border-white focus:bg-white/15 transition-all tracking-wider'
            : 'w-full bg-[#FFFFFF] border border-[#E5E5E5] text-[#0A192F] px-4 py-3 rounded-lg focus:outline-none focus:border-[#0A192F] transition-colors placeholder:text-[#999999]'
        }
      />
      {phone.trim() && (
        <label htmlFor={`${idPrefix}-consent`} className="flex items-start gap-2.5 cursor-pointer">
          <input
            id={`${idPrefix}-consent`}
            type="checkbox"
            checked={consent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer ${dark ? 'accent-white' : 'accent-[#0A192F]'}`}
          />
          <span className={`text-[10px] leading-relaxed ${dark ? 'text-white/60' : 'text-[#666666]'}`}>
            {SMS_CONSENT_TEXT}{' '}
            <Link href="/terms" target="_blank" className="underline underline-offset-2">Terms</Link>
            {' & '}
            <Link href="/privacy" target="_blank" className="underline underline-offset-2">Privacy</Link>.
          </span>
        </label>
      )}
    </div>
  )
}
