import fs from 'fs'
import path from 'path'

export interface StoredDiscount {
  id: string
  code: string
  percentage: number
  is_active: boolean
  max_uses: number // 0 or negative indicates unlimited
  uses_count: number
  expires_at: string | null // ISO string or null
  created_at: string
}

const dataFilePath = path.join(process.cwd(), 'data', 'discounts.json')

const DEFAULT_DISCOUNTS: StoredDiscount[] = [
  {
    id: 'disc_thank_you',
    code: 'THANK YOU',
    percentage: 15,
    is_active: true,
    max_uses: 5000,
    uses_count: 0,
    expires_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'disc_outer15',
    code: 'OUTER15',
    percentage: 15,
    is_active: true,
    max_uses: 1000,
    uses_count: 0,
    expires_at: null,
    created_at: new Date().toISOString(),
  }
]

export function getLocalDiscounts(): StoredDiscount[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      saveAllDiscounts(DEFAULT_DISCOUNTS)
      return DEFAULT_DISCOUNTS
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8')
    const list: StoredDiscount[] = JSON.parse(raw)
    
    // Ensure "THANK YOU" is always present if not already added
    const hasThankYou = list.some(d => normalizeCode(d.code) === 'THANKYOU')
    if (!hasThankYou) {
      list.unshift(DEFAULT_DISCOUNTS[0])
      saveAllDiscounts(list)
    }
    return list
  } catch (err) {
    return DEFAULT_DISCOUNTS
  }
}

export function saveAllDiscounts(discounts: StoredDiscount[]): void {
  try {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true })
    fs.writeFileSync(dataFilePath, JSON.stringify(discounts, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write discounts.json:', err)
  }
}

export function normalizeCode(code: string): string {
  return (code || '').toUpperCase().replace(/[\s\-_]/g, '')
}

export function saveDiscount(discount: Partial<StoredDiscount>): StoredDiscount {
  const existing = getLocalDiscounts()
  const rawCode = (discount.code || '').trim().toUpperCase()

  if (discount.id) {
    // Update existing
    const index = existing.findIndex(d => d.id === discount.id)
    if (index !== -1) {
      existing[index] = {
        ...existing[index],
        ...discount,
        code: rawCode || existing[index].code,
        percentage: Number(discount.percentage) || existing[index].percentage,
        max_uses: discount.max_uses !== undefined ? Number(discount.max_uses) : existing[index].max_uses,
        expires_at: discount.expires_at !== undefined ? discount.expires_at : existing[index].expires_at,
        is_active: discount.is_active !== undefined ? !!discount.is_active : existing[index].is_active,
      }
      saveAllDiscounts(existing)
      return existing[index]
    }
  }

  // Create new
  const newDiscount: StoredDiscount = {
    id: discount.id || `disc_${Date.now().toString(36)}`,
    code: rawCode,
    percentage: Number(discount.percentage) || 15,
    is_active: discount.is_active !== undefined ? !!discount.is_active : true,
    max_uses: discount.max_uses !== undefined ? Number(discount.max_uses) : 0,
    uses_count: 0,
    expires_at: discount.expires_at || null,
    created_at: new Date().toISOString(),
  }

  const updated = [newDiscount, ...existing]
  saveAllDiscounts(updated)
  return newDiscount
}

export function deleteDiscount(id: string): boolean {
  const existing = getLocalDiscounts()
  const filtered = existing.filter(d => d.id !== id)
  if (filtered.length !== existing.length) {
    saveAllDiscounts(filtered)
    return true
  }
  return false
}

export function toggleDiscountActive(id: string): StoredDiscount | null {
  const existing = getLocalDiscounts()
  const target = existing.find(d => d.id === id)
  if (target) {
    target.is_active = !target.is_active
    saveAllDiscounts(existing)
    return target
  }
  return null
}

export function validateDiscount(inputCode: string): {
  valid: boolean
  discount?: StoredDiscount
  error?: string
} {
  const normalized = normalizeCode(inputCode)
  if (!normalized) {
    return { valid: false, error: 'Please enter a coupon code.' }
  }

  const discounts = getLocalDiscounts()
  const found = discounts.find(d => normalizeCode(d.code) === normalized)

  if (!found) {
    return { valid: false, error: 'Invalid coupon code.' }
  }

  if (!found.is_active) {
    return { valid: false, error: 'This coupon is currently inactive.' }
  }

  // Check expiration date
  if (found.expires_at) {
    const expiry = new Date(found.expires_at)
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return { valid: false, error: 'This coupon code has expired.' }
    }
  }

  // Check usage limit
  if (found.max_uses > 0 && found.uses_count >= found.max_uses) {
    return { valid: false, error: 'This coupon code has reached its maximum usage limit.' }
  }

  return { valid: true, discount: found }
}

export function incrementDiscountUse(inputCode: string): void {
  const normalized = normalizeCode(inputCode)
  const discounts = getLocalDiscounts()
  const found = discounts.find(d => normalizeCode(d.code) === normalized)
  if (found) {
    found.uses_count = (found.uses_count || 0) + 1
    saveAllDiscounts(discounts)
  }
}
