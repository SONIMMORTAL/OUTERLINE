import { NextResponse } from 'next/server'
import { validateDiscount } from '@/lib/discounts-store'

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}))
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, error: 'Promo code is required.' }, { status: 400 })
  }

  try {
    const result = await validateDiscount(code)
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error || 'Invalid promo code.' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      code: result.discount?.code,
      percentage: result.discount?.percentage,
    })
  } catch (err) {
    console.error('Promo code validation failed:', err)
    return NextResponse.json({ valid: false, error: 'Could not check that promo code. Please try again.' }, { status: 500 })
  }
}
