'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export default function DiscountModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [discountCode, setDiscountCode] = useState('')

  useEffect(() => {
    const isDismissed = localStorage.getItem('outerline-discount-dismissed')
    if (isDismissed) return

    // Show after 5 seconds
    const timer = setTimeout(() => setIsOpen(true), 5000)

    // Show on exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem('outerline-discount-dismissed', 'true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    
    try {
      const res = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      const code = data.code || 'OUTER15'
      setDiscountCode(code)
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => {})
      }
      setStatus('success')
      localStorage.setItem('outerline-discount-dismissed', 'true')
    } catch {
      setDiscountCode('OUTER15')
      setStatus('success')
      localStorage.setItem('outerline-discount-dismissed', 'true')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleDismiss}>
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
                className="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md"
              >
                <div className="bg-[#F9F9F9]/95 backdrop-blur-md border border-[#E5E5E5] p-8 rounded-2xl shadow-2xl overflow-hidden relative">
                  
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A192F]/10 rounded-bl-full blur-2xl pointer-events-none" />

                  <Dialog.Close className="absolute top-4 right-4 text-[#666666] hover:text-[#0A192F] transition-colors p-2 rounded-full hover:bg-[#F3F3F3]">
                    <X className="w-5 h-5" />
                  </Dialog.Close>

                  <div className="text-center space-y-6 relative z-10">
                    <div className="space-y-2">
                      <h2 className="font-serif text-3xl text-[#0A192F]">GET 15% OFF</h2>
                      <p className="text-[10px] uppercase tracking-widest text-[#0A192F] font-medium">YOUR FIRST ORDER</p>
                    </div>

                    {status === 'success' ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4 bg-[#F3F3F3] p-6 rounded-lg border border-[#E5E5E5]"
                      >
                        <p className="text-[#000000] text-sm">Use code at checkout:</p>
                        <div className="font-mono text-2xl tracking-widest text-[#0A192F] bg-[#FFFFFF] py-3 px-4 rounded border border-[#E5E5E5] select-all">
                          {discountCode}
                        </div>
                        <p className="text-[#666666] text-xs">Code has been copied to your clipboard!</p>
                      </motion.div>
                    ) : (
                      <>
                        <p className="text-[#666666] text-sm">
                          Join the Outerline collective. Get exclusive access to drops, editorial lookbooks, and 15% off your first purchase.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                          <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#FFFFFF] border border-[#E5E5E5] text-[#0A192F] px-4 py-3 rounded-lg focus:outline-none focus:border-[#0A192F] transition-colors placeholder:text-[#E5E5E5]"
                          />
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
  )
}
