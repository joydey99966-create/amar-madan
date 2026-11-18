import { ArrowLeft, Bell, CalendarDays, MapPin, ShieldAlert } from 'lucide-react'
import { Notice } from '../../../types'
import { VERIFY_PENDING } from '../../../constants/dataMeta'
import { formatDate } from '../../../utils/formatters'

interface NoticeDetailViewProps {
  notice: Notice
  /** Returns to the list the notice was opened from. */
  onBack: () => void
}

/**
 * Full text of a single notice — title, tag, publication date, source and the
 * complete body. Reached from the notice list and from the press club news.
 */
export function NoticeDetailView({ notice, onBack }: NoticeDetailViewProps) {
  return (
    <article className="rounded-[28px] border border-amber-200/70 bg-[#fffbef] p-6 dark:border-amber-900/35 dark:bg-[#272318] sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-amber-900/40 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={15} /> ফিরে যান
      </button>

      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Bell size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${notice.color}`}>
              {notice.tag}
            </span>
            {notice.priority === 'urgent' && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <ShieldAlert size={12} /> জরুরি
              </span>
            )}
          </div>
          <h1 className="mt-3 text-xl font-bold leading-snug text-slate-900 dark:text-white sm:text-2xl">
            {notice.title}
          </h1>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl border border-amber-200/50 bg-white/70 px-3 py-2.5 dark:border-amber-900/30 dark:bg-white/5">
          <CalendarDays size={15} className="shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              প্রকাশের তারিখ
            </dt>
            <dd className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {notice.date ? formatDate(notice.date) : VERIFY_PENDING}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-200/50 bg-white/70 px-3 py-2.5 dark:border-amber-900/30 dark:bg-white/5">
          <MapPin size={15} className="shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              উৎস
            </dt>
            <dd className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {notice.source || VERIFY_PENDING}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 rounded-2xl border border-amber-200/50 bg-white p-5 dark:border-amber-900/30 dark:bg-[#1f2a24]">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          বিস্তারিত
        </p>
        <div className="mt-2 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
          {(notice.body || VERIFY_PENDING).split(/\n\n+/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-forest-dark"
      >
        <ArrowLeft size={16} /> নোটিশ তালিকায় ফিরে যান
      </button>
    </article>
  )
}
