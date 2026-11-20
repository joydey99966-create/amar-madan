import { useEffect, useMemo, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { EducationInstitution } from '../../../types'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { Pagination } from '../../common/Pagination'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'

const PAGE_SIZE = 20

interface EducationDirectoryProps {
  institutions: EducationInstitution[]
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
}

export function EducationDirectory({
  institutions,
  query = '',
  onClearQuery,
}: EducationDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState(query)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setSearchTerm(query)
    setPage(1)
  }, [query])

  const filtered = useMemo(() => {
    return institutions.filter((inst) =>
      matchesSectionQuery('education', searchTerm, [
        inst.name,
        inst.type,
        inst.area,
        inst.headName,
        inst.eiin ?? '',
      ]),
    )
  }, [institutions, searchTerm])

  // 300 institutions render 20 at a time so mobile stays responsive.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const resetPage = () => setPage(1)

  return (
    <section className="scroll-mt-24 space-y-6">
      <div className="sticky top-20 z-20 rounded-[24px] bg-white p-4 shadow-md dark:bg-[#1a2420] sm:p-6">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1411]">
          <span className="text-slate-400 dark:text-slate-500">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); resetPage() }}
            placeholder="প্রতিষ্ঠান, ধরন বা এলাকা খুঁজুন..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); resetPage() }}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label="সার্চ মুছুন"
            >
              <X size={17} />
            </button>
          )}
        </label>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{filtered.length} টি প্রতিষ্ঠান পাওয়া গেছে</span>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); resetPage() }}
              className="font-semibold text-forest hover:underline dark:text-emerald-300"
            >
              মুছে ফেলুন
            </button>
          )}
        </div>
      </div>

      <SearchFilterBanner
        query={query}
        count={filtered.length}
        label="শিক্ষা প্রতিষ্ঠান"
        onClear={() => {
          setSearchTerm('')
          resetPage()
          onClearQuery?.()
        }}
      />

      <div className="grid gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="কোনো প্রতিষ্ঠান পাওয়া যায়নি"
            description="অন্য নাম বা এলাকা লিখে পুনরায় অনুসন্ধান করুন।"
            onReset={() => { setSearchTerm(''); resetPage() }}
            suggestions={SECTION_SUGGESTIONS.education}
            onSuggest={(value) => { setSearchTerm(value); resetPage() }}
          />
        ) : (
          paged.map((inst) => (
            <div
              key={inst.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{inst.name}</h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {inst.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  প্রধান: {inst.headName || 'তথ্য যাচাই চলছে'}
                  {inst.eiin ? ` • EIIN: ${inst.eiin}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <MapPin size={15} className="shrink-0 text-forest dark:text-emerald-300" />
                <span>{inst.area}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                {inst.phone?.trim() ? (
                  <>
                    <CallButton phone={inst.phone} />
                    <CopyPhoneButton phone={inst.phone} />
                    <WhatsAppButton phone={inst.phone} />
                  </>
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    যোগাযোগের তথ্য যাচাই চলছে
                  </span>
                )}
              </div>

              <ListingMeta
                listing={inst.name}
                section="শিক্ষা প্রতিষ্ঠান"
                className="border-t border-slate-100 pt-2.5 dark:border-white/10"
              />
            </div>
          ))
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination
          total={filtered.length}
          page={safePage}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          label="প্রতিষ্ঠান"
        />
      )}
    </section>
  )
}