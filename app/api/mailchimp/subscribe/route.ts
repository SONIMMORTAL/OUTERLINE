import React from 'react';
import { NextResponse } from 'next/server';
import { subscribeToList } from '@/lib/mailchimp';
import { Resend } from 'resend';
import CustomerWelcome from '@/components/emails/CustomerWelcome';
import { normalizePhone } from '@/lib/phone';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNUP_SOURCES = ['discount-popup', 'drop-countdown', 'footer'] as const;

export async function POST(req: Request) {
  try {
    const { email, firstName, phone, smsConsent, source } = await req.json();

    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const rawPhone = typeof phone === 'string' ? phone.trim() : '';
    const smsPhone = rawPhone ? normalizePhone(rawPhone) : null;
    if (rawPhone && !smsPhone) {
      return NextResponse.json({ error: 'Please enter a valid mobile number.' }, { status: 400 });
    }
    if (smsPhone && smsConsent !== true) {
      return NextResponse.json(
        { error: 'Check the box to agree to text messages, or leave the mobile number blank.' },
        { status: 400 }
      );
    }

    const signupSource = SIGNUP_SOURCES.includes(source) ? source : 'discount-popup';
    const tags = ['first-drop-subscriber'];
    if (signupSource === 'drop-countdown') tags.push('drop-early-access');
    if (smsPhone) tags.push('sms-opt-in');

    // 1. Subscribe to Mailchimp list (graceful if credentials missing or rate limited)
    try {
      await subscribeToList(
        trimmedEmail,
        tags,
        firstName,
        smsPhone ? { phone: smsPhone, source: signupSource } : undefined
      );
    } catch (mcErr) {
      console.warn('Mailchimp subscribe non-fatal error:', mcErr);
    }

    // 2. Official Promo Code for subscribers (managed in Admin → Discounts)
    const promoCode = 'THANK YOU';

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
      sms: Boolean(smsPhone),
      message: 'Welcome to the collective! Your 15% off discount code is ready.'
    });
  } catch (error: any) {
    console.error('Subscribe handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
