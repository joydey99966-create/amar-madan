import { toBanglaCount, toBanglaNumber } from './formatters'

/** One part of a combined count, e.g. "১০ জন ডাক্তার". */
export interface CountPart {
  label: string
  count: number
  unit: string
}

/** A section count: the correct total plus the breakdown it is made of. */
export interface SectionCount {
  /** Sum of every sub-list that belongs to this section. */
  total: number
  /** Unit of the total, e.g. "টি". */
  unit: string
  /** Every sub-list that was counted. */
  parts: CountPart[]
  /** "১০ জন ডাক্তার • ৭ টি হাসপাতাল" */
  detail: string
}

/** Every list the homepage counters are built from. */
export interface CountInput {
  donors: number
  doctors: number
  hospitals: number
  ambulances: number
  technicians: number
  /** Emergency hotline cards shown on the emergency page. */
  emergencyCards: number
  rentACars: number
  /** Agro machinery + BCIC dealers. */
  machinery: number
  agroDealers: number
  /** Tuition posts (type "টিউশনি") — never includes real jobs. */
  tuitionPosts: number
  /** Real jobs — never includes tuition posts. */
  jobs: number
  lostFound: number
  marketPrices: number
  fishPrices: number
  news: number
  citizens: number
  education: number
  routes: number
}

function part(label: string, count: number, unit: string): CountPart {
  return { label, count, unit }
}

function build(parts: CountPart[], unit: string): SectionCount {
  const total = parts.reduce((sum, item) => sum + item.count, 0)
  return {
    total,
    unit,
    parts,
    detail: parts.map((item) => `${toBanglaCount(item.count, item.unit)} ${item.label}`).join(' • '),
  }
}

/**
 * The one place every homepage counter is computed.
 *
 * A section that shows several lists (doctors + hospitals, tuition + jobs,
 * emergency cards + ambulances + technicians, machinery + BCIC dealers) counts
 * every one of them — never just one sub-list.
 */
export function buildSectionCounts(input: CountInput): Record<string, SectionCount> {
  return {
    blood: build([part('রক্তদাতা', input.donors, 'জন')], 'জন'),
    ambulance: build([part('অ্যাম্বুলেন্স', input.ambulances, 'টি')], 'টি'),
    doctors: build(
      [part('ডাক্তার', input.doctors, 'জন'), part('হাসপাতাল', input.hospitals, 'টি')],
      'টি',
    ),
    emergency: build(
      [
        part('জরুরি কার্ড', input.emergencyCards, 'টি'),
        part('অ্যাম্বুলেন্স', input.ambulances, 'টি'),
        part('মিস্ত্রি', input.technicians, 'টি'),
      ],
      'টি',
    ),
    // The published route table (12) is the single source of truth for the
    // transport count — the two rental providers are a sub-list, not the total.
    transport: build([part('যাতায়াত রুট', input.routes, 'টি')], 'টি'),
    lostfound: build([part('বিজ্ঞপ্তি', input.lostFound, 'টি')], 'টি'),
    market: build([part('পণ্য', input.marketPrices, 'টি')], 'টি'),
    fish: build([part('মাছের দর', input.fishPrices, 'টি')], 'টি'),
    agro: build(
      [part('যন্ত্রপাতি', input.machinery, 'টি'), part('BCIC ডিলার', input.agroDealers, 'টি')],
      'টি',
    ),
    tuition: build(
      [
        part('টিউশনি পোস্ট', input.tuitionPosts, 'টি'),
        part('কর্মসংস্থান', input.jobs, 'টি'),
      ],
      'টি',
    ),
    education: build([part('প্রতিষ্ঠান', input.education, 'টি')], 'টি'),
    hospitals: build([part('হাসপাতাল', input.hospitals, 'টি')], 'টি'),
    news: build([part('সংবাদ', input.news, 'টি')], 'টি'),
    citizens: build([part('সেবা', input.citizens, 'টি')], 'টি'),
  }
}

/** Plain number per section, for consumers that only need the total. */
export function totalsBySection(counts: Record<string, SectionCount>): Record<string, number> {
  return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value.total]))
}

/** "১৭ টি" — Bengali digits with a space before the unit. */
export function formatCount(value: number, unit: string): string {
  return toBanglaCount(value, unit)
}

/** "১৭" — Bengali digits only. */
export function formatNumber(value: number): string {
  return toBanglaNumber(value)
}
