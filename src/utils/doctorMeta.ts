import { Doctor, DoctorSpecialty, ServiceProvider } from '../types'

/**
 * The specialties a doctor can be filed under.
 *
 * The cards and the "Medicine / গাইনি …" filter both read this one list, so a
 * doctor can never be hidden by a filter but shown without its specialty.
 */
export const DOCTOR_SPECIALTIES: DoctorSpecialty[] = [
  'মেডিসিন',
  'শিশু',
  'গাইনি',
  'হৃদরোগ',
  'চর্মরোগ',
  'চক্ষু',
  'অর্থোপেডিক',
  'দন্তচিকিৎসা',
]

/** Shown when a record has no specialty of its own — the card never hides it. */
export const DEFAULT_DOCTOR_SPECIALTY: DoctorSpecialty = 'মেডিসিন'

/** The one field the doctor card and the specialty filter both read. */
export function doctorSpecialty(
  doctor: Pick<ServiceProvider, 'specialty'> | Pick<Doctor, 'specialty'>,
): DoctorSpecialty {
  const value = (doctor as { specialty?: string }).specialty?.trim()
  return (DOCTOR_SPECIALTIES.find((item) => item === value) ??
    DEFAULT_DOCTOR_SPECIALTY) as DoctorSpecialty
}

/** Weekday names in getDay() order (0=Sunday), in both scripts the data uses. */
const WEEKDAY_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি']
const WEEKDAY_EN = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
]

/** maps a Bengali/English day word to its getDay() index, "বার"/"বন্ধ" suffixes allowed. */
function dayIndex(word: string): number {
  const cleaned = word
    .trim()
    .toLowerCase()
    .replace(/বার$/, '')
    .replace(/বন্ধ$/, '')
    .replace(/\s+$/, '')
  // Match in either direction: a full/suffixed word "শুক্রবার" that starts
  // with the canonical "শুক্র", or a short token "বৃহ" that is a prefix of the
  // canonical "বৃহস্পতি" (used in ranges such as "শনি-বৃহ").
  const bn = WEEKDAY_BN.findIndex(
    (d) => cleaned === d || cleaned.startsWith(d) || d.startsWith(cleaned),
  )
  if (bn >= 0) return bn
  return WEEKDAY_EN.findIndex(
    (d) => cleaned === d || cleaned.startsWith(d) || d.startsWith(cleaned),
  )
}

/**
 * True when the doctor's chamber is open on a given weekday index (0=Sunday).
 * Works for Bengali day names ("রবি, মঙ্গল, বুধ"), "প্রতিদিন" (every day),
 * ranges such as "শনি-বৃহ" (Saturday–Thursday), the "(... বন্ধ)" closed-day
 * pattern, and English day names. Empty/unknown schedules return false.
 */
export function doctorVisitsOnDay(
  doctor: Pick<ServiceProvider, 'visitingDays'>,
  day: number,
): boolean {
  const days = (doctor.visitingDays ?? '').trim()
  if (!days) return false
  if (day < 0 || day > 6) return false

  // An explicit "(... বন্ধ)" closed day overrides everything, including প্রতিদিন.
  const closedMatch = days.match(/\(([^)]*)\)/)
  if (closedMatch && dayIndex(closedMatch[1]) === day) return false

  if (days.includes('প্রতিদিন') || /every\s*day/i.test(days)) return true

  // Ranges like "শনি-বৃহ" mean every day from Saturday through Thursday.
  // Walk the week cyclically so the range never accidentally includes Friday.
  const body = closedMatch ? days.replace(/\([^)]*\)/g, ' ').trim() : days
  return body
    .split(/[,\s]+/)
    .filter(Boolean)
    .some((token) => {
      const [start, end] = token.split(/\s*[-–—]\s*/)
      if (end) {
        const from = dayIndex(start)
        const to = dayIndex(end)
        if (from < 0 || to < 0) return false
        for (let i = 0, cursor = from; i <= 6; i++, cursor = (cursor + 1) % 7) {
          if (cursor === day) return true
          if (cursor === to) return false
        }
        return false
      }
      return dayIndex(token) === day
    })
}

/** True when the doctor's chamber is open today. */
export function doctorVisitsToday(
  doctor: Pick<ServiceProvider, 'visitingDays'>,
  date: Date = new Date(),
): boolean {
  return doctorVisitsOnDay(doctor, date.getDay())
}
