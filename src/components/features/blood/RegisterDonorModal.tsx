import { useEffect, useState } from 'react'
import { CheckCircle2, MessageCircle, X } from 'lucide-react'
import { BloodDonor, BloodGroup } from '../../../types'
import { bloodGroups, unionAreas } from '../../../constants'
import { useToast } from '../../../context/ToastContext'
import { isValidBangladeshPhone } from '../../../utils/validation'
import { submissionBridgeService } from '../../../services/submissionBridgeService'

interface RegisterDonorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (donor: Omit<BloodDonor, 'id'>) => void
}

export function RegisterDonorModal({ isOpen, onClose, onSubmit }: RegisterDonorModalProps) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+' as BloodGroup,
    unionArea: 'মদন পৌরসভা' as (typeof unionAreas)[0],
    lastDonationDate: '',
    phone: '',
    availability: 'available' as 'available' | 'busy',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)

  // Escape closes the dialog and the page behind it stays put.
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'দাতার নাম লিখুন'
    else if (formData.name.trim().length > 60) newErrors.name = 'নাম ৬০ অক্ষরের মধ্যে লিখুন'
    if (!formData.phone.trim()) newErrors.phone = 'মোবাইল নম্বর লিখুন'
    else if (!isValidBangladeshPhone(formData.phone)) {
      newErrors.phone = 'বৈধ বাংলাদেশী মোবাইল নম্বর লিখুন (০১X-XXXXX-XXXX)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResetAndClose = () => {
    setSubmittedUrl(null)
    setFormData({
      name: '',
      bloodGroup: 'O+',
      unionArea: 'মদন পৌরসভা',
      lastDonationDate: '',
      phone: '',
      availability: 'available',
    })
    setErrors({})
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    const waUrl = submissionBridgeService.buildDonorWhatsAppUrl({
      name: formData.name.trim(),
      bloodGroup: formData.bloodGroup,
      unionArea: formData.unionArea,
      phone: formData.phone.trim(),
      lastDonationDate: formData.lastDonationDate || undefined,
    })

    onSubmit({
      name: formData.name.trim(),
      bloodGroup: formData.bloodGroup,
      unionArea: formData.unionArea,
      lastDonationDate: formData.lastDonationDate || null,
      phone: formData.phone.trim(),
      availability: formData.availability,
    })

    addToast('তথ্য জমা হয়েছে! অ্যাডমিন যাচাইয়ের পর সার্বজনীন তালিকায় যুক্ত হবে।', 'success')
    setSubmittedUrl(waUrl)
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-donor-title"
        className="lg-glass flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] sm:max-h-[calc(90dvh-1rem)] sm:rounded-[32px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Sticky close bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
          <h2
            id="register-donor-title"
            className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl"
          >
            {submittedUrl ? 'নিবন্ধন সম্পন্ন' : 'রক্তদাতা হোন'}
          </h2>
          <button
            onClick={handleResetAndClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        {submittedUrl ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              আপনার তথ্যটি সংরক্ষিত হয়েছে। মদন রক্তদাতা ডিরেক্টরিতে দ্রুত যাচাই ও সবার জন্য প্রকাশের জন্য মদন কোঅর্ডিনেটরকে হোয়াটসঅ্যাপে সরাসরি পাঠিয়ে দিন।
            </p>
            <div className="w-full space-y-2 pt-2">
              <a
                href={submittedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <MessageCircle size={18} /> হোয়াটসঅ্যাপে সরাসরি পাঠান
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
              >
                পরে পাঠাবো / বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
            আপনার তথ্য দিয়ে আমাদের রক্তদাতা তালিকায় যোগ হন এবং জরুরি সময়ে মানুষের সেবা করুন।
          </p>

          <form id="register-donor-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                আপনার নাম
              </label>
              <input
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: মোঃ রহিম"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition dark:bg-[#1a2420] text-slate-800 dark:text-white ${
                  errors.name ? 'border-rose-400 dark:border-rose-600' : 'border-slate-200 dark:border-white/10'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  রক্তের গ্রুপ
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition dark:border-white/10 dark:bg-[#1a2420] text-slate-800 dark:text-white"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  ফোন নম্বর
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={15}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="০১৭XXXXXXXX"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition dark:bg-[#1a2420] text-slate-800 dark:text-white ${
                    errors.phone ? 'border-rose-400 dark:border-rose-600' : 'border-slate-200 dark:border-white/10'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                এলাকা / ইউনিয়ন
              </label>
              <select
                value={formData.unionArea}
                onChange={(e) => setFormData({ ...formData, unionArea: e.target.value as (typeof unionAreas)[0] })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition dark:border-white/10 dark:bg-[#1a2420] text-slate-800 dark:text-white"
              >
                {unionAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                গত রক্তদানের তারিখ (ঐচ্ছিক)
              </label>
              <input
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition dark:border-white/10 dark:bg-[#1a2420] text-slate-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                রক্তদানের মধ্যে কমপক্ষে ৫৬ দিন (৮ সপ্তাহ) ব্যবধান থাকতে হয়
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                অ্যাভেইলবিলিটি / স্ট্যাটাস
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value as 'available' | 'busy' })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition dark:border-white/10 dark:bg-[#1a2420] text-slate-800 dark:text-white"
              >
                <option value="available">উপলব্ধ / প্রস্তুত</option>
                <option value="busy">ব্যস্ত / অনুপলব্ধ</option>
              </select>
            </div>
          </form>

          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            💚 আপনার তথ্য সম্পূর্ণ নিরাপদ এবং শুধুমাত্র জরুরি অবস্থায় ব্যবহৃত হবে।
          </div>
        </div>

        {/* Sticky action bar — always reachable, even on short screens */}
        <div className="shrink-0 space-y-2 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/10 sm:px-6">
          <button
            type="submit"
            form="register-donor-form"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-forest px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#104b38] disabled:opacity-60"
          >
            {isSubmitting ? 'যোগ করা হচ্ছে...' : '✓ আমাকে যোগ করুন'}
          </button>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            বাতিল করুন
          </button>
        </div>
      </>
    )}
  </div>
</div>
  )
}
