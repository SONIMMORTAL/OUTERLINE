'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Invalid credentials. Please try again.')
        setLoading(false)
        return
      }

      toast.success('Authenticated successfully. Welcome to Outerline Admin.')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setErrorMsg('Failed to connect to authentication server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-[#FFFFFF] border border-[#E5E5E5] p-8 md:p-10 rounded-2xl shadow-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
            <img 
              src="/OUTERLINE LOGO.png" 
              alt="Outerline Logo" 
              className="h-12 mx-auto object-contain"
            />
          </Link>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#0A192F] font-semibold">
              Admin Access Gateway
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0A192F] tracking-tight">
            Sign In to Store Portal
          </h2>
          <p className="text-xs text-[#666666]">
            Enter your administrative credentials to manage products, orders, and telemetry.
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#0A192F] block">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Outer or email"
                required
                className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all placeholder:text-[#999999]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#0A192F] block">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-[#0A192F] focus:bg-[#FFFFFF] transition-all placeholder:text-[#999999]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#0A192F] p-1 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest uppercase text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-[#000000] disabled:opacity-50 transition-all shadow-md font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Access Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Default Credentials Note */}
        <div className="pt-4 border-t border-[#E5E5E5] space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#666666]">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Encrypted Session Protection Active</span>
          </div>
          <p className="text-[10px] text-[#999999] leading-tight">
            Default credentials for store management: <br/>
            Username: <span className="font-mono text-[#0A192F] font-medium">admin</span> | Password: <span className="font-mono text-[#0A192F] font-medium">outerline2026!</span>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="text-xs text-[#666666] hover:text-[#0A192F] tracking-wider uppercase font-medium transition-colors"
        >
          ← Return to Storefront
        </Link>
      </div>
    </div>
  )
}
