import { bloodGroups } from '../constants'
import { phoneticKey } from './sectionSearch'
import {
  BloodDonor,
  BloodGroup,
  CitizenService,
  EducationInstitution,
  FishWholesaler,
  Hospital,
  JobPosting,
  LostFoundItem,
  MarketPrice,
  NewsItem,
  Notice,
  ServiceProvider,
  TransportRoute,
  ViewId,
} from '../types'

export type SearchKind =
  | 'donor'
  | 'doctor'
  | 'hospital'
  | 'ambulance'
  | 'dealer'
  | 'transport'
  | 'route'
  | 'price'
  | 'fish'
  | 'job'
  | 'institution'
  | 'news'
  | 'lostfound'
  | 'citizen'

/** All searchable sections, in the order shown in the admin panel. */
export const SEARCH_KINDS: SearchKind[] = [
  'price',
  'donor',
  'doctor',
  'hospital',
  'ambulance',
  'dealer',
  'transport',
  'route',
  'fish',
  'job',
  'institution',
  'news',
  'lostfound',
  'citizen',
]

export interface SearchHit {
  key: string
  kind: SearchKind
  title: string
  subtitle: string
  view: ViewId
  tab?: string
  query: string
  group?: BloodGroup
  /** Higher is a better match — used to pick the destination section. */
  score?: number
}

export interface SearchGroup {
  kind: SearchKind
  label: string
  view: ViewId
  tab?: string
  hits: SearchHit[]
  /** Best hit score in this group. */
  score?: number
}

export interface SearchData {
  donors: BloodDonor[]
  doctors: ServiceProvider[]
  hospitals: Hospital[]
  ambulances: ServiceProvider[]
  dealers: ServiceProvider[]
  transport: ServiceProvider[]
  routes: TransportRoute[]
  prices: MarketPrice[]
  fishPrices: MarketPrice[]
  wholesalers: FishWholesaler[]
  jobs: JobPosting[]
  institutions: EducationInstitution[]
  news: NewsItem[]
  notices: Notice[]
  lostFound: LostFoundItem[]
  citizens: CitizenService[]
}

/** Shape of the admin-controlled settings the engine needs. */
export interface SearchConfig {
  sections?: Partial<Record<SearchKind, boolean>>
  customItems?: Array<{
    id: string
    title: string
    subtitle: string
    kind: SearchKind
    query: string
    approved: boolean
  }>
}

const GROUP_LABELS: Record<SearchKind, string> = {
  donor: 'রক্তদাতা',
  doctor: 'ডাক্তার',
  hospital: 'হাসপাতাল',
  ambulance: 'অ্যাম্বুলেন্স',
  dealer: 'কৃষি ডিলার',
  transport: 'গাড়ি ভাড়া',
  route: 'যাতায়াতের রুট',
  price: 'বাজার দর',
  fish: 'হাওরের মাছ',
  job: 'চাকরি ও টিউশনি',
  institution: 'শিক্ষা প্রতিষ্ঠান',
  news: 'সংবাদ',
  lostfound: 'হারানো ও প্রাপ্তি',
  citizen: 'নাগরিক সেবা',
}

/** Bengali section labels, reused by the search results and the admin panel. */
export const SEARCH_LABELS = GROUP_LABELS

const KIND_VIEW: Record<SearchKind, { view: ViewId; tab?: string }> = {
  donor: { view: 'emergency', tab: 'blood' },
  doctor: { view: 'directory', tab: 'doctors' },
  hospital: { view: 'directory', tab: 'hospitals' },
  ambulance: { view: 'emergency', tab: 'emergency' },
  dealer: { view: 'market', tab: 'dealers' },
  transport: { view: 'transport' },
  route: { view: 'transport' },
  price: { view: 'market', tab: 'prices' },
  fish: { view: 'fish' },
  job: { view: 'jobs', tab: 'jobs' },
  institution: { view: 'directory', tab: 'education' },
  news: { view: 'news' },
  lostfound: { view: 'lostfound' },
  citizen: { view: 'citizens' },
}

/** Words that mean "food/market" — these must never route to blood/emergency. */
const FOOD_WORDS = [
  'চাল', 'আলু', 'পেঁয়াজ', 'পিয়াজ', 'ডিম', 'দুধ', 'মাংস', 'মুরগি',
  'সবজি', 'শাক', 'বেগুন', 'টমেটি', 'বীজ', 'সার', 'ধান', 'গম', 'চিনি',
  'লবণ', 'তেল', 'দাল', 'মসলা', 'হলুদ', 'আদা', 'রসুন', 'মরিচ',
  'rice', 'potato', 'onion', 'egg', 'food', 'vegetable', 'price', 'market',
]

const INTENT_KEYWORDS: Array<{ view: ViewId; tab?: string; words: string[]; label: string }> = [
  {
    view: 'market',
    tab: 'prices',
    label: 'বাজার দর',
    words: ['বাজার', 'দাম', 'দর', 'price', 'market', ...FOOD_WORDS],
  },
  {
    view: 'fish',
    label: 'হাওরের মাছ',
    words: ['মাছ', 'fish', 'আড়ত', 'ইলিশ', 'রুই', 'বোয়াল'],
  },
  {
    view: 'emergency',
    tab: 'blood',
    label: 'রক্তদাতা তালিকা',
    words: ['রক্ত', 'রক্তদাতা', 'blood', 'donor', 'গ্রুপ', 'group'],
  },
  {
    view: 'emergency',
    tab: 'emergency',
    label: 'জরুরি সেবা',
    words: ['জরুরি', 'অ্যাম্বুলেন্স', 'ambulance', 'হটলাইন', 'hotline', '৯৯৯', '999'],
  },
  {
    view: 'directory',
    tab: 'hospitals',
    label: 'হাসপাতাল ও ক্লিনিক',
    words: ['হাসপাতাল', 'hospital', 'ক্লিনিক', 'clinic', 'ডায়াগনস্টিক', 'স্বাস্থ্য কমপ্লেক্স'],
  },
  {
    view: 'directory',
    tab: 'doctors',
    label: 'ডাক্তার ও হাসপাতাল',
    words: ['ডাক্তার', 'doctor', 'চিকিৎসক'],
  },
  {
    view: 'citizens',
    label: 'নাগরিক সেবা',
    words: [
      'নাগরিক', 'nid', 'এনআইডি', 'জন্ম নিবন্ধন', 'পাসপোর্ট', 'passport',
      'জমি', 'নামজারি', 'ইউনিয়ন পরিষদ', 'ইউপি', 'সনদ', 'লাইসেন্স',
    ],
  },
  {
    view: 'directory',
    tab: 'education',
    label: 'শিক্ষা প্রতিষ্ঠান',
    words: ['শিক্ষা', 'স্কুল', 'কলেজ', 'মাদরাসা', 'প্রতিষ্ঠান', 'school', 'college'],
  },
  {
    view: 'jobs',
    tab: 'jobs',
    label: 'চাকরি ও টিউশনি',
    words: ['চাকরি', 'জব', 'job', 'টিউশনি', 'tuition', 'কর্মসংস্থান'],
  },
  {
    view: 'news',
    label: 'সংবাদ ও প্রেস ক্লাব',
    words: ['সংবাদ', 'খবর', 'news', 'প্রেস', 'সাংবাদিক'],
  },
  {
    view: 'lostfound',
    label: 'হারানো ও প্রাপ্তি',
    words: ['হারানো', 'প্রাপ্তি', 'lost', 'found'],
  },
  {
    view: 'transport',
    label: 'যাতায়াত',
    words: ['যাতায়াত', 'গাড়ি', 'ভাড়া', 'transport', 'car', 'বাস', 'বোট', 'রিকশা', 'সিএনজি', 'সময়সূচি'],
  },
]

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Section names are searchable too: "মাছ" matches the whole fish section. */
const SECTION_LABEL: Partial<Record<SearchKind, string>> = {
  price: 'বাজার দর পণ্য মূল্য',
  fish: 'মাছ হাওরের মাছ আড়ত',
  donor: 'রক্ত রক্তদাতা ডোনার',
  doctor: 'ডাক্তার চিকিৎসক',
  hospital: 'হাসপাতাল ক্লিনিক',
  ambulance: 'অ্যাম্বুলেন্স জরুরি সেবা',
  dealer: 'কৃষি ডিলার সার বীজ',
  transport: 'যাতায়াত গাড়ি ভাড়া বাস বোট',
  route: 'যাতায়াত রুট বাস বোট',
  job: 'চাকরি টিউশনি কর্মসংস্থান',
  institution: 'শিক্ষা প্রতিষ্ঠান স্কুল কলেজ',
  news: 'সংবাদ খবর প্রেস',
  lostfound: 'হারানো প্রাপ্তি',
  citizen: 'নাগরিক সেবা সার্ভিস',
}

/**
 * One normaliser for the whole app: Bengali digits become Arabic digits,
 * common spelling/blood-group variants are folded, and stray punctuation is
 * removed so a query matches the way people actually type it.
 */
export function normaliseSearchText(value: string | null | undefined): string {
  if (!value) return ''
  let text = String(value).toLocaleLowerCase('bn').trim()

  // Bengali digits -> 0-9 (phone numbers and prices are searchable too).
  text = text.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))

  // Spelling variants people use for the same thing.
  text = text
    .replace(/পেআঁজ|পিয়াজ|পেয়াজ/g, 'পেঁয়াজ')
    .replace(/নবীকরণ/g, 'নবায়ন')
    .replace(/হাওড়/g, 'হাওর')
    .replace(/এবি\s*([+\-])/g, 'ab$1')
    .replace(/ও\s*([+\-])/g, 'o$1')
    .replace(/এ\s*([+\-])/g, 'a$1')
    .replace(/বি\s*([+\-])/g, 'b$1')
    .replace(/[`´’‘]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')

  return text.trim()
}

/** Splits a query into normalised terms. */
export function searchTerms(query: string): string[] {
  return normaliseSearchText(query)
    .split(/[\s,،;:|]+/)
    .map((term) => term.replace(/^[+\-]+|[+\-]+$/g, ''))
    .filter(Boolean)
}

/** Score one term against one field. 0 means "no match". */
function fieldScore(term: string, value: string): number {
  const hay = normaliseSearchText(value)
  if (!term || !hay) return 0
  if (hay === term) return 10

  const words = hay.split(/[\s,;:()\-/]+/).filter(Boolean)
  if (words.includes(term)) return 9

  // Short terms must be a whole word or the start of the field. This stops
  // "চাল" from matching "চালক" (driver) in emergency-service details.
  if (term.length <= 3) {
    return hay.startsWith(term) ? 7 : 0
  }
  if (words.some((word) => word.startsWith(term))) return 8
  if (hay.startsWith(term)) return 7
  if (hay.includes(term)) return 4

  // Latin spelling of a Bengali name: "Rafiq" -> "রফিকুল". This is only for
  // Latin input — a Bengali term already matches by exact word/substring, and
  // folding it to a consonant skeleton creates false positives (e.g. "রক্ত"
  // matching an unrelated news item through a shared consonant skeleton).
  if (term.length >= 3 && /^[a-z]+$/.test(term)) {
    const key = phoneticKey(term)
    if (key.length >= 2 && phoneticKey(hay).includes(key)) return 5
  }
  return 0
}

/**
 * Every term has to match somewhere; the first (primary) field carries extra
 * weight so e.g. a price's item name beats a distant description match.
 */
export function scoreMatch(terms: string[], values: Array<string | undefined | null>): number {
  if (!terms.length) return 0
  const fields = values.filter((value): value is string => Boolean(value))
  let total = 0

  for (const term of terms) {
    let best = 0
    for (const field of fields) best = Math.max(best, fieldScore(term, field))
    if (!best) return 0
    total += best
  }

  const primary = fields[0] ?? ''
  const bonus = terms.reduce((sum, term) => sum + fieldScore(term, primary), 0)
  return total + Math.min(bonus, 12)
}

/** Section labels act as extra searchable text, so "মাছ" finds the fish list. */
function sectionScore(
  kind: SearchKind,
  terms: string[],
  values: Array<string | undefined | null>,
): number {
  const recordScore = scoreMatch(terms, values)
  if (recordScore) return recordScore
  const label = SECTION_LABEL[kind]
  return label ? scoreMatch(terms, [label]) : 0
}

/** Kept for components that only need a yes/no answer. */
export function matchesSearchQuery(query: string, values: Array<string | undefined | null>): boolean {
  const terms = searchTerms(query)
  return terms.length > 0 && scoreMatch(terms, values) > 0
}

/** Detects a blood group in free text such as "O+ রক্ত", "AB negative" or "ও+". */
export function extractBloodGroup(query: string): BloodGroup | null {
  const text = normaliseSearchText(query)
    .toUpperCase()
    .replace(/এ/g, 'E')

  const match = text.match(/(?:^|[^A-Z])(AB|A|B|O)\s*([+\-])(?![A-Z])/)
  if (match) {
    const candidate = `${match[1]}${match[2]}`
    if ((bloodGroups as readonly string[]).includes(candidate)) return candidate as BloodGroup
  }
  if (/নেগেটিভ|NEGATIVE|\bNEG\b/i.test(query)) {
    const letter = text.match(/\b(AB|A|B|O)\b/)
    if (letter) {
      const candidate = `${letter[1]}-`
      if ((bloodGroups as readonly string[]).includes(candidate)) return candidate as BloodGroup
    }
  }
  return null
}

/** Sections the query is obviously asking for, e.g. "ডাক্তার" → directory. */
export function detectIntents(query: string): Array<{ view: ViewId; tab?: string; label: string }> {
  const text = normaliseSearchText(query)
  if (!text) return []

  // Whole-word matching for single words (so "99999" is not the ৯৯৯
  // hotline), phrase matching for multi-word intents like "জন্ম নিবন্ধন".
  const words = text.split(/[\s,;:()+/\-]+/).filter(Boolean)
  const intents: Array<{ view: ViewId; tab?: string; label: string }> = []
  for (const intent of INTENT_KEYWORDS) {
    const matched = intent.words.some((word) => {
      const normalisedWord = normaliseSearchText(word)
      return normalisedWord.includes(' ')
        ? text.includes(normalisedWord)
        : words.includes(normalisedWord)
    })
    if (matched) {
      if (!intents.some((item) => item.view === intent.view && item.tab === intent.tab)) {
        intents.push({ view: intent.view, tab: intent.tab, label: intent.label })
      }
    }
  }
  return intents
}

function pushHits(
  groups: Map<SearchKind, SearchGroup>,
  kind: SearchKind,
  hits: SearchHit[],
  enabled: boolean,
) {
  if (!hits.length || !enabled) return
  const meta = KIND_VIEW[kind]
  const existing = groups.get(kind)
  if (existing) {
    existing.hits.push(...hits)
    existing.score = Math.max(existing.score ?? 0, ...hits.map((hit) => hit.score ?? 0))
  } else {
    groups.set(kind, {
      kind,
      label: GROUP_LABELS[kind],
      view: meta.view,
      tab: meta.tab,
      hits,
      score: Math.max(...hits.map((hit) => hit.score ?? 0)),
    })
  }
}

/**
 * The one global search. Searches every published dataset, honours the
 * admin's section switches, and adds approved custom search items.
 */
export function searchEverything(
  query: string,
  data: SearchData,
  config: SearchConfig = {},
): SearchGroup[] {
  const terms = searchTerms(query)
  const group = extractBloodGroup(query)
  const textTerms = terms.filter(
    (term) => !/^(ab|a|b|o)[+\-]?$/.test(term) && !/^[+\-]+$/.test(term),
  )

  if (!textTerms.length && !group) return []

  const enabled = (kind: SearchKind) => config.sections?.[kind] !== false
  const groups = new Map<SearchKind, SearchGroup>()
  const carry = textTerms.join(' ') || group || query

  const providerHits = (
    kind: SearchKind,
    providers: ServiceProvider[],
    view: ViewId,
    tab?: string,
  ): SearchHit[] =>
    providers
      .map((provider): SearchHit | null => {
        const values = [provider.name, provider.details, provider.area, provider.phone]
        const score = sectionScore(kind, textTerms, values)
        return score
          ? {
              key: `${kind}-${provider.id}`,
              kind,
              title: provider.name,
              subtitle: `${provider.details} • ${provider.area}`,
              view,
              tab,
              query: carry,
              score,
            }
          : null
      })
      .filter((hit): hit is SearchHit => Boolean(hit))

  // A detected blood group is the strongest possible signal for donors.
  const donorHits: SearchHit[] = data.donors
    .map((donor): SearchHit | null => {
      const score = group
        ? donor.bloodGroup === group
          ? 100
          : 0
        : sectionScore('donor', textTerms, [donor.name, donor.unionArea, donor.bloodGroup, donor.phone])
      return score
        ? {
            key: `donor-${donor.id}`,
            kind: 'donor' as const,
            title: donor.name,
            subtitle: `${donor.bloodGroup} • ${donor.unionArea}`,
            view: 'emergency' as ViewId,
            tab: 'blood',
            query: carry,
            group: group ?? donor.bloodGroup,
            score,
          }
        : null
    })
    .filter((hit): hit is SearchHit => Boolean(hit))
  pushHits(groups, 'donor', donorHits, enabled('donor'))

  if (!group) {
    pushHits(groups, 'doctor', providerHits('doctor', data.doctors, 'directory', 'doctors'), enabled('doctor'))
    pushHits(
      groups,
      'ambulance',
      providerHits('ambulance', data.ambulances, 'emergency', 'emergency'),
      enabled('ambulance'),
    )
    pushHits(groups, 'dealer', providerHits('dealer', data.dealers, 'market', 'dealers'), enabled('dealer'))
    pushHits(groups, 'transport', providerHits('transport', data.transport, 'transport'), enabled('transport'))
  }

  const simpleHits = <T extends { id: string }>(
    kind: SearchKind,
    records: T[],
    values: (record: T) => Array<string | undefined | null>,
    toHit: (record: T, score: number) => SearchHit,
  ): SearchHit[] =>
    records
      .map((record) => {
        const score = sectionScore(kind, textTerms, values(record))
        return score ? toHit(record, score) : null
      })
      .filter((hit): hit is SearchHit => Boolean(hit))

  pushHits(
    groups,
    'hospital',
    simpleHits(
      'hospital',
      data.hospitals,
      (h) => [h.name, h.type, h.address, (h.services ?? []).join(' ')],
      (h, score) => ({
        key: `hospital-${h.id}`,
        kind: 'hospital',
        title: h.name,
        subtitle: `${h.type} • ${h.address}`,
        view: 'directory',
        tab: 'hospitals',
        query: carry,
        score,
      }),
    ),
    enabled('hospital'),
  )

  pushHits(
    groups,
    'route',
    simpleHits(
      'route',
      data.routes,
      (r) => [r.name, r.mode, r.from, r.to, (r.schedule ?? []).join(' ')],
      (r, score) => ({
        key: `route-${r.id}`,
        kind: 'route',
        title: r.name,
        subtitle: `${r.mode} • ${r.fare} • ${r.from} → ${r.to}`,
        view: 'transport',
        query: carry,
        score,
      }),
    ),
    enabled('route'),
  )

  pushHits(
    groups,
    'citizen',
    simpleHits(
      'citizen',
      data.citizens,
      (s) => [s.name, s.office, s.address, (s.requiredDocs ?? []).join(' ')],
      (s, score) => ({
        key: `citizen-${s.id}`,
        kind: 'citizen',
        title: s.name,
        subtitle: `${s.office} • ${s.fee}`,
        view: 'citizens',
        query: carry,
        score,
      }),
    ),
    enabled('citizen'),
  )

  pushHits(
    groups,
    'price',
    simpleHits(
      'price',
      data.prices,
      (p) => [p.itemName, p.unit],
      (p, score) => ({
        key: `price-${p.id}`,
        kind: 'price',
        title: p.itemName,
        subtitle: `খুচরা ${p.retailPrice} • ${p.unit}`,
        view: 'market',
        tab: 'prices',
        query: carry,
        score,
      }),
    ),
    enabled('price'),
  )

  pushHits(
    groups,
    'fish',
    simpleHits(
      'fish',
      data.fishPrices,
      (p) => [p.itemName, p.unit],
      (p, score) => ({
        key: `fish-${p.id}`,
        kind: 'fish',
        title: p.itemName,
        subtitle: `খুচরা ${p.retailPrice} • ${p.unit}`,
        view: 'fish',
        query: carry,
        score,
      }),
    ),
    enabled('fish'),
  )

  pushHits(
    groups,
    'job',
    simpleHits(
      'job',
      data.jobs,
      (j) => [j.title, j.organization, j.location, j.category, j.description],
      (j, score) => ({
        key: `job-${j.id}`,
        kind: 'job',
        title: j.title,
        subtitle: `${j.category} • ${j.organization}`,
        view: 'jobs',
        tab: 'jobs',
        query: carry,
        score,
      }),
    ),
    enabled('job'),
  )

  pushHits(
    groups,
    'institution',
    simpleHits(
      'institution',
      data.institutions,
      (i) => [i.name, i.type, i.area, i.headName],
      (i, score) => ({
        key: `institution-${i.id}`,
        kind: 'institution',
        title: i.name,
        subtitle: `${i.type} • ${i.area}`,
        view: 'directory',
        tab: 'education',
        query: carry,
        score,
      }),
    ),
    enabled('institution'),
  )

  pushHits(
    groups,
    'news',
    simpleHits(
      'news',
      data.news,
      (n) => [n.title, n.category, n.content, n.source],
      (n, score) => ({
        key: `news-${n.id}`,
        kind: 'news',
        title: n.title,
        subtitle: `${n.category} • ${n.source}`,
        view: 'news',
        query: carry,
        score,
      }),
    ),
    enabled('news'),
  )

  pushHits(
    groups,
    'lostfound',
    simpleHits(
      'lostfound',
      data.lostFound,
      (i) => [i.itemName, i.type, i.location, i.description],
      (i, score) => ({
        key: `lostfound-${i.id}`,
        kind: 'lostfound',
        title: `${i.type}: ${i.itemName}`,
        subtitle: `${i.location} • ${i.date}`,
        view: 'lostfound',
        query: carry,
        score,
      }),
    ),
    enabled('lostfound'),
  )

  // Admin-added search items (only the approved ones are public).
  for (const item of config.customItems ?? []) {
    if (!item.approved || !enabled(item.kind)) continue
    const meta = KIND_VIEW[item.kind]
    pushHits(
      groups,
      item.kind,
      [
        {
          key: `custom-${item.id}`,
          kind: item.kind,
          title: item.title,
          subtitle: item.subtitle,
          view: meta.view,
          tab: meta.tab,
          query: item.query || carry,
          score: 5,
        },
      ],
      true,
    )
  }

  // Best matches first, then the groups with the most hits.
  for (const groupResult of groups.values()) {
    groupResult.hits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }
  return Array.from(groups.values()).sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0) || b.hits.length - a.hits.length,
  )
}

/** Total number of individual records matched. */
export function countHits(groups: SearchGroup[]): number {
  return groups.reduce((total, group) => total + group.hits.length, 0)
}

/** A flat, de-duplicated list for live suggestions — at most `limit` hits. */
export function suggestionHits(groups: SearchGroup[], limit = 8): SearchHit[] {
  const seenKeys = new Set<string>()
  const seenTitles = new Set<string>()
  return groups
    .flatMap((group) => group.hits)
    .filter((hit) => {
      const titleKey = `${hit.kind}:${hit.title.trim().toLocaleLowerCase('bn')}`
      if (seenKeys.has(hit.key) || seenTitles.has(titleKey)) return false
      seenKeys.add(hit.key)
      seenTitles.add(titleKey)
      return true
    })
    .slice(0, limit)
}

export interface SearchDestination {
  view: ViewId
  tab?: string
  group?: BloodGroup | null
  /** The query to carry into the section (cleaned when possible). */
  q?: string
}

/**
 * Picks the section that can actually answer the query.
 *
 * A blood group always wins for donors. Real, high-scoring matches decide the
 * destination before any keyword intent, and food queries are explicitly kept
 * away from the blood/emergency section.
 */
export function bestSectionForQuery(
  query: string,
  groups: SearchGroup[],
): SearchDestination {
  const bloodGroup = extractBloodGroup(query)
  if (bloodGroup) {
    return { view: 'emergency', tab: 'blood', group: bloodGroup, q: bloodGroup }
  }

  const text = normaliseSearchText(query)
  const isFood = FOOD_WORDS.some((word) => text.includes(normaliseSearchText(word)))

  const best = groups[0]
  if (best && best.score && best.score > 0) {
    // Never send a food query to the blood/emergency page, even if a provider
    // description contains a stray matching syllable.
    if (!isFood || best.view !== 'emergency') {
      return { view: best.view, tab: best.tab, group: null, q: best.hits[0]?.query }
    }
    if (isFood) {
      return { view: 'market', tab: 'prices', group: null, q: text }
    }
  }

  if (isFood) return { view: 'market', tab: 'prices', group: null, q: text }

  const intents = detectIntents(query)
  if (intents.length) return { view: intents[0].view, tab: intents[0].tab, group: null, q: text }

  // No match anywhere — stay on the homepage and show the empty state there.
  return { view: 'home', group: null, q: text }
}
