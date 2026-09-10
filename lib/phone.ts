// Normalizes user-entered phone numbers to E.164. US numbers may omit the country code.
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null
  }
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}
