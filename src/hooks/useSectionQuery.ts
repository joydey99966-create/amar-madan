import { useEffect, useState } from 'react'

/**
 * Section-local query state.
 *
 * Starts from the URL query, follows it on back/forward navigation, and can be
 * changed locally (e.g. by clicking a suggestion in the empty state).
 */
export function useSectionQuery(query: string) {
  const [localQuery, setLocalQuery] = useState(query)

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  return [localQuery, setLocalQuery] as const
}
