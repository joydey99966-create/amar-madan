import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * Admin-controlled display order, ranked by real usefulness:
 * emergency → blood → ambulance → doctors → citizens → market → fish →
 * transport → jobs → news → lost & found → agro → education.
 *
 * Reordering is presentation logic only — no colours, fonts or data change.
 */
export interface DisplayOrder {
  /** Category tile ids (homepage + "সব সেবা"). */
  categories: string[]
  /** Core nav tabs (bottom bar + desktop header). */
  nav: string[]
  /** Tabs shown in the fixed mobile bottom bar (jobs lives in the side menu). */
  bottomNav: string[]
  /** Side-menu keys, e.g. "directory-doctors". */
  side: string[]
  /** Profile quick-link ids. */
  quick: string[]
  /** Footer quick-link ids. */
  footer: string[]
}

const KEY = 'amar-madan-display-order'

export const DEFAULT_ORDER: DisplayOrder = {
  categories: [
    'emergency', 'blood', 'ambulance', 'doctors', 'citizens', 'market',
    'fish', 'transport', 'tuition', 'news', 'lostfound', 'agro', 'education',
  ],
  nav: ['home', 'emergency', 'market', 'directory', 'jobs'],
  // "চাকরি ও টিউশনি" is intentionally absent — it is reachable from the side
  // menu, homepage tile, footer and profile instead.
  bottomNav: ['home', 'emergency', 'market', 'directory'],
  side: [
    'directory-doctors', 'citizens', 'fish', 'transport', 'news',
    'lostfound', 'directory-education', 'services', 'profile',
  ],
  quick: [
    'emergency-blood', 'emergency-help', 'citizens', 'market', 'fish',
    'transport', 'lostfound', 'jobs', 'news', 'services', 'directory',
  ],
  footer: [
    'home', 'blood', 'hotline', 'doctors', 'citizens', 'market', 'fish',
    'transport', 'jobs', 'news', 'lostfound', 'services', 'profile',
  ],
}

type ListKey = keyof DisplayOrder

export const displayOrderService = {
  get(): DisplayOrder {
    const stored = storageService.get<Partial<DisplayOrder> | null>(KEY, null)
    if (!stored || typeof stored !== 'object') return { ...DEFAULT_ORDER }
    const result = { ...DEFAULT_ORDER }
    ;(Object.keys(DEFAULT_ORDER) as ListKey[]).forEach((key) => {
      if (Array.isArray(stored[key]) && stored[key]!.length === DEFAULT_ORDER[key].length) {
        result[key] = stored[key] as string[]
      }
    })
    return result
  },

  save(order: DisplayOrder): DisplayOrder {
    storageService.set(KEY, order)
    notifyDataChanged('order')
    return order
  },

  reset(): DisplayOrder {
    storageService.remove(KEY)
    notifyDataChanged('order')
    return { ...DEFAULT_ORDER }
  },

  /** Sorts items by a stored id order; unlisted items keep their original tail. */
  sortById<T extends { id: string }>(items: T[], ids: string[]): T[] {
    const index = new Map(ids.map((id, i) => [id, i]))
    return [...items].sort((a, b) => (index.get(a.id) ?? 999) - (index.get(b.id) ?? 999))
  },

  /** Sorts items by a `key` field (used where several entries share an id). */
  sortByKey<T extends { key: string }>(items: T[], keys: string[]): T[] {
    const index = new Map(keys.map((key, i) => [key, i]))
    return [...items].sort((a, b) => (index.get(a.key) ?? 999) - (index.get(b.key) ?? 999))
  },

  /** Keeps only the listed ids, in list order — used where some items are intentionally omitted. */
  pickById<T extends { id: string }>(items: T[], ids: string[]): T[] {
    const byId = new Map(items.map((item) => [item.id, item]))
    return ids.map((id) => byId.get(id)).filter((item): item is T => Boolean(item))
  },
}
