import { useEffect, useState } from 'react'
import { LostFoundItem } from '../../../types'
import { useToast } from '../../../context/ToastContext'
import { lostFoundService } from '../../../services/lostFoundService'
import { formErrorClass, formFieldClass, formLabelClass, ModalShell } from '../../common/ModalShell'
import { isValidBangladeshPhone } from '../../../utils/validation'

interface PostLostFoundModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
}

/** Public "হারানো / প্রাপ্তি" board posting form (admin approved). */
export function PostLostFoundModal({ isOpen, onClose, onSubmitted }: PostLostFoundModalProps) {
  const { addToast } = useToast()
  const [form, setForm] = useState({
    type: 'হারানো' as LostFoundItem['type'],
    itemName: '',
    location: '',
    date: '',
    description: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return
    setErrors({})
  }, [isOpen])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.itemName.trim()) nextErrors.itemName = 'জিনিসের নাম লিখুন'
    else if (form.itemName.trim().length > 80) nextErrors.itemName = 'জিনিসের নাম ৮০ অক্ষরের মধ্যে লিখুন'
    if (!form.location.trim()) nextErrors.location = 'কোথায় হারিয়েছে/পেয়েছেন লিখুন'
    if (!form.phone.trim()) nextErrors.phone = 'যোগাযোগের মোবাইল নম্বর লিখুন'
    else if (!isValidBangladeshPhone(form.phone)) {
      nextErrors.phone = 'বৈধ বাংলাদেশী মোবাইল নম্বর লিখুন (০১X-XXXXX-XXXX)'
    }
    if (form.description.trim().length > 500) {
      nextErrors.description = 'বিবরণ ৫০০ অক্ষরের মধ্যে লিখুন'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const today = new Date()
    lostFoundService.add({
      type: form.type,
      itemName: form.itemName.trim(),
      location: form.location.trim(),
      date: form.date.trim() || today.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' }),
      description: form.description.trim(),
      phone: form.phone.trim(),
    })

    addToast('বিজ্ঞপ্তি জমা হয়েছে — অনুমোদনের পর তালিকায় দেখা যাবে।', 'success')
    onSubmitted()
    onClose()
    setForm({ type: 'হারানো', itemName: '', location: '', date: '', description: '', phone: '' })
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="নতুন বিজ্ঞপ্তি দিন"
      description="হারানো বা পাওয়া জিনিসের তথ্য দিন — অ্যাডমিন যাচাই করে প্রকাশ করবেন।"
      titleId="post-lostfound-title"
      footer={
        <div className="space-y-2">
          <button
            type="submit"
            form="post-lostfound-form"
            className="w-full rounded-xl bg-forest px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            ✓ বিজ্ঞপ্তি জমা দিন
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
      <form id="post-lostfound-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={formLabelClass}>বিজ্ঞপ্তির ধরন</label>
          <div className="grid grid-cols-2 gap-2">
            {(['হারানো', 'প্রাপ্তি'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, type })}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  form.type === type
                    ? 'border-forest bg-forest text-white'
                    : 'border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
                }`}
              >
                {type === 'হারানো' ? '😟 হারিয়ে গেছে' : '🙌 খুঁজে পেয়েছি'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={formLabelClass} htmlFor="lf-item">
            জিনিসের নাম
          </label>
          <input
            id="lf-item"
            type="text"
            value={form.itemName}
            onChange={(event) => setForm({ ...form, itemName: event.target.value })}
            placeholder="যেমন: মোবাইল ফোন, এনআইডি কার্ড"
            className={formFieldClass}
          />
          {errors.itemName && <p className={formErrorClass}>{errors.itemName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass} htmlFor="lf-location">
              স্থান
            </label>
            <input
              id="lf-location"
              type="text"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              placeholder="মদন বাজার"
              className={formFieldClass}
            />
            {errors.location && <p className={formErrorClass}>{errors.location}</p>}
          </div>
          <div>
            <label className={formLabelClass} htmlFor="lf-date">
              তারিখ
            </label>
            <input
              id="lf-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className={formFieldClass}
            />
          </div>
        </div>

        <div>
          <label className={formLabelClass} htmlFor="lf-description">
            বিবরণ
          </label>
          <textarea
            id="lf-description"
            rows={3}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="রঙ, ব্র্যান্ড বা শনাক্ত করার মতো বৈশিষ্ট্য লিখুন"
            className={formFieldClass}
          />
        </div>

        <div>
          <label className={formLabelClass} htmlFor="lf-phone">
            যোগাযোগের নম্বর
          </label>
          <input
            id="lf-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={15}
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="০১৭XXXXXXXX"
            className={formFieldClass}
          />
          {errors.phone && <p className={formErrorClass}>{errors.phone}</p>}
        </div>
      </form>
    </ModalShell>
  )
}
