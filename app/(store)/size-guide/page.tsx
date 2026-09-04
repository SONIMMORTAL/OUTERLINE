'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Ruler, ChevronRight, Info, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in')

  const formatVal = (valInInches: string) => {
    if (unit === 'in') return `${valInInches}"`
    
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 pb-16 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-[#666666] font-medium tracking-wide">
        <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-[#0A192F]">Size & Measurement Guide</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-8">
        <div className="space-y-2">
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest bg-[#F9F9F9] text-[#0A192F] border-[#E5E5E5]">
            US Standard Specifications
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#0A192F] tracking-tight">
            GARMENT SIZE CHART
          </h1>
          <p className="text-sm text-[#666666] max-w-2xl leading-relaxed">
            All Outerline garments are engineered to precise luxury streetwear specifications. Use our measurement tables below to find your ideal fit.
          </p>
        </div>

        {/* Global Unit Switcher */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="text-xs text-[#666666] font-medium">Measurement Unit:</span>
          <div className="flex items-center p-1 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                unit === 'in'
                  ? 'bg-[#0A192F] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A192F]'
              }`}
            >
              Inches (IN)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                unit === 'cm'
                  ? 'bg-[#0A192F] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A192F]'
              }`}
            >
              Centimeters (CM)
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Hoodies & Fleece */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0A192F]">
              1. Heavyweight Hoodies & Fleece (10 oz / 32 Singles)
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Features a generous, relaxed streetwear drape, fleece-lined hood, and split stitch double-needle sewing.
            </p>
          </div>
          <Badge className="bg-[#0A192F] text-white text-[10px] font-mono">XS - 5XL Available</Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A192F] text-[#FFFFFF]">
                <th className="py-3 px-4 font-semibold tracking-wider font-mono text-[11px] uppercase border-r border-[#1E2D42]">
                  Measurement Spec
                </th>
                {hoodieSpecs.sizes.map((s) => (
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
              {hoodieSpecs.rows.map((row, idx) => (
                <tr key={row.name} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAFAFA]'}>
                  <td className="py-3.5 px-4 font-semibold text-[#0A192F] whitespace-nowrap border-r border-[#E5E5E5]">
                    {row.name}
                  </td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-3.5 px-3.5 text-center font-mono text-[#0A192F] font-bold border-r border-[#E5E5E5] last:border-none">
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
      </div>

      {/* Section 2: Tees & Shirts */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0A192F]">
              2. Combed Ring-Spun Cotton Tees (4.3 oz / 32 Singles)
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Features a regular fit, self 3/8” shoulder binding, 3/4” 1x1 rib neckband, and side-seam construction.
            </p>
          </div>
          <Badge className="bg-[#0A192F] text-white text-[10px] font-mono">XS - 3XL Available</Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A192F] text-[#FFFFFF]">
                <th className="py-3 px-4 font-semibold tracking-wider font-mono text-[11px] uppercase border-r border-[#1E2D42]">
                  Measurement Spec
                </th>
                {teeSpecs.sizes.map((s) => (
                  <th key={s} className="py-3 px-4 text-center font-bold font-mono tracking-wider text-xs border-r border-[#1E2D42] last:border-none">
                    {s}
                  </th>
                ))}
                <th className="py-3 px-3 text-center font-semibold font-mono text-[10px] uppercase text-[#A1A1AA]">
                  Tolerance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {teeSpecs.rows.map((row, idx) => (
                <tr key={row.name} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAFAFA]'}>
                  <td className="py-3.5 px-4 font-semibold text-[#0A192F] whitespace-nowrap border-r border-[#E5E5E5]">
                    {row.name}
                  </td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-3.5 px-4 text-center font-mono text-[#0A192F] font-bold border-r border-[#E5E5E5] last:border-none">
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
      </div>

      {/* How to Measure Cards */}
      <div className="pt-8 border-t border-[#E5E5E5] space-y-6">
        <h3 className="font-serif text-2xl font-bold text-[#0A192F]">
          HOW TO MEASURE YOUR GARMENT
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#F9F9F9] border border-[#E5E5E5] space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-mono font-bold text-xs">
              1
            </div>
            <h4 className="font-semibold text-sm text-[#0A192F]">Body Length</h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              Place the garment face down on a flat surface. Measure from the highest point of the shoulder seam straight down to the bottom edge of the waistband hem.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F9F9F9] border border-[#E5E5E5] space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-mono font-bold text-xs">
              2
            </div>
            <h4 className="font-semibold text-sm text-[#0A192F]">Chest Width (Laid Flat)</h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              Lay garment completely flat. Measure 1 inch below the armpit point across the front chest horizontally from edge to edge.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F9F9F9] border border-[#E5E5E5] space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-mono font-bold text-xs">
              3
            </div>
            <h4 className="font-semibold text-sm text-[#0A192F]">Sleeve Length</h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              For hoodies: Measure from center back of neck, along the shoulder and down to the end of the wrist cuff. For tees: Measure from the top shoulder seam to cuff hem.
            </p>
          </div>
        </div>
      </div>

      {/* Assurance Box */}
      <div className="flex items-start gap-4 p-6 rounded-xl bg-[#0A192F]/5 border border-[#0A192F]/15">
        <ShieldCheck className="w-6 h-6 text-[#0A192F] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-[#0A192F] leading-relaxed">
          <span className="font-bold text-sm block">Outerline Fit Guarantee</span>
          <p>
            We take pride in precision manufacturing. If you have any sizing questions or need assistance selecting the right fit before ordering, please reach out to our concierge team at <span className="font-mono font-semibold">concierge@outerline.nyc</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
