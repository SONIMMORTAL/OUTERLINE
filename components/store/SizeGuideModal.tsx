'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Ruler, Sparkles, Check, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SizeGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCategory?: 'hoodies' | 'tees'
}

export function SizeGuideModal({ open, onOpenChange, initialCategory = 'hoodies' }: SizeGuideModalProps) {
  const [category, setCategory] = useState<'hoodies' | 'tees'>(
    initialCategory === 'tees' ? 'tees' : 'hoodies'
  )
  const [unit, setUnit] = useState<'in' | 'cm'>('in')

  // Convert fraction / decimal inches string to cm if unit === 'cm'
  const formatVal = (valInInches: string) => {
    if (unit === 'in') return `${valInInches}"`
    
    // Parse fraction like "27 1/2" or "30" or "+/- 1"
    if (valInInches.startsWith('+/-')) {
      const numStr = valInInches.replace('+/-', '').trim()
      const n = numStr.includes('1/2') ? 1.5 : parseFloat(numStr) || 1
      return `+/- ${(n * 2.54).toFixed(1)} cm`
    }
    
    let total = 0
    if (valInInches.includes('1/2')) {
      const whole = parseInt(valInInches.split(' ')[0], 10) || 0
      total = whole + 0.5
    } else {
      total = parseFloat(valInInches) || 0
    }
    return `${(total * 2.54).toFixed(1)} cm`
  }

  const hoodieSpecs = {
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    rows: [
      {
        name: 'Body Length',
        values: ['27 1/2', '28 1/2', '29 1/2', '30 1/2', '31 1/2', '32 1/2', '33 1/2', '34', '34 1/2'],
        tolerance: '+/- 1'
      },
      {
        name: 'Chest Width (Laid Flat)',
        values: ['20 1/2', '21', '23', '24 1/2', '26 1/2', '27 1/2', '28 1/2', '30', '31 1/2'],
        tolerance: '+/- 1'
      },
      {
        name: 'Sleeve Length (From Center Back)',
        values: ['34 1/2', '35 1/2', '36 1/2', '37 1/2', '38 1/2', '39 1/2', '40 1/2', '41', '41 1/2'],
        tolerance: '+/- 1'
      }
    ]
  }

  const teeSpecs = {
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    rows: [
      {
        name: 'Body Length',
        values: ['27', '28', '29', '30', '31', '32', '33'],
        tolerance: '+/- 1/2'
      },
      {
        name: 'Chest Width (Laid Flat)',
        values: ['17 1/2', '19', '20 1/2', '22', '24', '26', '28'],
        tolerance: '+/- 1/2'
      },
      {
        name: 'Sleeve Length',
        values: ['7 1/2', '8', '8 1/2', '9', '9 1/2', '10', '10 1/2'],
        tolerance: '+/- 1/2'
      }
    ]
  }

  const activeSpecs = category === 'hoodies' ? hoodieSpecs : teeSpecs

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6 md:p-8 bg-[#FFFFFF] text-[#0A192F] border border-[#E5E5E5] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#0A192F]" />
              <DialogTitle className="font-serif text-2xl tracking-wider text-[#0A192F]">
                GARMENT SIZE & MEASUREMENT GUIDE
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest bg-[#F9F9F9] text-[#0A192F] border-[#E5E5E5]">
              US Standard Sizing
            </Badge>
          </div>
          <DialogDescription className="text-xs text-[#666666]">
            All measurements are taken with the garment laid completely flat. Follow our guideline below to find your tailored fit.
          </DialogDescription>
        </DialogHeader>

        {/* Controls: Category Selector & Unit Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          {/* Category Tabs */}
          <div className="flex items-center p-1 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
            <button
              onClick={() => setCategory('hoodies')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                category === 'hoodies'
                  ? 'bg-[#0A192F] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A192F]'
              }`}
            >
              Hoodies & Fleece (10 oz)
            </button>
            <button
              onClick={() => setCategory('tees')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                category === 'tees'
                  ? 'bg-[#0A192F] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A192F]'
              }`}
            >
              Tees & Shirts (4.3 oz)
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-[#666666] font-medium">Unit:</span>
            <div className="flex items-center p-1 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  unit === 'in'
                    ? 'bg-[#0A192F] text-[#FFFFFF]'
                    : 'text-[#666666] hover:text-[#0A192F]'
                }`}
              >
                Inches (IN)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  unit === 'cm'
                    ? 'bg-[#0A192F] text-[#FFFFFF]'
                    : 'text-[#666666] hover:text-[#0A192F]'
                }`}
              >
                Centimeters (CM)
              </button>
            </div>
          </div>
        </div>

        {/* The Size Chart Table */}
        <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A192F] text-[#FFFFFF]">
                <th className="py-3 px-4 font-semibold tracking-wider font-mono text-[11px] uppercase border-r border-[#1E2D42]">
                  Measurement Spec
                </th>
                {activeSpecs.sizes.map((s) => (
                  <th key={s} className="py-3 px-3.5 text-center font-bold font-mono tracking-wider text-xs border-r border-[#1E2D42] last:border-none">
                    {s}
                  </th>
                ))}
                <th className="py-3 px-3 text-center font-semibold font-mono text-[10px] uppercase text-[#A1A1AA]">
                  Tolerance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {activeSpecs.rows.map((row, idx) => (
                <tr key={row.name} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAFAFA]'}>
                  <td className="py-3.5 px-4 font-medium text-[#0A192F] whitespace-nowrap border-r border-[#E5E5E5]">
                    {row.name}
                  </td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-3.5 px-3.5 text-center font-mono text-[#0A192F] font-semibold border-r border-[#E5E5E5] last:border-none">
                      {formatVal(v)}
                    </td>
                  ))}
                  <td className="py-3.5 px-3 text-center font-mono text-[11px] text-[#666666]">
                    {formatVal(row.tolerance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Editorial Measuring Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-lg bg-[#F9F9F9] border border-[#E5E5E5] space-y-1">
            <span className="font-semibold text-xs text-[#0A192F] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#0A192F] text-white text-[10px] flex items-center justify-center font-mono">1</span>
              Body Length
            </span>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Measured from the highest point of the shoulder seam straight down to the bottom hemline.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F9F9F9] border border-[#E5E5E5] space-y-1">
            <span className="font-semibold text-xs text-[#0A192F] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#0A192F] text-white text-[10px] flex items-center justify-center font-mono">2</span>
              Chest Width (Laid Flat)
            </span>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Measured 1" below the armhole across the front chest from side seam to side seam.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F9F9F9] border border-[#E5E5E5] space-y-1">
            <span className="font-semibold text-xs text-[#0A192F] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#0A192F] text-white text-[10px] flex items-center justify-center font-mono">3</span>
              Sleeve Length
            </span>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              {category === 'hoodies'
                ? 'Measured from center back neck across shoulder and down to wrist cuff edge.'
                : 'Measured from shoulder seam point down to the sleeve cuff opening.'
              }
            </p>
          </div>
        </div>

        {/* Fit Profile Note */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A192F]/5 border border-[#0A192F]/10">
          <Info className="w-4 h-4 text-[#0A192F] shrink-0 mt-0.5" />
          <div className="text-xs text-[#0A192F] leading-relaxed">
            <span className="font-bold block mb-0.5">Fit Recommendation:</span>
            {category === 'hoodies'
              ? 'Our 10 oz fleece hoodies feature a generous, relaxed streetwear cut with fleece-lined hoods. If you prefer a tailored fit, we recommend sizing down one size.'
              : 'Our 4.3 oz 32-singles ring-spun cotton tees are engineered with a regular fit and side-seam construction. Fits true to size.'
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
