'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  await (supabase.from('orders') as any).update({ status }).eq('id', orderId)
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

export async function updateOrderTracking(orderId: string, tracking_number: string, carrier: string) {
  const supabase = await createClient()
  await (supabase.from('orders') as any).update({ tracking_number, carrier }).eq('id', orderId)
  revalidatePath('/admin/orders')
}

export async function notifyVendor(orderId: string) {
  return { success: true }
}
