import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/** Admin-controlled donor phone privacy setting. */
export interface DonorSettings {
  /** 'full' keeps the current behaviour; 'masked' shows only the last 4 digits but stays tappable. */
  phoneDisplay: 'full' | 'masked'
}

const KEY = 'amar-madan-donor-settings'
const DEFAULT: DonorSettings = { phoneDisplay: 'full' }

export const donorSettingsService = {
  get(): DonorSettings {
    const stored = storageService.get<DonorSettings | null>(KEY, null)
    return stored?.phoneDisplay === 'masked' ? stored : DEFAULT
  },
  save(settings: DonorSettings): DonorSettings {
    storageService.set(KEY, settings)
    notifyDataChanged('donor-settings')
    return settings
  },
}
