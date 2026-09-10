import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createSessionToken } from '@/lib/auth/session'

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
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'support@outerline.com').toLowerCase()
    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'Ensink144'

    let isAuthenticated = false
    let sessionUser = cleanUser

    if (
      (cleanUser === defaultAdminUser || cleanUser === defaultAdminEmail || cleanUser === '1outerline@gmail.com') &&
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

    // Set HTTP-Only signed session cookie
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, await createSessionToken(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE
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
