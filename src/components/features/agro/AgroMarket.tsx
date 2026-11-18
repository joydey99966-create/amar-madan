import { useMemo, useState } from 'react'
import { Tag, CalendarDays } from 'lucide-react'
import { MarketPrice, ServiceProvider } from '../../../types'
import { formatDate, toBanglaNumber, formatPrice } from '../../../utils/formatters'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { useSectionQuery } from '../../../hooks/useSectionQuery'
import { useUrlFilter } from '../../../hooks/useUrlFilter'
import { MachineryBookingModal } from '../market/MachineryBookingModal'
import { recordsService } from '../../../services/recordsService'
import { PillRow } from '../../common/PillRow'
import {
  getPriceChange,
  getTrendFromChange,
  getTrendLabel,
  PRICE_TREND_CLASSES,
  PRICE_TREND_STROKES,
} from '../../../utils/marketTrend'

export type AgroTab = 'prices' | 'dealers' | 'machinery'

interface AgroMarketProps {
  dealers: ServiceProvider[]
  /** Live market prices from the shared market service. */
  prices: MarketPrice[]
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
  initialTab?: AgroTab
  /** Extra classes for the section wrapper. */
  className?: string
  /** Opens the "suggest a price" form from inside the prices tab. */
  onAddPrice?: () => void
}

const agroMachinery = recordsService.machinery()

function matchesQuery(query: string, values: Array<string | undefined>): boolean {
  return matchesSectionQuery('market', query, values)
}

export function AgroMarket({
  dealers,
  prices,
  query = '',
  onClearQuery,
  initialTab = 'prices',
  className = '',
  onAddPrice,
}: AgroMarketProps) {
  const [activeTab, setActiveTab] = useUrlFilter<AgroTab>('tab', initialTab, ['prices', 'dealers', 'machinery'] as const)
  const [activeQuery, setActiveQuery] = useSectionQuery(query)
  const [bookingItem, setBookingItem] = useState<import('../../../types').AgroMachineryItem | null>(null)

  const filteredPrices = useMemo(
    () => prices.filter((item) => matchesQuery(activeQuery, [item.itemName, item.unit])),
    [prices, activeQuery],
  )
  const filteredDealers = useMemo(
    () => dealers.filter((dealer) => matchesQuery(activeQuery, [dealer.name, dealer.details, dealer.area])),
    [dealers, activeQuery],
  )
  const filteredMachinery = useMemo(
    () => agroMachinery.filter((item) => matchesQuery(activeQuery, [item.name, item.area])),
    [activeQuery],
  )

  const activeCount =
    activeTab === 'prices'
      ? filteredPrices.length
      : activeTab === 'dealers'
        ? filteredDealers.length
        : filteredMachinery.length

  return (
    <section className={`scroll-mt-24 space-y-6 ${className}`}>
      <div className="sticky top-20 z-20 rounded-[24px] bg-white p-3 shadow-md dark:bg-[#1a2420] sm:p-4">
        <PillRow trackClassName="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(['prices', 'dealers', 'machinery'] as const).map((tab) => (
            <button
              key={tab}
              data-active={activeTab === tab ? 'true' : 'false'}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-forest text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
              }`}
            >
              {tab === 'prices' && '🛍️ বাজার দাম'}
              {tab === 'dealers' && '🌾 BCIC ডিলার'}
              {tab === 'machinery' && '⚙️ যন্ত্রপাতি ভাড়া'}
            </button>
          ))}
        </PillRow>
      </div>

      <SearchFilterBanner
        query={query}
        count={activeCount}
        label={
          activeTab === 'prices' ? 'বাজার দর' : activeTab === 'dealers' ? 'ডিলার' : 'যন্ত্রপাতি'
        }
        onClear={() => onClearQuery?.()}
      />

      {activeTab === 'prices' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <span>📊 দৈনিক স্থানীয় বাজার দর — মোট {toBanglaNumber(filteredPrices.length)} টি পণ্য</span>
            {onAddPrice && (
              <button
                type="button"
                onClick={onAddPrice}
                className="flex items-center gap-1.5 rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white transition hover:bg-forest-dark"
              >
                <Tag size={14} /> বাজারের দাম যোগ করুন
              </button>
            )}
          </div>

          {filteredPrices.length === 0 ? (
            <EmptyState
              title="এই পণ্যটি তালিকায় নেই"
              description="অন্য পণ্যের নাম লিখে আবার খুঁজুন।"
            />
          ) : (
            filteredPrices.map((item) => <PriceRow key={item.id} item={item} />)
          )}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
            💡 <strong>টিপস:</strong> মদন উপজেলার কৃষি সম্প্রসারণ কর্মকর্তার সাথে যোগাযোগ করে সর্বশেষ দাম নিশ্চিত করুন।
          </div>
        </div>
      )}

      {activeTab === 'dealers' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            ✓ সত্যায়িত BCIC সার, বীজ ও কীটনাশক ডিলার — {toBanglaNumber(filteredDealers.length)} টি
          </div>

          {filteredDealers.length === 0 ? (
            <EmptyState
              title="কোনো ডিলার পাওয়া যায়নি"
              description="অন্য নাম বা এলাকা লিখে আবার খুঁজুন।"
            />
          ) : (
            filteredDealers.map((dealer) => (
              <div
                key={dealer.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{dealer.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{dealer.details}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-base">📍</span>
                  <span>{dealer.area}</span>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                  <CallButton phone={dealer.phone} />
                  <CopyPhoneButton phone={dealer.phone} />
                  <WhatsAppButton phone={dealer.phone} />
                </div>

                <ListingMeta
                  listing={dealer.name}
                  section="কৃষি ডিলার"
                  className="border-t border-slate-100 pt-2.5 dark:border-white/10"
                />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'machinery' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-purple-50 p-4 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
            ⚙️ কৃষি যন্ত্রপাতি ভাড়া সেবা (ঋণপত্র স্বীকৃত) — {toBanglaNumber(filteredMachinery.length)} টি
          </div>

          {filteredMachinery.length === 0 ? (
            <EmptyState
              title="কোনো যন্ত্রপাতি পাওয়া যায়নি"
              description="অন্য নাম বা এলাকা লিখে আবার খুঁজুন।"
            />
          ) : (
            filteredMachinery.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{item.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="text-base">📍</span>
                      <span>{item.area}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-forest dark:text-emerald-300">{item.price}</div>
                    {item.availability && (
                      <div className={`mt-1 text-[10px] font-semibold ${
                        item.availability === 'available'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.availability === 'available' ? '✓ উপলব্ধ' : item.availability === 'busy' ? 'ব্যস্ত' : 'অফলাইন'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                  {item.phone ? (
                    <>
                      <CallButton phone={item.phone} />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.ownerName} • {item.phone}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      যোগাযোগের তথ্য যাচাই চলছে
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setBookingItem(item)}
                    className="flex items-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3 py-2 text-xs font-semibold text-forest transition hover:bg-forest/10 dark:text-emerald-300"
                  >
                    <CalendarDays size={14} /> বুকিংয়ের অনুরোধ
                  </button>
                </div>

                <ListingMeta
                  listing={item.name}
                  section="কৃষি যন্ত্রপাতি"
                  className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
                />
              </div>
            ))
          )}

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-800 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-200">
            📞 সরাসরি যোগাযোগ করুন বা আপনার ইউনিয়ন কৃষি অফিসে জানুন ভাড়া পাওয়ার বিস্তারিত তথ্যের জন্য।
          </div>
        </div>
      )}

      <MachineryBookingModal item={bookingItem} onClose={() => setBookingItem(null)} />
    </section>
  )
}

/** A market price row with the per-item check date and a small price history. */
function PriceRow({ item }: { item: MarketPrice }) {
  const [showHistory, setShowHistory] = useState(false)
  const history = item.history ?? []
  // One date for the whole row — the Bengali format used across the site.
  const checkedOn = item.date ? formatDate(item.date) : ''

  const values = history.map((point) => point.retail)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const range = max - min || 1
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100
      const y = 34 - ((value - min) / range) * 28
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  // One change value drives the label, the delta number, the colour and the
  // sparkline — so none of them can contradict the others.
  const delta = getPriceChange(history)
  const trend = getTrendFromChange(delta)
  const trendColor = PRICE_TREND_CLASSES[trend]
  const strokeColor = PRICE_TREND_STROKES[trend]

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{item.itemName}</h3>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {item.unit} • আপডেট: {checkedOn || 'আজ'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-800 dark:text-white">
            {formatPrice(item.retailPrice)}
          </div>
          <div className={`mt-1 text-[10px] font-semibold ${trendColor}`}>
            {getTrendLabel(delta)}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] dark:bg-white/5">
        <div>
          <span className="block text-slate-500 dark:text-slate-400">পাইকারি</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">{formatPrice(item.wholesalePrice)}</span>
        </div>
        <div>
          <span className="block text-slate-500 dark:text-slate-400">খুচরা</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">{formatPrice(item.retailPrice)}</span>
        </div>
        <div>
          <span className="block text-slate-500 dark:text-slate-400">সর্বশেষ যাচাই</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {checkedOn || 'আজ'}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {values.length > 1 ? `গত ${toBanglaNumber(values.length)} দিনের দর` : 'দামের ইতিহাস'}
          </span>
          <span className={delta > 0 ? 'text-amber-600 dark:text-amber-400' : delta < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
            {delta === 0
              ? 'পরিবর্তন নেই'
              : `${delta > 0 ? '+' : ''}${toBanglaNumber(delta)} টাকা`}
          </span>
        </div>
        {values.length > 1 && (
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="mt-1 h-10 w-full"
            role="img"
            aria-label={`${item.itemName} — দামের ইতিহাস`}
          >
            <polyline
              points={points}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        <button
          type="button"
          onClick={() => setShowHistory((value) => !value)}
          className="-my-1.5 mt-0 min-h-[34px] px-1 text-[11px] font-semibold text-forest hover:underline dark:text-emerald-300"
          aria-expanded={showHistory}
        >
          {showHistory ? 'ইতিহাস লুকান' : 'দামের ইতিহাস দেখুন'}
        </button>

        {showHistory && (
          <table className="mt-2 w-full text-left text-[11px]">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="py-1 font-medium">তারিখ</th>
                <th className="py-1 text-right font-medium">খুচরা দর</th>
              </tr>
            </thead>
            <tbody>
              {history.map((point) => (
                <tr key={point.date} className="border-t border-slate-100 dark:border-white/10">
                  <td className="py-1 text-slate-600 dark:text-slate-300">{formatDate(point.date)}</td>
                  <td className="py-1 text-right font-semibold text-slate-800 dark:text-slate-100">
                    {formatPrice(point.retail)}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>

      <ListingMeta
        updated={item.date}
        listing={item.itemName}
        section="বাজার দর"
        className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
      />
    </div>
  )
}
