import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)

  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  const adminCookie = request.cookies.get('outerline_admin_session')

  if (isAdminRoute && !isApiRoute) {
    let hasAdminSession = !!adminCookie

    // Also check Supabase Auth session if configured
    if (!hasAdminSession && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() { return request.cookies.getAll() },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              },
            },
          }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          hasAdminSession = true
        }
      } catch {
        // ignore
      }
    }

    // If trying to access admin without session -> redirect to /admin/login
    if (!hasAdminSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // If already logged in and visiting /admin/login -> redirect to /admin
    if (hasAdminSession && isLoginPage) {
      const adminUrl = new URL('/admin', request.url)
      return NextResponse.redirect(adminUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
