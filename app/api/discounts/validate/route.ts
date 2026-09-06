import { NextResponse } from 'next/server'
import { validateDiscount } from '@/lib/discounts-store'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Promo code is required.' }, { status: 400 })
    }

    const result = validateDiscount(code)
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error || 'Invalid promo code.' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      code: result.discount?.code,
      percentage: result.discount?.percentage,
      discountId: result.discount?.id
    })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: 'Failed to validate promo code.' }, { status: 500 })
  }
}
