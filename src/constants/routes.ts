import { ViewId } from '../types'

/**
 * The deploy base. Vite injects "/" on the dev server and "/amar-madan/" in a
 * GitHub Pages build. Keeping it here means every route works in both places.
 */
export const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

/** Adds the deploy base to an app route, e.g. "/bazar" -> "/amar-madan/bazar". */
export function withBase(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}` || '/'
}

/** Removes the deploy base from a pathname so route matching works everywhere. */
export function stripBase(pathname: string): string {
  if (!BASE_PATH) return pathname
  if (pathname === BASE_PATH) return '/'
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length)
  return pathname
}

/**
 * Real, shareable URLs for every section of the app.
 *
 * The path is the single source of truth for "which section am I on", so the
 * browser back/forward buttons, bookmarks and direct links all behave exactly
 * like a normal multi-page website.
 */
export const ROUTE_PATHS: Record<ViewId, string> = {
  home: '/',
  market: '/bazar',
  emergency: '/rokto',
  jobs: '/jobs',
  directory: '/directory',
  services: '/services',
  profile: '/profile',
  transport: '/yatayat',
  lostfound: '/harano',
  news: '/news',
  fish: '/haoar-mach',
  citizens: '/nagorik-seba',
}

/** Reverse lookup used to resolve a URL back to a section. */
export const PATH_TO_VIEW: Record<string, ViewId> = Object.entries(ROUTE_PATHS).reduce(
  (acc, [view, path]) => {
    acc[path] = view as ViewId
    return acc
  },
  {} as Record<string, ViewId>,
)

/** Per-section Bengali page title / description (SEO + share previews). */
export const ROUTE_META: Record<ViewId, { title: string; description: string }> = {
  home: {
    title: 'আমার মদন — মদন উপজেলা সেবা ও তথ্য',
    description: 'মদন উপজেলার জরুরি সেবা, রক্তদাতা, বাজার দর ও স্থানীয় তথ্য এক জায়গায়।',
  },
  market: {
    title: 'বাজার দর ও কৃষি সেবা — আমার মদন',
    description: 'মদন উপজেলার দৈনিক বাজার দর, সার-বীজ ডিলার ও কৃষি যন্ত্রপাতি ভাড়ার তথ্য।',
  },
  emergency: {
    title: 'রক্তদাতা ও জরুরি সেবা — আমার মদন',
    description: 'মদন উপজেলার রক্তদাতা তালিকা, অ্যাম্বুলেন্স, ডাক্তার ও জরুরি হটলাইন।',
  },
  jobs: {
    title: 'চাকরি ও টিউশনি — আমার মদন',
    description: 'মদন উপজেলার টিউশনি কেন্দ্র, কোচিং ও সক্রিয় চাকরির বিজ্ঞপ্তি।',
  },
  directory: {
    title: 'স্থানীয় ডিরেক্টরি — আমার মদন',
    description: 'মদন উপজেলার ডাক্তার, হাসপাতাল ও শিক্ষা প্রতিষ্ঠানের তথ্য।',
  },
  services: {
    title: 'সব সেবা — আমার মদন',
    description: 'মদন উপজেলার সব সেবা এক তালিকায় — যেকোনো সেবায় সরাসরি যান।',
  },
  profile: {
    title: 'সাইটের তথ্য ও পরিসংখ্যান — আমার মদন',
    description: 'সাইটে প্রকাশিত তথ্যের সংখ্যা ও দ্রুত লিংক।',
  },
  transport: {
    title: 'যাতায়াত ও গাড়ি ভাড়া — আমার মদন',
    description: 'মদন উপজেলার গাড়ি ভাড়ার প্রদানকারী ও যাতায়াত ভাড়ার অনুমান।',
  },
  lostfound: {
    title: 'হারানো ও প্রাপ্তি — আমার মদন',
    description: 'মদন উপজেলায় হারানো জিনিস খোঁজা ও পাওয়া জিনিস ফেরত দেওয়ার তালিকা।',
  },
  news: {
    title: 'সংবাদ ও প্রেস ক্লাব — আমার মদন',
    description: 'মদন উপজেলার স্থানীয় সংবাদ, প্রেস ক্লাব ও সাংবাদিকদের তথ্য।',
  },
  fish: {
    title: 'হাওরের মাছ বাজার — আমার মদন',
    description: 'নীল হাওরের মাছের দৈনিক দর ও মাছ আড়তের তালিকা।',
  },
  citizens: {
    title: 'নাগরিক সেবা — আমার মদন',
    description: 'NID, জন্ম নিবন্ধন, জমি, পাসপোর্ট ও ইউনিয়ন পরিষদের সেবার অফিস, ফি ও কাগজপত্রের তালিকা।',
  },
}

/** Extracts the notice id from a /news/:id deep link. */
export function noticeIdFromPath(pathname: string): string | null {
  let path = stripBase(pathname)
  try {
    path = decodeURIComponent(path)
  } catch {
    // keep the raw path when it is not valid percent-encoding
  }
  const match = path.match(/^\/news\/([^/]+)\/?$/)
  return match ? match[1] : null
}

/** Builds the full URL (path + optional query params) for a section. */
export function pathForView(
  view: ViewId,
  params?: { q?: string; group?: string; tab?: string; noticeId?: string },
): string {
  const path = ROUTE_PATHS[view] ?? '/'
  // A notice/news deep link owns the path: /news/:id
  if (view === 'news' && params?.noticeId) {
    return `${path}/${encodeURIComponent(params.noticeId.trim())}`
  }
  const search = new URLSearchParams()
  const q = params?.q?.trim()
  const group = params?.group?.trim()
  const tab = params?.tab?.trim()
  if (q) search.set('q', q)
  if (group) search.set('group', group)
  if (tab) search.set('tab', tab)
  const queryString = search.toString()
  return withBase(queryString ? `${path}?${queryString}` : path)
}

/** Resolves a pathname (e.g. "/bazar/") to a known section id. */
export function viewFromPath(pathname: string): ViewId | null {
  let path = stripBase(pathname)
  try {
    path = decodeURIComponent(path)
  } catch {
    // keep the raw path when it is not valid percent-encoding
  }

  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)

  const normalised = path.toLowerCase()
  if (normalised in PATH_TO_VIEW) return PATH_TO_VIEW[normalised]

  // Notice/news detail deep links: /news/:id still belong to the news section.
  if (normalised.startsWith('/news/') && normalised.length > '/news/'.length) return 'news'

  // Legacy hash links such as `/#home` still land on the matching section.
  for (const [viewPath, view] of Object.entries(PATH_TO_VIEW)) {
    if (viewPath !== '/' && normalised === viewPath.toLowerCase()) return view
  }
  return null
}
