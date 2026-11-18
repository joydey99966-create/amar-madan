import { useMemo } from 'react'
import { ChevronRight, Phone } from 'lucide-react'
import { categories } from '../../../constants'
import { useEmergencyContacts } from '../../../hooks/useEmergencyContacts'
import { displayOrderService } from '../../../services/displayOrderService'
import { useDataVersion } from '../../../hooks/useDataVersion'
import { cleanPhone } from '../../../utils/formatters'
import { CATEGORY_COUNT_UNITS, CATEGORY_VIEW_MAP } from '../../../constants'
import { ViewId } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'
import { formatCount } from '../../../utils/counts'

interface AllServicesViewProps {
  /** Live counts per category id, calculated from the real data. */
  counts: Record<string, number>
  /** Breakdown of every combined count, e.g. "১০ জন ডাক্তার • ৭ টি হাসপাতাল". */
  countDetails?: Record<string, string>
  /** Unit of the total, decided by the count helper (mixed lists use "টি"). */
  countUnits?: Record<string, string>
  onSelectView: (view: ViewId) => void
}

/**
 * The "সব সেবা" page — every category of the homepage in one list, each row
 * carrying the live number of records behind it.
 */
export function AllServicesView({ counts, countDetails, countUnits, onSelectView }: AllServicesViewProps) {
  const contacts = useEmergencyContacts()
  const orderVersion = useDataVersion('order')
  const ordered = useMemo(
    () => displayOrderService.sortById(categories, displayOrderService.get().categories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderVersion],
  )
  const quickDial = contacts.filter((c) => c.category === 'police' || c.category === 'fire' || c.category === 'ambulance' || c.category === 'women')

  return (
    <section className="space-y-4">
      {/* Offline-safe emergency quick-dial — numbers are bundled, so they work without a network. */}
      {quickDial.length > 0 && (
        <div className="rounded-2xl border border-rose-200/70 bg-[#fff5f4] p-4 shadow-soft-sm dark:border-rose-900/40 dark:bg-[#201516]">
          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">জরুরি ক্বিক-ডায়াল</h3>
          <p className="mt-0.5 text-[11px] text-rose-600/80 dark:text-rose-400/80">অফলাইনেও কল করা যায় — নম্বরগুলো ডিভাইসেই আছে।</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {quickDial.map((c) => (
              <a
                key={c.id}
                href={`tel:${cleanPhone(c.dial)}`}
                className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl bg-white px-2 py-2 text-center shadow-sm transition hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-white/10"
                aria-label={`কল করুন ${c.name}`}
              >
                <Phone size={15} className="text-rose-600 dark:text-rose-400" />
                <span className="text-[11px] font-semibold leading-tight text-slate-700 dark:text-slate-200">{c.name}</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{c.phone}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-soft-sm dark:border-white/10 dark:bg-[#182420] dark:text-slate-300">
        ℹ️ মোট {toBanglaNumber(ordered.length)} টি সেবা — প্রতিটির সাথে বর্তমান তথ্যের সংখ্যা দেওয়া হয়েছে।
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ordered.map((category) => {
          const view = CATEGORY_VIEW_MAP[category.id] ?? 'home'
          const count = counts[category.id]
          const unit = countUnits?.[category.id] ?? CATEGORY_COUNT_UNITS[category.id]

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectView(view)}
              className="group hover-lift tap-scale flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-soft-sm transition hover:border-forest/30 hover:shadow-soft dark:border-white/[0.08] dark:bg-[#182420] dark:hover:border-emerald-500/30"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: category.background }}
              >
                <category.icon size={24} color={category.color} strokeWidth={1.8} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-800 transition-colors group-hover:text-forest dark:text-slate-100 dark:group-hover:text-emerald-300">
                  {category.name}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {category.english}
                </span>
                {count !== undefined && (
                  <span
                    title={countDetails?.[category.id]}
                    className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    {formatCount(count, unit)}
                  </span>
                )}
              </span>

              <ChevronRight size={18} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-forest dark:text-slate-600 dark:group-hover:text-emerald-300" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
