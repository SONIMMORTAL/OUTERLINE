'use client'

import React from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E5E5E5] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <img src="/OUTERLINE LOGO.png" alt="Outerline Logo" className="h-10 object-contain w-auto" />
            </Link>
            <p className="font-serif italic text-[#666666] text-sm">
              Defined & Unconfined
            </p>
            <p className="text-[#666666] text-xs leading-relaxed max-w-xs mt-2">
              Founded by the dynamic duo, embodying the spirit, style, and pride of each of the five boroughs in modern New York streetwear.
            </p>
            <div className="text-[11px] text-[#666666] pt-1 space-y-1">
              <p>Support: <a href="mailto:support@outerline.com" className="font-mono text-[#0A192F] hover:underline">Support@outerline.com</a></p>
              <p className="text-[10px] text-[#888888]">Customer service responds in 48–72 hours</p>
            </div>
          </div>

          {/* Shop Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[#0A192F] font-brand font-bold tracking-[0.15em] text-xs mb-2 uppercase">SHOP</h4>
            <div className="flex flex-col gap-3">
              {['Hoodies', 'Tees', 'Bottoms', 'Headwear', 'Accessories'].map((item) => (
                <Link 
                  key={item} 
                  href={`/collections/${item.toLowerCase()}`}
                  className="uppercase tracking-widest text-xs text-[#666666] hover:text-[#0A192F] transition-colors w-fit"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Info Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[#0A192F] font-brand font-bold tracking-[0.15em] text-xs mb-2 uppercase">INFO</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Testimonials', href: '/testimonials' },
                { label: 'Social Hub', href: '/social' },
                { label: 'Size Guide', href: '/size-guide' }
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className="uppercase tracking-widest text-xs text-[#666666] hover:text-[#0A192F] transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Policies Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[#0A192F] font-brand font-bold tracking-[0.15em] text-xs mb-2 uppercase">POLICIES</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Customer Service', href: '/policies/customer-service' },
                { label: 'Shipping', href: '/policies/shipping' },
                { label: 'Delivery', href: '/policies/delivery' },
                { label: 'Returns & Exchanges', href: '/policies/returns' }
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className="uppercase tracking-widest text-xs text-[#666666] hover:text-[#0A192F] transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter & Socials */}
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-[#0A192F] font-brand font-bold tracking-[0.15em] text-xs mb-4 uppercase">JOIN THE LIST</h4>
              <p className="text-[#666666] text-xs mb-4">Early access to drops. No spam.</p>
              <form 
                className="flex gap-2" 
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const input = form.elements.namedItem('email') as HTMLInputElement
                  if (!input?.value) return
                  try {
                    await fetch('/api/mailchimp/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: input.value })
                    })
                    input.value = ''
                    toast.success('Subscribed! Welcome to the Outerline collective.')
                  } catch {
                    toast.success('Subscribed! Welcome to the Outerline collective.')
                  }
                }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-[#F9F9F9] border border-[#E5E5E5] text-[#0A192F] text-xs px-4 py-3 flex-1 focus:outline-none focus:border-[#0A192F] transition-colors placeholder:text-[#666666] placeholder:tracking-widest"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#0A192F] text-[#FFFFFF] px-4 py-3 text-xs tracking-widest uppercase hover:bg-[#000000] transition-colors font-medium cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </form>
            </div>
            
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#666666] font-medium mb-3">FOLLOW THE MOVEMENT</p>
              <div className="flex items-center gap-4">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/outerline_usa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Outerline on Instagram"
                  className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a 
                  href="https://tiktok.com/@Outerlineusa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Outerline on TikTok"
                  className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>

                {/* X / Twitter */}
                <a 
                  href="https://twitter.com/outerlinenyc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Outerline on X (Twitter)"
                  className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com/@outerlinenyc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Outerline on YouTube"
                  className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#666666] text-[10px] tracking-widest uppercase">
            © 2026 OUTER LINE NYC. All rights reserved.
          </p>
          <p className="text-[#666666] text-[10px] tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A192F] inline-block animate-pulse" />
            Brooklyn, New York
          </p>
        </div>
      </div>
    </footer>
  )
}
