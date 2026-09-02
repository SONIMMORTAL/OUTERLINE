import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('outerline_admin_session')
  if (!session?.value) return null
  try {
    const raw = session.value.startsWith('%') ? decodeURIComponent(session.value) : session.value
    const parsed = JSON.parse(raw)
    return parsed?.user ? parsed : null
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }
  return session
}
