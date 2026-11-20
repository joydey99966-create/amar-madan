import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * Static-host-friendly data layer.
 *
 * Admin edits normally live in localStorage. The published snapshot
 * (`public/data/snapshot.json`) is the source of truth: on first load, or when a
 * newer snapshot is published, it OVERWRITES whatever demo seed happened to be
 * written first. A meta marker records which snapshot was applied so that local
 * admin edits made afterwards are never clobbered on later reloads.
 */

export const SNAPSHOT_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/data/snapshot.json`
export const SNAPSHOT_VERSION = 1

/** Deliberately NOT in STORAGE_KEYS so it is never exported/imported as data. */
const META_KEY = 'amar-madan-snapshot-meta'

export interface DataSnapshot {
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

export interface SnapshotMeta {
  exportedAt: string
  version: number
  appliedAt: string
}

export interface SnapshotStatus {
  state: 'idle' | 'loading' | 'ok' | 'error'
  message: string
  exportedAt?: string
  appliedAt?: string
  seededKeys: string[]
  attempts: number
}

let status: SnapshotStatus = {
  state: 'idle',
  message: 'এখনো সিঙ্ক করা হয়নি',
  seededKeys: [],
  attempts: 0,
}

export function getSnapshotStatus(): SnapshotStatus {
  return { ...status, seededKeys: [...status.seededKeys] }
}

function readMeta(): SnapshotMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return null
    const meta = JSON.parse(raw) as SnapshotMeta
    return meta && typeof meta.exportedAt === 'string' ? meta : null
  } catch {
    return null
  }
}

function writeMeta(meta: SnapshotMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    // Storage may be full — the data itself is still written by storageService.
  }
}

function devLog(...args: unknown[]): void {
  if (import.meta.env.DEV) console.log('[snapshot]', ...args)
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
   * Fetches and applies the published snapshot. Overwrites stored data when
   * there is no applied-meta yet or the snapshot is newer. Retries once on a
   * fetch failure and records the outcome in `getSnapshotStatus()`.
   */
  async applyPublished(force = false): Promise<number> {
    status = { state: 'loading', message: 'স্ন্যাপশট লোড হচ্ছে…', seededKeys: [], attempts: 0 }
    let snapshot: DataSnapshot | null = null
    let lastError = ''

    for (let attempt = 1; attempt <= 2; attempt++) {
      status.attempts = attempt
      try {
        const res = await fetch(SNAPSHOT_URL, { cache: 'no-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const parsed = (await res.json()) as DataSnapshot
        if (!parsed?.data || typeof parsed.data !== 'object') throw new Error('Invalid snapshot shape')
        snapshot = parsed
        devLog('fetch ok', {
          attempt,
          exportedAt: parsed.exportedAt,
          keys: Object.keys(parsed.data).length,
        })
        break
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        devLog('fetch failed', { attempt, error: lastError })
        if (attempt < 2) {
          // One immediate retry — no long delay on the critical boot path.
          await Promise.resolve()
        }
      }
    }

    if (!snapshot) {
      status = {
        ...status,
        state: 'error',
        message: `স্ন্যাপশট আনতে ব্যর্থ (${lastError}) — পুরনো তথ্য ব্যবহার করা হচ্ছে`,
      }
      devLog('giving up; kept existing data')
      return 0
    }

    const meta = readMeta()
    const newer = !meta || snapshot.exportedAt > meta.exportedAt
    const shouldApply = force || newer

    if (!shouldApply) {
      const appliedAt = meta?.appliedAt ?? ''
      status = {
        ...status,
        state: 'ok',
        message: 'তথ্য সিঙ্ক হয়েছে — নতুন স্ন্যাপশট নেই',
        exportedAt: snapshot.exportedAt,
        appliedAt,
        seededKeys: [],
      }
      devLog('already applied this snapshot; local edits preserved')
      return 0
    }

    let written = 0
    const keys: string[] = []
    Object.entries(snapshot.data).forEach(([key, value]) => {
      if (!DATA_KEYS.includes(key as (typeof DATA_KEYS)[number])) return
      // A key with empty/absent data is always seeded. On a fresh/newer
      // snapshot we overwrite demo seeds too — that is the whole point.
      storageService.set(key, value)
      written += 1
      keys.push(key)
    })

    const appliedAt = new Date().toISOString()
    writeMeta({ exportedAt: snapshot.exportedAt, version: snapshot.version, appliedAt })
    status = {
      ...status,
      state: 'ok',
      message: `${written} টি ডেটা সেট সিঙ্ক করা হয়েছে`,
      exportedAt: snapshot.exportedAt,
      appliedAt,
      seededKeys: keys,
    }
    devLog('applied', { written, exportedAt: snapshot.exportedAt, keys })
    if (written > 0) notifyDataChanged('all')
    return written
  },
}
