import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { items, customerEmail, discountCode } = await req.json();
    const supabase = await createClient();

    let discountAmount = 0;
    let discountId = null;

    if (discountCode) {
      const { data: discount, error: discountError } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', discountCode)
        .eq('is_active', true)
        .single();

      if (discountError) {
        console.error('Discount validation error:', discountError);
      } else if (discount) {
        const discountData: any = discount;
        if (discountData.uses_count < discountData.max_uses) {
          discountAmount = discountData.percentage;
          discountId = discountData.id;
        }
      }
    }

    const lineItems = [];
    const orderItemsMeta = [];

    for (const item of items) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('*, product:products(*)')
        .eq('id', item.variantId)
        .single();

      if (variantError || !variant) {
        return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 404 });
      }
      
      const variantData: any = variant;

      if (variantData.inventory_quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient inventory for ${variantData.product?.title}` }, { status: 400 });
      }

      const unitAmount = Math.round((variantData.product?.price || 0) * 100);
      const discountedAmount = Math.round(unitAmount * (1 - discountAmount / 100));

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${variantData.product?.title} - ${variantData.size} - ${variantData.color}`,
            metadata: {
              variantId: item.variantId,
            },
          },
          unit_amount: discountedAmount,
        },
        quantity: item.quantity,
      });
      
      orderItemsMeta.push(`${item.variantId}:${item.quantity}`);
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Flat Rate Shipping',
            delivery_estimate: { minimum: { unit: 'business_day', value: 3 }, maximum: { unit: 'business_day', value: 5 } },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free Shipping',
            delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 7 } },
          },
        },
      ],
      metadata: {
        discountCode: discountCode || '',
        customerEmail,
        orderItems: orderItemsMeta.join(','),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
