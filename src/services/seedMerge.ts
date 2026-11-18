/**
 * Keeps bundled seed records in sync with what is already stored in the
 * browser. New seed rows are appended, existing edits are never overwritten —
 * so a release that adds content shows up without wiping local changes.
 */
export function mergeSeed<T extends { id: string }>(
  stored: T[] | null | undefined,
  seed: T[],
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return seed
  const ids = new Set(stored.map((item) => item?.id).filter(Boolean))
  const missing = seed.filter((item) => !ids.has(item.id))
  return missing.length ? [...stored, ...missing] : stored
}
