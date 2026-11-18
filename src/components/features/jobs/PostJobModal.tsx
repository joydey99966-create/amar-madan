import { useEffect, useState } from 'react'
import { JobPosting } from '../../../types'
import { useToast } from '../../../context/ToastContext'
import { jobPostingService } from '../../../services/jobPostingService'
import { toBanglaNumber } from '../../../utils/formatters'
import { isTodayOrFuture, isValidBangladeshPhone } from '../../../utils/validation'
import { formErrorClass, formFieldClass, formLabelClass, ModalShell } from '../../common/ModalShell'

interface PostJobModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called after a posting is queued for approval, so lists can refresh. */
  onSubmitted: () => void
}

type JobCategory = JobPosting['category']
type JobType = NonNullable<JobPosting['type']>

const CATEGORIES: JobCategory[] = ['চাকরি', 'টিউশনি', 'খণ্ডকালীন']
const TYPES: JobType[] = ['ফুল টাইম', 'পার্ট টাইম', 'কন্ট্রাক্ট', 'টিউশনি']

/**
 * Public "চাকরি / টিউশনি পোস্ট করুন" form. Every submission starts as pending
 * and only becomes visible after an admin approves it in the dashboard.
 */
export function PostJobModal({ isOpen, onClose, onSubmitted }: PostJobModalProps) {
  const { addToast } = useToast()
  const [form, setForm] = useState({
    title: '',
    category: 'চাকরি' as JobCategory,
    type: 'ফুল টাইম' as JobType,
    organization: '',
    location: 'মদন পৌরসভা',
    salaryAmount: '',
    deadline: '',
    contact: '',
    description: '',
    posterName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return
    setErrors({})
  }, [isOpen])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = 'পদের নাম লিখুন'
    if (!form.organization.trim()) nextErrors.organization = 'প্রতিষ্ঠানের নাম লিখুন'
    if (!form.contact.trim()) nextErrors.contact = 'যোগাযোগের মোবাইল নম্বর লিখুন'
    else if (!isValidBangladeshPhone(form.contact)) {
      nextErrors.contact = 'বৈধ বাংলাদেশী মোবাইল নম্বর লিখুন (০১X-XXXXX-XXXX)'
    }
    if (!form.salaryAmount.trim() || Number.isNaN(Number(form.salaryAmount))) {
      nextErrors.salaryAmount = 'মাসিক বেতন সংখ্যায় লিখুন'
    }
    if (!form.deadline) nextErrors.deadline = 'আবেদনের শেষ তারিখ দিন'
    else if (!isTodayOrFuture(form.deadline)) {
      nextErrors.deadline = 'আবেদনের শেষ তারিখ আজ বা ভবিষ্যতের হতে হবে'
    }
    if (form.description.trim().length > 500) {
      nextErrors.description = 'বিবরণ ৫০০ অক্ষরের মধ্যে লিখুন'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const salary = Number(form.salaryAmount)
    jobPostingService.addPending({
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      organization: form.organization.trim(),
      location: form.location.trim() || 'মদন',
      salary: `${toBanglaNumber(salary)} টাকা / মাস`,
      salaryAmount: salary,
      deadline: form.deadline,
      contact: form.contact.trim(),
      description: form.description.trim() || 'বিস্তারিত জানতে সরাসরি যোগাযোগ করুন।',
      posterName: form.posterName.trim() || undefined,
    })

    addToast('পোস্ট জমা হয়েছে — অ্যাডমিন অনুমোদনের পর তালিকায় দেখা যাবে।', 'success')
    onSubmitted()
    onClose()
    setForm({
      title: '',
      category: 'চাকরি',
      type: 'ফুল টাইম',
      organization: '',
      location: 'মদন পৌরসভা',
      salaryAmount: '',
      deadline: '',
      contact: '',
      description: '',
      posterName: '',
    })
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="চাকরি / টিউশনি পোস্ট করুন"
      description="পোস্টটি অ্যাডমিন যাচাই করে অনুমোদন দিলে তালিকায় প্রকাশিত হবে।"
      titleId="post-job-title"
      maxWidthClass="max-w-lg"
      footer={
        <div className="space-y-2">
          <button
            type="submit"
            form="post-job-form"
            className="w-full rounded-xl bg-forest px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            ✓ পোস্ট জমা দিন
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
      <form id="post-job-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={formLabelClass} htmlFor="job-title">
            পদের নাম
          </label>
          <input
            id="job-title"
            type="text"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="যেমন: অষ্টম শ্রেণির গণিত শিক্ষক প্রয়োজন"
            className={formFieldClass}
          />
          {errors.title && <p className={formErrorClass}>{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass} htmlFor="job-category">
              বিভাগ
            </label>
            <select
              id="job-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value as JobCategory })}
              className={formFieldClass}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={formLabelClass} htmlFor="job-type">
              কাজের ধরন
            </label>
            <select
              id="job-type"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as JobType })}
              className={formFieldClass}
            >
              {TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={formLabelClass} htmlFor="job-org">
            প্রতিষ্ঠান / ব্যক্তি
          </label>
          <input
            id="job-org"
            type="text"
            value={form.organization}
            onChange={(event) => setForm({ ...form, organization: event.target.value })}
            placeholder="যেমন: মেসার্স ভাই ভাই এন্টারপ্রাইজ"
            className={formFieldClass}
          />
          {errors.organization && <p className={formErrorClass}>{errors.organization}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass} htmlFor="job-location">
              এলাকা
            </label>
            <input
              id="job-location"
              type="text"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              className={formFieldClass}
            />
          </div>
          <div>
            <label className={formLabelClass} htmlFor="job-salary">
              মাসিক বেতন (টাকা)
            </label>
            <input
              id="job-salary"
              type="number"
              inputMode="numeric"
              value={form.salaryAmount}
              onChange={(event) => setForm({ ...form, salaryAmount: event.target.value })}
              placeholder="৮০০০"
              className={formFieldClass}
            />
            {errors.salaryAmount && <p className={formErrorClass}>{errors.salaryAmount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass} htmlFor="job-deadline">
              আবেদনের শেষ তারিখ
            </label>
            <input
              id="job-deadline"
              type="date"
              value={form.deadline}
              onChange={(event) => setForm({ ...form, deadline: event.target.value })}
              className={formFieldClass}
            />
            {errors.deadline && <p className={formErrorClass}>{errors.deadline}</p>}
          </div>
          <div>
            <label className={formLabelClass} htmlFor="job-contact">
              যোগাযোগের নম্বর
            </label>
            <input
              id="job-contact"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={15}
              value={form.contact}
              onChange={(event) => setForm({ ...form, contact: event.target.value })}
              placeholder="০১৭XXXXXXXX"
              className={formFieldClass}
            />
            {errors.contact && <p className={formErrorClass}>{errors.contact}</p>}
          </div>
        </div>

        <div>
          <label className={formLabelClass} htmlFor="job-description">
            বিস্তারিত
          </label>
          <textarea
            id="job-description"
            rows={3}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="কাজের সময়, যোগ্যতা ও সুবিধা সংক্ষেপে লিখুন"
            className={formFieldClass}
          />
        </div>

        <div>
          <label className={formLabelClass} htmlFor="job-poster">
            আপনার নাম (ঐচ্ছিক)
          </label>
          <input
            id="job-poster"
            type="text"
            autoComplete="name"
            value={form.posterName}
            onChange={(event) => setForm({ ...form, posterName: event.target.value })}
            className={formFieldClass}
          />
        </div>

        <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          🔒 পোস্ট প্রকাশের আগে অ্যাডমিন যাচাই করবেন — এতে ভুয়া বিজ্ঞপ্তি ঠেকানো যায়।
        </p>
      </form>
    </ModalShell>
  )
}
