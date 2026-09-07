export interface CountdownConfig {
  badge: string
  title: string
  message: string
  targetDate: string
  is_active: boolean
  placeholder_text: string
  button_text: string
  updated_at: string
}

export const DEFAULT_COUNTDOWN: CountdownConfig = {
  badge: '🔥 NYC STREETWEAR DROP RADAR',
  title: 'NEXT CAPSULE DROP COUNTDOWN',
  message: 'Limited batch five boroughs heavyweight hoodies, vintage graphic tees & headwear. Once sold out, they will not restock.',
  targetDate: '2026-09-12T20:00:00.000Z',
  is_active: true,
  placeholder_text: 'ENTER YOUR EMAIL FOR EARLY DROP ACCESS',
  button_text: 'NOTIFY ME',
  updated_at: '2026-09-06T20:00:00.000Z'
}
