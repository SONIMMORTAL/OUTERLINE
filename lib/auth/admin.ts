import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session'

export async function getAdminSession() {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }
  return session
}
