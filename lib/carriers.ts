export const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL'] as const
export type Carrier = (typeof CARRIERS)[number]

const TRACKING_URLS: Record<Carrier, string> = {
  USPS: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  UPS: 'https://www.ups.com/track?tracknum=',
  FedEx: 'https://www.fedex.com/fedextrack/?trknbr=',
  DHL: 'https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=',
}

export function isCarrier(value: string | null | undefined): value is Carrier {
  return Boolean(value) && (CARRIERS as readonly string[]).includes(value as string)
}

export function trackingUrl(carrier: string | null, trackingNumber: string | null): string | null {
  if (!trackingNumber || !isCarrier(carrier)) return null
  return TRACKING_URLS[carrier] + encodeURIComponent(trackingNumber)
}
