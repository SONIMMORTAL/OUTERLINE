// Signed admin session tokens (HMAC-SHA256 via Web Crypto, so this runs in route handlers and proxy alike).
// The cookie used to hold plain JSON, which anyone could forge by hand.

export const ADMIN_SESSION_COOKIE = 'outerline_admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

export interface AdminSession {
  user: string
  role: 'admin'
  authenticatedAt: string
  exp: number
}

function getSecret(): string | null {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_PASSWORD
  if (secret) return secret
  return process.env.NODE_ENV === 'production' ? null : 'outerline-local-dev-session-secret'
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return toBase64Url(new Uint8Array(signature))
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken(user: string): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('Admin sessions are not configured. Set ADMIN_SESSION_SECRET.')

  const session: AdminSession = {
    user,
    role: 'admin',
    authenticatedAt: new Date().toISOString(),
    exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
  }
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)))
  return `${payload}.${await sign(payload, secret)}`
}

export async function verifySessionToken(token?: string | null): Promise<AdminSession | null> {
  const secret = getSecret()
  if (!token || !secret) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  try {
    if (!constantTimeEqual(signature, await sign(payload, secret))) return null
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as AdminSession
    return session.role === 'admin' && session.exp > Date.now() ? session : null
  } catch {
    return null
  }
}
