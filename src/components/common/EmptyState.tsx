import { ReactNode } from 'react'
import { SearchX, AlertTriangle, ArrowLeft } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  onReset?: () => void
  /** Optional secondary action, used for the "back" button of empty sections. */
  actionLabel?: string
  onAction?: () => void
  actionIcon?: ReactNode
  /** Optional clickable suggestions shown below the message. */
  suggestions?: string[]
  onSuggest?: (query: string) => void
}

export function EmptyState({
  title = 'কোনো তথ্য পাওয়া যায়নি',
  description = 'আপনার খোঁজের সাথে মিলে যাওয়া তথ্য পাওয়া যায়নি',
  onReset,
  actionLabel,
  onAction,
  actionIcon,
  suggestions = [],
  onSuggest,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <SearchX size={40} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-xl bg-forest px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            রিসেট করুন
          </button>
        )}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-300"
          >
            {actionIcon ?? <ArrowLeft size={15} />} {actionLabel}
          </button>
        )}
      </div>
      {suggestions.length > 0 && onSuggest && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggest(suggestion)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:text-slate-300 dark:hover:text-emerald-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}