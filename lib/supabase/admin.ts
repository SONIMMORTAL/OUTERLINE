import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Admin writes (storage buckets, product catalog) need the secret key. A publishable/anon key
// here fails in confusing ways (e.g. "Bucket not found"), so callers check this first.
export function getServiceRoleKeyError(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    return 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
  }

  let isPublicKey = key.startsWith('sb_publishable_') || key === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const jwtParts = key.split('.')
  if (!isPublicKey && jwtParts.length === 3) {
    try {
      isPublicKey = JSON.parse(Buffer.from(jwtParts[1], 'base64url').toString()).role !== 'service_role'
    } catch {
      // Not a JWT; leave it to Supabase to reject.
    }
  }

  return isPublicKey
    ? 'SUPABASE_SERVICE_ROLE_KEY is set to the public (publishable/anon) key. Replace it with the secret key from Supabase → Project Settings → API Keys.'
    : null
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}
