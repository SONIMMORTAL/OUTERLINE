import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { createAdminClient, getServiceRoleKeyError } from '@/lib/supabase/admin'

const BUCKET = 'product-images'
const MAX_BYTES = 15 * 1024 * 1024
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

// Returns a one-time signed upload URL. The browser sends the file straight to Supabase Storage,
// which avoids Vercel's ~4.5 MB request body limit for large product photos.
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Your admin session has expired. Please log in again.' }, { status: 401 })
  }
  const keyError = getServiceRoleKeyError()
  if (keyError) {
    return NextResponse.json({ error: `Image uploads are not configured: ${keyError}` }, { status: 500 })
  }

  const { fileName, contentType, size } = await req.json().catch(() => ({}))
  const extension = EXTENSIONS[contentType]
  if (!extension) {
    return NextResponse.json({ error: 'Upload a JPG, PNG, WebP, or AVIF image.' }, { status: 400 })
  }
  if (typeof size === 'number' && size > MAX_BYTES) {
    return NextResponse.json({ error: 'Images must be 15 MB or smaller.' }, { status: 400 })
  }

  const baseName = String(fileName || 'image')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image'
  const path = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${baseName}.${extension}`

  const storage = createAdminClient().storage
  let signed = await storage.from(BUCKET).createSignedUploadUrl(path)
  if (signed.error && /not found/i.test(signed.error.message)) {
    const created = await storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: Object.keys(EXTENSIONS),
    })
    if (created.error && !/already exists/i.test(created.error.message)) {
      return NextResponse.json({ error: `Could not create the "${BUCKET}" storage bucket: ${created.error.message}` }, { status: 500 })
    }
    signed = await storage.from(BUCKET).createSignedUploadUrl(path)
  }
  if (signed.error || !signed.data) {
    return NextResponse.json({ error: signed.error?.message || 'Could not prepare the upload.' }, { status: 500 })
  }

  const { data: { publicUrl } } = storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ bucket: BUCKET, path, token: signed.data.token, publicUrl })
}
