'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sendTestEmail } from './actions'

export function EmailDeliveryCard({ sender, problem }: { sender: string; problem: string | null }) {
  const [to, setTo] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setResult(null)
    const response = await sendTestEmail(to)
    setResult(response.success
      ? { ok: true, message: `Sent to ${to.trim()}. Check that inbox (and spam) in a minute.` }
      : { ok: false, message: response.error })
    setIsSending(false)
  }

  return (
    <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#0A192F]" />
          <CardTitle className="font-serif text-xl">Customer Email Delivery</CardTitle>
        </div>
        <CardDescription className="text-xs text-[#666666]">
          Promo code welcome emails, order confirmations, and shipping updates are sent through Resend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex gap-2 rounded-lg border p-3 text-xs ${
          problem ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'
        }`}>
          {problem ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <div className="space-y-1">
            <p className="font-semibold">{problem ? 'Customers are not receiving emails' : 'Email sending is set up'}</p>
            {problem && <p>{problem}</p>}
            <p className="font-mono text-[10px] opacity-80">Sending from: {sender}</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            required
            placeholder="Send a test welcome email to…"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border-[#E5E5E5] bg-[#FAFAFA] text-xs"
          />
          <Button
            type="submit"
            disabled={isSending}
            className="bg-[#0A192F] text-white hover:bg-black text-xs font-serif tracking-widest uppercase gap-2 shrink-0"
          >
            {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Send Test Email
          </Button>
        </form>

        {result && (
          <p role="status" className={`text-xs ${result.ok ? 'text-green-700' : 'text-red-600'}`}>
            {result.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
