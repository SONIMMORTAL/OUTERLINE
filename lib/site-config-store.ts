import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'

// Small JSON settings documents (countdown, etc.).
// Production runs on Vercel, where the filesystem is read-only, so documents live in a private
// Supabase Storage bucket. The committed data/*.json files seed the first read and serve local dev
// when Supabase is not configured.

const BUCKET = 'site-config'

function hasSupabaseStorage() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function localPath(name: string) {
  return path.join(process.cwd(), 'data', `${name}.json`)
}

function readLocal<T>(name: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(localPath(name), 'utf-8')) as T
  } catch {
    return null
  }
}

export async function readConfig<T>(name: string): Promise<T | null> {
  if (hasSupabaseStorage()) {
    try {
      const { data, error } = await createAdminClient().storage.from(BUCKET).download(`${name}.json`)
      if (!error && data) return JSON.parse(await data.text()) as T
    } catch (err) {
      console.warn(`Reading ${name} from Supabase Storage failed, using local seed:`, err)
    }
  }
  return readLocal<T>(name)
}

export async function writeConfig(name: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value, null, 2)

  if (!hasSupabaseStorage()) {
    fs.mkdirSync(path.dirname(localPath(name)), { recursive: true })
    fs.writeFileSync(localPath(name), json, 'utf-8')
    return
  }

  const storage = createAdminClient().storage
  const upload = () =>
    storage.from(BUCKET).upload(`${name}.json`, new Blob([json], { type: 'application/json' }), {
      upsert: true,
      cacheControl: '0',
      contentType: 'application/json',
    })

  let { error } = await upload()
  if (error && /not found/i.test(error.message)) {
    await storage.createBucket(BUCKET, { public: false })
    ;({ error } = await upload())
  }
  if (error) {
    throw new Error(`Could not save ${name} settings: ${error.message}`)
  }
}
