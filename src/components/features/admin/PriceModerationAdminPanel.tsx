import { CheckCircle2, Clock, MapPin, Trash2, XCircle } from 'lucide-react'
import { PriceSubmission } from '../../../types/priceModeration'

interface PriceModerationAdminPanelProps {
  submissions: PriceSubmission[]
  pendingCount: number
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRefresh: () => void
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function formatPrice(value: number | string): string {
  const numeric =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))))
  if (!Number.isFinite(numeric)) return String(value)
  try {
    return new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 2 }).format(numeric)
  } catch {
    return String(numeric)
  }
}

function formatSubmittedAt(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return timestamp
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return timestamp
  }
}

export function PriceModerationAdminPanel({
  submissions,
  pendingCount,
  onApprove,
  onReject,
  onRefresh,
}: PriceModerationAdminPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            দাম যাচাই ও অনুমোদন
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Clock size={13} />
            অপেক্ষমাণ: {pendingCount}
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:self-auto"
        >
          রিফ্রেশ করুন
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-blue-50 p-4 text-xs leading-5 text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-200">
        ব্যবহারকারীরা জমা দেওয়া দামগুলো এখানে যাচাই করে অনুমোদন বা বাতিল করুন।
        অনুমোদন করলে লাইভ বাজার দর আপডেট হবে; বাতিল করলে কোনো পরিবর্তন হবে না।
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-white/10 sm:py-12">
          <CheckCircle2 size={32} className="mb-2 text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            কোনো অপেক্ষমাণ সাবমিশন নেই
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
            <thead className="bg-slate-50 dark:bg-[#1a2420]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  পণ্য
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  এলাকা
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                  বর্তমান দাম
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                  প্রস্তাবিত দাম
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  জমাদাতা
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  সময়
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-white/5 dark:bg-[#0f1411]">
              {submissions.map((submission) => {
                const priceIncreased =
                  submission.suggestedPrice > submission.currentPrice &&
                  submission.currentPrice > 0
                const priceDecreased =
                  submission.suggestedPrice < submission.currentPrice &&
                  submission.currentPrice > 0

                return (
                  <tr key={submission.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {submission.productName}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {submission.category}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin size={13} className="shrink-0 text-slate-400" />
                        <span>{submission.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {submission.currentPrice > 0 ? (
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          ৳{formatPrice(submission.currentPrice)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold ${
                          priceIncreased
                            ? 'text-rose-600 dark:text-rose-400'
                            : priceDecreased
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-forest dark:text-emerald-300'
                        }`}
                      >
                        ৳{formatPrice(submission.suggestedPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {submission.submittedBy || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={12} className="shrink-0" />
                        {formatSubmittedAt(submission.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onApprove(submission.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                          title="অনুমোদন করুন"
                          aria-label="অনুমোদন করুন"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(submission.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                          title="বাতিল করুন"
                          aria-label="বাতিল করুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile-friendly card fallback is the table above (horizontal scroll). */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <XCircle size={12} />
        <span>বাতিল করলে সাজেশনটি স্থায়ীভাবে মুছে যাবে।</span>
      </div>
    </div>
  )
}
