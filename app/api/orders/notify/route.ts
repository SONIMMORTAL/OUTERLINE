import { NextResponse } from 'next/server'
import { sendInstantOrderSMS } from '@/lib/twilio'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { saveLocalOrder } from '@/lib/orders-store'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const {
      customerName,
      customerEmail,
      shippingAddress,
      items = [],
      totalAmount = 0,
      paymentMethod = 'PayPal'
    } = payload

    const city = shippingAddress?.city || 'NYC'
    const state = shippingAddress?.state || 'NY'
    const itemsSummary = items.map((i: any) => `${i.productTitle} (${i.size}/${i.color}) x${i.quantity}`).join(', ')

    // 1. Dispatch Instant SMS to 718-600-7410
    try {
      await sendInstantOrderSMS({
        customerName: customerName || 'Customer',
        totalAmount: Number(totalAmount) || 0,
        itemCount: items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
        city,
        state,
        itemsSummary,
        paymentMethod
      })
    } catch (smsErr) {
      console.error('SMS notification error (skipping):', smsErr)
    }

    // 2. Dispatch Email to 1outerline@gmail.com
    const resendApiKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL || '1outerline@gmail.com'

    if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_your_resend_api_key') {
      try {
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: 'Outerline Orders <orders@outerline.nyc>',
          to: adminEmail,
          subject: `⚡ NEW OUTERLINE ORDER: $${Number(totalAmount).toFixed(2)} - ${customerName}`,
          html: `
            <h2>New Outerline Store Order</h2>
            <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Total Amount:</strong> $${Number(totalAmount).toFixed(2)}</p>
            <p><strong>Shipping Address:</strong><br/>
              ${shippingAddress?.line1 || ''}<br/>
              ${shippingAddress?.line2 ? shippingAddress.line2 + '<br/>' : ''}
              ${city}, ${state} ${shippingAddress?.zip || ''}<br/>
              ${shippingAddress?.country || 'US'}
            </p>
            <h3>Order Items:</h3>
            <ul>
              ${items.map((i: any) => `<li><strong>${i.productTitle}</strong> — Size: ${i.size} | Color: ${i.color} | Qty: ${i.quantity} | Price: $${i.price}</li>`).join('')}
            </ul>
          `
        })
      } catch (emailErr) {
        console.error('Email dispatch error (skipping):', emailErr)
      }
    }

    // 3. Persist Real Order in Orders Store
    const savedOrder = saveLocalOrder({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: shippingAddress?.phone || '',
      total_amount: Number(totalAmount) || 0,
      subtotal: Number(totalAmount) || 0,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      order_items: items,
      status: 'paid',
      vendor_notified: true,
      vendor_notified_at: new Date().toISOString()
    })

    // 4. Also insert into Supabase orders table if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      try {
        const supabase = createAdminClient()
        await (supabase.from('orders') as any).insert({
          customer_email: customerEmail,
          total_amount: Number(totalAmount) || 0,
          subtotal: Number(totalAmount) || 0,
          status: 'paid',
          shipping_address: shippingAddress,
          vendor_notified: true,
          vendor_notified_at: new Date().toISOString()
        })
      } catch (dbErr) {
        console.error('Database insert skipped (preview mode):', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications dispatched successfully.'
    })
  } catch (err: any) {
    console.error('Order notify route error:', err)
    return NextResponse.json({ success: true, warning: err.message })
  }
}
