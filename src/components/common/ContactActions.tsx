import { Check, Copy, MessageCircle, Phone } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { copyToClipboard } from '../../utils/clipboard'
import { cleanPhone } from '../../utils/formatters'
import { isPlaceholderPhone, UNVERIFIED } from '../../utils/placeholderData'

/**
 * ONE call-button pattern for the whole site. Every directory card, detail
 * dialog and service page uses these three components — same shape, same size
 * and the same "কল করুন" label. No page defines its own call button.
 */

export function CallButton({
  phone,
  dial,
  className = '',
  label,
}: {
  phone: string
  /** Dial digits, when the display number uses Bengali numerals. */
  dial?: string
  className?: string
  /** Optional display text (e.g. masked number) — the call target stays the real number. */
  label?: string
}) {
  // Placeholder numbers are never callable on the public site.
  if (isPlaceholderPhone(dial ?? phone)) {
    return <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{UNVERIFIED}</span>
  }
  return (
    <a
      href={`tel:${cleanPhone(dial ?? phone)}`}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#104b38] ${className}`}
      title={`কল করুন: ${phone}`}
      aria-label="কল করুন"
    >
      <span className="flex items-center gap-1.5">
        <Phone size={14} />
        কল করুন
      </span>
      <span className="text-[10px] font-medium opacity-90">{label ?? phone}</span>
    </a>
  )
}

export function CopyPhoneButton({ phone, copied }: { phone: string; copied?: boolean }) {
  const { addToast } = useToast()
  if (isPlaceholderPhone(phone)) return null
  const handleCopy = () =>
    copyToClipboard(
      phone,
      () => addToast('নম্বর কপি করা হয়েছে!', 'success'),
      () => addToast('কপি করতে ব্যর্থ হয়েছে', 'error'),
    )
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:text-slate-300"
      title="নম্বর কপি করুন"
      aria-label="নম্বর কপি করুন"
    >
      {copied ? <Check size={15} className="text-forest" /> : <Copy size={15} />}
    </button>
  )
}

export function WhatsAppButton({ phone }: { phone: string }) {
  if (isPlaceholderPhone(phone)) return null
  return (
    <a
      href={`https://wa.me/${cleanPhone(phone)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
      title="WhatsApp"
      aria-label="WhatsApp"
    >
      <MessageCircle size={15} />
    </a>
  )
}
