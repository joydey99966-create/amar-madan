import { Ambulance, Droplets, Siren } from 'lucide-react'
import { ViewId } from '../../../types'
import { cleanPhone } from '../../../utils/formatters'

interface EmergencyStripProps {
  /** First published ambulance's phone, used for the direct call action. */
  ambulancePhone?: string
  onNavigate: (view: ViewId, tab?: string) => void
}

/**
 * Compact, always-visible first row on the home page. Three actions that use
 * only existing data and existing click paths — no new features.
 */
export function EmergencyStrip({ ambulancePhone, onNavigate }: EmergencyStripProps) {
  const items = [
    {
      id: 'ambulance',
      label: 'অ্যাম্বুলেন্স',
      sub: ambulancePhone ? 'সরাসরি কল' : 'তালিকা দেখুন',
      icon: Ambulance,
      href: ambulancePhone ? `tel:${cleanPhone(ambulancePhone)}` : undefined,
      onClick: () => onNavigate('emergency', 'emergency'),
      accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    {
      id: 'blood',
      label: 'রক্ত খুঁজুন',
      sub: 'ডিরেক্টরি খুলুন',
      icon: Droplets,
      onClick: () => onNavigate('emergency', 'blood'),
      accent: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    },
    {
      id: 'hotline',
      label: 'হটলাইন',
      sub: 'জরুরি নম্বর',
      icon: Siren,
      onClick: () => onNavigate('emergency', 'emergency'),
      accent: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
  ]

  return (
    <section aria-label="জরুরি সহায়তা" className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon
        const content = (
          <>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${item.accent}`}>
              <Icon size={19} />
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-bold text-slate-800 dark:text-white">{item.label}</span>
              <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{item.sub}</span>
            </span>
          </>
        )
        const cls = 'flex min-h-[60px] items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-2.5 py-2 shadow-soft-sm transition hover:border-forest hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest dark:border-white/10 dark:bg-[#182420] sm:gap-3 sm:px-3'
        return item.href ? (
          <a key={item.id} href={item.href} className={cls}>
            {content}
          </a>
        ) : (
          <button key={item.id} type="button" onClick={item.onClick} className={cls}>
            {content}
          </button>
        )
      })}
    </section>
  )
}
