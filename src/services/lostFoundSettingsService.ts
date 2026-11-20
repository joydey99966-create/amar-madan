import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/** Settings for LostFound feature – currently only NID masking mode. */
export interface LostFoundSettings {
  /** 'full' | 'last4' | 'hide' – what to show on public display */
  nidMaskMode: 'full' | 'last4' | 'hide'
}

const DEFAULT_SETTINGS: LostFoundSettings = {
  // Privacy first: never show any NID digits unless the admin explicitly opts in.
  nidMaskMode: 'hide',
}

function loadSettings(): LostFoundSettings {
  const stored = storageService.get<LostFoundSettings | null>(STORAGE_KEYS.LOST_FOUND_SETTINGS, null)
  return stored ? stored : DEFAULT_SETTINGS
}

function saveSettings(settings: LostFoundSettings): LostFoundSettings {
  storageService.set(STORAGE_KEYS.LOST_FOUND_SETTINGS, settings)
  notifyDataChanged('lostfound-settings')
  return settings
}

/** Expose the service */
export const lostFoundSettingsService = {
  getSettings: loadSettings,
  saveSettings,
}