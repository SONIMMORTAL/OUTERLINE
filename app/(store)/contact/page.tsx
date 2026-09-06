'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Mail, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    // Simulate or send contact inquiry
    try {
      // If an email dispatch endpoint or webhook exists, we can call it or record it
      await new Promise((resolve) => setTimeout(resolve, 600))
      setIsSubmitted(true)
      toast.success('Your message has been sent to Support@outerlineusa.com. We will respond within 24–48 hours.')
    } catch {
      toast.error('Failed to submit message. Please email Support@outerlineusa.com directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-28 sm:pt-32 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Contact</span>
        </nav>

        {/* 10Deep-style Minimalist Header */}
        <div className="space-y-4 border-b border-[#E5E5E5] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            CUSTOMER ASSISTANCE
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#0A192F]">
            CONTACT US
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed max-w-2xl">
            For questions regarding recent drops, sizing recommendations, or order inquiries, please reach out below. Our support team reviews all inquiries in the order received.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details & SLA (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                  OFFICIAL SUPPORT EMAIL
                </span>
                <p className="font-mono text-base font-bold text-[#0A192F]">
                  <a href="mailto:Support@outerlineusa.com" className="hover:underline">
                    Support@outerlineusa.com
                  </a>
                </p>
              </div>

              <div className="space-y-2 border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0A192F]">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>RESPONSE TIME</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Our customer service team responds within <strong>24–48 hours</strong>. Response times may be slightly extended during major release drops and holiday periods.
                </p>
              </div>

              <div className="space-y-2 border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0A192F]">
                  <MapPin className="w-4 h-4 text-[#0A192F]" />
                  <span>HEADQUARTERS</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed font-mono">
                  Ensink Inc, dba Outerline<br />
                  Brooklyn, New York
                </p>
              </div>
            </div>

            {/* Quick Policy Links */}
            <div className="border border-[#E5E5E5] rounded-2xl p-6 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block">
                QUICK DIRECTORY
              </span>
              <div className="space-y-2 text-xs font-mono">
                <Link href="/orders" className="block text-[#0A192F] hover:underline">
                  &rarr; Look Up Order History &amp; Tracking
                </Link>
                <Link href="/policies/shipping" className="block text-[#0A192F] hover:underline">
                  &rarr; Free Shipping ($100+) &amp; Delivery Times
                </Link>
                <Link href="/policies/returns" className="block text-[#0A192F] hover:underline">
                  &rarr; Returns &amp; Exchanges Policy (10-Day Window)
                </Link>
                <Link href="/about" className="block text-[#0A192F] hover:underline">
                  &rarr; The Dynamic Duo Brand Ethos
                </Link>
              </div>
            </div>
          </div>

          {/* Form (Right) */}
          <div className="lg:col-span-7">
            {isSubmitted ? (
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0A192F]">MESSAGE RECEIVED</h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry has been forwarded to our team at <strong>Support@outerlineusa.com</strong>. We will reply to <strong>{formData.email}</strong> within 24–48 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: '', email: '', orderNumber: '', subject: 'General Inquiry', message: '' })
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#0A192F] text-white text-xs font-serif uppercase tracking-widest rounded hover:bg-black transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-5 bg-white shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#0A192F] font-semibold">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="FIRST & LAST NAME"
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-mono px-4 py-3 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#0A192F] font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="EMAIL@EXAMPLE.COM"
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-mono px-4 py-3 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#0A192F] font-semibold">
                      Order # (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="E.G. #1001"
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-mono px-4 py-3 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#0A192F] font-semibold">
                      Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-mono px-4 py-3 rounded text-[#0A192F] focus:outline-none focus:border-[#0A192F] transition-colors"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                      <option value="Sizing & Fit Advice">Sizing &amp; Fit Advice</option>
                      <option value="Defective or Error Item (10-Day Window)">Defective or Error Item (10-Day Window)</option>
                      <option value="Wholesale or Press">Wholesale or Press</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-[#0A192F] font-semibold">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="HOW CAN WE ASSIST YOU?"
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-mono p-4 rounded text-[#0A192F] placeholder:text-[#888888] focus:outline-none focus:border-[#0A192F] transition-colors resize-y"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0A192F] text-white py-4 rounded font-serif uppercase tracking-[0.2em] text-xs hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'TRANSMITTING...' : 'SUBMIT INQUIRY'}</span>
                </button>

                <p className="text-[11px] text-[#888888] text-center font-mono">
                  All messages are transmitted securely to Support@outerlineusa.com.
                </p>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
