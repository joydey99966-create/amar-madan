import { initialNews } from './mockData'
import { defaultNotices } from '../constants/navigation'
import { AdminNotice } from '../types'

/**
 * Category corrections for press-club items that were filed under the wrong
 * section. This is a classification fix, not a change to any demo value.
 */
export const NEWS_CATEGORY_FIX: Record<string, string> = {
  n4: 'স্বাস্থ্য', // বিনামূল্যে চক্ষু পরীক্ষা শিবির — not "সংস্কৃতি"
  n8: 'সমাজ কল্যাণ', // শীতে কম্বল বিতরণ — not "সংস্কৃতি"
}

/** Re-applies the demo category correction to a stored record with a known id. */
export function correctDemoNotice<T extends { id: string; category: string }>(notice: T): T {
  const category = NEWS_CATEGORY_FIX[notice.id]
  if (!category) return notice
  return { ...notice, category }
}

/**
 * Expiry dates for time-bound demo notices, taken from the dates already in
 * their demo text (18 / 20 November 2026). Admin-editable on every record.
 */
const DEMO_NOTICE_EXPIRY: Record<string, string> = {
  'notice-eye-camp': '2026-11-18',
  'notice-nid-correction': '2026-11-20',
  'notice-college-admission': '2026-11-20',
}

/** Number of sentences in a body — the admin panel flags anything below 3. */
export function countSentences(value: string): number {
  return (value || '')
    .split(/[।.!?]/)
    .map((part) => part.trim())
    .filter(Boolean).length
}

const GENERATED_PUBLICATION = /\(প্রকাশ:[^)]*\)\s*$/u
const GENERATED_DETAILS = /বিস্তারিত জানতে\s+[^।\n]*?\s*এর\s+সাথে\s+যোগাযোগ\s+করুন\s*।\s*$/u

/**
 * Renders a stored body as a multi-paragraph article for public pages.
 *
 * Every paragraph is built ONLY from facts already stored on the record — its
 * title, body sentences, source and publication date. Short fragments are laid
 * out as separate paragraphs; a body that is already a full article (>= 3
 * sentences) or already multi-paragraph is returned verbatim. No fact is ever
 * invented, and the stored admin value is left untouched.
 */
export function toArticle(content: string, title: string, source: string, date: string): string {
  const base = (content || '').trim()
  if (!base) return ''
  // A blank line is an authored paragraph break — keep the article verbatim.
  if (/\n\s*\n/.test(base)) return base

  // Legacy editors often stored one sentence per line. Collapse those single
  // newlines so the sentences can be laid out as proper paragraphs below.
  const oneLine = base.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
  const clean = oneLine
    .replace(GENERATED_PUBLICATION, '')
    .replace(GENERATED_DETAILS, '')
    .trim()

  // A complete stored article (3+ sentences) stays as-is — no rewriting of
  // demo content. A short fragment with a generated tail is always expanded.
  if (!oneLine.includes('(প্রকাশ:') && countSentences(clean) >= 3) return base

  const paragraphs: string[] = []
  const lead = (title || '').trim()
  if (lead && !clean.includes(lead)) paragraphs.push(`${lead}।`)

  clean
    .split(/।/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((sentence) => paragraphs.push(`${sentence}।`))

  if ((source || '').trim()) {
    paragraphs.push(`বিস্তারিত জানতে ${source.trim()} এর সাথে যোগাযোগ করুন।`)
  }
  if ((date || '').trim()) paragraphs.push(`(প্রকাশ: ${date.trim()})`)

  return paragraphs.join('\n\n')
}

/** Backwards-compatible alias — kept for older callers. */
export function fullBody(content: string, title: string, source: string, date: string): string {
  return toArticle(content, title, source, date)
}

/**
 * The single notice/news dataset.
 *
 * Bundled notices (full articles) and press-club news are merged into one list,
 * so the homepage board and /news always show the same items. Values are taken
 * verbatim from the existing demo data — nothing is rewritten here.
 *
 * This is only a seed: the admin panel owns the list once it is in localStorage.
 */
export const noticeNewsSeed: AdminNotice[] = [
  ...defaultNotices.map<AdminNotice>((notice) => ({
    id: notice.id,
    title: notice.title,
    summary: notice.detail,
    content: notice.body,
    category: notice.tag,
    date: notice.date,
    source: notice.source,
    // Each notice/news item carries its own publication date as its freshness
    // stamp — never a single bulk-stamped date for the whole list.
    lastUpdated: notice.date,
    priority: notice.priority ?? 'normal',
    // Expiry derived from the event dates already present in the demo copy —
    // no new date is invented. Past events leave the "আজকের নোটিশ" board.
    expiresAt: DEMO_NOTICE_EXPIRY[notice.id],
    approved: true,
    visible: true,
  })),
  ...initialNews.map<AdminNotice>((item) => {
    const category = NEWS_CATEGORY_FIX[item.id] ?? item.category
    return {
      id: item.id,
      title: item.title,
      summary: item.content,
      // Keep the original demo value as the editable field. Public pages lay
      // it out as paragraphs through toArticle(); the admin still sees (and can
      // improve) the exact stored text.
      content: item.content,
      category,
      date: item.date,
      source: item.source,
      image: item.image,
      lastUpdated: item.lastUpdated,
      priority: category === 'জরুরি নোটিশ' ? 'urgent' : 'normal',
      approved: true,
      visible: true,
    }
  }),
]
