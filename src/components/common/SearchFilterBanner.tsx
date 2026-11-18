import { Search, X } from 'lucide-react'
import { toBanglaNumber } from '../../utils/formatters'

interface SearchFilterBannerProps {
  /** The text carried from the homepage search into this section. */
  query: string
  /** Number of records that matched inside this section. */
  count: number
  /** What is being counted, e.g. "রক্তদাতা". */
  label: string
  onClear: () => void
}

/** Shows that a search query is active inside a section, with its live count. */
export function SearchFilterBanner({ query, count, label, onClear }: SearchFilterBannerProps) {
  if (!query.trim()) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-forest/20 bg-forest/5 px-3 py-2 dark:border-emerald-500/25 dark:bg-emerald-900/20">
      <div className="flex min-w-0 items-center gap-2 text-xs text-forest dark:text-emerald-300">
        <Search size={14} className="shrink-0" />
        <span className="truncate">
          “{query}” — <strong>{toBanglaNumber(count)}</strong> টি {label}
        </span>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-forest/20 px-2 py-1 text-[11px] font-semibold text-forest transition hover:bg-forest/10 dark:border-emerald-500/25 dark:text-emerald-300"
      >
        <X size={12} /> ফিল্টার মুছুন
      </button>
    </div>
  )
}
