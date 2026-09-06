import React from 'react';
import { NextResponse } from 'next/server';
import { subscribeToList } from '@/lib/mailchimp';
import { Resend } from 'resend';
import CustomerWelcome from '@/components/emails/CustomerWelcome';
import { validateDiscount } from '@/lib/discounts-store';

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim();

    // 1. Subscribe to Mailchimp list (graceful if credentials missing or rate limited)
    try {
      await subscribeToList(trimmedEmail, ['first-drop-subscriber'], firstName);
    } catch (mcErr) {
      console.warn('Mailchimp subscribe non-fatal error:', mcErr);
    }

    // 2. Official Promo Code for subscribers
    const promoCode = 'THANK YOU';
    // Ensure discount exists and is active
    validateDiscount(promoCode);

    // 3. Dispatch Branded Welcome Email to the subscriber via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey !== 're_your_resend_api_key') {
      try {
        const resend = new Resend(resendApiKey);
        const sender = process.env.RESEND_FROM_EMAIL || 'Outerline NYC <onboarding@resend.dev>';
        
        await resend.emails.send({
          from: sender,
          to: trimmedEmail,
          subject: '⚡ Welcome to Outerline NYC — Your 15% OFF Promo Code',
          react: React.createElement(CustomerWelcome, {
            email: trimmedEmail,
            firstName,
            discountCode: promoCode,
          }),
        });
      } catch (emailErr: any) {
        console.error('Welcome email dispatch error via Resend:', emailErr?.message || emailErr);
      }
    } else {
      console.log(`[DEV/STAGING] Welcome email for ${trimmedEmail} prepared with code ${promoCode}. (Resend API key is pending or test key)`);
    }

    return NextResponse.json({ 
      success: true, 
      code: promoCode,
      message: 'Welcome to the collective! Your 15% off discount code is ready.'
    });
  } catch (error: any) {
    console.error('Subscribe handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

