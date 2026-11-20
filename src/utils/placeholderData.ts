/**
 * Detects demo/placeholder identifiers so they are never published as real,
 * callable contact data. No real value is invented here — this only classifies
 * values already present in the data.
 */

/** Digits from any script, normalised to ASCII. */
function digits(value: string | null | undefined): string {
  const bn = '০১২৩৪৫৬৭৮৯'
  return String(value ?? '')
    .replace(/[০-৯]/g, (d) => String(bn.indexOf(d)))
    .replace(/\D/g, '')
}

/** True when all digits are the same, e.g. 01700000000 or 11111111. */
function allSame(value: string): boolean {
  return value.length >= 4 && new Set(value.split('')).size === 1
}

/** True for a strictly ascending or descending run, e.g. 1234567890. */
function sequential(value: string): boolean {
  if (value.length < 5) return false
  const nums = value.split('').map(Number)
  const asc = nums.every((n, i) => i === 0 || n === (nums[i - 1] + 1) % 10)
  const desc = nums.every((n, i) => i === 0 || n === (nums[i - 1] + 9) % 10)
  return asc || desc
}

/**
 * A phone is a placeholder when it is short, all-zero-ish, a repeated digit,
 * a sequential run, or a known demo pattern such as 0170-000000 / 01511111111.
 */
export function isPlaceholderPhone(phone: string | null | undefined): boolean {
  const d = digits(phone)
  if (!d) return true
  if (d.length < 3 || d.length > 13) return true
  // Short official hotlines (999, 102, 109, 333, 16899 …) are valid — do not
  // flag them as placeholders just for being short.
  if (d.length <= 6) return /^0+$/.test(d)
  // Bangladeshi mobiles are often stored with a leading 0 (018…, 017…).
  const local = d.startsWith('0') && d.length > 6 ? d.slice(1) : d
  if (allSame(local) || sequential(local)) return true
  // Known demo families: 0170-000000, 01411111111, 01511111111, 01811111111, 01900000000 …
  if (/^1700000/.test(local)) return true
  if (/^(14|17|15|16|18|19)\d{8}$/.test(local)) {
    const tail = local.slice(-8)
    if (allSame(tail) || sequential(tail)) return true
    // Repeated blocks like 11111111 / 22222222 / 44444444.
    if (/^(\d)\1{7}$/.test(tail)) return true
  }
  return false
}

/** EIINs in the demo data are six sequential/repeated digits (123456…). */
export function isPlaceholderEiin(eiin: string | null | undefined): boolean {
  const d = digits(eiin)
  if (!d) return false
  if (d.length < 6) return false
  return allSame(d) || sequential(d)
}

/** NID-like identifier: only a masked tail may ever be shown publicly. */
export function containsFullNid(value: string | null | undefined): boolean {
  const d = digits(value)
  return d.length >= 10
}

export const UNVERIFIED = 'তথ্য যাচাই চলছে'

/**
 * Admin-side publish guard. Returns the exact reasons why a record must not be
 * published as-is. Empty/missing contacts are allowed (shown as "তথ্য যাচাই
 * চলছে" publicly) — only fake-looking values are blocked.
 */
export function publishBlockers(record: Record<string, unknown>): string[] {
  const reasons: string[] = []
  const phones = ['phone', 'contact', 'dial', 'mobile', 'telephone']
  for (const key of phones) {
    const value = record[key]
    if (value != null && String(value).trim() && isPlaceholderPhone(String(value))) {
      reasons.push(`${key}: প্লেসহোল্ডার নম্বর — প্রকাশের আগে বাস্তব নম্বর দিন`)
    }
  }
  const eiin = record.eiin
  if (eiin != null && String(eiin).trim() && isPlaceholderEiin(String(eiin))) {
    reasons.push('EIIN: ক্রমিক/পুনরাবৃত্ত সংখ্যা — যাচাই করুন')
  }
  return reasons
}
