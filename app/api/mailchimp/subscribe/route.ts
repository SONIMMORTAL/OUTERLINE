import { NextResponse } from 'next/server';
import { subscribeToList } from '@/lib/mailchimp';
import { emailSetupProblem, getResend, sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/components/emails/CustomerWelcome';
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

    // 3. Email the code too. The popup already shows it, so a failed email doesn't fail the signup.
    const setupProblem = emailSetupProblem();
    if (setupProblem) {
      console.error(`Welcome email to ${trimmedEmail} will not be delivered: ${setupProblem}`);
    }
    if (getResend()) {
      try {
        await sendEmail(welcomeEmail(trimmedEmail, promoCode, firstName));
      } catch (emailErr) {
        console.error('Welcome email failed:', emailErr instanceof Error ? emailErr.message : emailErr);
      }
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
