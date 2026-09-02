'use client'

import React from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

// Placeholder for social icons
const SocialIcon = MessageCircle

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
              Founded by The Dynamic Duo, embodying the spirit, style, and pride of each of the five boroughs in modern New York streetwear.
            </p>
          </div>

          {/* Shop Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[#0A192F] font-serif tracking-widest text-sm mb-2">SHOP</h4>
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
            <h4 className="text-[#0A192F] font-serif tracking-widest text-sm mb-2">INFO</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'About', href: '/#brand-story' },
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
            <h4 className="text-[#0A192F] font-serif tracking-widest text-sm mb-2">POLICIES</h4>
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
              <h4 className="text-[#0A192F] font-serif tracking-widest text-sm mb-4">JOIN THE LIST</h4>
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
            
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="text-[#666666] hover:text-[#0A192F] transition-colors">
                <SocialIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a href="#" className="text-[#666666] hover:text-[#0A192F] transition-colors">
                <SocialIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a href="#" className="text-[#666666] hover:text-[#0A192F] transition-colors">
                <SocialIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
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
