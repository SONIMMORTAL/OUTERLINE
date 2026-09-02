export async function sendSMS(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.ADMIN_PHONE_NUMBER;

  if (!accountSid) {
    console.warn('Twilio Account SID is missing. Skipping SMS dispatch.');
    return;
  }

  // Use API Key credentials if provided, otherwise fallback to Auth Token
  const authUser = apiKeySid || accountSid;
  const authSecret = apiKeySecret || authToken;

  if (!authUser || !authSecret) {
    console.warn('Twilio auth credentials missing. Skipping SMS dispatch.');
    return;
  }

  if (!fromNumber) {
    console.warn('Twilio fromNumber missing. Skipping SMS dispatch.');
    return;
  }

  const basicAuth = Buffer.from(`${authUser}:${authSecret}`).toString('base64');
  const params = new URLSearchParams();
  params.append('To', to);
  params.append('From', fromNumber);
  params.append('Body', body);

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio SMS error:', errorText);
    } else {
      console.log(`Twilio SMS successfully sent to ${to}`);
    }
  } catch (error) {
    console.error('Twilio fetch error:', error);
  }
}

export async function sendAdminAlert(orderNumber: number | string, amount: number, itemCount: number, city: string) {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER || '+17186007410';
  if (!adminPhone) return;

  const body = `OUTERLINE Alert: New order #${orderNumber} for $${(amount / 100).toFixed(2)} (${itemCount} items) shipping to ${city}.`;
  await sendSMS(adminPhone, body);
}

export async function sendVendorPO(orderNumber: number | string, skuList: string[]) {
  const vendorPhone = process.env.VENDOR_PHONE_NUMBER || '+17186007410';
  if (!vendorPhone) return;

  const skus = skuList.join(', ');
  const body = `OUTERLINE PO #${orderNumber} FULFILL IMMEDIATELY. SKUs: ${skus}. Check email for details.`;
  await sendSMS(vendorPhone, body);
}

export async function sendInstantOrderSMS(order: {
  customerName: string
  totalAmount: number
  itemCount: number
  city: string
  state: string
  itemsSummary: string
  paymentMethod: string
}) {
  const targetPhone = process.env.ADMIN_PHONE_NUMBER || '+17186007410';
  const body = `OUTERLINE SALE! $${order.totalAmount.toFixed(2)} (${order.itemCount} items) from ${order.customerName}. Items: ${order.itemsSummary}. Ship to: ${order.city}, ${order.state}. Method: ${order.paymentMethod}.`;
  
  await sendSMS(targetPhone, body);
}
