import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendVendorPO } from '@/lib/twilio';
import { Resend } from 'resend';
import VendorPurchaseOrder from '@/components/emails/VendorPurchaseOrder';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profileData: any = profile;

    if (profileData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderId } = await req.json();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, product_variants(*, products(*)))')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData: any = order;
    const skus = orderData.order_items.map((item: any) => item.variant_id);
    
    await sendVendorPO(orderData.id, skus);

    const emailData = {
      orderNumber: orderData.id,
      customerName: orderData.customer_email,
      items: orderData.order_items.map((item: any) => ({
        product: item.product_variants?.products?.title || 'Product',
        qty: item.quantity,
        price: item.unit_price,
        size: item.product_variants?.size || 'N/A',
        color: item.product_variants?.color || 'N/A',
        sku: item.variant_id,
      })),
      subtotal: orderData.total_amount,
      discount: 0,
      total: orderData.total_amount,
      shippingAddress: orderData.shipping_address,
      orderDate: new Date(orderData.created_at || Date.now()).toLocaleDateString(),
    };

    const vendorEmail = process.env.VENDOR_EMAIL;
    if (vendorEmail) {
      await resend.emails.send({
        from: 'Outerline Admin <admin@outerline.nyc>',
        to: vendorEmail,
        subject: `NEW PO: Order #${orderData.id} (RESENT)`,
        react: React.createElement(VendorPurchaseOrder, emailData),
      });
    }

    await (supabase
      .from('orders') as any)
      .update({ vendor_notified: true, vendor_notified_at: new Date().toISOString() })
      .eq('id', orderData.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notify vendor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
