import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCountdown, saveCountdown } from '@/lib/countdown-store'
import { getAdminSession } from '@/lib/auth/admin'

export async function GET() {
  try {
    const config = await getCountdown()
    return NextResponse.json({ config }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Your admin session has expired. Please log in again.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updated = await saveCountdown(body)
    revalidatePath('/')
    revalidatePath('/admin')
    return NextResponse.json({ config: updated, success: true })
  } catch (err: any) {
    console.error('Countdown save failed:', err)
    return NextResponse.json({ error: err.message || 'Failed to save countdown settings' }, { status: 500 })
  }
}
