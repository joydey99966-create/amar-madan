import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'

export interface FreshnessRow {
  section: string
  label: string
  oldest: string
  count: number
}

/** Finds the oldest `lastUpdated` stamp in every managed dataset. */
export const freshnessService = {
  scan(): FreshnessRow[] {
    const groups: { label: string; key: string }[] = [
      { label: 'রক্তদাতা', key: STORAGE_KEYS.BLOOD_DONORS },
      { label: 'বাজারদর', key: STORAGE_KEYS.MARKET_PRICES },
      { label: 'ডাক্তার', key: STORAGE_KEYS.DOCTORS },
      { label: 'হাসপাতাল', key: STORAGE_KEYS.HOSPITALS },
      { label: 'শিক্ষা প্রতিষ্ঠান', key: STORAGE_KEYS.EDUCATION },
      { label: 'হাওরের মাছ', key: STORAGE_KEYS.FISH_PRICES },
      { label: 'যাতায়াত রুট', key: STORAGE_KEYS.ROUTES },
      { label: 'নাগরিক সেবা', key: STORAGE_KEYS.CITIZENS },
      { label: 'নোটিশ ও সংবাদ', key: STORAGE_KEYS.NOTICES },
      { label: 'চাকরি', key: STORAGE_KEYS.JOB_POSTINGS },
      { label: 'হারানো ও প্রাপ্তি', key: STORAGE_KEYS.LOST_FOUND },
    ]
    const rows: FreshnessRow[] = []
    groups.forEach(({ label, key }) => {
      const list = storageService.get<unknown[]>(key, [])
      if (!Array.isArray(list) || list.length === 0) {
        rows.push({ section: key, label, oldest: '', count: 0 })
        return
      }
      const dates = list
        .map((item) => {
          const record = item as { lastUpdated?: string; date?: string; lastDonationDate?: string | null; postedAt?: string }
          return record.lastUpdated ?? record.date ?? record.lastDonationDate ?? record.postedAt ?? ''
        })
        .filter((d) => typeof d === 'string' && d.length > 0)
        .sort()
      rows.push({ section: key, label, oldest: dates[0] ?? '', count: list.length })
    })
    return rows.sort((a, b) => (a.oldest || '9999').localeCompare(b.oldest || '9999'))
  },
}
