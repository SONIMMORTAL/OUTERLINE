import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('outerline_admin_session')

    // Also sign out from Supabase Auth if applicable
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = await createClient()
        await supabase.auth.signOut()
      } catch (err) {
        // ignore
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to log out.' }, { status: 500 })
  }
}
