import { initialMarketPrices, fishPrices, initialFishWholesalers } from '../data'
import { FishWholesaler, MarketPrice } from '../types'
import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { mergeSeed } from './seedMerge'
import { recordsService } from './recordsService'
import { notifyDataChanged } from './dataEvents'

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  {
    category: 'সবজি',
    keywords: [
      'আলু',
      'পেঁয়াজ',
      'রসুন',
      'আদা',
      'মরিচ',
      'টমেটো',
      'বেগুন',
      'শাক',
      'কুমড়া',
      'লাউ',
      'ঢেঁড়স',
      'ফুলকপি',
      'ধাঁধা',
      'পেঁপে',
    ],
  },
  {
    category: 'প্রাণিজ পণ্য',
    keywords: ['ডিম', 'দুধ', 'মাছ', 'মাংস', 'মুরগি', 'গরু', 'ছাগল', 'বোয়াল', 'ইলিশ', 'রুই'],
  },
  {
    category: 'খাদ্যশস্য ও নিত্যপণ্য',
    keywords: ['চাল', 'ধান', 'গম', 'ডাল', 'তেল', 'চিনি', 'লবণ', 'আটা', 'ময়দা', 'সয়াবি'],
  },
  {
    category: 'মসলা',
    keywords: ['হলুদ', 'জিরা', 'ধনে', 'দারুচিনি', 'এলাচ', 'কালো মরিচ'],
  },
]

function normalizeProductName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parsePrice(value: string): number {
  const normalized = value
    .replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))
    .replace(/,/g, '')
    .trim()

  if (!normalized || normalized.includes('-')) return Number.NaN

  const match = normalized.match(/\d+(\.\d+)?/)
  if (!match) return Number.NaN

  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

/** Best-effort product group, used to file a submission in the right bucket. */
function inferCategory(productName: string): string {
  const name = normalizeProductName(productName)
  const matched = CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => name.includes(keyword)),
  )
  return matched?.category ?? 'অন্যান্য'
}

/**
 * Brings every stored row up to the current shape: a price history, a single
 * "last updated" date and the admin flags. Rows saved by an older version of
 * the app are completed from the bundled seed, so every item behaves the same.
 */
function normalizePriceRow(row: MarketPrice): MarketPrice {
  const seed = initialMarketPrices.find((item) => item.id === row.id)
  const history = row.history && row.history.length > 0 ? row.history : seed?.history ?? []
  const date = row.date ?? seed?.date ?? new Date().toISOString().slice(0, 10)
  return {
    ...row,
    history,
    date,
    approved: row.approved !== false,
    visible: row.visible !== false,
  }
}

export const marketService = {
  getMarketPrices(): MarketPrice[] {
    return initialMarketPrices
  },

  getFishPrices(): MarketPrice[] {
    return recordsService.fishPrices()
  },

  getFishWholesalers(): FishWholesaler[] {
    return initialFishWholesalers
  },

  /** Every row the admin manages — including hidden and pending ones. */
  getAllPrices(): MarketPrice[] {
    const stored = storageService.get<MarketPrice[]>(STORAGE_KEYS.MARKET_PRICES, initialMarketPrices)
    const merged = mergeSeed(stored, initialMarketPrices)
    const normalized = merged.map(normalizePriceRow)
    if (JSON.stringify(normalized) !== JSON.stringify(merged)) {
      storageService.set(STORAGE_KEYS.MARKET_PRICES, normalized)
    }
    return normalized
  },

  /** The live (admin-managed) price list, falling back to the bundled seed. */
  getLiveMarketPrices(): MarketPrice[] {
    return marketService.getAllPrices().filter(
      (price) => price.approved !== false && price.visible !== false,
    )
  },

  /** Saves one row (price, history, date or the admin flags). */
  updatePrice(id: string, patch: Partial<MarketPrice>): MarketPrice[] {
    const updated = marketService.getAllPrices().map((price) =>
      price.id === id ? { ...price, ...patch } : price,
    )
    storageService.set(STORAGE_KEYS.MARKET_PRICES, updated)
    notifyDataChanged('market')
    return updated
  },

  addPrice(price: Omit<MarketPrice, 'id'>): MarketPrice[] {
    const id = `mp-${Date.now()}`
    const created: MarketPrice = {
      ...price,
      id,
      date: price.date ?? new Date().toISOString().slice(0, 10),
      approved: price.approved ?? false,
      visible: price.visible ?? true,
    }
    const updated = [created, ...marketService.getAllPrices()]
    storageService.set(STORAGE_KEYS.MARKET_PRICES, updated)
    notifyDataChanged('market')
    return updated
  },

  removePrice(id: string): MarketPrice[] {
    const updated = marketService.getAllPrices().filter((price) => price.id !== id)
    storageService.set(STORAGE_KEYS.MARKET_PRICES, updated)
    notifyDataChanged('market')
    return updated
  },

  approvePrice(id: string, approved: boolean): MarketPrice[] {
    return marketService.updatePrice(id, { approved })
  },

  setPriceVisible(id: string, visible: boolean): MarketPrice[] {
    return marketService.updatePrice(id, { visible })
  },

  /**
   * Read-only lookup of the currently published retail price for a product.
   * Returns 0 when the product is not in the list yet.
   */
  getCurrentPrice(productName: string): number {
    const target = normalizeProductName(productName)
    if (!target) return 0

    const candidates = [...marketService.getLiveMarketPrices(), ...fishPrices]

    const exactMatch = candidates.find(
      (price) => normalizeProductName(price.itemName) === target,
    )
    const partialMatch =
      exactMatch ??
      candidates.find((price) => {
        const currentName = normalizeProductName(price.itemName)
        return currentName.includes(target) || target.includes(currentName)
      })

    if (!partialMatch) return 0

    const currentPrice = parsePrice(partialMatch.retailPrice)
    return Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 0
  },

  inferCategory,

  /** Parses a user-typed price (Bengali or Arabic digits, optional commas). */
  parsePrice,
}
