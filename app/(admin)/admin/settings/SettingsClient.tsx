'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Store, 
  Phone, 
  Mail, 
  Truck, 
  CreditCard, 
  Save, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

export function SettingsClient() {
  const [storeName, setStoreName] = useState('Outerline NYC')
  const [tagline, setTagline] = useState('Defined & Unconfined')
  const [vendorPhone, setVendorPhone] = useState('+1 (917) 555-0188')
  const [vendorEmail, setVendorEmail] = useState('fulfillment@outerline.nyc')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('150.00')
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('owner@outerline.nyc')
  const [isDropMode, setIsDropMode] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    toast.success('Store & Vendor automation settings saved!')
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wider text-[#0A192F]">
          STORE SETTINGS & CONFIGURATION
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Manage brand credentials, automated vendor phone notifications for order fulfillment, and drop policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#0A192F]" />
              <CardTitle className="font-serif text-xl">Brand Identity & Presence</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#666666]">
              Store naming, brand slogan, and public storefront details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0A192F]">Store Name</label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="border-[#E5E5E5] bg-[#FAFAFA] text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0A192F]">Brand Slogan</label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-serif italic"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor & SMS Notifications */}
        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#0A192F]" />
              <CardTitle className="font-serif text-xl">Automated Vendor Dispatch</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#666666]">
              Whenever a customer places an order, Twilio automatically sends a Purchase Order SMS directly to your manufacturing vendor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0A192F]">Primary Vendor Phone (Twilio SMS)</label>
                <Input
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-mono"
                />
                <span className="text-[10px] text-[#666666]">Receives instant item SKU, size, and shipping PO.</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0A192F]">Vendor Packing Email</label>
                <Input
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  className="border-[#E5E5E5] bg-[#FAFAFA] text-xs"
                />
                <span className="text-[10px] text-[#666666]">Receives React Email printable packing slip.</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0A192F]">Admin Alert Notification Email</label>
                <Input
                  value={adminNotificationEmail}
                  onChange={(e) => setAdminNotificationEmail(e.target.value)}
                  className="border-[#E5E5E5] bg-[#FAFAFA] text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commercial & Shipping Rules */}
        <Card className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0A192F]" />
              <CardTitle className="font-serif text-xl">Commercial & Shipping Thresholds</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#666666]">
              Adjust cart progress bars and drop exclusivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0A192F]">Free Shipping Threshold ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="border-[#E5E5E5] bg-[#FAFAFA] text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-[#FAFAFA] border border-[#E5E5E5] self-end">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#0A192F] block">Exclusive Drop Mode</span>
                  <span className="text-[10px] text-[#666666]">Highlight new collection urgency badges</span>
                </div>
                <input
                  type="checkbox"
                  checked={isDropMode}
                  onChange={(e) => setIsDropMode(e.target.checked)}
                  className="rounded border-[#E5E5E5] text-[#0A192F] w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-[#0A192F] text-white hover:bg-black font-serif tracking-widest uppercase text-xs px-6 py-2.5 gap-2"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
