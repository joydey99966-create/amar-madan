import { storageService } from './storageService'

/** Privacy-friendly, fully local page-view counters — nothing leaves the device. */
const KEY = 'amar-madan-local-analytics'

export interface AnalyticsState {
  views: Record<string, number>
  since: string
}

export const analyticsService = {
  get(): AnalyticsState {
    const stored = storageService.get<AnalyticsState | null>(KEY, null)
    if (stored && typeof stored === 'object' && stored.views) return stored
    return { views: {}, since: new Date().toISOString() }
  },

  record(view: string): void {
    const state = this.get()
    state.views[view] = (state.views[view] ?? 0) + 1
    storageService.set(KEY, state)
  },

  reset(): void {
    storageService.set(KEY, { views: {}, since: new Date().toISOString() })
  },
}
