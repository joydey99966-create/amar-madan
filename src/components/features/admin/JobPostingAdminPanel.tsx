import { CheckCircle, Eye, Trash2, XCircle } from 'lucide-react'
import { JobPosting } from '../../../types'
import { formatDate, toBanglaNumber } from '../../../utils/formatters'

interface JobPostingAdminPanelProps {
  postings: JobPosting[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
  /** Switches a post between the single "টিউশনি" and "চাকরি" kinds. */
  onEditType: (id: string, type: JobPosting['type']) => void
}

const statusLabel = (posting: JobPosting) => {
  if (posting.isRejected) return { text: 'বাতিল', className: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' }
  if (posting.isApproved === false) {
    return { text: 'অনুমোদনের অপেক্ষায়', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
  }
  return { text: 'প্রকাশিত', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
}

/** Admin queue for visitor-submitted jobs and tuitions. */
export function JobPostingAdminPanel({
  postings,
  onApprove,
  onReject,
  onDelete,
  onEditType,
}: JobPostingAdminPanelProps) {
  const pending = postings.filter((posting) => posting.isApproved === false && !posting.isRejected)
  const others = postings.filter((posting) => posting.isApproved !== false || posting.isRejected)
  const ordered = [...pending, ...others]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">চাকরি ও টিউশনি পোস্ট</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {toBanglaNumber(pending.length)} টি অনুমোদনের অপেক্ষায়
        </span>
      </div>

      {ordered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Eye size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">কোনো পোস্ট নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((posting) => {
            const status = statusLabel(posting)
            const isPending = posting.isApproved === false && !posting.isRejected
            return (
              <div
                key={posting.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-white">{posting.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                      {status.text}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {posting.category}
                    </span>
                    {posting.type && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {posting.type}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {posting.organization} • {posting.location} • {posting.salary}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    যোগাযোগ: {posting.contact} • শেষ তারিখ: {formatDate(posting.deadline)}
                    {posting.postedAt ? ` • জমা: ${formatDate(posting.postedAt)}` : ''}
                    {posting.posterName ? ` • পাঠিয়েছেন: ${posting.posterName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={posting.type ?? 'চাকরি'}
                    onChange={(e) => onEditType(posting.id, e.target.value as JobPosting['type'])}
                    title="পোস্টের ধরন বদলান"
                    aria-label="পোস্টের ধরন বদলান"
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-[#0f1411] dark:text-slate-300"
                  >
                    <option value="টিউশনি">টিউশনি</option>
                    <option value="চাকরি">চাকরি</option>
                    <option value="ফুল টাইম">ফুল টাইম</option>
                    <option value="পার্ট টাইম">পার্ট টাইম</option>
                    <option value="কন্ট্রাক্ট">কন্ট্রাক্ট</option>
                  </select>
                  {isPending && (
                    <>
                      <button
                        onClick={() => onApprove(posting.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                        title="অনুমোদন করুন"
                        aria-label="অনুমোদন করুন"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => onReject(posting.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-600 transition hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-950"
                        title="বাতিল করুন"
                        aria-label="বাতিল করুন"
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete(posting.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                    title="মুছে ফেলুন"
                    aria-label="মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
