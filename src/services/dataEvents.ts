/**
 * A tiny event bus for storage-backed data.
 *
 * The browser's `storage` event only fires in *other* tabs, so the tab where
 * an admin edits a record would never refresh. This bus covers both cases:
 * `notifyDataChanged()` runs in the editing tab, and the `storage` listener in
 * `useDataVersion` covers other tabs.
 */
const EVENT = 'amar-madan:data-changed'

/**
 * Tells every mounted section that storage-backed data changed (for example an
 * admin just published a notice or approved a job posting).
 *
 * @param section optional name; listeners for other sections stay untouched.
 */
export function notifyDataChanged(section?: string): void {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: section }))
}

/** Subscribes to data changes; returns the unsubscribe function. */
export function subscribeToDataChanges(handler: (section?: string) => void): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<string | undefined>).detail)
  }
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
