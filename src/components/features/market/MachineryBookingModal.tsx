import { useState } from 'react'
import { CalendarDays, Phone } from 'lucide-react'
import { AgroMachineryItem } from '../../../types'
import { ModalShell, formFieldClass, formLabelClass, formErrorClass } from '../../common/ModalShell'
import { machineryBookingService } from '../../../services/machineryBookingService'
import { useToast } from '../../../context/ToastContext'
import { isTodayOrFuture, isValidBangladeshPhone } from '../../../utils/validation'

interface MachineryBookingModalProps {
  item: AgroMachineryItem | null
  onClose: () => void
}

/** Request-to-book form for a machinery item. Submissions start as "pending". */
export function MachineryBookingModal({ item, onClose }: MachineryBookingModalProps) {
  const { addToast } = useToast()
  const [date, setDate] = useState('')
  const [contact, setContact] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [booked, setBooked] = useState(false)

  if (!item) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!date.trim()) nextErrors.date = 'বুকিংয়ের তারিখ দিন'
    else if (!isTodayOrFuture(date.trim())) {
      nextErrors.date = 'বুকিংয়ের তারিখ আজ বা ভবিষ্যতের হতে হবে'
    }
    if (!contact.trim()) nextErrors.contact = 'আপনার মোবাইল নম্বর লিখুন'
    else if (!isValidBangladeshPhone(contact)) {
      nextErrors.contact = 'বৈধ বাংলাদেশী মোবাইল নম্বর লিখুন (০১X-XXXXX-XXXX)'
    }
    if (name.trim().length > 60) nextErrors.name = 'নাম ৬০ অক্ষরের মধ্যে লিখুন'
    if (note.trim().length > 300) nextErrors.note = 'বার্তা ৩০০ অক্ষরের মধ্যে লিখুন'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    machineryBookingService.add({
      itemId: item.id,
      machineName: item.name,
      ownerPhone: item.phone,
      date: date.trim(),
      contact: contact.trim(),
      requesterName: name.trim() || undefined,
      note: note.trim() || undefined,
    })
    addToast('বুকিংয়ের অনুরোধ পাঠানো হয়েছে — অনুমোদনের অপেক্ষায়', 'success')
    setBooked(true)
    setDate('')
    setContact('')
    setName('')
    setNote('')
    setErrors({})
    onClose()
  }

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      title="বুকিংয়ের অনুরোধ"
      description={item.name}
      titleId="machinery-booking-title"
      maxWidthClass="max-w-md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
        >
          বন্ধ করুন
        </button>
      }
    >
      {booked ? (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          আপনার বুকিংয়ের অনুরোধ জমা হয়েছে। অ্যাডমিন অনুমোদন করলে স্ট্যাটাস দেখা যাবে।
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={formLabelClass} htmlFor="booking-date">
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> বুকিংয়ের তারিখ</span>
            </label>
            <input
              id="booking-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={formFieldClass}
            />
            {errors.date && <p className={formErrorClass}>{errors.date}</p>}
          </div>
          <div>
            <label className={formLabelClass} htmlFor="booking-contact">
              <span className="inline-flex items-center gap-1.5"><Phone size={14} /> আপনার মোবাইল নম্বর</span>
            </label>
            <input
              id="booking-contact"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={15}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="০১৭XXXXXXXX"
              className={formFieldClass}
            />
            {errors.contact && <p className={formErrorClass}>{errors.contact}</p>}
          </div>
          <div>
            <label className={formLabelClass} htmlFor="booking-name">আপনার নাম (ঐচ্ছিক)</label>
            <input
              id="booking-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={formFieldClass}
            />
            {errors.name && <p className={formErrorClass}>{errors.name}</p>}
          </div>
          <div>
            <label className={formLabelClass} htmlFor="booking-note">বার্তা (ঐচ্ছিক)</label>
            <textarea
              id="booking-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={formFieldClass}
            />
            {errors.note && <p className={formErrorClass}>{errors.note}</p>}
          </div>
          <p className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            অনুরোধটি অ্যাডমিন যাচাইয়ের পরেই চূড়ান্ত হবে। কোনো ফি এখন নেওয়া হয় না।
          </p>
          <button type="submit" className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark">
            বুকিংয়ের অনুরোধ পাঠান
          </button>
        </form>
      )}
    </ModalShell>
  )
}
