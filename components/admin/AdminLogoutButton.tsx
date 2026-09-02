'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function AdminLogoutButton({ className, variant = 'icon' }: { className?: string, variant?: 'icon' | 'full' }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      toast.success('Signed out of Admin Portal.')
      router.push('/admin/login')
      router.refresh()
    } catch {
      router.push('/admin/login')
    }
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleLogout}
        className={className || "flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"}
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className={className || "p-2 text-[#666666] hover:text-red-600 hover:bg-[#F3F3F3] rounded-md transition-colors"}
      title="Sign Out"
      aria-label="Sign Out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  )
}
