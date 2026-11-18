import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { MarketPrice } from '../../../types'
import { formatPrice } from '../../../utils/formatters'
import { formatDate } from '../../../utils/formatters'
import { WeatherTicker } from '../../layout/WeatherTicker'

interface TodayInfoProps {
  /** One live market price, chosen from the real published list. */
  price?: MarketPrice
  onOpenMarket: () => void
}

/**
 * "আজকের তথ্য" — today's weather plus one real price. Appears on mobile
 * between the search bar and the category grid; on desktop it sits in the
 * sidebar. Uses existing WeatherTicker and one existing market row.
 */
export function TodayInfo({ price, onOpenMarket }: TodayInfoProps) {
  return (
    <section className="grid gap-3 rounded-[24px] bg-gradient-to-br from-forest via-[#14503d] to-[#0e3a2b] p-3 text-white shadow-xl shadow-emerald-950/20 sm:p-4 lg:p-5">
      <WeatherTicker />
      {price && (
        <button
          type="button"
          onClick={onOpenMarket}
          className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur-md transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-100/90">
              <TrendingUp size={13} /> আজকের বাজারদর
            </span>
            <span className="mt-0.5 block truncate text-sm font-bold text-white">{price.itemName}</span>
            <span className="block text-[11px] text-emerald-100/75">
              {formatPrice(price.retailPrice)} · {formatDate(price.date)}
            </span>
          </span>
          <ArrowUpRight size={17} className="shrink-0 text-emerald-100" />
        </button>
      )}
    </section>
  )
}
