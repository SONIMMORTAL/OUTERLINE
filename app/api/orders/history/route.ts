import { NextResponse } from 'next/server'
import { getLocalOrders } from '@/lib/orders-store'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim().toLowerCase()
    const orderNumber = searchParams.get('orderNumber')?.trim()

    if (!email && !orderNumber) {
      return NextResponse.json({ error: 'Email or order number is required' }, { status: 400 })
    }

    const localOrders = getLocalOrders()
    let matched = localOrders.filter((order) => {
      const matchEmail = email ? order.customer_email.toLowerCase() === email : true
      const matchNumber = orderNumber ? String(order.order_number) === orderNumber || order.id === orderNumber : true
      return matchEmail && matchNumber
    })

    // Also attempt Supabase fallback if available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      try {
        const supabase = createAdminClient()
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
        
        if (email) {
          query = query.ilike('customer_email', email)
        }
        if (orderNumber) {
          query = query.eq('id', orderNumber)
        }

        const { data: dbOrders, error } = await query
        if (!error && dbOrders && (dbOrders as any[]).length > 0) {
          // Merge unique by id or order_number
          const existingIds = new Set(matched.map(o => o.id))
          for (const dbo of (dbOrders as any[])) {
            if (!existingIds.has(dbo.id)) {
              matched.push({
                id: dbo.id,
                order_number: dbo.order_number || parseInt(String(dbo.id).replace(/\D/g, '').slice(-4)) || 1001,
                customer_name: dbo.customer_name || 'Customer',
                customer_email: dbo.customer_email,
                customer_phone: dbo.shipping_address?.phone || '',
                total_amount: Number(dbo.total_amount) || 0,
                subtotal: Number(dbo.subtotal) || Number(dbo.total_amount) || 0,
                discount_applied: Number(dbo.discount_applied) || 0,
                status: dbo.status || 'paid',
                payment_method: dbo.payment_method || 'Card',
                shipping_address: dbo.shipping_address || {},
                order_items: dbo.order_items || [],
                vendor_notified: !!dbo.vendor_notified,
                vendor_notified_at: dbo.vendor_notified_at,
                tracking_number: dbo.tracking_number || '',
                carrier: dbo.carrier || 'USPS',
                created_at: dbo.created_at || new Date().toISOString()
              })
            }
          }
        }
      } catch (dbErr) {
        console.warn('Supabase query non-fatal fallback:', dbErr)
      }
    }

    // Sort newest first
    matched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      orders: matched,
      count: matched.length
    })
  } catch (err: any) {
    console.error('Order history query error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch order history' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body.email?.trim().toLowerCase()
    const orderNumber = body.orderNumber?.trim()

    if (!email && !orderNumber) {
      return NextResponse.json({ error: 'Email or order number is required' }, { status: 400 })
    }

    const localOrders = getLocalOrders()
    const matched = localOrders.filter((order) => {
      const matchEmail = email ? order.customer_email.toLowerCase() === email : true
      const matchNumber = orderNumber ? String(order.order_number) === orderNumber || order.id === orderNumber : true
      return matchEmail && matchNumber
    })

    matched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      orders: matched,
      count: matched.length
    })
  } catch (err: any) {
    console.error('Order history query error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch order history' }, { status: 500 })
  }
}
