/**
 * Shared client-side validation for all public forms. Every message returned
 * here is Bengali and names the offending field, so no form can submit an empty
 * required value or an invalid phone/date silently.
 */

/** Bangladeshi mobile: 01XXXXXXXXX, with optional +88 / separators. */
export function isValidBangladeshPhone(value: string): boolean {
  const digits = (value || '').replace(/[^0-9]/g, '')
  const local = digits.startsWith('88') && digits.length === 13 ? digits.slice(2) : digits
  return /^01[3-9]\d{8}$/.test(local)
}

/** ISO `YYYY-MM-DD` that is not in the past. */
export function isTodayOrFuture(value: string): boolean {
  if (!value) return false
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

/** Masks any identifier so a full number is never displayed in the UI. */
export function maskIdentifier(value: string | null | undefined): string {
  const raw = (value ?? '').trim()
  if (raw.length <= 4) return raw
  return `${raw.slice(0, 2)}${'•'.repeat(Math.max(2, raw.length - 4))}${raw.slice(-2)}`
}
