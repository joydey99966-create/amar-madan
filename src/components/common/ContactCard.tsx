import { ReactNode } from 'react'
import { MapPin } from 'lucide-react'
import { formatDate, formatPrice } from '../../utils/formatters'
import { SITE_DATA_REVIEWED } from '../../constants/dataMeta'
import { CallButton, CopyPhoneButton, WhatsAppButton } from './ContactActions'
import { ListingMeta } from './ListingMeta'
import {
  getPriceTrend,
  PRICE_TREND_CLASSES,
  PRICE_TREND_LABELS,
  PriceTrend,
} from '../../utils/marketTrend'
import { PriceHistoryPoint } from '../../types'

interface ContactCardProps {
  title: string
  subtitle?: string
  location?: string
  phone: string
  category?: string
  extraInfo?: ReactNode
  className?: string
  /** ISO date of the last verified update for this listing. */
  updated?: string
  /** Section name shown inside the report dialog. */
  section?: string
  /** Extra rows (fee, hours, services) rendered above the call actions. */
  details?: ReactNode
}

export function ContactCard({
  title,
  subtitle,
  location,
  phone,
  category = 'সাধারণ সেবা',
  extraInfo,
  className = '',
  updated,
  section,
  details,
}: ContactCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md dark:border-white/[0.07] dark:bg-[#1a2420] ${className}`}
    >
      {extraInfo && <div className="absolute right-3 top-3">{extraInfo}</div>}

      <div className="p-4 sm:p-5">
        <div>
          <div className="flex items-center justify-between pr-8">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        {location && (
          <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-forest dark:text-emerald-300" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        )}

        {details}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
          {phone?.trim() ? (
            <>
              <CallButton phone={phone} className="flex-1" />
              <CopyPhoneButton phone={phone} />
              <WhatsAppButton phone={phone} />
            </>
          ) : (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              যোগাযোগের তথ্য যাচাই চলছে
            </span>
          )}
        </div>

        <ListingMeta
          updated={updated}
          fallback={SITE_DATA_REVIEWED}
          listing={title}
          section={section ?? category}
          className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
        />
      </div>
    </div>
  )
}

export function ServiceCard({
  title,
  subtitle,
  location,
  phone,
  category,
  badge,
  extraInfo,
  updated,
  section,
}: {
  title: string
  subtitle?: string
  location?: string
  phone: string
  category: string
  badge?: ReactNode
  extraInfo?: ReactNode
  updated?: string
  section?: string
}) {
  return (
    <ContactCard
      title={title}
      subtitle={subtitle}
      location={location}
      phone={phone}
      category={category}
      extraInfo={badge || extraInfo}
      updated={updated}
      section={section}
    />
  )
}

export function PriceCard({
  itemName,
  wholesalePrice,
  retailPrice,
  unit,
  trend,
  updatedAt,
  history,
}: {
  itemName: string
  wholesalePrice: string
  retailPrice: string
  unit: string
  trend?: PriceTrend
  updatedAt?: string
  history?: PriceHistoryPoint[]
}) {
  // The one trend decision, shared with the agro market cards.
  const activeTrend = getPriceTrend({ trend, history })
  // One Bengali date format on every card (ISO in, Bengali out).
  const displayDate = updatedAt ? formatDate(updatedAt) : 'তথ্য যাচাই চলছে'

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{itemName}</h3>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">আপডেট: {displayDate}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="block text-[10px] text-slate-500">পাইকারি</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">{formatPrice(wholesalePrice, unit)}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500">খুচরা</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">{formatPrice(retailPrice, unit)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-400">{unit}</div>
      <div className={`mt-3 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold ${PRICE_TREND_CLASSES[activeTrend]}`}>
        {PRICE_TREND_LABELS[activeTrend]}
      </div>

      <ListingMeta
        updated={displayDate}
        listing={itemName}
        section="হাওরের মাছ"
        className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
      />
    </div>
  )
}
