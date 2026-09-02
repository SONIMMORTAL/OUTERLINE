import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { sendAdminAlert, sendVendorPO } from '@/lib/twilio';
import { subscribeToList } from '@/lib/mailchimp';
import { Resend } from 'resend';
import CustomerReceipt from '@/components/emails/CustomerReceipt';
import VendorPurchaseOrder from '@/components/emails/VendorPurchaseOrder';
import React from 'react';

export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { discountCode, customerEmail } = session.metadata || {};

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    // Create Order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: customerEmail || session.customer_details?.email,
        total_amount: (session.amount_total || 0) / 100,
        subtotal: (session.amount_subtotal || 0) / 100,
        discount_applied: (session.total_details?.amount_discount || 0) / 100,
        discount_code: discountCode || null,
        status: 'paid',
        shipping_address: session.shipping_details?.address || {},
        vendor_notified: true,
        vendor_notified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    const items = fullSession.line_items?.data || [];
    const orderItems = [];
    const skus: string[] = [];

    for (const item of items) {
      const product = item.price?.product as any;
      const variantId = product?.metadata?.variantId;
      
      if (variantId) {
        orderItems.push({
          order_id: order.id,
          variant_id: variantId,
          quantity: item.quantity,
          price: item.price?.unit_amount,
        });
        skus.push(variantId.toString());

        await supabaseAdmin.rpc('decrement_stock', {
          p_variant_id: variantId,
          p_qty: item.quantity,
        });
      }
    }

    if (orderItems.length > 0) {
      await supabaseAdmin.from('order_items').insert(orderItems);
    }

    if (discountCode) {
      const { data: discount } = await supabaseAdmin
        .from('discounts')
        .select('uses_count, max_uses, id')
        .eq('code', discountCode)
        .single();
      
      if (discount) {
        await supabaseAdmin
          .from('discounts')
          .update({ uses_count: discount.uses_count + 1 })
          .eq('id', discount.id);
      }
    }

    // Fire and forget
    const city = session.shipping_details?.address?.city || 'Unknown';
    sendAdminAlert(order.id, session.amount_total, items.length, city).catch(console.error);
    sendVendorPO(order.id, skus).catch(console.error);

    // Resend Emails
    const customerName = session.customer_details?.name || 'Customer';
    const emailData = {
      orderNumber: order.id,
      customerName,
      items: items.map(i => ({
        product: (i.price?.product as any)?.name || 'Product',
        qty: i.quantity || 1,
        price: i.price?.unit_amount || 0,
        size: (i.price?.product as any)?.metadata?.size || 'N/A',
        color: (i.price?.product as any)?.metadata?.color || 'N/A',
        sku: (i.price?.product as any)?.metadata?.variantId || 'N/A'
      })),
      subtotal: session.amount_subtotal,
      discount: session.total_details?.amount_discount || 0,
      total: session.amount_total,
      shippingAddress: session.shipping_details?.address,
      orderDate: new Date().toLocaleDateString(),
    };

    resend.emails.send({
      from: 'Outerline <noreply@outerline.nyc>',
      to: customerEmail || session.customer_details?.email,
      subject: `Outerline Order Receipt #${order.id}`,
      react: React.createElement(CustomerReceipt, emailData),
    }).catch(console.error);

    const vendorEmail = process.env.VENDOR_EMAIL;
    if (vendorEmail) {
      resend.emails.send({
        from: 'Outerline Admin <admin@outerline.nyc>',
        to: vendorEmail,
        subject: `NEW PO: Order #${order.id}`,
        react: React.createElement(VendorPurchaseOrder, emailData),
      }).catch(console.error);
    }

    // Mailchimp sync
    if (customerEmail || session.customer_details?.email) {
      subscribeToList(
        customerEmail || session.customer_details?.email,
        ['buyer', 'checkout'],
        session.customer_details?.name?.split(' ')[0]
      ).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
