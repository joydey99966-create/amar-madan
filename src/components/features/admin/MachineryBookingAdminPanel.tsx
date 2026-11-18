import { CalendarDays, Check, Phone, Trash2, XCircle } from 'lucide-react'
import {
  machineryBookingService,
  MachineryBooking,
} from '../../../services/machineryBookingService'
import { toBanglaNumber } from '../../../utils/formatters'

interface MachineryBookingAdminPanelProps {
  bookings: MachineryBooking[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
}

const statusBadge = (status: MachineryBooking['status']) => {
  if (status === 'approved') return { text: 'অনুমোদিত', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
  if (status === 'rejected') return { text: 'বাতিল', className: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' }
  return { text: 'অনুমোদনের অপেক্ষায়', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
}

/** Admin CMS for machinery booking requests. */
export function MachineryBookingAdminPanel({
  bookings,
  onApprove,
  onReject,
  onDelete,
}: MachineryBookingAdminPanelProps) {
  const pending = bookings.filter((b) => b.status === 'pending')
  const others = bookings.filter((b) => b.status !== 'pending')
  const ordered = [...pending, ...others]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">যন্ত্রপাতি বুকিংয়ের অনুরোধ</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {toBanglaNumber(pending.length)} টি অপেক্ষমাণ
        </span>
      </div>

      {ordered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <CalendarDays size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">কোনো বুকিংয়ের অনুরোধ নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((b) => {
            const badge = statusBadge(b.status)
            return (
              <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-white">{b.machineName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.text}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays size={12} className="mr-1 inline" /> বুকিংয়ের তারিখ: {b.date}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <Phone size={12} className="mr-1 inline" /> যোগাযোগ: {b.contact}
                      {b.requesterName ? ` • ${b.requesterName}` : ''}
                    </p>
                    {b.note && <p className="mt-0.5 text-xs text-slate-400">{b.note}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(b.id)}
                          title="অনুমোদন করুন"
                          aria-label="অনুমোদন করুন"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => onReject(b.id)}
                          title="বাতিল করুন"
                          aria-label="বাতিল করুন"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-600 transition hover:bg-amber-50 dark:border-amber-900/40"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(b.id)}
                      title="মুছে ফেলুন"
                      aria-label="মুছে ফেলুন"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
