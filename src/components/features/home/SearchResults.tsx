import { ArrowRight, Compass, SearchX } from 'lucide-react'
import { SearchGroup, SearchHit } from '../../../utils/search'
import { ViewId } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'

interface SearchResultsProps {
  query: string
  groups: SearchGroup[]
  total: number
  intents: Array<{ view: ViewId; tab?: string; label: string }>
  onSelectHit: (hit: SearchHit) => void
  onSelectIntent: (intent: { view: ViewId; tab?: string }) => void
  onClear: () => void
  /** Fills the search box with one of the example queries. */
  onSuggestQuery?: (query: string) => void
}

const MAX_PER_GROUP = 4
const SUGGESTED_QUERIES = ['চাল', 'O+', 'ডাক্তার', 'চাকরি', 'পাসপোর্ট']

/**
 * Live results across every real dataset, grouped by section.
 * Each group shows its own count and each record links to its exact page.
 */
export function SearchResults({
  query,
  groups,
  total,
  intents,
  onSelectHit,
  onSelectIntent,
  onClear,
  onSuggestQuery,
}: SearchResultsProps) {
  return (
    <section className="mx-auto mt-3 max-w-4xl px-2 sm:mt-4 sm:px-4" aria-label="সার্চ ফলাফল">
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-3.5 shadow-soft dark:border-white/10 dark:bg-[#182420] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="section-eyebrow">সার্চ ফলাফল</div>
            <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              “{query}” — {toBanglaNumber(total)} টি ফলাফল
            </h2>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-forest hover:text-forest dark:border-white/10 dark:text-slate-400 dark:hover:text-emerald-300"
          >
            মুছুন
          </button>
        </div>

        {intents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {intents.map((intent) => (
              <button
                key={`${intent.view}-${intent.tab ?? 'default'}`}
                type="button"
                onClick={() => onSelectIntent(intent)}
                className="flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-3 py-1.5 text-[11px] font-semibold text-forest transition hover:bg-forest/10 dark:border-emerald-500/25 dark:bg-emerald-900/20 dark:text-emerald-300"
              >
                <Compass size={13} /> {intent.label}
              </button>
            ))}
          </div>
        )}

        {total === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center py-4 text-center sm:mt-6 sm:py-6">
            <SearchX size={32} className="text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              কোনো ফলাফল পাওয়া যায়নি
            </p>
            <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
              রক্তের গ্রুপ (যেমন O+), ডাক্তারের নাম, পণ্যের নাম বা প্রতিষ্ঠানের নাম দিয়ে খুঁজুন।
            </p>
            {onSuggestQuery && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUERIES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onSuggestQuery(suggestion)}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
            {groups.map((group) => (
              <div key={group.kind}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {group.label} ({toBanglaNumber(group.hits.length)})
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSelectIntent({ view: group.view, tab: group.tab })}
                    className="flex items-center gap-1 text-[11px] font-semibold text-forest hover:underline dark:text-emerald-300"
                  >
                    সব দেখুন <ArrowRight size={12} />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.hits.slice(0, MAX_PER_GROUP).map((hit) => (
                    <button
                      key={hit.key}
                      type="button"
                      onClick={() => onSelectHit(hit)}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-left transition hover:border-forest/30 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-emerald-500/30"
                    >
                      <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {hit.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {hit.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
