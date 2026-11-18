import { CalendarDays, MapPin, Newspaper } from 'lucide-react'
import { Journalist, NewsItem } from '../../../types'
import { ServiceCard } from '../../common/ContactCard'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { toBanglaNumber, formatDate } from '../../../utils/formatters'
import { VERIFY_PENDING } from '../../../constants/dataMeta'
import { useSectionQuery } from '../../../hooks/useSectionQuery'

interface NewsViewProps {
  news: NewsItem[]
  journalists: Journalist[]
  /** Opens the full text of a news item in the notice detail view. */
  onSelectNews: (item: NewsItem) => void
  onBack?: () => void
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
}

function matchesQuery(query: string, values: Array<string | undefined>): boolean {
  return matchesSectionQuery('news', query, values)
}

export function NewsView({
  news,
  journalists,
  onSelectNews,
  onBack,
  query = '',
  onClearQuery,
}: NewsViewProps) {
  const [activeQuery, setActiveQuery] = useSectionQuery(query)
  const visibleNews = news.filter((item) =>
    matchesQuery(activeQuery, [item.title, item.category, item.content, item.source]),
  )
  const visibleJournalists = journalists.filter((journalist) =>
    matchesQuery(activeQuery, [journalist.name, journalist.mediaName, journalist.designation, journalist.area]),
  )

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-800 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-200">
        📰 মোট {toBanglaNumber(visibleNews.length)} টি সংবাদ ও {toBanglaNumber(visibleJournalists.length)} জন
        সাংবাদিক — প্রতিটি সংবাদে সূত্র ও প্রকাশের তারিখ দেওয়া আছে।
      </div>

      <SearchFilterBanner
        query={activeQuery}
        count={visibleNews.length}
        label="সংবাদ"
        onClear={() => {
          setActiveQuery('')
          onClearQuery?.()
        }}
      />

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">স্থানীয় সংবাদ</h3>
        {visibleNews.length === 0 ? (
          <EmptyState
            title="কোনো সংবাদ পাওয়া যায়নি"
            description="অন্য শব্দ দিয়ে খুঁজুন বা সব সংবাদ দেখুন।"
            actionLabel="ফিরে যান"
            onAction={onBack}
            suggestions={SECTION_SUGGESTIONS.news}
            onSuggest={setActiveQuery}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleNews.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft-sm dark:border-white/[0.08] dark:bg-[#182420]"
              >
                <button
                  type="button"
                  onClick={() => onSelectNews(item)}
                  aria-label={`${item.title} — বিস্তারিত পড়ুন`}
                  className="group flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50/70 dark:hover:bg-white/[0.03]"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={64}
                      loading="lazy"
                      className="h-16 w-20 shrink-0 rounded-xl object-cover sm:h-20 sm:w-28"
                    />
                  ) : (
                    <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 sm:h-20 sm:w-28">
                      <Newspaper size={20} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                      {item.category}
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-5 text-slate-800 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300">
                      {item.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">
                      {item.content}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} /> {item.date ? formatDate(item.date) : VERIFY_PENDING}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> সূত্র: {item.source || VERIFY_PENDING}
                      </span>
                    </span>
                  </span>
                </button>
                <div className="px-4 pb-3">
                  <ListingMeta
                    updated={item.lastUpdated}
                    listing={item.title}
                    section="সংবাদ"
                    className="border-t border-slate-100 pt-2.5 dark:border-white/10"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {visibleJournalists.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">প্রেস ক্লাবের সাংবাদিক</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleJournalists.map((journalist) => (
              <ServiceCard
                key={journalist.id}
                title={journalist.name}
                subtitle={`${journalist.mediaName} • ${journalist.designation}`}
                location={journalist.area}
                phone={journalist.phone}
                category="প্রেস ক্লাব"
                section="প্রেস ক্লাব"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
