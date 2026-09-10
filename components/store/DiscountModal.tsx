'use client'

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { SmsOptIn } from '@/components/store/SmsOptIn'
import { normalizePhone } from '@/lib/phone'

const CLAIMED_KEY = 'outerline-discount-claimed'
const DISMISSED_AT_KEY = 'outerline-discount-dismissed-at'
const TAB_USED_KEY = 'outerline-discount-tab-used'
const SESSION_PAGEVIEWS_KEY = 'outerline-session-pageviews'
const SESSION_PROMPTED_KEY = 'outerline-discount-prompted'

const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000
// Let visitors browse before asking: a long delay on the landing page, a short one once they open a second page.
const LANDING_PAGE_DELAY_MS = 30_000
const LATER_PAGE_DELAY_MS = 4_000
const NO_PROMPT_PATHS = ['/checkout', '/orders', '/policies', '/terms', '/privacy']

function readStorage(kind: 'local' | 'session', key: string): string | null {
  try {
    return (kind === 'local' ? window.localStorage : window.sessionStorage).getItem(key)
  } catch {
    return null
  }
}

function writeStorage(kind: 'local' | 'session', key: string, value: string) {
  try {
    ;(kind === 'local' ? window.localStorage : window.sessionStorage).setItem(key, value)
  } catch {
    // Storage can be blocked (private mode, strict privacy settings); the popup just won't remember.
  }
}

function wasRecentlyDismissed() {
  const dismissedAt = Number(readStorage('local', DISMISSED_AT_KEY) || '0')
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS
}

// The "Get 15% Off" tab is a one-time reminder after a dismissal: once clicked or claimed, it never returns.
function isTabEligible() {
  if (readStorage('local', CLAIMED_KEY) || readStorage('local', TAB_USED_KEY)) return false
  return wasRecentlyDismissed()
}

// Storage isn't observable, so nothing to subscribe to; the snapshot is re-read on every render,
// and each handler that writes storage also sets state.
const subscribeToNothing = () => () => {}

export default function DiscountModal() {
  const pathname = usePathname()
  const countedPathRef = useRef<string | null>(null)
  const tabEligible = useSyncExternalStore(subscribeToNothing, isTabEligible, () => false)

  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (readStorage('local', CLAIMED_KEY)) return

    // Count each page once (effects run twice in development).
    let pageviews = Number(readStorage('session', SESSION_PAGEVIEWS_KEY) || '0')
    if (countedPathRef.current !== pathname) {
      countedPathRef.current = pathname
      pageviews += 1
      writeStorage('session', SESSION_PAGEVIEWS_KEY, String(pageviews))
    }

    if (wasRecentlyDismissed()) return
    if (readStorage('session', SESSION_PROMPTED_KEY)) return
    if (NO_PROMPT_PATHS.some((path) => pathname.startsWith(path))) return

    const timer = setTimeout(() => {
      writeStorage('session', SESSION_PROMPTED_KEY, '1')
      setIsOpen(true)
    }, pageviews > 1 ? LATER_PAGE_DELAY_MS : LANDING_PAGE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [pathname])

  const handleOpenChange = (open: boolean) => {
    if (open) return
    if (status !== 'success') {
      writeStorage('local', DISMISSED_AT_KEY, String(Date.now()))
    }
    setIsOpen(false)
  }

  const handleTabClick = () => {
    writeStorage('local', TAB_USED_KEY, '1')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedPhone = phone.trim()
    if (trimmedPhone && !normalizePhone(trimmedPhone)) {
      setError('Please enter a valid mobile number.')
      return
    }
    if (trimmedPhone && !smsConsent) {
      setError('Check the box to get texts, or leave the mobile number blank.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: trimmedPhone || undefined,
          smsConsent: Boolean(trimmedPhone) && smsConsent,
          source: 'discount-popup',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setStatus('idle')
        return
      }

      const code = data.code || 'THANK YOU'
      writeStorage('local', CLAIMED_KEY, 'true')
      setDiscountCode(code)
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => setCopied(true)).catch(() => {})
      }
      setStatus('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('idle')
    }
  }

  return (
    <>
      {tabEligible && !isOpen && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleTabClick}
          className="fixed bottom-5 left-5 z-40 bg-[#0A192F] text-white px-3.5 py-2 rounded-full shadow-2xl border border-white/20 font-mono text-[11px] uppercase tracking-wider hover:bg-black hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Get 15% Off</span>
        </motion.button>
      )}

      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <AnimatePresence>
          {isOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, y: 100, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 100, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
                >
                  <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-6 sm:p-8 rounded-2xl shadow-2xl overflow-hidden relative">

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A192F]/10 rounded-bl-full blur-2xl pointer-events-none" />

                    <Dialog.Close
                      aria-label="Close"
                      className="absolute top-4 right-4 text-[#666666] hover:text-[#0A192F] transition-colors p-2 rounded-full hover:bg-[#F3F3F3]"
                    >
                      <X className="w-5 h-5" />
                    </Dialog.Close>

                    <div className="text-center space-y-5 relative z-10">
                      <div className="space-y-2">
                        <Dialog.Title className="font-serif text-3xl text-[#0A192F]">GET 15% OFF</Dialog.Title>
                        <p className="text-[10px] uppercase tracking-widest text-[#0A192F] font-medium">YOUR FIRST ORDER</p>
                      </div>

                      {status === 'success' ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-4 bg-[#F3F3F3] p-6 rounded-lg border border-[#E5E5E5]"
                        >
                          <Dialog.Description className="text-[#000000] text-sm">Use code at checkout:</Dialog.Description>
                          <div className="font-mono text-2xl tracking-widest text-[#0A192F] bg-[#FFFFFF] py-3 px-4 rounded border border-[#E5E5E5] select-all">
                            {discountCode}
                          </div>
                          {copied && <p className="text-[#666666] text-xs">Code copied to your clipboard.</p>}
                        </motion.div>
                      ) : (
                        <>
                          <Dialog.Description className="text-[#666666] text-sm">
                            Join the Outerline collective by email or text. Get early access to drops and 15% off your first purchase.
                          </Dialog.Description>

                          <form onSubmit={handleSubmit} className="space-y-3">
                            <label htmlFor="discount-email" className="sr-only">Email address</label>
                            <input
                              id="discount-email"
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] text-[#0A192F] px-4 py-3 rounded-lg focus:outline-none focus:border-[#0A192F] transition-colors placeholder:text-[#999999]"
                            />

                            <SmsOptIn
                              idPrefix="discount"
                              phone={phone}
                              onPhoneChange={setPhone}
                              consent={smsConsent}
                              onConsentChange={setSmsConsent}
                            />

                            {error && (
                              <p role="alert" className="text-xs text-red-600 text-left">{error}</p>
                            )}

                            <button
                              type="submit"
                              disabled={status === 'loading'}
                              className="w-full bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest text-sm py-3 rounded-lg hover:bg-[#000000] transition-colors disabled:opacity-70 flex justify-center items-center h-12"
                            >
                              {status === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                'CLAIM YOUR CODE'
                              )}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  )
}
