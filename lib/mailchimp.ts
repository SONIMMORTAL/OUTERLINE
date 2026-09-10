import crypto from 'crypto';
import { SMS_CONSENT_TEXT } from '@/lib/sms-consent';

function getMd5Hash(message: string): string {
  return crypto.createHash('md5').update(message).digest('hex');
}

export interface SmsSignup {
  phone: string; // E.164
  source: string;
}

export async function subscribeToList(email: string, tags: string[], firstName?: string, sms?: SmsSignup) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !listId || !serverPrefix) {
    console.error('Mailchimp credentials missing');
    return;
  }

  const subscriberHash = getMd5Hash(email.toLowerCase());
  const memberUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;
  const headers = {
    'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const body: Record<string, unknown> = {
    email_address: email,
    status_if_new: 'subscribed',
    tags,
  };

  if (firstName) {
    body.merge_fields = { FNAME: firstName };
  }

  const putMember = (payload: Record<string, unknown>) =>
    fetch(memberUrl, { method: 'PUT', headers, body: JSON.stringify(payload) });

  try {
    let smsSaved = false;
    let response: Response | null = null;

    if (sms) {
      response = await putMember({
        ...body,
        sms_phone_number: sms.phone,
        sms_subscription_status: 'subscribed',
        consents_to_one_to_one_messaging: true,
      });
      smsSaved = response.ok;
      if (!response.ok) {
        // Audiences without Mailchimp SMS Marketing enabled reject SMS fields. Keep the email signup;
        // the consent note below preserves the number so it can be imported once SMS is set up.
        console.error('Mailchimp SMS subscribe error (retrying email only):', await response.text());
        response = null;
      }
    }

    if (!response) {
      response = await putMember(body);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailchimp subscribe error:', errorText);
      return;
    }

    if (sms) {
      const note = [
        `SMS marketing opt-in via ${sms.source} at ${new Date().toISOString()}.`,
        `Mobile: ${sms.phone}.`,
        smsSaved ? 'Saved to SMS channel.' : 'NOT yet on SMS channel (SMS Marketing not enabled on audience) — import this number.',
        `Disclosure shown: "${SMS_CONSENT_TEXT}"`,
      ].join(' ');
      const noteResponse = await fetch(`${memberUrl}/notes`, { method: 'POST', headers, body: JSON.stringify({ note }) });
      if (!noteResponse.ok) {
        console.error('Mailchimp consent note error:', await noteResponse.text());
      }
    }
  } catch (error) {
    console.error('Mailchimp fetch error:', error);
  }
}

export function generateDiscountCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OUTER-${result}`;
}
