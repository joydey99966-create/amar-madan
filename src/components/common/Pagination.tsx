import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toBanglaNumber } from '../../utils/formatters'

interface PaginationProps {
  /** Total number of filtered records. */
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Noun shown in the range line, e.g. "ডাক্তার". */
  label?: string
}

/**
 * Shared, theme-neutral pagination used by large directory lists so 135 doctors
 * or 300 institutions render incrementally instead of all at once on mobile.
 */
export function Pagination({ total, page, pageSize, onPageChange, label = 'এন্ট্রি' }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), pages)
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1
  const to = Math.min(total, current * pageSize)

  const change = (next: number) => {
    if (next < 1 || next > pages || next === current) return
    onPageChange(next)
  }

  // A compact sliding window around the current page.
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  const end = Math.min(pages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const numbers: number[] = []
  for (let i = start; i <= end; i++) numbers.push(i)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {toBanglaNumber(from)}–{toBanglaNumber(to)} / {toBanglaNumber(total)} {label}
      </p>
      <nav className="flex items-center gap-1" aria-label="পেজ নির্বাচন">
        <button
          type="button"
          onClick={() => change(current - 1)}
          disabled={current === 1}
          aria-label="আগের পেজ"
          className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-2 text-slate-600 transition hover:border-forest hover:text-forest disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
        >
          <ChevronLeft size={15} />
        </button>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => change(n)}
            aria-current={n === current ? 'page' : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
              n === current
                ? 'bg-forest text-white'
                : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
            }`}
          >
            {toBanglaNumber(n)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => change(current + 1)}
          disabled={current === pages}
          aria-label="পরবর্তী পেজ"
          className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-2 text-slate-600 transition hover:border-forest hover:text-forest disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
        >
          <ChevronRight size={15} />
        </button>
      </nav>
    </div>
  )
}
