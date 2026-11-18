import { ArrowUpRight, Bell } from 'lucide-react'
import { Notice } from '../../../types'
import { defaultNotices } from '../../../constants'
import { formatBanglaToday, formatDate } from '../../../utils/formatters'

interface NoticesSectionProps {
  notices?: Notice[]
  /** Opens the detail view of the selected notice. */
  onSelectNotice?: (notice: Notice) => void
}

export function NoticesSection({ notices = defaultNotices, onSelectNotice }: NoticesSectionProps) {
  const today = formatBanglaToday()

  return (
    <div className="rounded-[28px] border border-amber-200/70 bg-[#fffbef] p-4 dark:border-amber-900/35 dark:bg-[#272318] sm:p-8">
      <div className="mb-3 flex items-center justify-between sm:mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 sm:h-12 sm:w-12">
            <Bell size={22} />
          </span>
          <div>
            <div className="section-eyebrow !text-amber-700 dark:!text-amber-300">আপডেট থাকুন</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">আজকের নোটিশ</h2>
          </div>
        </div>
        <span className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          {today}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {notices.map((notice, idx) => (
          <button
            key={notice.id ?? notice.title + idx}
            type="button"
            onClick={() => onSelectNotice?.(notice)}
            aria-label={`${notice.title} — বিস্তারিত দেখুন`}
            className="flex items-start gap-2.5 rounded-2xl border border-amber-200/40 bg-white/60 p-3 text-left transition hover:border-amber-400 hover:bg-white dark:border-amber-900/20 dark:bg-white/5 dark:hover:border-amber-700 sm:gap-3 sm:p-4"
          >
            <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${notice.color}`}>
              {notice.tag}
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100 sm:text-base">
                {notice.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{notice.detail}</p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {formatDate(notice.date)} · {notice.source}
              </p>
            </div>
            <ArrowUpRight size={18} className="mt-1 shrink-0 text-amber-700 dark:text-amber-300" />
          </button>
        ))}
      </div>
    </div>
  )
}
