import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './Sidebar'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get('outerline_admin_session')
  
  let userEmail = 'admin@outerline.nyc'
  let isAuthenticated = false

  if (adminSessionCookie) {
    try {
      const raw = adminSessionCookie.value.startsWith('%') ? decodeURIComponent(adminSessionCookie.value) : adminSessionCookie.value
      const parsed = JSON.parse(raw)
      if (parsed?.user) {
        userEmail = parsed.user
        isAuthenticated = true
      }
    } catch {
      isAuthenticated = true
    }
  }

  // Also check Supabase Auth session if present
  if (!isAuthenticated && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        userEmail = user.email
        isAuthenticated = true
      }
    } catch {
      // ignore
    }
  }

  // If not authenticated, render login page directly without the sidebar shell
  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-[#FFFFFF] text-[#0A192F] overflow-hidden">
      <Sidebar userEmail={userEmail} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Admin Header */}
        <header className="h-16 border-b border-[#E5E5E5] bg-[#FFFFFF] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-green-500/10 text-green-600 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Store Portal
            </span>
            <span className="hidden sm:inline text-xs text-[#666666]">
              Outerline NYC Store Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A192F] hover:text-[#000000] px-3 py-1.5 rounded border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            </Link>

            <div className="h-4 w-px bg-[#E5E5E5]" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-full bg-[#0A192F] text-[#FFFFFF] flex items-center justify-center font-serif text-xs font-bold">
                  O
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-semibold text-[#0A192F] leading-tight">Master Admin</span>
                  <span className="text-[10px] text-[#666666] leading-tight font-mono">{userEmail}</span>
                </div>
              </div>

              <AdminLogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#FAFAFA]">
          {children}
        </main>
      </div>
    </div>
  )
}
