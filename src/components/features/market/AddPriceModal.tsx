import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Info, MapPin, MessageCircle, ShieldCheck, Tag, X } from 'lucide-react'
import { STORAGE_KEYS, unionAreas } from '../../../constants'
import { useToast } from '../../../context/ToastContext'
import { usePriceModerationQueue } from '../../../hooks/usePriceModerationQueue'
import { marketService } from '../../../services'
import { isValidBangladeshPhone } from '../../../utils/validation'
import { submissionBridgeService } from '../../../services/submissionBridgeService'

interface AddPriceModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  productName: string
  location: string
  price: string
  unit: string
  submittedBy: string
  phone: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  productName: '',
  location: 'মদন বাজার',
  price: '',
  unit: 'প্রতি কেজি',
  submittedBy: '',
  phone: '',
}

const UNITS = ['প্রতি কেজি', 'প্রতি হালি', 'প্রতি লিটার', 'প্রতি মণ', 'প্রতি পিস', 'প্রতি ডিবি']

const PRODUCT_SUGGESTIONS = [
  'আলু',
  'পেঁয়াজ',
  'ডিম',
  'রসুন',
  'আদা',
  'মরিচ',
  'টমেটো',
  'বেগুন',
  'শাক',
  'চাল',
  'ডাল',
  'সয়াবি তেল',
  'চিনি',
  'দুধ',
  'মাছ',
  'হাওরের মাছ',
  'ধান',
]

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

const INPUT_BASE =
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-forest focus:ring-4 focus:ring-forest/10 dark:bg-[#1a2420] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/20'

function inputClass(error?: string): string {
  return `${INPUT_BASE} ${
    error ? 'border-rose-400 dark:border-rose-600' : 'border-slate-200 dark:border-white/10'
  }`
}

function parsePrice(value: string): number {
  const normalized = value
    .replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))
    .replace(/,/g, '')
    .trim()

  if (!normalized || normalized.includes('-')) return Number.NaN

  const match = normalized.match(/\d+(\.\d+)?/)
  if (!match) return Number.NaN

  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatTaka(value: number): string {
  try {
    return new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 2 }).format(value)
  } catch {
    return String(value)
  }
}

/**
 * Public "add a market price" form.
 *
 * Submissions are written to the isolated moderation queue with a `pending`
 * status — the published price list is never touched from here. The admin
 * dashboard is the only place where a price may be approved.
 */
export function AddPriceModal({ isOpen, onClose }: AddPriceModalProps) {
  const { addToast } = useToast()
  const { submitSubmission } = usePriceModerationQueue()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [blockMessage, setBlockMessage] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const currentPrice = useMemo(() => marketService.getCurrentPrice(form.productName), [form.productName])

  useEffect(() => {
    if (!isOpen) return

    panelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleClose = () => {
    setErrors({})
    setBlockMessage(null)
    setSubmittedUrl(null)
    setForm(INITIAL_FORM)
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBlockMessage(null)

    // Honeypot: real users never see this field, bots fill everything in.
    if (honeypot.trim()) {
      setForm(INITIAL_FORM)
      setHoneypot('')
      onClose()
      return
    }

    const productName = form.productName.trim()
    const suggestedPrice = parsePrice(form.price)
    const nextErrors: FormErrors = {}

    if (!productName) {
      nextErrors.productName = 'পণ্যের নাম লিখুন'
    } else if (productName.length < 2) {
      nextErrors.productName = 'কমপক্ষে ২ অক্ষরের নাম লিখুন'
    } else if (productName.length > 60) {
      nextErrors.productName = 'নাম ৬০ অক্ষরের মধ্যে লিখুন'
    }

    if (!form.location) {
      nextErrors.location = 'এলাকা / বাজার নির্বাচন করুন'
    }

    if (!form.price.trim()) {
      nextErrors.price = 'বর্তমান দাম লিখুন'
    } else if (!Number.isFinite(suggestedPrice) || suggestedPrice <= 0) {
      nextErrors.price = '১ টাকার বেশি একটি বৈধ দাম লিখুন'
    } else if (suggestedPrice > 100000) {
      nextErrors.price = 'দামটি সম্ভাব্য নয় — আবার দেখে নিন'
    }

    if (form.submittedBy.trim().length > 40) {
      nextErrors.submittedBy = 'নাম ৪০ অক্ষরের মধ্যে লিখুন'
    }

    const phone = form.phone.trim()
    if (phone && !isValidBangladeshPhone(phone)) {
      nextErrors.phone = 'বৈধ বাংলাদেশী মোবাইল নম্বর লিখুন (০১X-XXXXX-XXXX)'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const { submission, guard } = submitSubmission({
      productName,
      category: marketService.inferCategory(productName),
      suggestedPrice,
      currentPrice: marketService.getCurrentPrice(productName),
      location: form.location,
      submittedBy: form.submittedBy.trim() || undefined,
      status: 'pending',
    })

    if (!submission) {
      setBlockMessage(
        guard.message ?? 'এই মুহূর্তে দাম পাঠানো যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
      )
      return
    }

    const waUrl = submissionBridgeService.buildPriceWhatsAppUrl({
      itemName: productName,
      category: marketService.inferCategory(productName),
      price: suggestedPrice,
      unit: form.unit,
      marketName: form.location,
      reporterPhone: form.phone.trim() || undefined,
    })

    addToast(
      'ধন্যবাদ! আপনার দাম যাচাইয়ের জন্য জমা হয়েছে।',
      'success',
    )

    setSubmittedUrl(waUrl)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-price-title"
        tabIndex={-1}
        className="lg-glass max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[28px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none animate-slide-up sm:rounded-[28px] sm:p-6 sm:pb-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/15 sm:hidden" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest dark:bg-emerald-900/30 dark:text-emerald-300">
              <Tag size={22} />
            </div>
            <div>
              <h2
                id="add-price-title"
                className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl"
              >
                {submittedUrl ? 'দাম জমা সম্পন্ন' : 'বাজারের দাম যোগ করুন'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                {submittedUrl ? 'ভেরিফিকেশনের জন্য হোয়াটসঅ্যাপে পাঠান' : 'আপনার এলাকার বাজার দর জানান — যাচাইয়ের পর প্রকাশ করা হবে।'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="ফর্ম বন্ধ করুন"
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
              দাম সফলভাবে জমা হয়েছে!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              আপনার রিপোর্ট করা বাজারদর সংরক্ষিত হয়েছে। মদন বাজারদরে দ্রুত ভেরিফিকেশন ও প্রকাশের জন্য মদন অ্যাডমিনকে হোয়াটসঅ্যাপে পাঠিয়ে দিন।
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
                onClick={handleClose}
                className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
              >
                পরে পাঠাবো / বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <p>
                আপনার দাম সরাসরি তালিকায় যাবে না। প্রথমে অ্যাডমিন যাচাই করবেন, তারপর
                ভেরিফায়েড তালিকায় যোগ করা হবে।
              </p>
            </div>

        {blockMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3 text-xs leading-5 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>{blockMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
          {/* Honeypot — hidden from users, tempting for bots. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label htmlFor="add-price-website">website</label>
            <input
              id="add-price-website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="add-product-name"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              পণ্যের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="add-product-name"
              type="text"
              list="add-price-products"
              value={form.productName}
              onChange={(event) => setForm({ ...form, productName: event.target.value })}
              placeholder="যেমন: আলু, পেঁয়াজ, ডিম"
              maxLength={60}
              aria-invalid={Boolean(errors.productName)}
              className={inputClass(errors.productName)}
            />
            <datalist id="add-price-products">
              {PRODUCT_SUGGESTIONS.map((product) => (
                <option key={product} value={product} />
              ))}
            </datalist>

            {errors.productName ? (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.productName}</p>
            ) : (
              form.productName.trim().length >= 2 && (
                <p
                  className={`mt-1.5 text-xs ${
                    currentPrice > 0
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {currentPrice > 0
                    ? `বর্তমান ভেরিফায়েড দর: ৳${formatTaka(currentPrice)}`
                    : 'এই পণ্যটি এখনো তালিকায় নেই — নতুন পণ্য হিসেবে যাচাই হবে।'}
                </p>
              )
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="add-location"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                এলাকা / বাজার <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  id="add-location"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  aria-invalid={Boolean(errors.location)}
                  className={`${inputClass(errors.location)} pl-10`}
                >
                  {unionAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              {errors.location && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.location}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-price"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                বর্তমান দাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ৳
                </span>
                <input
                  id="add-price"
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="যেমন: ৫০"
                  maxLength={12}
                  aria-invalid={Boolean(errors.price)}
                  className={`${inputClass(errors.price)} pl-8 pr-14`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                  টাকা
                </span>
              </div>
              {errors.price ? (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.price}</p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  প্রতি কেজি / হালি / লিটার অনুযায়ী
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="add-unit"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              একক
            </label>
            <select
              id="add-unit"
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
              className={inputClass()}
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="add-submitted-by"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                আপনার নাম{' '}
                <span className="font-normal text-slate-400">(যাচাইয়ের জন্য ঐচ্ছিক)</span>
              </label>
              <input
                id="add-submitted-by"
                type="text"
                autoComplete="name"
                value={form.submittedBy}
                onChange={(event) => setForm({ ...form, submittedBy: event.target.value })}
                placeholder="যেমন: স্থানীয় ক্রেতা"
                maxLength={40}
                aria-invalid={Boolean(errors.submittedBy)}
                className={inputClass(errors.submittedBy)}
              />
              {errors.submittedBy && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {errors.submittedBy}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-phone"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                মোবাইল নম্বর{' '}
                <span className="font-normal text-slate-400">(ঐচ্ছিক)</span>
              </label>
              <input
                id="add-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="০১৭xxxxxxxx"
                maxLength={15}
                aria-invalid={Boolean(errors.phone)}
                className={inputClass(errors.phone)}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 -mb-5 mt-2 border-t border-slate-100 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-white/10 dark:bg-[#0f1411] sm:-mx-6 sm:-mb-6 sm:px-6 sm:pb-4">
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:flex-1"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white shadow-forest transition hover:bg-forest-dark active:scale-[0.99] sm:flex-[1.35]"
              >
                <Tag size={16} />
                দাম পাঠান
              </button>
            </div>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck size={12} className="shrink-0" />
              জমা দেওয়া তথ্য যাচাই না হওয়া পর্যন্ত প্রকাশ হবে না
            </p>
          </div>
        </form>
      </>
    )}
  </div>
</div>
  )
}
