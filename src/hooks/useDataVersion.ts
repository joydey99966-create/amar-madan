import { useEffect, useState } from 'react'
import { notifyDataChanged, subscribeToDataChanges } from '../services/dataEvents'

export { notifyDataChanged }

/** Re-render counter for a section; bumps on admin edits and cross-tab writes. */
export function useDataVersion(section: string): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<string | undefined>).detail
      if (!detail || detail === section) setVersion((value) => value + 1)
    }
    window.addEventListener('storage', listener)
    const unsubscribe = subscribeToDataChanges((detail) => {
      if (!detail || detail === section) setVersion((value) => value + 1)
    })
    return () => {
      window.removeEventListener('storage', listener)
      unsubscribe()
    }
  }, [section])

  return version
}
