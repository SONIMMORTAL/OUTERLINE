'use client'

import React, { useState } from 'react'
import { StoredDiscount } from '@/lib/discounts-store'
import { 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Calendar, 
  Hash, 
  Percent, 
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { toast } from 'sonner'

interface DiscountsClientProps {
  initialDiscounts: StoredDiscount[]
}

export function DiscountsClient({ initialDiscounts }: DiscountsClientProps) {
  const [discounts, setDiscounts] = useState<StoredDiscount[]>(initialDiscounts)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form State
  const [code, setCode] = useState('')
  const [percentage, setPercentage] = useState(15)
  const [maxUses, setMaxUses] = useState(0)
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode)
    setCopiedCode(couponCode)
    toast.success(`Copied ${couponCode} to clipboard!`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('Please enter a coupon code.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          percentage: Number(percentage) || 15,
          max_uses: Number(maxUses) || 0,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          is_active: isActive,
        })
      })

      const data = await res.json()
      if (data.discount) {
        setDiscounts([data.discount, ...discounts.filter(d => d.id !== data.discount.id)])
        toast.success(`Coupon "${data.discount.code}" created successfully!`)
        setIsCreating(false)
        // Reset form
        setCode('')
        setPercentage(15)
        setMaxUses(0)
        setExpiresAt('')
        setIsActive(true)
      } else {
        toast.error(data.error || 'Failed to create coupon.')
      }
    } catch {
      toast.error('Network error creating coupon.')
    }
    setIsSubmitting(false)
  }

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch('/api/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle' })
      })
      const data = await res.json()
      if (data.discount) {
        setDiscounts(discounts.map(d => d.id === id ? data.discount : d))
        toast.success(`Coupon status updated!`)
      }
    } catch {
      toast.error('Failed to update coupon status.')
    }
  }

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return

    try {
      const res = await fetch(`/api/discounts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setDiscounts(discounts.filter(d => d.id !== id))
        toast.success(`Coupon "${couponCode}" deleted.`)
      }
    } catch {
      toast.error('Failed to delete coupon.')
    }
  }

  const filtered = discounts.filter(d => 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#666666]">
            <Tag className="w-3.5 h-3.5 text-[#0A192F]" />
            <span>Store Promotion Engine</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#0A192F] mt-1">
            Coupon Codes &amp; Discounts
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Create and manage promotional discounts, set usage limits, and configure expiration dates.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-[#0A192F] text-white rounded-md text-xs font-serif uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Close Form' : 'New Promo Code'}</span>
        </button>
      </div>

      {/* Create Form Card */}
      {isCreating && (
        <div className="p-6 bg-[#FFFFFF] border border-[#0A192F]/20 rounded-xl shadow-md space-y-6">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h2 className="font-serif text-lg font-bold text-[#0A192F]">Create New Coupon</h2>
            <p className="text-xs text-[#666666]">Configure promo discount rules and limitations.</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#0A192F]">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. THANK YOU"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] uppercase focus:outline-none focus:border-[#0A192F]"
                />
              </div>

              {/* Discount Percentage */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#0A192F]">
                  Discount (% Off) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 pr-8 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                  />
                  <Percent className="w-3.5 h-3.5 text-[#888888] absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Usage Limit */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#0A192F]">
                  Usage Limit (0 = Unlimited)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 pr-8 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                  />
                  <Hash className="w-3.5 h-3.5 text-[#888888] absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#0A192F]">
                  Expiration Date (Optional)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                  />
                </div>
              </div>
            </div>

            {/* Status Toggle & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E5E5E5]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[#CCCCCC] text-[#0A192F] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs font-medium text-[#0A192F]">Activate coupon immediately</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-[#E5E5E5] text-[#666666] text-xs font-serif uppercase tracking-wider rounded hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#0A192F] text-white text-xs font-serif uppercase tracking-wider rounded hover:bg-black transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs">
        {/* Search */}
        <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
          <input
            type="text"
            placeholder="Search promo codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs p-2 rounded border border-[#E5E5E5] bg-white text-[#0A192F] max-w-xs w-full focus:outline-none focus:border-[#0A192F]"
          />
          <span className="text-xs text-[#666666] font-mono">
            {filtered.length} {filtered.length === 1 ? 'coupon' : 'coupons'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F3F3] border-b border-[#E5E5E5] text-[#666666] font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Usage Stats</th>
                <th className="py-3 px-4">Expiration Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filtered.map((d) => {
                const isExpired = d.expires_at && new Date(d.expires_at).getTime() < Date.now()
                const isMaxedOut = d.max_uses > 0 && d.uses_count >= d.max_uses
                return (
                  <tr key={d.id} className="hover:bg-[#FAFAFA] transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#0A192F]">
                      <div className="flex items-center gap-2">
                        <span>{d.code}</span>
                        <button
                          onClick={() => handleCopy(d.code)}
                          className="p-1 text-[#888888] hover:text-[#0A192F] transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === d.code ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">
                      {d.percentage}% OFF
                    </td>

                    {/* Usage Stats */}
                    <td className="py-3.5 px-4 font-mono text-[#666666]">
                      {d.max_uses > 0 ? (
                        <div className="space-y-1">
                          <span>{d.uses_count} / {d.max_uses} used</span>
                          {isMaxedOut && (
                            <span className="block text-[10px] text-red-600 font-semibold">
                              Limit Reached
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>{d.uses_count} used (Unlimited)</span>
                      )}
                    </td>

                    {/* Expiration Date */}
                    <td className="py-3.5 px-4 text-[#666666]">
                      {d.expires_at ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                          <span>{new Date(d.expires_at).toLocaleDateString()}</span>
                          {isExpired && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#888888] italic">No expiration</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                        d.is_active && !isExpired && !isMaxedOut
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {d.is_active && !isExpired && !isMaxedOut ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(d.id)}
                          className="p-1.5 rounded hover:bg-[#EAEAEA] text-[#666666] hover:text-[#0A192F] transition-colors cursor-pointer"
                          title={d.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {d.is_active ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.code)}
                          className="p-1.5 rounded hover:bg-red-50 text-[#888888] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
