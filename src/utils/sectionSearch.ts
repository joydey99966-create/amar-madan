/**
 * Section-local search helpers.
 *
 * 1. A query that names the section itself ("মাছ" on the fish page, "বাজার"
 *    on the market page) is a generic term — show every item in that section.
 * 2. Latin names ("Rafiq") are matched against Bengali names ("রফিকুল") with
 *    a lightweight phonetic comparison, in addition to the normal Bengali
 *    substring match.
 */

export type SectionKey =
  | 'fish'
  | 'market'
  | 'donors'
  | 'doctors'
  | 'hospitals'
  | 'education'
  | 'jobs'
  | 'news'
  | 'transport'
  | 'lostfound'
  | 'citizens'

/** Words that mean "this whole section" rather than a specific record. */
export const SECTION_TERMS: Record<SectionKey, string[]> = {
  fish: ['মাছ', 'মাছের', 'হাওর', 'আড়ত', 'মৎস্য', 'fish', 'haor'],
  market: ['বাজার', 'দাম', 'দর', 'পণ্য', 'মূল্য', 'দামদর', 'price', 'market'],
  donors: ['রক্ত', 'রক্তদাতা', 'রক্তদান', 'ডোনার', 'blood', 'donor'],
  doctors: ['ডাক্তার', 'চিকিৎসক', 'doctor', 'doctors'],
  hospitals: ['হাসপাতাল', 'ক্লিনিক', 'স্বাস্থ্য', 'hospital', 'clinic'],
  education: ['শিক্ষা', 'প্রতিষ্ঠান', 'স্কুল', 'কলেজ', 'মাদরাসা', 'education', 'school', 'college'],
  jobs: ['চাকরি', 'জব', 'টিউশনি', 'কর্মসংস্থান', 'job', 'jobs', 'vacancy'],
  news: ['সংবাদ', 'খবর', 'নিউজ', 'প্রেস', 'news'],
  transport: ['যাতায়াত', 'গাড়ি', 'ভাড়া', 'বাস', 'বোট', 'রিকশা', 'সিএনজি', 'রুট', 'transport', 'route'],
  lostfound: ['হারানো', 'প্রাপ্তি', 'lost', 'found'],
  citizens: ['নাগরিক', 'সেবা', 'সার্ভিস', 'citizen', 'service'],
}

/** Suggestions offered in a section's helpful empty state. */
export const SECTION_SUGGESTIONS: Record<SectionKey, string[]> = {
  fish: ['মাছ', 'ইলিশ', 'রুই'],
  market: ['বাজার', 'আলু', 'চাল'],
  donors: ['রফিক', 'O+', 'রক্ত'],
  doctors: ['ডাক্তার', 'মেডিসিন', 'চক্ষু'],
  hospitals: ['হাসপাতাল', 'ক্লিনিক', 'মদন'],
  education: ['কলেজ', 'স্কুল', 'মাদরাসা'],
  jobs: ['চাকরি', 'টিউশনি', 'শিক্ষক'],
  news: ['সংবাদ', 'খবর', 'মদন'],
  transport: ['যাতায়াত', 'বোট', 'বাস'],
  lostfound: ['হারানো', 'প্রাপ্তি', 'মোবাইল'],
  citizens: ['নাগরিক', 'জন্ম নিবন্ধন', 'পাসপোর্ট'],
}

/** Bengali script -> rough Latin phonemes, for Latin-name matching. */
const BN_TO_LATIN: Record<string, string> = {
  অ: 'a', আ: 'a', ই: 'i', ঈ: 'i', উ: 'u', ঊ: 'u', এ: 'e', ঐ: 'ai', ও: 'o', ঔ: 'ou',
  ক: 'k', খ: 'kh', গ: 'g', ঘ: 'gh', ঙ: 'ng', চ: 'ch', ছ: 'chh', জ: 'j', ঝ: 'jh', ঞ: 'ny',
  'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'b', 'ম': 'm', 'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh',
  'স': 's', 'হ': 'h', 'ড়': 'r', 'ঢ়': 'r', 'য়': 'y', 'ৎ': 't',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ে': 'e', 'ৈ': 'ai', 'ৌ': 'ou', '্য': '', 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n',
}

/** Normalises both scripts to a vowel-less consonant skeleton. */
export function phoneticKey(value: string): string {
  let latin = ''
  for (const char of value) {
    if (BN_TO_LATIN[char] !== undefined) latin += BN_TO_LATIN[char]
    else if (/[a-z]/i.test(char)) latin += char.toLowerCase()
  }
  return latin
    .replace(/ph/g, 'f')
    .replace(/q/g, 'k')
    .replace(/v/g, 'b')
    .replace(/z/g, 'j')
    .replace(/[aeiou]+/g, '')
    .replace(/[^a-z]/g, '')
}

function normal(value: string): string {
  return value.toLocaleLowerCase('bn').trim()
}

/** True when a term just names the whole section. */
function isSectionTerm(term: string, section: SectionKey): boolean {
  return SECTION_TERMS[section].some((word) => {
    const w = normal(word)
    return w.includes(term) || term.includes(w)
  })
}

/**
 * Matches a section-local query against a record's values.
 * Generic section terms are ignored; remaining terms must match by normal
 * substring OR by Latin/Bengali phonetic equivalence.
 */
export function matchesSectionQuery(
  section: SectionKey,
  query: string,
  values: Array<string | undefined | null>,
  allowPhonetic = true,
): boolean {
  const terms = normal(query).split(/[\s,،]+/).filter(Boolean)
  if (!terms.length) return true

  const specific = terms.filter((term) => !isSectionTerm(term, section))
  if (!specific.length) return true

  const fields = values.filter((value): value is string => Boolean(value)).map(normal)
  const phoneticFields = allowPhonetic ? fields.map(phoneticKey) : []

  return specific.every((term) => {
    if (fields.some((field) => field.includes(term))) return true
    // The phonetic fallback exists only for Latin-script input (e.g. "Rafiq"
    // -> "রফিকুল"). Applying it to Bengali terms makes short words like
    // "জমি" match unrelated cards, so Bengali queries use substring only.
    // Sections that pass allowPhonetic=false match strictly by substring.
    if (!allowPhonetic || !/[a-z]/i.test(term)) return false
    if (term.length < 3) return false
    const key = phoneticKey(term)
    if (key.length < 2) return false
    return phoneticFields.some((field) => field.includes(key))
  })
}
