import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Please enter both username and password.' },
        { status: 400 }
      )
    }

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    // 1. Check Master Admin Credentials
    const defaultAdminUser = (process.env.ADMIN_USERNAME || 'Outer').toLowerCase()
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || '1outerline@gmail.com').toLowerCase()
    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'Ensink144'

    let isAuthenticated = false
    let sessionUser = cleanUser

    if (
      (cleanUser === defaultAdminUser || cleanUser === defaultAdminEmail) &&
      cleanPass === defaultAdminPass
    ) {
      isAuthenticated = true
      sessionUser = 'Outer'
    }

    // 2. Also attempt Supabase Auth if credentials match a Supabase account
    if (!isAuthenticated && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass
        })

        if (!error && data?.user) {
          isAuthenticated = true
          sessionUser = data.user.email || cleanUser
        }
      } catch (err) {
        console.error('Supabase auth check skipped:', err)
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Invalid username or password. Please verify your credentials.' },
        { status: 401 }
      )
    }

    // Set HTTP-Only Session Cookie
    const cookieStore = await cookies()
    cookieStore.set('outerline_admin_session', JSON.stringify({
      user: sessionUser,
      authenticatedAt: new Date().toISOString(),
      role: 'admin'
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({
      success: true,
      user: sessionUser
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed. Please try again.' },
      { status: 500 }
    )
  }
}
