'use client'

import { motion } from 'framer-motion'
import React from 'react'

type AnimationType = 'fade-up' | 'scale-up' | 'fade-in'

export function AnimatedSection({
  children,
  className,
  delay = 0,
  type = 'fade-up'
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  type?: AnimationType
}) {
  const getVariants = () => {
    switch (type) {
      case 'scale-up':
        return {
          initial: { opacity: 0, scale: 0.9, y: 20 },
          whileInView: { opacity: 1, scale: 1, y: 0 }
        }
      case 'fade-in':
        return {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 }
        }
      case 'fade-up':
      default:
        return {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 }
        }
    }
  }

  const { initial, whileInView } = getVariants()

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1.2, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
