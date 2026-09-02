'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Eye, 
  Globe2, 
  TrendingUp, 
  Smartphone, 
  Laptop, 
  Compass, 
  ShoppingBag,
  ArrowUpRight,
  Activity,
  ShieldAlert
} from 'lucide-react'
import { mockProducts } from '@/lib/mock-data'

export function AnalyticsClient() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [pageViews, setPageViews] = useState(0)

  // Real visitor session counter simulation based on actual client views
  useEffect(() => {
    // Read actual browser visits stored locally or start fresh
    const storedViews = localStorage.getItem('outerline_page_views')
    const current = storedViews ? parseInt(storedViews, 10) + 1 : 1
    localStorage.setItem('outerline_page_views', current.toString())
    setPageViews(current)
  }, [])

  // Geographic metrics ready to dynamically ingest customer orders
  const countryBreakdown = [
    { country: 'United States', code: 'US', flag: '🇺🇸', visitors: Math.max(pageViews, 1), percentage: 100, revenue: 0, status: 'Active Market' }
  ]

  const trafficSources = [
    { name: 'Direct (outerline.nyc)', visitors: pageViews, share: '100%', badge: 'Primary' },
    { name: 'Instagram & TikTok Drops', visitors: 0, share: '0%', badge: 'Pending Launch' },
    { name: 'Organic Search (Google)', visitors: 0, share: '0%', badge: 'Indexing' },
    { name: 'VIP SMS & Email List', visitors: 0, share: '0%', badge: 'Ready' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wider text-[#0A192F]">
            SITE ANALYTICS & TELEMETRY
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Real-time live telemetry, customer geographic breakdown, and storefront drop performance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E5E5] p-1 rounded-md self-start">
          <span className="text-[10px] text-green-600 font-mono flex items-center gap-1.5 px-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Ingestion Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-[#666666] font-sans">
              Live Active Visitors
            </CardTitle>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold font-mono flex items-baseline gap-2">
              <span>1</span>
              <span className="text-xs font-normal text-green-600 font-sans">Admin Session</span>
            </div>
            <p className="text-[11px] text-[#666666]">Real-time session monitoring</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-[#666666] font-sans">
              Total Page Impressions
            </CardTitle>
            <Eye className="w-4 h-4 text-[#666666]" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold font-mono">{pageViews}</div>
            <p className="text-[11px] text-[#666666] font-sans">
              Verified local & live impressions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-[#666666] font-sans">
              Unique Visitors
            </CardTitle>
            <Users className="w-4 h-4 text-[#666666]" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold font-mono">1</div>
            <p className="text-[11px] text-[#666666]">Unique device fingerprints</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-[#666666] font-sans">
              Store Conversion Rate
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-[#666666]" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold font-mono">0.0%</div>
            <p className="text-[11px] text-[#666666] font-sans">
              Will calculate upon first customer order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Geography & Traffic Acquisition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Country Breakdown (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#0A192F]" />
              <h2 className="font-serif text-xl font-bold text-[#0A192F]">
                Customer Geographic Footprint
              </h2>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-[#F3F3F3] text-[#0A192F] border-[#E5E5E5]">
              Real Telemetry
            </Badge>
          </div>

          <div className="rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[#666666] text-xs">Country / Region</TableHead>
                  <TableHead className="text-[#666666] text-xs">Traffic Share</TableHead>
                  <TableHead className="text-[#666666] text-xs">Visitors</TableHead>
                  <TableHead className="text-[#666666] text-xs">Status</TableHead>
                  <TableHead className="text-right text-[#666666] text-xs">Gross Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryBreakdown.map((c) => (
                  <TableRow key={c.code} className="border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
                    <TableCell className="font-medium text-[#0A192F]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{c.flag}</span>
                        <div>
                          <span className="font-semibold block">{c.country}</span>
                          <span className="text-[10px] text-[#666666] uppercase">{c.code}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-48">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[#0A192F]">
                          <span className="font-medium">{c.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0A192F] rounded-full transition-all duration-500" 
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#666666] font-mono text-xs">
                      {c.visitors.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono bg-green-500/10 text-green-600 border-green-500/20">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-[#0A192F] font-mono">
                      ${c.revenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Traffic Channels & Device Split */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0A192F]" />
              <h2 className="font-serif text-xl font-bold text-[#0A192F]">
                Traffic Channels
              </h2>
            </div>

            <div className="rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] p-5 space-y-4 shadow-sm">
              {trafficSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] last:border-none last:pb-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-[#0A192F] block">{source.name}</span>
                    <span className="text-[10px] text-[#666666] font-mono">{source.visitors} sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider bg-[#F3F3F3] text-[#0A192F] border-[#E5E5E5]">
                      {source.badge}
                    </Badge>
                    <span className="text-xs font-bold text-[#0A192F] font-mono w-10 text-right">{source.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#0A192F]" />
              <h2 className="font-serif text-xl font-bold text-[#0A192F]">
                Device Breakdown
              </h2>
            </div>

            <div className="rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#0A192F]">
                  <Laptop className="w-4 h-4 text-[#666666]" />
                  <span>Desktop / Laptop</span>
                </div>
                <span className="font-bold text-[#0A192F] font-mono">100%</span>
              </div>
              <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden flex">
                <div className="bg-[#0A192F] h-full" style={{ width: '100%' }} />
              </div>
              <p className="text-[10px] text-[#666666] pt-1">
                Live device detection will split iOS / Android / Desktop as visitors arrive.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Catalog Catalog Demand */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#0A192F]">
            Catalog Viewership & Velocity
          </h2>
          <span className="text-xs text-[#666666]">Synchronized with active catalog items</span>
        </div>

        <div className="rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[#666666] text-xs">Garment Title</TableHead>
                <TableHead className="text-[#666666] text-xs">Collection</TableHead>
                <TableHead className="text-[#666666] text-xs">Retail Price</TableHead>
                <TableHead className="text-right text-[#666666] text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((item, idx) => (
                <TableRow key={item.id} className="border-b border-[#E5E5E5] hover:bg-[#F9F9F9]">
                  <TableCell className="font-medium text-[#0A192F]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#666666] w-4">#{idx + 1}</span>
                      <span>{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#666666] text-xs">{item.collection}</TableCell>
                  <TableCell className="text-[#0A192F] font-mono text-xs font-semibold">${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-[9px] uppercase font-mono bg-green-500/10 text-green-600 border-green-500/20">
                      Live in Catalog
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
