import { useCallback, useEffect, useMemo, useState } from 'react'
import { bloodGroups } from '../constants'
import {
  noticeIdFromPath,
  pathForView,
  ROUTE_META,
  stripBase,
  viewFromPath,
  PATH_ALIASES,
} from '../constants/routes'
import { BloodGroup, ViewId } from '../types'

export interface RouteState {
  view: ViewId
  /** Free-text search carried from the homepage into the section. */
  query: string
  /** Blood group shorthand such as "O+" when the search asked for blood. */
  group: BloodGroup | null
  /** Sub-tab inside the section, e.g. "education", "prices", "blood". */
  tab: string | null
  /** Notice/news id when a /news/:id detail page is open. */
  noticeId: string | null
}

export interface NavigateOptions {
  q?: string
  group?: string | BloodGroup | null
  tab?: string | null
  noticeId?: string | null
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean
}

function normaliseGroup(value: string | null | undefined): BloodGroup | null {
  if (!value) return null
  const candidate = value.trim().toUpperCase().replace(/\s+/g, '')
  return (bloodGroups as readonly string[]).includes(candidate) ? (candidate as BloodGroup) : null
}

/** Reads the current browser location into a normalised route state. */
export function readRoute(): RouteState {
  if (typeof window === 'undefined')
    return { view: 'home', query: '', group: null, tab: null, noticeId: null }

  const view = viewFromPath(window.location.pathname) ?? 'home'
  const params = new URLSearchParams(window.location.search)
  return {
    view,
    query: (params.get('q') ?? '').trim(),
    group: normaliseGroup(params.get('group')),
    tab: (params.get('tab') ?? '').trim() || null,
    noticeId: noticeIdFromPath(window.location.pathname),
  }
}

/**
 * Minimal History-API router.
 *
 * Every section gets a real URL (`/bazar`, `/rokto`, ...) so links can be
 * shared, bookmarked and reached with the browser back/forward buttons.
 */
export function useAppRouter() {
  const [route, setRoute] = useState<RouteState>(() => readRoute())

  const navigate = useCallback((view: ViewId, options: NavigateOptions = {}) => {
    const url = pathForView(view, {
      q: options.q,
      group: options.group ?? undefined,
      tab: options.tab ?? undefined,
      noticeId: options.noticeId ?? undefined,
    })
    if (options.replace) {
      window.history.replaceState({}, '', url)
    } else {
      window.history.pushState({}, '', url)
    }
    setRoute({
      view,
      query: (options.q ?? '').trim(),
      group: normaliseGroup(options.group ?? null),
      tab: options.tab ?? null,
      noticeId: options.noticeId ?? null,
    })
  }, [])

  /** Re-reads the URL — used by the back/forward buttons. */
  useEffect(() => {
    const handlePopState = () => setRoute(readRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Keep the document title and description in sync with the current section,
  // so every URL has its own Bengali SEO title.
  useEffect(() => {
    const meta = ROUTE_META[route.view] ?? ROUTE_META.home
    document.title = meta.title

    const descriptionTag = document.querySelector('meta[name="description"]')
    if (descriptionTag) {
      descriptionTag.setAttribute('content', meta.description)
    }
  }, [route.view])

  // Normalise a legacy or unknown URL once, without adding a history entry.
  useEffect(() => {
    const path = stripBase(window.location.pathname).toLowerCase().replace(/\/+$/, '') || '/'
    // Alias URLs such as /fish point at an existing section: redirect to its
    // canonical path so address bars and shared links show the real page.
    if (path in PATH_ALIASES) {
      window.history.replaceState({}, '', pathForView(PATH_ALIASES[path]))
      return
    }
    const resolved = viewFromPath(window.location.pathname)
    if (resolved === null) {
      window.history.replaceState({}, '', pathForView('home'))
    }
  }, [])

  return useMemo(
    () => ({
      route,
      navigate,
      isActive: (view: ViewId) => route.view === view,
    }),
    [route, navigate],
  )
}
