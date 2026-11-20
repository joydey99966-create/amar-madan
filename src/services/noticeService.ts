import {
  STORAGE_KEYS,
  DEFAULT_NOTICE_CATEGORY,
  noticeCategoryColor,
} from '../constants'
import { noticeNewsSeed, correctDemoNotice, toArticle } from '../data/noticeNewsSeed'
import { assetUrl } from '../data/photos'
import { AdminNotice, NewsItem, Notice } from '../types'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

const FALLBACK_SOURCE = 'উপজেলা কার্যালয়, মদন'

/** Normalises older records so every item has all fields the UI needs. */
function normalize(notice: Partial<AdminNotice> & { id: string }): AdminNotice {
  const content = (notice.content ?? '').trim()
  // A record saved by an older version can have an empty date/body. Restore
  // them from the bundled seed (matched by id) — the date/body already exist
  // in the site's own data, so nothing is invented. n1 keeps its stored date.
  const seed = noticeNewsSeed.find((item) => item.id === notice.id)
  const date = (notice.date ?? '').trim() || seed?.date || ''
  const rawBody = content || seed?.content || ''
  const withTitle = (notice.title ?? '').trim() || seed?.title || 'নোটিশ'
  // The stored body stays exactly as the admin wrote it. Public pages render
  // it as a multi-paragraph article via toArticle(); the admin panel keeps the
  // raw value so short bodies can be spotted and completed before publishing.
  const base = {
    id: notice.id,
    title: withTitle,
    summary: (notice.summary ?? '').trim() || rawBody.replace(/\s+/g, ' '),
    content: rawBody,
    category: (notice.category ?? '').trim() || DEFAULT_NOTICE_CATEGORY,
    date,
    source: (notice.source ?? '').trim() || seed?.source || FALLBACK_SOURCE,
    priority: notice.priority === 'urgent' ? 'urgent' : 'normal',
    image: (() => {
      const image = notice.image?.trim() || seed?.image
      if (!image) return undefined
      // Bundled images are stored as "/images/…"; make them base-aware so they
      // also load from the /amar-madan/ GitHub Pages deployment.
      return image.startsWith('/') ? assetUrl(image) : image
    })(),
    lastUpdated: notice.lastUpdated?.trim() || seed?.lastUpdated || undefined,
    expiresAt: notice.expiresAt?.trim() || seed?.expiresAt || undefined,
    approved: notice.approved !== false,
    visible: notice.visible !== false,
  } as AdminNotice
  // Re-apply the demo category/body corrections to legacy stored records.
  return correctDemoNotice(base)
}

/** Public notice-board shape. */
function toNotice(notice: AdminNotice): Notice {
  return {
    id: notice.id,
    tag: notice.category,
    title: notice.title,
    detail: notice.summary,
    color: noticeCategoryColor(notice.category),
    date: notice.date,
    source: notice.source,
    // Multi-paragraph article for the detail page; built from stored facts.
    body: toArticle(notice.content, notice.title, notice.source, notice.date),
    priority: notice.priority,
    image: notice.image,
    lastUpdated: notice.lastUpdated,
  }
}

/** Public news-list shape — the very same records, viewed differently. */
function toNewsItem(notice: AdminNotice): NewsItem {
  return {
    id: notice.id,
    title: notice.title,
    category: notice.category,
    content: toArticle(notice.content, notice.title, notice.source, notice.date),
    date: notice.date,
    source: notice.source,
    image: notice.image,
    lastUpdated: notice.lastUpdated,
  }
}

export const noticeService = {
  /** All records, including pending/hidden ones (admin panel only). */
  getAdminNotices(): AdminNotice[] {
    const stored = storageService.get<AdminNotice[] | null>(STORAGE_KEYS.NOTICES, null)
    // A missing key seeds the bundled list; once stored, the admin owns it.
    if (Array.isArray(stored)) {
      const normalized = stored
        .filter((notice) => notice && typeof notice.id === 'string')
        .map((notice) => normalize(notice))
      if (normalized.length !== stored.length) {
        storageService.set(STORAGE_KEYS.NOTICES, normalized)
      }
      return normalized
    }
    storageService.set(STORAGE_KEYS.NOTICES, noticeNewsSeed)
    return noticeNewsSeed
  },

  /** Approved + visible + in-date records — the only list public pages read. */
  getPublished(): AdminNotice[] {
    const today = new Date().toISOString().slice(0, 10)
    return noticeService.getAdminNotices().filter(
      (notice) =>
        notice.approved &&
        notice.visible !== false &&
        // An expired event stops being "আজকের নোটিশ" automatically. Expiry is
        // inclusive (the event still shows on its last day).
        (!notice.expiresAt || notice.expiresAt >= today),
    )
  },

  /** Homepage notice board. */
  getPublishedNotices(): Notice[] {
    return noticeService.getPublished().map(toNotice)
  },

  /** /news list — same items, same dates, same categories. */
  getPublishedNews(): NewsItem[] {
    return noticeService.getPublished().map(toNewsItem)
  },

  /** Looks up a single record for the /news/:id deep link. */
  getPublishedById(id: string): Notice | undefined {
    const found = noticeService.getPublished().find((notice) => notice.id === id)
    return found ? toNotice(found) : undefined
  },

  saveAll(notices: AdminNotice[]): AdminNotice[] {
    const normalized = notices.map((notice) => normalize(notice))
    storageService.set(STORAGE_KEYS.NOTICES, normalized)
    notifyDataChanged('notices')
    return normalized
  },

  addNotice(input: Omit<AdminNotice, 'id'>): AdminNotice[] {
    const notice = normalize({ ...input, id: `n-${Date.now()}`, approved: false })
    return noticeService.saveAll([notice, ...noticeService.getAdminNotices()])
  },

  updateNotice(id: string, input: Omit<AdminNotice, 'id'>): AdminNotice[] {
    return noticeService.saveAll(
      noticeService
        .getAdminNotices()
        .map((notice) => (notice.id === id ? normalize({ ...notice, ...input, id }) : notice)),
    )
  },

  deleteNotice(id: string): AdminNotice[] {
    return noticeService.saveAll(
      noticeService.getAdminNotices().filter((notice) => notice.id !== id),
    )
  },

  /**
   * Admin-visible publish rule: a notice cannot be published with an empty
   * publication date or an empty body. Incomplete items stay pending so Joy
   * can complete them first. Returns true when the item was publishable.
   */
  canPublish(notice: AdminNotice): boolean {
    return Boolean(notice.date?.trim()) && Boolean(notice.content?.trim())
  },

  approveNotice(id: string, approved: boolean): AdminNotice[] {
    return noticeService.saveAll(
      noticeService
        .getAdminNotices()
        .map((notice) =>
          notice.id === id
            ? { ...notice, approved: approved && noticeService.canPublish(notice) }
            : notice,
        ),
    )
  },

  setNoticeVisibility(id: string, visible: boolean): AdminNotice[] {
    return noticeService.saveAll(
      noticeService
        .getAdminNotices()
        .map((notice) => (notice.id === id ? { ...notice, visible } : notice)),
    )
  },
}
