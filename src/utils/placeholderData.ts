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
  if (d.length < 10 || d.length > 13) return true
  if (allSame(d) || sequential(d)) return true
  // Known demo families: 0170-000000, 014xxxxxxxxxxxx sequential tails, etc.
  if (/^1700000000/.test(d)) return true
  if (/^(17|15|16|18|19)\d{8}$/.test(d)) {
    const tail = d.slice(-8)
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
