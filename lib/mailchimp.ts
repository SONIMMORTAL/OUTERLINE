import crypto from 'crypto';

function getMd5Hash(message: string): string {
  return crypto.createHash('md5').update(message).digest('hex');
}

export async function subscribeToList(email: string, tags: string[], firstName?: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !listId || !serverPrefix) {
    console.error('Mailchimp credentials missing');
    return;
  }

  const subscriberHash = getMd5Hash(email.toLowerCase());
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;

  const body: any = {
    email_address: email,
    status_if_new: 'subscribed',
    tags,
  };

  if (firstName) {
    body.merge_fields = { FNAME: firstName };
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailchimp subscribe error:', errorText);
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
