import { NextResponse } from 'next/server'
import {
  createDiscount,
  deleteDiscount,
  DiscountInputError,
  listDiscounts,
  toggleDiscountActive,
  updateDiscount
} from '@/lib/discounts-store'
import { getAdminSession } from '@/lib/auth/admin'

function unauthorized() {
  return NextResponse.json({ error: 'Your admin session has expired. Please log in again.' }, { status: 401 })
}

function errorResponse(err: unknown) {
  if (err instanceof DiscountInputError) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
  console.error('Discount API error:', err)
  return NextResponse.json({ error: err instanceof Error ? err.message : 'Something went wrong.' }, { status: 500 })
}

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  try {
    return NextResponse.json({ discounts: await listDiscounts() })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const discount = await createDiscount(await req.json())
    return NextResponse.json({ discount, success: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Discount ID is required.' }, { status: 400 })
    }
    const { id, action, ...fields } = body
    const discount = action === 'toggle' ? await toggleDiscountActive(id) : await updateDiscount(id, fields)
    return NextResponse.json({ discount, success: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(req: Request) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required.' }, { status: 400 })
    }
    await deleteDiscount(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return errorResponse(err)
  }
}
