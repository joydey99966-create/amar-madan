import { useCallback, useState } from 'react'

/**
 * Keeps a single filter value in the URL query string so a filtered view can
 * be refreshed, bookmarked and shared. The value lives only in `?key=value`;
 * an absent/invalid value falls back to `fallback`.
 */
export function useUrlFilter<T extends string>(
  key: string,
  fallback: T,
  allowed?: readonly T[],
): [T, (value: T) => void] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return fallback
    const value = new URLSearchParams(window.location.search).get(key)
    if (value && (!allowed || allowed.includes(value as T))) return value as T
    return fallback
  }, [key, fallback, allowed])

  const [value, setValue] = useState<T>(read)

  const setFilter = useCallback(
    (next: T) => {
      setValue(next)
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      if (next === fallback) params.delete(key)
      else params.set(key, next)
      const query = params.toString()
      const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash
      window.history.replaceState(window.history.state, '', url)
    },
    [key, fallback],
  )

  return [value, setFilter]
}
