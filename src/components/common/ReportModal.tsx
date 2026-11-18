import { useEffect, useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { formErrorClass, formFieldClass, formLabelClass, ModalShell } from './ModalShell'

interface ReportModalProps {
  isOpen: boolean
  target: { listing: string; section: string } | null
  onClose: () => void
  onSubmit: (input: { reason: string; details: string; contact?: string }) => void
}

const REASONS = [
  'তথ্য পুরোনো হয়ে গেছে',
  'ফোন নম্বর ভুল',
  'ঠিকানা বা চেম্বারের সময় ভুল',
  'তালিকায় নাম নেই',
  'অন্য কিছু',
]

/** "ভুল তথ্য জানান" dialog, opened from every listing's meta line. */
export function ReportModal({ isOpen, target, onClose, onSubmit }: ReportModalProps) {
  const { addToast } = useToast()
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')

  // Reset the form each time a different listing is reported.
  useEffect(() => {
    if (!isOpen) return
    setReason(REASONS[0])
    setDetails('')
    setContact('')
    setError('')
  }, [isOpen, target?.listing])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!details.trim()) {
      setError('কী ভুল আছে সংক্ষেপে লিখুন')
      return
    }
    onSubmit({ reason, details: details.trim(), contact: contact.trim() || undefined })
    addToast('ধন্যবাদ! আপনার তথ্য অ্যাডমিনের কাছে পাঠানো হয়েছে।', 'success')
    onClose()
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="ভুল তথ্য জানান"
      description={target ? `${target.section} — ${target.listing}` : undefined}
      titleId="report-info-title"
      footer={
        <div className="space-y-2">
          <button
            type="submit"
            form="report-info-form"
            className="w-full rounded-xl bg-forest px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            রিপোর্ট পাঠান
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            বাতিল করুন
          </button>
        </div>
      }
    >
      <form id="report-info-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={formLabelClass} htmlFor="report-reason">
            সমস্যার ধরন
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={formFieldClass}
          >
            {REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={formLabelClass} htmlFor="report-details">
            বিস্তারিত
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={4}
            placeholder="যেমন: এই ডাক্তারের চেম্বার এখন বন্ধ, নতুন ঠিকানা ..."
            className={formFieldClass}
          />
          {error && <p className={formErrorClass}>{error}</p>}
        </div>

        <div>
          <label className={formLabelClass} htmlFor="report-contact">
            আপনার মোবাইল (ঐচ্ছিক)
          </label>
          <input
            id="report-contact"
            type="tel"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder="০১৭XXXXXXXX"
            className={formFieldClass}
          />
        </div>

        <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          🔎 অ্যাডমিন যাচাই করে তথ্য হালনাগাদ করবেন। আপনার নম্বর কোথাও প্রকাশ করা হবে না।
        </p>
      </form>
    </ModalShell>
  )
}
