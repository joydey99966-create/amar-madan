import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'

/**
 * Only a one-way fingerprint of the PIN lives in the source. The PIN itself is
 * never written to code, the DOM, logs or localStorage — it exists only for the
 * few milliseconds it is typed into the password field.
 */
const PIN_FINGERPRINT = 1961600436

function fingerprint(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** A logged-in session is short-lived and never remembered indefinitely. */
const SESSION_TTL_MS = 15 * 60 * 1000

interface AuthSession {
  at: number
}

export const adminService = {
  /**
   * True only while an unexpired session exists. Any stale, malformed or
   * timed-out session is cleared, so every fresh visit needs the PIN again.
   */
  isAuthenticated(): boolean {
    const session = storageService.getSession<AuthSession | null>(STORAGE_KEYS.ADMIN_AUTH, null)
    if (!session || typeof session.at !== 'number') {
      storageService.removeSession(STORAGE_KEYS.ADMIN_AUTH)
      return false
    }
    if (Date.now() - session.at >= SESSION_TTL_MS) {
      storageService.removeSession(STORAGE_KEYS.ADMIN_AUTH)
      return false
    }
    return true
  },

  login(pin: string): boolean {
    // No plaintext PIN comparison, logging or persistence anywhere.
    if (fingerprint(pin.trim()) === PIN_FINGERPRINT) {
      storageService.setSession<AuthSession>(STORAGE_KEYS.ADMIN_AUTH, { at: Date.now() })
      return true
    }
    return false
  },

  logout(): void {
    storageService.removeSession(STORAGE_KEYS.ADMIN_AUTH)
  },

  /** Ends the session on tab close, refresh and dashboard close. */
  endSession(): void {
    adminService.logout()
  },

  /** Milliseconds left in the current session — 0 when not authenticated. */
  remainingMs(): number {
    const session = storageService.getSession<AuthSession | null>(STORAGE_KEYS.ADMIN_AUTH, null)
    if (!session || typeof session.at !== 'number') return 0
    return Math.max(0, SESSION_TTL_MS - (Date.now() - session.at))
  },
}
