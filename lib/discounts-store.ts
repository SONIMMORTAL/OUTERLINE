import { createServiceClient } from '@/lib/supabase/admin'

// Discount codes live in the Supabase `discounts` table (supabase/migrations/002_orders_discounts.sql).
// The table has no public access; everything goes through the service-role client.

export interface StoredDiscount {
  id: string
  code: string
  percentage: number
  is_active: boolean
  max_uses: number // 0 = unlimited
  uses_count: number
  expires_at: string | null
  created_at: string
}

export class DiscountInputError extends Error {}

const COLUMNS = 'id, code, percentage, is_active, max_uses, uses_count, expires_at, created_at'

export function normalizeCode(code: string): string {
  return (code || '').toUpperCase().replace(/[\s\-_]/g, '')
}

function databaseError(error: { code?: string; message: string }, action: string): Error {
  if (error.code === '23505') return new DiscountInputError('A coupon with this code already exists.')
  return new Error(`Could not ${action}: ${error.message}`)
}

function parseInput(raw: Record<string, unknown>, partial: boolean): Record<string, unknown> {
  const fields: Record<string, unknown> = {}

  if (!partial || raw.code !== undefined) {
    const code = String(raw.code ?? '').trim().toUpperCase().replace(/\s+/g, ' ')
    if (!/^[A-Z0-9][A-Z0-9 _-]{1,31}$/.test(code)) {
      throw new DiscountInputError('Codes must be 2–32 characters: letters, numbers, spaces, dashes, or underscores.')
    }
    fields.code = code
  }
  if (!partial || raw.percentage !== undefined) {
    const percentage = Number(raw.percentage)
    if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) {
      throw new DiscountInputError('Discount must be a whole number from 1 to 100.')
    }
    fields.percentage = percentage
  }
  if (!partial || raw.max_uses !== undefined) {
    const maxUses = Number(raw.max_uses ?? 0)
    if (!Number.isInteger(maxUses) || maxUses < 0) {
      throw new DiscountInputError('Usage limit must be 0 (unlimited) or a positive whole number.')
    }
    fields.max_uses = maxUses
  }
  if (!partial || raw.expires_at !== undefined) {
    if (raw.expires_at == null || raw.expires_at === '') {
      fields.expires_at = null
    } else {
      const expiresAt = new Date(String(raw.expires_at))
      if (isNaN(expiresAt.getTime())) throw new DiscountInputError('Expiration date is not valid.')
      fields.expires_at = expiresAt.toISOString()
    }
  }
  if (!partial || raw.is_active !== undefined) {
    fields.is_active = raw.is_active === undefined ? true : Boolean(raw.is_active)
  }

  return fields
}

export async function listDiscounts(): Promise<StoredDiscount[]> {
  const { data, error } = await createServiceClient()
    .from('discounts')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw databaseError(error, 'load discount codes')
  return (data ?? []) as StoredDiscount[]
}

export async function createDiscount(raw: Record<string, unknown>): Promise<StoredDiscount> {
  const { data, error } = await createServiceClient()
    .from('discounts')
    .insert(parseInput(raw, false))
    .select(COLUMNS)
    .single()
  if (error) throw databaseError(error, 'create the coupon')
  return data as StoredDiscount
}

export async function updateDiscount(id: string, raw: Record<string, unknown>): Promise<StoredDiscount> {
  const { data, error } = await createServiceClient()
    .from('discounts')
    .update(parseInput(raw, true))
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw databaseError(error, 'update the coupon')
  return data as StoredDiscount
}

export async function toggleDiscountActive(id: string): Promise<StoredDiscount> {
  const supabase = createServiceClient()
  const { data: current, error } = await supabase.from('discounts').select('is_active').eq('id', id).single()
  if (error || !current) throw new Error('Coupon not found.')
  return updateDiscount(id, { is_active: !current.is_active })
}

export async function deleteDiscount(id: string): Promise<void> {
  const { error } = await createServiceClient().from('discounts').delete().eq('id', id)
  if (error) throw databaseError(error, 'delete the coupon')
}

// Read-only check for the checkout "Apply" button. The use is only claimed when the order is placed.
export async function validateDiscount(inputCode: string): Promise<{ valid: boolean; discount?: StoredDiscount; error?: string }> {
  const normalized = normalizeCode(inputCode)
  if (!normalized) return { valid: false, error: 'Please enter a coupon code.' }

  const found = (await listDiscounts()).find((d) => normalizeCode(d.code) === normalized)
  if (!found) return { valid: false, error: 'Invalid coupon code.' }
  if (!found.is_active) return { valid: false, error: 'This coupon is currently inactive.' }
  if (found.expires_at && new Date(found.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'This coupon code has expired.' }
  }
  if (found.max_uses > 0 && found.uses_count >= found.max_uses) {
    return { valid: false, error: 'This coupon code has reached its usage limit.' }
  }
  return { valid: true, discount: found }
}

// Atomically claims one use. Returns null if the code is invalid, inactive, expired, or used up.
export async function redeemDiscount(code: string): Promise<StoredDiscount | null> {
  const { data, error } = await createServiceClient().rpc('redeem_discount', { p_code: code })
  if (error) throw new Error(`Could not apply the discount code: ${error.message}`)
  return ((data ?? []) as StoredDiscount[])[0] ?? null
}

export async function releaseDiscount(id: string): Promise<void> {
  const { error } = await createServiceClient().rpc('release_discount', { p_id: id })
  if (error) console.error('Could not release discount use:', error.message)
}

export async function releaseDiscountByCode(code: string): Promise<void> {
  const normalized = normalizeCode(code)
  const found = (await listDiscounts()).find((d) => normalizeCode(d.code) === normalized)
  if (found) await releaseDiscount(found.id)
}
