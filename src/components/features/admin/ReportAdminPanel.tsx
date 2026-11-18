import { CheckCircle, Flag, Trash2 } from 'lucide-react'
import { InfoReport } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'

interface ReportAdminPanelProps {
  reports: InfoReport[]
  onResolve: (id: string) => void
  onDelete: (id: string) => void
}

function readableDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('bn-BD', {
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Moderation queue for "ভুল তথ্য জানান" reports sent from any listing. */
export function ReportAdminPanel({ reports, onResolve, onDelete }: ReportAdminPanelProps) {
  const open = reports.filter((report) => !report.isResolved)
  const resolved = reports.filter((report) => report.isResolved)
  const ordered = [...open, ...resolved]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ভুল তথ্যের রিপোর্ট</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {toBanglaNumber(open.length)} টি অপেক্ষমাণ
        </span>
      </div>

      {ordered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Flag size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">এখনো কোনো রিপোর্ট আসেনি</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((report) => (
            <div
              key={report.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-white">{report.listing}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {report.section}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      report.isResolved
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {report.isResolved ? 'সমাধান হয়েছে' : report.reason}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{report.details}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {readableDate(report.createdAt)}
                  {report.contact ? ` • যোগাযোগ: ${report.contact}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!report.isResolved && (
                  <button
                    onClick={() => onResolve(report.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                    title="সমাধান হিসেবে চিহ্নিত করুন"
                    aria-label="সমাধান হিসেবে চিহ্নিত করুন"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(report.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                  title="মুছে ফেলুন"
                  aria-label="মুছে ফেলুন"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
