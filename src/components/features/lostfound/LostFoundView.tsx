import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { LostFoundItem } from '../../../types'
import { ServiceCard } from '../../common/ContactCard'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { PostLostFoundModal } from './PostLostFoundModal'
import { lostFoundService } from '../../../services/lostFoundService'
import { useDataVersion } from '../../../hooks/useDataVersion'
import { toBanglaNumber, formatDate } from '../../../utils/formatters'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { useSectionQuery } from '../../../hooks/useSectionQuery'

interface LostFoundViewProps {
  items: LostFoundItem[]
  onBack?: () => void
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
}

export function LostFoundView({ items, onBack, query = '', onClearQuery }: LostFoundViewProps) {
  const [board, setBoard] = useState<LostFoundItem[]>(items)
  const [showPostModal, setShowPostModal] = useState(false)
  const [version, setVersion] = useState(0)
  const dataVersion = useDataVersion('lostfound')

  useEffect(() => {
    setBoard(lostFoundService.getPublic())
  }, [items, dataVersion])

  // Re-read the board after a submission so the new count is honest even while
  // the item waits for approval.
  const pendingCount = useMemo(() => {
    void version
    return lostFoundService.getPending().length
  }, [version, dataVersion])

  const [activeQuery, setActiveQuery] = useSectionQuery(query)
  const visibleItems = board.filter((item) =>
    matchesSectionQuery('lostfound', activeQuery, [
      item.itemName,
      item.type,
      item.location,
      item.description,
    ]),
  )

  const lost = visibleItems.filter((item) => item.type === 'হারানো')
  const found = visibleItems.filter((item) => item.type === 'প্রাপ্তি')

  // Auto-matching: a lost item and a found item whose names share a word and
  // whose locations match are likely the same thing. Uses only stored data.
  const matches = useMemo(() => {
    const pairs: { lostName: string; foundName: string }[] = []
    lost.forEach((l) => {
      found.forEach((f) => {
        const a = l.itemName.trim().toLocaleLowerCase('bn')
        const b = f.itemName.trim().toLocaleLowerCase('bn')
        const shared = a.split(/\s+/).some((word) => word.length >= 2 && b.includes(word))
        if (shared && l.location.trim() === f.location.trim()) {
          pairs.push({ lostName: l.itemName, foundName: f.itemName })
        }
      })
    })
    return pairs
  }, [lost, found])

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
        <span>
          মোট {toBanglaNumber(visibleItems.length)} টি অনুসন্ধান বিজ্ঞপ্তি — হারানো{' '}
          {toBanglaNumber(lost.length)} টি, প্রাপ্ত {toBanglaNumber(found.length)} টি
          {pendingCount > 0 && ` • ${toBanglaNumber(pendingCount)} টি অনুমোদনের অপেক্ষায়`}।
        </span>
        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={14} />
          নতুন বিজ্ঞপ্তি দিন
        </button>
      </div>

      <SearchFilterBanner
        query={activeQuery}
        count={visibleItems.length}
        label="বিজ্ঞপ্তি"
        onClear={() => {
          setActiveQuery('')
          onClearQuery?.()
        }}
      />

      {matches.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          {toBanglaNumber(matches.length)} টি সম্ভাব্য মিল পাওয়া গেছে — একই জিনিস হারানো ও পাওয়া দুই তালিকায় আছে কি না দেখে নিন।
        </div>
      )}

      {visibleItems.length === 0 ? (
        <EmptyState
          title="কোনো হারানো বা প্রাপ্ত জিনিস নেই"
          description="অন্য শব্দ দিয়ে খুঁজুন, অথবা নতুন কিছু হারালে বা পেলে নিজে বিজ্ঞপ্তি দিন।"
          actionLabel="বিজ্ঞপ্তি দিন"
          onAction={() => setShowPostModal(true)}
          suggestions={SECTION_SUGGESTIONS.lostfound}
          onSuggest={setActiveQuery}
        />
      ) : (
        <>
          {lost.length > 0 && (
            <div>
              <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">হারানো জিনিস</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {lost.map((item) => (
                  <ServiceCard
                    key={item.id}
                    title={item.itemName}
                    subtitle={`${item.description || 'বিস্তারিত নেই'} • ${formatDate(item.date)}`}
                    location={item.location}
                    phone={item.phone}
                    category="হারানো ও প্রাপ্তি"
                    section="হারানো ও প্রাপ্তি"
                    updated={item.lastUpdated ?? item.postedAt}
                    badge={
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {item.type}
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {found.length > 0 && (
            <div>
              <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">পাওয়া গেছে</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {found.map((item) => (
                  <ServiceCard
                    key={item.id}
                    title={item.itemName}
                    subtitle={`${item.description || 'বিস্তারিত নেই'} • ${formatDate(item.date)}`}
                    location={item.location}
                    phone={item.phone}
                    category="হারানো ও প্রাপ্তি"
                    section="হারানো ও প্রাপ্তি"
                    updated={item.lastUpdated ?? item.postedAt}
                    badge={
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {item.type}
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-[#182420] dark:text-slate-300">
        মূল্যবান জিনিস পাওয়ার ক্ষেত্রে মালিকের পরিচয় নিশ্চিত না করে কোথাও হস্তান্তর করবেন না।
        পুলিশ বা ইউনিয়ন পরিষদে জানিয়ে রাখুন।
      </div>

      <PostLostFoundModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmitted={() => {
          setBoard(lostFoundService.getPublic())
          setVersion((value) => value + 1)
        }}
      />
    </section>
  )
}
