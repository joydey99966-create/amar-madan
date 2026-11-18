import { Fish, Waves } from 'lucide-react'
import { FishWholesaler, MarketPrice } from '../../../types'
import { PriceCard, ServiceCard } from '../../common/ContactCard'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { toBanglaNumber } from '../../../utils/formatters'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { useSectionQuery } from '../../../hooks/useSectionQuery'

interface FishMarketViewProps {
  prices: MarketPrice[]
  wholesalers: FishWholesaler[]
  onBack?: () => void
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
}

export function FishMarketView({
  prices,
  wholesalers,
  onBack,
  query = '',
  onClearQuery,
}: FishMarketViewProps) {
  const [activeQuery, setActiveQuery] = useSectionQuery(query)
  const visiblePrices = prices.filter((price) =>
    matchesSectionQuery('fish', activeQuery, [price.itemName, price.unit]),
  )
  const visibleWholesalers = wholesalers.filter((wholesaler) =>
    matchesSectionQuery('fish', activeQuery, [
      wholesaler.name,
      wholesaler.area,
      wholesaler.fishTypes.join(' '),
    ]),
  )

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-xs text-cyan-800 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-200">
        নীল হাওরের মাছের {toBanglaNumber(visiblePrices.length)} টি দাম এবং {toBanglaNumber(visibleWholesalers.length)} টি মাছ আড়তের তথ্য।
      </div>

      <SearchFilterBanner
        query={activeQuery}
        count={visiblePrices.length}
        label="হাওরের মাছ"
        onClear={() => {
          setActiveQuery('')
          onClearQuery?.()
        }}
      />

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">হাওরের মাছের দর</h3>
        {visiblePrices.length === 0 ? (
          <EmptyState
            title="মাছের দর পাওয়া যায়নি"
            description="অন্য মাছের নাম লিখে আবার খুঁজুন অথবা নিচের পরামর্শগুলো চেষ্টা করুন।"
            actionLabel="ফিরে যান"
            onAction={onBack}
            suggestions={SECTION_SUGGESTIONS.fish}
            onSuggest={setActiveQuery}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visiblePrices.map((price) => (
              <PriceCard
                key={price.id}
                itemName={price.itemName}
                wholesalePrice={price.wholesalePrice}
                retailPrice={price.retailPrice}
                unit={price.unit}
                trend={price.trend}
                updatedAt={price.date ?? price.updated}
                history={price.history}
              />
            ))}
          </div>
        )}
      </div>

      {visibleWholesalers.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Waves size={17} className="text-cyan-500" /> মাছ আড়ত ও ঠেলা
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleWholesalers.map((wholesaler) => (
              <ServiceCard
                key={wholesaler.id}
                title={wholesaler.name}
                subtitle={`মাছ: ${wholesaler.fishTypes.join(', ')}`}
                location={wholesaler.area}
                phone={wholesaler.phone}
                category="হাওরের মাছ"
                badge={<Fish size={16} className="text-cyan-500" />}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
