import { ChevronRight } from 'lucide-react'
import { Category, ViewId } from '../../../types'
import { CATEGORY_COUNT_UNITS, CATEGORY_VIEW_MAP } from '../../../constants'
import { toBanglaNumber } from '../../../utils/formatters'
import { formatCount } from '../../../utils/counts'
import { useLanguage } from '../../../context/LanguageContext'

interface CategoriesGridProps {
  categories: Category[]
  /** Live counts per category id, calculated from the real data. */
  counts: Record<string, number>
  /** Breakdown of every combined count, e.g. "১০ জন ডাক্তার • ৭ টি হাসপাতাল". */
  countDetails?: Record<string, string>
  /** Unit of the total, decided by the count helper (mixed lists use "টি"). */
  countUnits?: Record<string, string>
  onSelectCategory: (view: ViewId, categoryId: string) => void
}

export function CategoriesGrid({
  categories,
  counts,
  countDetails,
  countUnits,
  onSelectCategory,
}: CategoriesGridProps) {
  const { language, t } = useLanguage()
  const getTargetView = (categoryId: string): ViewId => CATEGORY_VIEW_MAP[categoryId] ?? 'home'

  return (
    <section id="categories" className="scroll-mt-24 mt-6 sm:mt-9">
      <div className="mb-3 flex items-end justify-between sm:mb-4">
        <div>
          <div className="section-eyebrow">{t('categories.eyebrow')}</div>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
            {t('categories.title')}
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('services', 'all')}
          className="flex items-center gap-1 text-sm font-semibold text-forest hover:text-emerald-800 dark:text-emerald-300"
        >
          {t('categories.all')} <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((category) => {
          const liveCount = counts[category.id]
          const unit = countUnits?.[category.id] ?? CATEGORY_COUNT_UNITS[category.id]

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(getTargetView(category.id), category.id)}
              className="lg-card group hover-lift tap-scale relative flex min-h-[128px] flex-col items-center justify-center rounded-[24px] bg-white px-2.5 py-3 text-center transition-all duration-500 hover:bg-white/90 dark:bg-[#182420] dark:hover:bg-[#1f2e29] sm:min-h-[160px] sm:px-3 sm:py-4"
            >
              {liveCount !== undefined && (
                <span
                  title={countDetails?.[category.id]}
                  className="absolute right-2.5 top-2.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 shadow-sm dark:bg-rose-950/60 dark:text-rose-300"
                >
                  {formatCount(liveCount, unit)}
                </span>
              )}
              <span
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:mb-3 sm:h-[56px] sm:w-[56px]"
                style={{ backgroundColor: category.background }}
              >
                <category.icon size={26} color={category.color} strokeWidth={1.8} />
              </span>
              <span className="text-[14px] font-bold leading-5 text-slate-800 transition-colors group-hover:text-forest dark:text-slate-100 dark:group-hover:text-emerald-300">
                {language === 'en' ? category.english : category.name}
              </span>
              <span className="mt-1 text-[11px] font-medium text-slate-400 transition-colors group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400">
                {language === 'en' ? category.name : category.english}
              </span>
            </button>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          {t('categories.empty')}
        </div>
      )}
    </section>
  )
}
