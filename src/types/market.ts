/** One past retail price of a product, used for the mini history chart. */
export interface PriceHistoryPoint {
  /** ISO date, e.g. "2026-11-10". */
  date: string
  retail: number
}

export interface MarketPrice {
  id: string
  itemName: string
  wholesalePrice: string
  retailPrice: string
  unit: string
  /** Trend shown on the card — derived from the history by `getPriceTrend`. */
  trend?: 'up' | 'down' | 'stable'
  /** Legacy display string; the card shows the Bengali `date` instead. */
  updated?: string
  /** The single "last updated" field of the row (ISO), e.g. "2026-11-16". */
  date?: string
  /** Retail price over the last few days, oldest first. */
  history?: PriceHistoryPoint[]
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}

export interface FishWholesaler {
  id: string
  name: string
  area: string
  phone: string
  fishTypes: string[]
}

export interface AgroMachinery {
  id: string
  name: string
  machineType: 'পাওয়ার টিলার' | 'হারভেস্টার' | 'মাড়াই যন্ত্র' | 'সেচ পাম্প' | 'ধান কাটার মেশিন'
  area: string
  phone: string
  ownerName: string
  availability: 'available' | 'busy' | 'offline'
  rentalRate: string
}

export interface FertilizerDealer {
  id: string
  name: string
  storeName: string
  area: string
  phone: string
  verified: boolean
}
