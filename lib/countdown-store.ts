import fs from 'fs'
import path from 'path'
import { CountdownConfig, DEFAULT_COUNTDOWN } from '@/lib/types/countdown'

export type { CountdownConfig }
export { DEFAULT_COUNTDOWN }

const dataFilePath = path.join(process.cwd(), 'data', 'countdown.json')

export function getLocalCountdown(): CountdownConfig {
  try {
    const dir = path.dirname(dataFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (!fs.existsSync(dataFilePath)) {
      saveCountdown(DEFAULT_COUNTDOWN)
      return DEFAULT_COUNTDOWN
    }

    const raw = fs.readFileSync(dataFilePath, 'utf-8')
    const config = JSON.parse(raw)
    return { ...DEFAULT_COUNTDOWN, ...config }
  } catch {
    return DEFAULT_COUNTDOWN
  }
}

export function saveCountdown(config: Partial<CountdownConfig>): CountdownConfig {
  try {
    const dir = path.dirname(dataFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const current = getLocalCountdown()
    const updated: CountdownConfig = {
      ...current,
      ...config,
      updated_at: new Date().toISOString()
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(updated, null, 2), 'utf-8')
    return updated
  } catch {
    return { ...DEFAULT_COUNTDOWN, ...config, updated_at: new Date().toISOString() }
  }
}
