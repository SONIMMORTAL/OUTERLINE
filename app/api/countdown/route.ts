import { NextResponse } from 'next/server'
import { getLocalCountdown, saveCountdown } from '@/lib/countdown-store'

export async function GET() {
  try {
    const config = getLocalCountdown()
    return NextResponse.json({ config })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const updated = saveCountdown(body)
    return NextResponse.json({ config: updated, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
