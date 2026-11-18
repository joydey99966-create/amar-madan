import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Info, MapPin, MessageSquarePlus, Send, X } from 'lucide-react'
import { STORAGE_KEYS, unionAreas } from '../../../constants'
import { useToast } from '../../../context/ToastContext'
import { usePriceModerationQueue } from '../../../hooks/usePriceModerationQueue'
import { marketService, storageService } from '../../../services'
import { MarketPrice } from '../../../types'
interface SuggestPriceModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  productName: string
  location: string
  suggestedPrice: string
  submittedBy: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  productName: '',
  location: 'মদন বাজার',
  suggestedPrice: '',
  submittedBy: '',
}

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
  'সয়াবিন তেল',
  'চিনি',
  'দুধ',
  'মাছ',
]

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

const INPUT_BASE =
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-forest focus:ring-4 focus:ring-forest/10 dark:bg-[#1a2420] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/20'

function inputClass(error?: string): string {
  return `${INPUT_BASE} ${
    error ? 'border-rose-400 dark:border-rose-600' : 'border-slate-200 dark:border-white/10'
  }`
}

function formatTaka(value: number): string {
  try {
    return new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 2 }).format(value)
  } catch {
    return String(value)
  }
}

export function SuggestPriceModal({ isOpen, onClose }: SuggestPriceModalProps) {
  const { addToast } = useToast()
  const { submitSubmission } = usePriceModerationQueue()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const panelRef = useRef<HTMLDivElement>(null)

  const currentPrice = useMemo(
    () => marketService.getCurrentPrice(form.productName),
    [form.productName],
  )

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
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const productName = form.productName.trim()
    const suggestedPrice = marketService.parsePrice(form.suggestedPrice)
    const nextErrors: FormErrors = {}

    if (!productName) {
      nextErrors.productName = 'পণ্যের নাম লিখুন'
    } else if (productName.length < 2) {
      nextErrors.productName = 'কমপক্ষে ২ অক্ষরের নাম লিখুন'
    }

    if (!form.location) {
      nextErrors.location = 'এলাকা / বাজার নির্বাচন করুন'
    }

    if (!form.suggestedPrice.trim()) {
      nextErrors.suggestedPrice = 'বর্তমান দাম লিখুন'
    } else if (!Number.isFinite(suggestedPrice) || suggestedPrice <= 0) {
      nextErrors.suggestedPrice = '১ টাকার বেশি একটি বৈধ দাম লিখুন'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Queue-only write: this never touches the live market price storage key.
    const result = submitSubmission({
      productName,
      category: marketService.inferCategory(productName),
      suggestedPrice,
      currentPrice: marketService.getCurrentPrice(productName),
      location: form.location,
      submittedBy: form.submittedBy.trim() || undefined,
      status: 'pending',
    })

    if (!result.guard.allowed) {
      addToast(result.guard.message ?? 'এখনো আরও তথ্য পাঠানো যাচ্ছে না।', 'error')
      return
    }

    addToast(
      'ধন্যবাদ! আপনার তথ্যটি যাচাইয়ের জন্য অ্যাডমিন প্যানেলে পাঠানো হয়েছে।',
      'success',
    )

    setForm(INITIAL_FORM)
    setErrors({})
    onClose()
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
        aria-labelledby="suggest-price-title"
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[28px] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none animate-slide-up dark:bg-[#0f1411] sm:rounded-[28px] sm:p-6 sm:pb-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/15 sm:hidden" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest dark:bg-emerald-900/30 dark:text-emerald-300">
              <MessageSquarePlus size={22} />
            </div>
            <div>
              <h2
                id="suggest-price-title"
                className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl"
              >
                তথ্য দিয়ে সাহায্য করুন
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                আপনার জানা বাজার দর জানান। যাচাই শেষে অ্যাডমিন প্যানেল থেকে এটি প্রকাশ করা হবে।
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

        <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            আপনার তথ্য সরাসরি বাজার দর তালিকায় যাবে না। প্রথমে অ্যাডমিন এটি যাচাই করবেন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="suggest-product-name"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              পণ্যের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="suggest-product-name"
              type="text"
              list="suggest-price-products"
              value={form.productName}
              onChange={(event) => setForm({ ...form, productName: event.target.value })}
              placeholder="যেমন: আলু, পেঁয়াজ, ডিম"
              autoComplete="off"
              maxLength={80}
              aria-invalid={Boolean(errors.productName)}
              className={inputClass(errors.productName)}
            />
            <datalist id="suggest-price-products">
              {PRODUCT_SUGGESTIONS.map((product) => (
                <option key={product} value={product} />
              ))}
            </datalist>

            {errors.productName ? (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                {errors.productName}
              </p>
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
                    ? `বর্তমান বাজার দর: ৳${formatTaka(currentPrice)}`
                    : 'বর্তমান তালিকায় এই পণ্যটি পাওয়া যায়নি — নতুন পণ্য হিসেবে যাচাই হবে।'}
                </p>
              )
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="suggest-location"
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
                  id="suggest-location"
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
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="suggest-price"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                বর্তমান দাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ৳
                </span>
                <input
                  id="suggest-price"
                  type="text"
                  inputMode="decimal"
                  value={form.suggestedPrice}
                  onChange={(event) =>
                    setForm({ ...form, suggestedPrice: event.target.value })
                  }
                  placeholder="যেমন: ৫০"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.suggestedPrice)}
                  className={`${inputClass(errors.suggestedPrice)} pl-8 pr-14`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                  টাকা
                </span>
              </div>
              {errors.suggestedPrice ? (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {errors.suggestedPrice}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  প্রতি কেজি / হালি / লিটার অনুযায়ী
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="suggest-submitted-by"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              আপনার নাম / পরিচয়{' '}
              <span className="font-normal text-slate-400">(ঐচ্ছিক)</span>
            </label>
            <input
              id="suggest-submitted-by"
              type="text"
              value={form.submittedBy}
              onChange={(event) => setForm({ ...form, submittedBy: event.target.value })}
              placeholder="যেমন: শিক্ষার্থী / স্থানীয় ক্রেতা"
              autoComplete="name"
              maxLength={80}
              className={inputClass()}
            />
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
                <Send size={16} />
                তথ্য পাঠান
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
