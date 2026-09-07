'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Flame, 
  Clock, 
  Save, 
  CheckCircle2, 
  Eye, 
  Calendar, 
  Sparkles, 
  MessageSquare,
  Bell,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { CountdownConfig, DEFAULT_COUNTDOWN } from '@/lib/types/countdown'

const PRESET_MESSAGES = [
  {
    name: 'Standard NYC Capsule',
    badge: '🔥 NYC STREETWEAR DROP RADAR',
    title: 'NEXT CAPSULE DROP COUNTDOWN',
    message: 'Limited batch five boroughs heavyweight hoodies, vintage graphic tees & headwear. Once sold out, they will not restock.'
  },
  {
    name: 'Been Brooklyn Baller Exclusive',
    badge: '⚡ LIMITED RELEASE // BALLER MERCH',
    title: 'BEEN BROOKLYN BALLER DROP',
    message: 'Official Brooklyn Baller mascot collection dropping in limited quantities. Collegiate athletic stripes and heavyweight NYC tailoring.'
  },
  {
    name: 'VIP Midnight Release',
    badge: '🔒 VIP EARLY ACCESS DROP',
    title: 'MIDNIGHT VAULT RELEASE',
    message: 'Strictly 50 units per borough style. First come, first served. Enter your email below to unlock the private vault.'
  },
  {
    name: 'Archive Final Restock',
    badge: '🚨 FINAL INVENTORY RUN',
    title: 'FIVE BOROUGHS RESTOCK',
    message: 'Final restock of Been Brooklyn and So New York core essentials. Once this drop concludes, the capsule will be archived.'
  }
]

export function CountdownClient() {
  const [config, setConfig] = useState<CountdownConfig>(DEFAULT_COUNTDOWN)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Local state for datetime-local string (YYYY-MM-DDTHH:mm)
  const [dateInput, setDateInput] = useState('')

  useEffect(() => {
    fetch('/api/countdown')
      .then(res => res.json())
      .then(data => {
        if (data?.config) {
          setConfig(data.config)
          if (data.config.targetDate) {
            const d = new Date(data.config.targetDate)
            if (!isNaN(d.getTime())) {
              // Convert to YYYY-MM-DDTHH:mm format for input
              const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
              setDateInput(localIso)
            }
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load countdown configuration')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: Partial<CountdownConfig> = {
        ...config,
        targetDate: dateInput ? new Date(dateInput).toISOString() : config.targetDate
      }

      const res = await fetch('/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data?.success) {
        setConfig(data.config)
        setSavedSuccess(true)
        toast.success('Countdown announcement message and settings updated live!')
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        toast.error(data?.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Network error saving countdown settings')
    } finally {
      setSaving(false)
    }
  }

  // Quick Date Helpers
  const setQuickDate = (daysAhead: number, hour: number = 20) => {
    const d = new Date()
    d.setDate(d.getDate() + daysAhead)
    d.setHours(hour, 0, 0, 0)
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setDateInput(localIso)
    setConfig(prev => ({ ...prev, targetDate: d.toISOString() }))
  }

  const applyPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setConfig(prev => ({
      ...prev,
      badge: preset.badge,
      title: preset.title,
      message: preset.message
    }))
    toast.info(`Applied preset: ${preset.name}`)
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-[#666666] font-mono text-xs">
        Loading drop countdown configuration...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#666666] font-semibold">
              STOREFRONT ANNOUNCEMENTS
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wider text-[#0A192F] mt-1">
            DROP COUNTDOWN &amp; MESSAGE
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Control the live drop timer, announcement headline, and description message displayed on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={config.is_active ? "default" : "outline"} className={config.is_active ? "bg-emerald-600 text-white" : "text-[#666666]"}>
            {config.is_active ? "Live on Storefront" : "Countdown Paused"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Countdown Message Card (Main User Focus) */}
            <Card className="bg-[#FFFFFF] border-[#E5E5E5] shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0A192F]" />
                    <CardTitle className="font-serif text-lg text-[#0A192F]">
                      Countdown Message &amp; Narrative
                    </CardTitle>
                  </div>
                  <span className="text-[10px] font-mono text-[#666666]">
                    {config.message?.length || 0} characters
                  </span>
                </div>
                <CardDescription className="text-xs text-[#666666]">
                  This is the exact description message displayed directly under the countdown heading.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#0A192F] block">
                    Drop Description Message
                  </label>
                  <textarea
                    rows={3}
                    value={config.message}
                    onChange={(e) => setConfig({ ...config, message: e.target.value })}
                    placeholder="Enter the drop message displayed to customers..."
                    className="w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-sm text-[#0A192F] focus:outline-none focus:border-[#0A192F] focus:bg-white transition-all resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* Quick Message Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                    Quick Narrative Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MESSAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="text-[11px] px-2.5 py-1 rounded bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#0A192F] font-mono transition-colors border border-[#E5E5E5]"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Heading & Badge Card */}
            <Card className="bg-[#FFFFFF] border-[#E5E5E5] shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <CardTitle className="font-serif text-lg text-[#0A192F]">
                    Headlines &amp; Radar Badge
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-[#666666]">
                  The main banner title and small pill badge above the countdown.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0A192F] block">
                    Top Radar Badge Text
                  </label>
                  <Input
                    value={config.badge}
                    onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                    placeholder="e.g. 🔥 NYC STREETWEAR DROP RADAR"
                    className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0A192F] block">
                    Countdown Main Title
                  </label>
                  <Input
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="e.g. NEXT CAPSULE DROP COUNTDOWN"
                    className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-brand tracking-wider uppercase font-bold"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Launch Date & Time Card */}
            <Card className="bg-[#FFFFFF] border-[#E5E5E5] shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0A192F]" />
                  <CardTitle className="font-serif text-lg text-[#0A192F]">
                    Target Drop Launch Date
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-[#666666]">
                  The countdown clock calculates days, hours, and seconds remaining until this exact moment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0A192F] block">
                    Drop Date &amp; Time (EST/Local)
                  </label>
                  <Input
                    type="datetime-local"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-mono"
                  />
                </div>

                {/* Quick Schedule Buttons */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                    Quick Schedule Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickDate(3, 20)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#0A192F] font-mono transition-colors"
                    >
                      In 3 Days (8 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(5, 20)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#0A192F] font-mono transition-colors"
                    >
                      In 5 Days (8 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7, 20)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#0A192F] font-mono transition-colors"
                    >
                      In 7 Days (8 PM)
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visibility & VIP Form Text */}
            <Card className="bg-[#FFFFFF] border-[#E5E5E5] shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#0A192F]" />
                  <CardTitle className="font-serif text-lg text-[#0A192F]">
                    Early Access Sign-Up Controls
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Button Label</label>
                    <Input
                      value={config.button_text}
                      onChange={(e) => setConfig({ ...config, button_text: e.target.value })}
                      placeholder="NOTIFY ME"
                      className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Input Placeholder</label>
                    <Input
                      value={config.placeholder_text}
                      onChange={(e) => setConfig({ ...config, placeholder_text: e.target.value })}
                      placeholder="ENTER YOUR EMAIL FOR EARLY DROP ACCESS"
                      className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] mt-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#0A192F] block">Display Countdown on Storefront</span>
                    <span className="text-[10px] text-[#666666]">Enable to show live countdown banner on the homepage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.is_active}
                    onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                    className="rounded border-[#E5E5E5] text-[#0A192F] w-4 h-4 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0A192F] text-white hover:bg-black font-serif tracking-widest uppercase text-xs px-8 py-3 gap-2 h-auto shadow-md"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Message Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Countdown Message</span>
                  </>
                )}
              </Button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Real-Time Storefront Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#0A192F] font-semibold flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Storefront Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Real-Time
              </span>
            </div>

            {/* Storefront Preview Box */}
            <div className="bg-[#000000] text-white rounded-xl p-6 border border-white/10 shadow-2xl relative overflow-hidden text-center space-y-5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Badge Preview */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[9px] font-mono tracking-[0.2em] uppercase mx-auto">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{config.badge || 'NYC STREETWEAR DROP RADAR'}</span>
              </div>

              {/* Title & Message Preview */}
              <div className="space-y-2">
                <h3 className="font-brand text-xl sm:text-2xl font-bold tracking-[0.1em] uppercase text-white leading-snug">
                  {config.title || 'NEXT CAPSULE DROP COUNTDOWN'}
                </h3>
                <p className="text-white/70 text-[11px] font-sans tracking-wide leading-relaxed px-2">
                  {config.message || 'Limited batch five boroughs heavyweight hoodies, vintage graphic tees & headwear. Once sold out, they will not restock.'}
                </p>
              </div>

              {/* Timer Preview */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { label: 'DAYS', val: '04' },
                  { label: 'HRS', val: '23' },
                  { label: 'MIN', val: '53' },
                  { label: 'SEC', val: '17' }
                ].map((t) => (
                  <div key={t.label} className="bg-white/5 border border-white/15 rounded-lg p-2 flex flex-col items-center">
                    <span className="font-mono text-lg sm:text-xl font-bold text-white">{t.val}</span>
                    <span className="text-[8px] font-mono text-white/60 tracking-wider uppercase">{t.label}</span>
                  </div>
                ))}
              </div>

              {/* Input & Button Preview */}
              <div className="pt-2 flex flex-col gap-2">
                <div className="bg-white/10 border border-white/20 text-white/50 text-[10px] font-mono px-3 py-2 rounded text-left truncate">
                  {config.placeholder_text || 'ENTER YOUR EMAIL FOR EARLY DROP ACCESS'}
                </div>
                <div className="bg-white text-black font-brand text-[10px] uppercase tracking-widest font-bold py-2 rounded flex items-center justify-center gap-1">
                  <Bell className="w-3 h-3" />
                  <span>{config.button_text || 'NOTIFY ME'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-white/40">
                Target Date: {dateInput ? new Date(dateInput).toLocaleString() : 'Next Friday 8:00 PM EST'}
              </div>
            </div>

            {/* Helper Info Note */}
            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] text-[#666666] space-y-1">
              <p className="font-semibold text-[#0A192F]">How it works:</p>
              <p>
                When you save changes here, the message and target date update instantly on the homepage for all visitors. Customers who sign up are tagged in your early drop list.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
