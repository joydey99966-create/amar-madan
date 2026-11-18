import { LucideIcon } from 'lucide-react'

/** The five core sections of the app, shared by the header nav and the mobile bottom bar. */
export type NavTabId = 'home' | 'market' | 'emergency' | 'jobs' | 'directory'

/**
 * Every screen the single page app is able to render.
 *
 * Navigation is always validated against this list (see `isViewId`), so a
 * stale or misspelled route id can never land the visitor on a blank page.
 */
export type ViewId =
  | NavTabId
  | 'services'
  | 'profile'
  | 'transport'
  | 'lostfound'
  | 'news'
  | 'fish'
  | 'citizens'

export interface NavItem {
  id: NavTabId
  label: string
  /** Compact label used where horizontal space is tight (mobile bottom bar, desktop header). */
  shortLabel?: string
  icon: LucideIcon
}

export type CategoryGroup = 'emergency' | 'agro' | 'community'

export interface Category {
  id: string
  name: string
  english: string
  icon: LucideIcon
  color: string
  background: string
  /**
   * Optional static fallback label. Live counts are injected at render time
   * from the real data, so this is never used for the badge on the home grid.
   */
  count?: string
  keywords?: string
  group: CategoryGroup
}

export interface Hotline {
  name: string
  phone: string
  dial: string
  icon: LucideIcon
}

export interface Notice {
  /** Stable id, used as the React key and for deep links inside the detail view. */
  id: string
  tag: string
  title: string
  /** Short one line summary shown inside the notice list. */
  detail: string
  color: string
  /** Bangla publication date, e.g. "১৫ নভেম্বর ২০২৬". */
  date: string
  /** Where the notice came from, e.g. "উপজেলা স্বাস্থ্য কমপ্লেক্স". */
  source: string
  /** Full text of the notice — only shown in the notice detail view. */
  body: string
  priority?: 'normal' | 'urgent'
  /** Optional bundled photo, carried through to the news list. */
  image?: string
  /** ISO date the item was last confirmed. */
  lastUpdated?: string
}

/**
 * A notice exactly as the admin panel stores it.
 *
 * The homepage notice board renders these records, so every field the board
 * shows (title, category, date, source) is editable by the admin.
 */
export interface AdminNotice {
  id: string
  title: string
  /** One line summary shown on the board card. */
  summary: string
  /** Full text shown in the notice detail view. */
  content: string
  /** Board category — decides the chip colour (স্বাস্থ্য, কৃষি, শিক্ষা …). */
  category: string
  /** Publication date — Bangla text or an ISO date. */
  date: string
  /** Where the notice came from. */
  source: string
  priority: 'normal' | 'urgent'
  /** Optional bundled photo. */
  image?: string
  /** ISO date the record was last confirmed. */
  lastUpdated?: string
  /** New records stay hidden from the public until an admin approves them. */
  approved?: boolean
  /** Admin-controlled visibility. */
  visible?: boolean
}
