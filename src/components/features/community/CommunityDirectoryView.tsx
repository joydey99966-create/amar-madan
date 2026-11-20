import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { ManagedRecordType, recordsService } from '../../../services/recordsService'
import { useDataVersion } from '../../../hooks/useDataVersion'
import { EmptyState } from '../../common/EmptyState'
import { ServiceCard } from '../../common/ContactCard'
import { Pagination } from '../../common/Pagination'
import { toBanglaNumber } from '../../../utils/formatters'

interface CommunityDirectoryViewProps {
  type: ManagedRecordType
  title: string
  description: string
  suggestions?: string[]
}

const PAGE_SIZE = 20

/**
 * Generic public list for the community sections (banks, pharmacies, government
 * offices, mechanics, agriculture officers, veterinary, postal). Records come
 * only from the admin-managed store; with no published records the page shows
 * an honest empty state instead of invented entries.
 */
export function CommunityDirectoryView({ type, title, description, suggestions }: CommunityDirectoryViewProps) {
  const version = useDataVersion('records')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [query])

  const records = useMemo(
    () => recordsService.all<Record<string, unknown> & { id: string }>(type),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, version],
  )

  const filtered = useMemo(() => {
    const terms = query.toLocaleLowerCase('bn').split(/[\s,،;:|]+/).filter(Boolean)
    if (!terms.length) return records
    return records.filter((record) => {
      const hay = ['name', 'type', 'area', 'address', 'details', 'phone']
        .map((key) => String(record[key] ?? '').toLocaleLowerCase('bn'))
        .join(' ')
      return terms.every((term) => hay.includes(term))
    })
  }, [records, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
        {description} মোট {toBanglaNumber(records.length)} টি তথ্য প্রকাশিত আছে।
      </div>

      <div className="rounded-[24px] bg-white p-4 shadow-md dark:bg-[#1a2420] sm:p-5">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1411]">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${title} খুঁজুন...`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="সার্চ মুছুন" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X size={17} />
            </button>
          )}
        </label>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{toBanglaNumber(filtered.length)} টি পাওয়া গেছে</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={records.length === 0 ? 'এখনো কোনো তথ্য প্রকাশিত হয়নি' : 'কোনো ফলাফল পাওয়া যায়নি'}
          description="অ্যাডমিন প্যানেল থেকে যাচাইকৃত তথ্য যোগ করলে এখানে দেখা যাবে।"
          suggestions={suggestions}
          onSuggest={setQuery}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {paged.map((record) => (
            <ServiceCard
              key={record.id}
              title={String(record.name ?? 'নাম যাচাই চলছে')}
              subtitle={[record.type, record.details].filter(Boolean).map(String).join(' • ')}
              location={[record.area, record.address].filter(Boolean).map(String).join(', ')}
              phone={String(record.phone ?? '')}
              category={title}
              section={title}
              updated={typeof record.lastUpdated === 'string' ? record.lastUpdated : undefined}
            />
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <Pagination total={filtered.length} page={safePage} pageSize={PAGE_SIZE} onPageChange={setPage} label="এন্ট্রি" />
      )}
    </section>
  )
}
