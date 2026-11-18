import { STORAGE_KEYS } from '../constants'
import { initialLostFound } from '../data'
import { LostFoundItem } from '../types'
import { storageService } from './storageService'
import { mergeSeed } from './seedMerge'

function todayIso(): string {
  return new Date().toISOString().split('T')[0]
}

export const lostFoundService = {
  getAll(): LostFoundItem[] {
    const stored = storageService.get<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, initialLostFound)
    return mergeSeed(stored, initialLostFound)
  },

  saveAll(items: LostFoundItem[]): void {
    storageService.set(STORAGE_KEYS.LOST_FOUND, items)
  },

  /** Approved items only — what the public board shows. */
  getPublic(): LostFoundItem[] {
    return lostFoundService.getAll().filter((item) => item.isApproved !== false)
  },

  getPending(): LostFoundItem[] {
    return lostFoundService.getAll().filter((item) => item.isApproved === false)
  },

  /** A visitor posting always waits for admin approval. */
  add(newItem: Omit<LostFoundItem, 'id' | 'postedAt' | 'lastUpdated'>): LostFoundItem {
    const existing = lostFoundService.getAll()
    const today = todayIso()
    const item: LostFoundItem = {
      ...newItem,
      id: 'lf-' + Date.now(),
      postedAt: today,
      lastUpdated: today,
      isApproved: false,
    }
    lostFoundService.saveAll([item, ...existing])
    return item
  },

  approve(id: string): LostFoundItem[] {
    const updated = lostFoundService
      .getAll()
      .map((item) =>
        item.id === id ? { ...item, isApproved: true, lastUpdated: todayIso() } : item,
      )
    lostFoundService.saveAll(updated)
    return updated
  },

  reject(id: string): LostFoundItem[] {
    const updated = lostFoundService.getAll().filter((item) => item.id !== id)
    lostFoundService.saveAll(updated)
    return updated
  },

  delete(id: string): LostFoundItem[] {
    const updated = lostFoundService.getAll().filter((item) => item.id !== id)
    lostFoundService.saveAll(updated)
    return updated
  },
}
