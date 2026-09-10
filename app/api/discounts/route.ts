import { NextResponse } from 'next/server'
import {
  getLocalDiscounts,
  saveDiscount,
  deleteDiscount,
  toggleDiscountActive
} from '@/lib/discounts-store'
import { getAdminSession } from '@/lib/auth/admin'

function unauthorized() {
  return NextResponse.json({ error: 'Your admin session has expired. Please log in again.' }, { status: 401 })
}

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const discounts = getLocalDiscounts()
    return NextResponse.json({ discounts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json()
    if (!body.code) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 })
    }

    const created = saveDiscount({
      code: body.code,
      percentage: Number(body.percentage) || 15,
      max_uses: body.max_uses ? Number(body.max_uses) : 0,
      expires_at: body.expires_at || null,
      is_active: body.is_active !== undefined ? !!body.is_active : true,
    })

    return NextResponse.json({ discount: created, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Discount ID is required.' }, { status: 400 })
    }

    if (body.action === 'toggle') {
      const updated = toggleDiscountActive(body.id)
      return NextResponse.json({ discount: updated, success: true })
    }

    const updated = saveDiscount(body)
    return NextResponse.json({ discount: updated, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required.' }, { status: 400 })
    }

    const success = deleteDiscount(id)
    return NextResponse.json({ success })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
