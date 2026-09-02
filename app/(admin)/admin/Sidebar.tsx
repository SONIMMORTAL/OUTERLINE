'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  Globe,
  Layers
} from 'lucide-react'

import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Merchandise', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics & Traffic', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Store Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar({ userEmail = 'admin@outerline.nyc' }: { userEmail?: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E5E5E5] flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-[#E5E5E5]">
        <Link href="/admin" className="block group">
          <h1 className="font-serif tracking-[0.25em] text-xl font-bold text-[#0A192F]">
            OUTERLINE
          </h1>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[#666666] text-[10px] uppercase tracking-widest font-medium">
              Admin Suite
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F3F3F3] text-[#0A192F] font-mono">
              NYC
            </span>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <Link
          href="/admin/products?action=new"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0A192F] text-[#FFFFFF] rounded-md text-xs font-serif tracking-wider uppercase hover:bg-[#000000] transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Merchandise</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold px-3 mb-2">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition-colors ${
                isActive
                  ? 'bg-[#0A192F] text-[#FFFFFF] font-medium shadow-sm'
                  : 'text-[#666666] hover:text-[#0A192F] hover:bg-[#F3F3F3]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFFFFF]' : 'text-[#666666]'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#E5E5E5] bg-[#FAFAFA] space-y-3">
        <div className="rounded p-3 bg-[#FFFFFF] border border-[#E5E5E5] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#0A192F]">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-green-600" />
              Live Feed
            </span>
            <span className="text-[10px] text-green-600 font-semibold">Active</span>
          </div>
          <p className="text-[10px] text-[#666666] leading-tight">
            Drop sync & vendor automations enabled.
          </p>
        </div>

        <AdminLogoutButton variant="full" />
      </div>
    </aside>
  )
}
