import { Flag } from 'lucide-react'
import { useReport } from '../../context/ReportContext'
import { SITE_DATA_REVIEWED } from '../../constants/dataMeta'
import { formatDate } from '../../utils/formatters'

interface ListingMetaProps {
  /** ISO date string ("2026-11-15") or a Bangla date already formatted. */
  updated?: string
  /** Fallback date when the record has no explicit update stamp. */
  fallback?: string
  listing: string
  section: string
  className?: string
}

function readableDate(value: string | undefined): string {
  if (!value) return ''
  // One formatter for every date shape (ISO, full Bengali, or Bengali no-year).
  return formatDate(value)
}

/**
 * "সর্বশেষ হালনাগাদ" + "ভুল তথ্য জানান" — shown on every listing so visitors
 * always know how fresh the information is and can correct it in one tap.
 */
export function ListingMeta({ updated, fallback = SITE_DATA_REVIEWED, listing, section, className = '' }: ListingMetaProps) {
  const { requestReport } = useReport()
  // The fallback is an ISO seed date too — run both values through the one
  // formatter so no card can ever show a raw "2026-11-16".
  const stamp = readableDate(updated || fallback) || ''

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500 ${className}`}
    >
      {stamp && <span>সর্বশেষ হালনাগাদ: {stamp}</span>}
      <button
        type="button"
        onClick={() => requestReport({ listing, section })}
        className="-my-1.5 inline-flex min-h-[34px] items-center gap-1 px-1 font-semibold text-slate-500 underline decoration-dotted underline-offset-2 transition hover:text-forest dark:text-slate-400 dark:hover:text-emerald-300"
      >
        <Flag size={11} />
        ভুল তথ্য জানান
      </button>
    </div>
  )
}
