import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * Static-host-friendly data layer.
 *
 * Admin edits normally live in localStorage. This service can (a) export all
 * of them into one JSON snapshot that Joy commits to `public/data/snapshot.json`
 * and deploys, and (b) seed an empty browser from that published snapshot.
 * That way admin changes reach every visitor without a server.
 */

export const SNAPSHOT_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/data/snapshot.json`
export const SNAPSHOT_VERSION = 1

export interface DataSnapshot {
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

/** All storage keys we manage, for export/import. */
const DATA_KEYS = Object.values(STORAGE_KEYS).filter((key) => key !== STORAGE_KEYS.ADMIN_AUTH)

export const dataSnapshotService = {
  /** Collects every managed localStorage entry into one snapshot object. */
  exportAll(): DataSnapshot {
    const data: Record<string, unknown> = {}
    DATA_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        try {
          data[key] = JSON.parse(raw)
        } catch {
          data[key] = raw
        }
      }
    })
    return { version: SNAPSHOT_VERSION, exportedAt: new Date().toISOString(), data }
  },

  /** Restores a snapshot into localStorage. Returns the number of keys written. */
  importAll(snapshot: DataSnapshot): number {
    if (!snapshot || typeof snapshot !== 'object' || !snapshot.data) return 0
    let written = 0
    Object.entries(snapshot.data).forEach(([key, value]) => {
      if (DATA_KEYS.includes(key as (typeof DATA_KEYS)[number])) {
        storageService.set(key, value)
        written += 1
      }
    })
    notifyDataChanged('all')
    return written
  },

  /** Downloads the current data as a JSON file for Joy to deploy. */
  downloadSnapshot(): void {
    const snapshot = this.exportAll()
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'amar-madan-snapshot.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },

  /**
   * Fetches the published snapshot. Seeds only keys that are still empty, so
   * a visitor always sees the admin-published data while local edits win.
   */
  async applyPublished(): Promise<number> {
    try {
      const res = await fetch(SNAPSHOT_URL, { cache: 'no-cache' })
      if (!res.ok) return 0
      const snapshot = (await res.json()) as DataSnapshot
      if (!snapshot?.data) return 0
      let seeded = 0
      Object.entries(snapshot.data).forEach(([key, value]) => {
        if (DATA_KEYS.includes(key as (typeof DATA_KEYS)[number]) && localStorage.getItem(key) === null) {
          storageService.set(key, value)
          seeded += 1
        }
      })
      if (seeded > 0) notifyDataChanged()
      return seeded
    } catch {
      return 0
    }
  },
}
