import { MarketPrice, PriceHistoryPoint } from '../types'

export type PriceTrend = 'up' | 'down' | 'stable'

/**
 * The ONE trend decision from a numeric price change. The label, the delta
 * number and the arrow/icon all come from this same value, so they can never
 * contradict one another.
 */
export function getTrendFromChange(change: number): PriceTrend {
  if (change > 0) return 'up'
  if (change < 0) return 'down'
  return 'stable'
}

/** The one trend label, derived from the same change the delta uses. */
export function getTrendLabel(change: number): string {
  return PRICE_TREND_LABELS[getTrendFromChange(change)]
}

/**
 * The change across a price history (last point minus first point). This is
 * the single number shown as the delta and used to derive the trend label.
 */
export function getPriceChange(history: PriceHistoryPoint[]): number {
  if (history.length < 2) return 0
  return history[history.length - 1].retail - history[0].retail
}

/**
 * Legacy helper: derives the trend from full history, kept for records that
 * have no change shown. Prefer getTrendFromChange(getPriceChange(history)).
 */
export function getPriceTrend(price: Pick<MarketPrice, 'history' | 'trend'>): PriceTrend {
  const history = price.history ?? []
  if (history.length >= 2) return getTrendFromChange(getPriceChange(history))
  return price.trend ?? 'stable'
}

/** Bengali wording of the trend — used by every price card. */
export const PRICE_TREND_LABELS: Record<PriceTrend, string> = {
  up: 'বেড়েছে',
  down: 'কমেছে',
  stable: 'স্থির',
}

/**
 * Trend colours. Red is reserved for emergency/blood only, so a price rise
 * uses the theme's existing amber accent instead.
 */
export const PRICE_TREND_CLASSES: Record<PriceTrend, string> = {
  up: 'text-amber-600 dark:text-amber-400',
  down: 'text-emerald-600 dark:text-emerald-400',
  stable: 'text-slate-500 dark:text-slate-400',
}

/** Stroke colour of the history sparkline. */
export const PRICE_TREND_STROKES: Record<PriceTrend, string> = {
  up: '#d97706',
  down: '#059669',
  stable: '#64748b',
}
