import { STORAGE_KEYS } from '../constants'
import { InfoReport } from '../types'
import { storageService } from './storageService'

/**
 * "ভুল তথ্য জানান" reports. They are stored locally (like every other
 * submission in this app) and shown to the admin in a moderation tab.
 */
export const reportService = {
  getAll(): InfoReport[] {
    const stored = storageService.get<InfoReport[]>(STORAGE_KEYS.REPORTS, [])
    return Array.isArray(stored) ? stored : []
  },

  add(input: Omit<InfoReport, 'id' | 'createdAt' | 'isResolved'>): InfoReport {
    const reports = reportService.getAll()
    const report: InfoReport = {
      ...input,
      id: 'rep-' + Date.now(),
      createdAt: new Date().toISOString(),
      isResolved: false,
    }
    storageService.set(STORAGE_KEYS.REPORTS, [report, ...reports])
    return report
  },

  resolve(id: string): InfoReport[] {
    const updated = reportService.getAll().map((report) =>
      report.id === id ? { ...report, isResolved: true } : report,
    )
    storageService.set(STORAGE_KEYS.REPORTS, updated)
    return updated
  },

  remove(id: string): InfoReport[] {
    const updated = reportService.getAll().filter((report) => report.id !== id)
    storageService.set(STORAGE_KEYS.REPORTS, updated)
    return updated
  },
}
