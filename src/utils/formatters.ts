import { SITE_DATA_REVIEWED } from '../constants/dataMeta'

/** Bengali month names that appear in demo dates such as "১৪ নভেম্বর". */
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

/**
 * The one Bengali date format used everywhere on the site:
 * "১৪ নভেম্বর, ২০২৬".
 *
 * ISO strings are converted. A Bengali day+month string with no year (e.g. the
 * fish prices' "১৪ নভেম্বর") is normalised to the same full format using the
 * site's data year — no new date is invented, only the format is completed.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const value = String(dateStr).trim()
  try {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      const parts = new Intl.DateTimeFormat('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).formatToParts(date)
      const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((item) => item.type === type)?.value ?? ''
      return `${part('day')} ${part('month')}, ${part('year')}`
    }
  } catch {
    // fall through to the string normalisers below
  }

  // Already a full Bengali date — normalise a missing comma before the year.
  if (/[০-৯]{4}/.test(value) || /\d{4}/.test(value)) {
    return value.replace(/([০-৯]{4})(?!.*[০-৯]{4})/, '$1').replace(/\s+([০-৯]{4})$/, ', $1')
  }

  // Bengali day + month without a year — append the site's data year.
  if (/^[০-৯]{1,2}\s/.test(value) && BENGALI_MONTHS.some((m) => value.includes(m))) {
    const year = new Intl.DateTimeFormat('bn-BD', { year: 'numeric' })
      .format(new Date(SITE_DATA_REVIEWED))
    return `${value}, ${year}`
  }
  return value
}

export function formatBanglaToday(): string {
  try {
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  } catch {
    return new Date().toLocaleDateString()
  }
}

/**
 * Formats any date (ISO string or Date) in the Bangla long form used across
 * the site, e.g. "১৬ নভেম্বর ২০২৬".
 */
export function formatBanglaDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return formatDate(value.toISOString())
  return formatDate(value)
}

export function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '')
}

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Converts every digit of a number to its Bangla counterpart (15 -> "১৫"). */
export function toBanglaNumber(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)])
}

/**
 * Reads the numeric fare out of a published fare string such as
 * "৪০ টাকা", "১,৫০০ টাকা (দিনভর, দলগত)" or "২৫০ টাকা (ভাড়া)".
 * Only digits from the string are used — no fare is invented.
 */
export function parseFare(fare: string): number {
  const banglaToAscii = String(fare ?? '').replace(/[০-৯]/g, (d) => String(BENGALI_DIGITS.indexOf(d)))
  const match = banglaToAscii.replace(/,/g, '').match(/\d+/)
  return match ? Number(match[0]) : 0
}

/**
 * The ONE price format used across the site: ৳ + Bengali digits + unit.
 * E.g. `formatPrice(70)` -> "৳৭০ টাকা". The numeric value is never changed.
 */
export function formatPrice(value: number | string): string {
  const numeric = typeof value === 'number' ? value : parseFare(value)
  return `৳${toBanglaNumber(numeric)} টাকা`
}

/**
 * Formats a live count for the UI, e.g. `toBanglaCount(15, 'জন')` -> "১৫ জন".
 */
export function toBanglaCount(value: number, unit?: string): string {
  const number = toBanglaNumber(value)
  return unit ? `${number} ${unit}` : number
}
