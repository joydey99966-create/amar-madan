import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'
import { SEARCH_KINDS, SearchKind } from '../utils/search'

/** A searchable record the admin adds by hand (no code change needed). */
export interface CustomSearchItem {
  id: string
  title: string
  subtitle: string
  /** Section the item belongs to — decides where a click navigates. */
  kind: SearchKind
  /** Text carried into that section when the item is opened. */
  query: string
  /** Only approved items are shown publicly. */
  approved: boolean
  createdAt: string
}

export interface SearchSettings {
  /** Per-section switch. A disabled section is skipped by the search engine. */
  sections: Record<SearchKind, boolean>
  customItems: CustomSearchItem[]
}

function defaultSettings(): SearchSettings {
  return {
    sections: SEARCH_KINDS.reduce(
      (state, kind) => {
        state[kind] = true
        return state
      },
      {} as Record<SearchKind, boolean>,
    ),
    customItems: [],
  }
}

/**
 * Admin-controlled search configuration. The PIN gate lives in the admin
 * dashboard — this service only owns the stored settings.
 */
export const searchSettingsService = {
  getSettings(): SearchSettings {
    const stored = storageService.get<SearchSettings | null>(STORAGE_KEYS.SEARCH_SETTINGS, null)
    const defaults = defaultSettings()
    if (!stored || typeof stored !== 'object') return defaults
    return {
      sections: { ...defaults.sections, ...(stored.sections ?? {}) },
      customItems: Array.isArray(stored.customItems) ? stored.customItems : [],
    }
  },

  save(settings: SearchSettings): SearchSettings {
    storageService.set(STORAGE_KEYS.SEARCH_SETTINGS, settings)
    notifyDataChanged('search')
    return settings
  },

  setSectionEnabled(kind: SearchKind, enabled: boolean): SearchSettings {
    const settings = searchSettingsService.getSettings()
    settings.sections[kind] = enabled
    return searchSettingsService.save(settings)
  },

  addCustomItem(input: Omit<CustomSearchItem, 'id' | 'createdAt' | 'approved'>): SearchSettings {
    const settings = searchSettingsService.getSettings()
    settings.customItems = [
      {
        ...input,
        id: `cs-${Date.now()}`,
        approved: false,
        createdAt: new Date().toISOString(),
      },
      ...settings.customItems,
    ]
    return searchSettingsService.save(settings)
  },

  updateCustomItem(id: string, input: Partial<Omit<CustomSearchItem, 'id'>>): SearchSettings {
    const settings = searchSettingsService.getSettings()
    settings.customItems = settings.customItems.map((item) =>
      item.id === id ? { ...item, ...input } : item,
    )
    return searchSettingsService.save(settings)
  },

  approveCustomItem(id: string, approved: boolean): SearchSettings {
    return searchSettingsService.updateCustomItem(id, { approved })
  },

  deleteCustomItem(id: string): SearchSettings {
    const settings = searchSettingsService.getSettings()
    settings.customItems = settings.customItems.filter((item) => item.id !== id)
    return searchSettingsService.save(settings)
  },
}
