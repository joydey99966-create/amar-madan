import { ChevronRight } from 'lucide-react'
import { Category, ViewId } from '../../../types'
import { CATEGORY_COUNT_UNITS, CATEGORY_VIEW_MAP } from '../../../constants'
import { toBanglaNumber } from '../../../utils/formatters'
import { formatCount } from '../../../utils/counts'

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
  const getTargetView = (categoryId: string): ViewId => CATEGORY_VIEW_MAP[categoryId] ?? 'home'

  return (
    <section id="categories" className="scroll-mt-24 mt-6 sm:mt-9">
      <div className="mb-3 flex items-end justify-between sm:mb-4">
        <div>
          <div className="section-eyebrow">আপনার প্রয়োজন</div>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
            সেবা খুঁজুন
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('services', 'all')}
          className="flex items-center gap-1 text-sm font-semibold text-forest hover:text-emerald-800 dark:text-emerald-300"
        >
          সব সেবা <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map((category) => {
          const liveCount = counts[category.id]
          const unit = countUnits?.[category.id] ?? CATEGORY_COUNT_UNITS[category.id]

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(getTargetView(category.id), category.id)}
              className="group hover-lift tap-scale relative flex min-h-[104px] flex-col items-center justify-center rounded-[20px] border border-slate-200/70 bg-white px-1 py-2.5 text-center shadow-soft-sm transition-all duration-300 hover:border-forest/30 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest dark:border-white/[0.08] dark:bg-[#182420] dark:hover:border-emerald-500/30 sm:min-h-[150px] sm:rounded-[24px] sm:px-3 sm:py-4"
            >
              {liveCount !== undefined && (
                <span
                  title={countDetails?.[category.id]}
                  className="absolute right-1 top-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-300 sm:right-2.5 sm:top-2.5 sm:bg-rose-50 sm:px-2 sm:text-[10px] sm:text-rose-600 sm:dark:bg-rose-950/60 sm:dark:text-rose-300"
                >
                  {formatCount(liveCount, unit)}
                </span>
              )}
              <span
                className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:mb-3 sm:h-[56px] sm:w-[56px] sm:rounded-2xl"
                style={{ backgroundColor: category.background }}
              >
                <category.icon size={20} color={category.color} strokeWidth={1.8} className="sm:hidden" />
                <category.icon size={26} color={category.color} strokeWidth={1.8} className="hidden sm:block" />
              </span>
              <span className="text-[11px] font-bold leading-4 text-slate-800 transition-colors group-hover:text-forest dark:text-slate-100 dark:group-hover:text-emerald-300 sm:text-[14px] sm:leading-5">
                {category.name}
              </span>
              <span className="mt-0.5 hidden text-[11px] font-medium text-slate-400 transition-colors group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 sm:block">
                {category.english}
              </span>
            </button>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          কোনো সেবা পাওয়া যায়নি। অন্য কিছু লিখে খুঁজুন।
        </div>
      )}
    </section>
  )
}
