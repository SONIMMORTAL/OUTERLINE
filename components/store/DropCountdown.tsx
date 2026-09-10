'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Bell, Check } from 'lucide-react'
import { toast } from 'sonner'
import { CountdownConfig } from '@/lib/types/countdown'
import { SmsOptIn } from '@/components/store/SmsOptIn'
import { normalizePhone } from '@/lib/phone'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// `config` is read on the server, so a hidden countdown never renders and there is no flash of stale settings.
export function DropCountdown({ config }: { config: CountdownConfig }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isLive, setIsLive] = useState(false)

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const target = config.targetDate ? new Date(config.targetDate) : new Date()

    // Fall back to next Friday 8 PM if no valid target date is configured
    if (!config.targetDate || isNaN(target.getTime())) {
      const now = new Date()
      const dayOfWeek = now.getDay()
      let daysUntilFriday = (5 - dayOfWeek + 7) % 7
      if (daysUntilFriday === 0 && now.getHours() >= 20) daysUntilFriday = 7
      target.setTime(now.getTime())
      target.setDate(now.getDate() + daysUntilFriday)
      target.setHours(20, 0, 0, 0)
    }

    const updateTimer = () => {
      const difference = target.getTime() - Date.now()
      if (difference <= 0) {
        setIsLive(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setIsLive(false)
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [config.targetDate])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const trimmedPhone = phone.trim()
    if (trimmedPhone && !normalizePhone(trimmedPhone)) {
      toast.error('Please enter a valid mobile number.')
      return
    }
    if (trimmedPhone && !smsConsent) {
      toast.error('Check the box to get text alerts, or leave the mobile number blank.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: trimmedPhone || undefined,
          smsConsent: Boolean(trimmedPhone) && smsConsent,
          source: 'drop-countdown',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not sign you up. Please try again.')
        return
      }
      setSubscribed(true)
      toast.success('VIP drop list confirmed! You will hear about the release before it goes public.')
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (config.is_active === false) {
    return null
  }

  return (
    <section className="bg-[#000000] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10 relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center space-y-8">

        {/* Drop Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono tracking-[0.25em] uppercase">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{config.badge || 'NYC STREETWEAR DROP RADAR'}</span>
        </div>

        {/* Heading & Admin Message */}
        <div className="space-y-3 max-w-2xl">
          <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.1em] uppercase text-white">
            {isLive ? 'THE DROP IS LIVE' : (config.title || 'NEXT CAPSULE DROP COUNTDOWN')}
          </h2>
          <p className="text-white/70 text-xs sm:text-sm font-sans tracking-wide leading-relaxed">
            {config.message || 'Limited batch five boroughs heavyweight hoodies, vintage graphic tees & headwear. Once sold out, they will not restock.'}
          </p>
        </div>

        {isLive ? (
          <Link
            href="/collections/all"
            className="px-8 py-4 bg-white text-black font-brand text-xs sm:text-sm uppercase tracking-widest font-bold rounded-lg hover:bg-white/90 transition-colors shadow-md"
          >
            Shop the Drop →
          </Link>
        ) : (
          <>
            {/* Countdown Timer Blocks */}
            <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl w-full" aria-live="off">
              {[
                { label: 'DAYS', value: timeLeft?.days },
                { label: 'HOURS', value: timeLeft?.hours },
                { label: 'MINUTES', value: timeLeft?.minutes },
                { label: 'SECONDS', value: timeLeft?.seconds }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/15 rounded-xl p-3 sm:p-5 flex flex-col items-center justify-center backdrop-blur-md shadow-xl"
                >
                  <span className="font-mono text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight tabular-nums">
                    {item.value === undefined ? '--' : String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-white/60 mt-1 sm:mt-2">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Drop Alert Form */}
            <div className="w-full max-w-md pt-2">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="drop-email" className="sr-only">Email address</label>
                    <input
                      id="drop-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={config.placeholder_text || "ENTER YOUR EMAIL FOR EARLY DROP ACCESS"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs font-mono px-4 py-3 rounded-lg focus:outline-none focus:border-white focus:bg-white/15 transition-all uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-white text-black font-brand text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-white/90 transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{loading ? 'Subscribing...' : (config.button_text || 'Notify Me')}</span>
                    </button>
                  </div>
                  <SmsOptIn
                    idPrefix="drop"
                    tone="dark"
                    phone={phone}
                    onPhoneChange={setPhone}
                    consent={smsConsent}
                    onConsentChange={setSmsConsent}
                  />
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                  <Check className="w-4 h-4" />
                  <span>YOU ARE ON THE EARLY ACCESS LIST</span>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </section>
  )
}
