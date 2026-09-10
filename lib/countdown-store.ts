import { CountdownConfig, DEFAULT_COUNTDOWN } from '@/lib/types/countdown'
import { readConfig, writeConfig } from '@/lib/site-config-store'

export type { CountdownConfig }
export { DEFAULT_COUNTDOWN }

const TEXT_FIELDS = ['badge', 'title', 'message', 'targetDate', 'placeholder_text', 'button_text'] as const

export async function getCountdown(): Promise<CountdownConfig> {
  const stored = await readConfig<Partial<CountdownConfig>>('countdown')
  return { ...DEFAULT_COUNTDOWN, ...(stored ?? {}) }
}

// Accepts a partial update from the admin form; unknown or mistyped fields are ignored.
export async function saveCountdown(input: Record<string, unknown>): Promise<CountdownConfig> {
  const updated: CountdownConfig = { ...(await getCountdown()), updated_at: new Date().toISOString() }

  for (const field of TEXT_FIELDS) {
    const value = input[field]
    if (typeof value === 'string') updated[field] = value
  }
  if (typeof input.is_active === 'boolean') {
    updated.is_active = input.is_active
  }

  await writeConfig('countdown', updated)
  return updated
}
