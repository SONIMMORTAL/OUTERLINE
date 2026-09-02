import { NextResponse } from 'next/server';
import { subscribeToList, generateDiscountCode } from '@/lib/mailchimp';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await subscribeToList(email, ['first-drop-subscriber'], firstName);

    const discountCode = generateDiscountCode();
    try {
      const supabase = await createClient();
      await supabase
        .from('discounts')
        .insert({
          code: discountCode,
          percentage: 15,
          max_uses: 1,
          uses_count: 0,
          is_active: true,
        } as any);
    } catch (err) {
      console.warn('Discounts table pending schema migration, returning generated code directly');
    }

    return NextResponse.json({ code: discountCode });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
