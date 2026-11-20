import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Clock, MapPin, Wallet, X } from 'lucide-react'
import { ServiceProvider } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { PillRow } from '../../common/PillRow'
import { ListingMeta } from '../../common/ListingMeta'
import { Pagination } from '../../common/Pagination'
import { doctorSpecialty, doctorVisitsToday } from '../../../utils/doctorMeta'

const PAGE_SIZE = 20

interface DoctorsDirectoryProps {
  doctors: ServiceProvider[]
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
}

export function DoctorsDirectory({ doctors, query = '', onClearQuery }: DoctorsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState(query)
  const [specialty, setSpecialty] = useState('সব')
  const [todayOnly, setTodayOnly] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setSearchTerm(query)
    setPage(1)
  }, [query])

  /** Chips come from the same field every card shows, so no specialty is hidden. */
  const specialties = useMemo(() => {
    const unique = Array.from(new Set(doctors.map((doctor) => doctorSpecialty(doctor))))
    return ['সব', ...unique]
  }, [doctors])

  const filtered = useMemo(() => {
    return doctors.filter((doctor) => {
      if (specialty !== 'সব' && doctorSpecialty(doctor) !== specialty) return false
      if (todayOnly && !doctorVisitsToday(doctor)) return false
      return matchesSectionQuery('doctors', searchTerm, [
        doctor.name,
        doctor.details,
        doctor.area,
        doctorSpecialty(doctor),
        doctor.chamber,
        doctor.registration,
        doctor.visitingDays,
      ])
    })
  }, [doctors, searchTerm, specialty, todayOnly])

  // Render only one page at a time so 135 doctors stay smooth on mobile.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetPage = () => setPage(1)

  return (
    <section className="scroll-mt-24 space-y-6">
      <div className="rounded-[24px] bg-white p-4 shadow-md dark:bg-[#1a2420] sm:p-5">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1411]">
          <span className="text-slate-400 dark:text-slate-500">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); resetPage() }}
            placeholder="ডাক্তার, বিশেষত্ব, চেম্বার বা এলাকা খুঁজুন..."
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

        <button
          type="button"
          onClick={() => { setTodayOnly((value) => !value); resetPage() }}
          aria-pressed={todayOnly}
          className={`mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            todayOnly
              ? 'border-forest bg-forest/10 text-forest dark:bg-emerald-900/20 dark:text-emerald-300'
              : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
          }`}
        >
          <span>🗓️ আজ কোন ডাক্তার আছেন</span>
          <span>{todayOnly ? 'দেখানো হচ্ছে ✓' : 'ফিল্টার করুন'}</span>
        </button>

        <PillRow className="mt-3" trackClassName="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {specialties.map((item) => (
            <button
              key={item}
              type="button"
              data-active={specialty === item ? 'true' : 'false'}
              onClick={() => { setSpecialty(item); resetPage() }}
              aria-pressed={specialty === item}
              className={`min-h-[34px] shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
                specialty === item
                  ? 'bg-forest text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </PillRow>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>মোট {toBanglaNumber(filtered.length)} জন ডাক্তার পাওয়া গেছে</span>
          {(searchTerm || specialty !== 'সব') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSpecialty('সব')
                setTodayOnly(false)
                resetPage()
              }}
              className="font-semibold text-forest hover:underline dark:text-emerald-300"
            >
              ফিল্টার মুছুন
            </button>
          )}
        </div>
      </div>

      <SearchFilterBanner
        query={query}
        count={filtered.length}
        label="ডাক্তার"
        onClear={() => {
          setSearchTerm('')
          resetPage()
          onClearQuery?.()
        }}
      />

      <div className="grid gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="কোনো ডাক্তার পাওয়া যায়নি"
            description="অন্য নাম, বিশেষত্ব বা এলাকা লিখে পুনরায় অনুসন্ধান করুন।"
            onReset={() => {
              setSearchTerm('')
              setSpecialty('সব')
              setTodayOnly(false)
              resetPage()
            }}
            suggestions={SECTION_SUGGESTIONS.doctors}
            onSuggest={(value) => { setSearchTerm(value); resetPage() }}
          />
        ) : (
          paged.map((doctor) => (
            <div
              key={doctor.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{doctor.name}</h3>
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {doctorSpecialty(doctor)}
                  </span>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {doctor.chamber ?? doctor.details}
                  </p>
                </div>
                {doctor.fee && (
                  <div className="rounded-xl bg-amber-50 px-3 py-2 text-right dark:bg-amber-900/20">
                    <span className="block text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      পরামর্শ ফি
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-amber-800 dark:text-amber-200">
                      <Wallet size={13} />
                      {doctor.fee}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="shrink-0 text-forest dark:text-emerald-300" />
                  <span>{doctor.area}</span>
                </div>
                {doctor.visitingDays && (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] leading-none" aria-hidden="true">🗓️</span>
                    <span>চেম্বার: {doctor.visitingDays}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    {doctor.visitingHours ?? 'চেম্বারের সময় ফোন করে নিশ্চিত করুন'}
                  </span>
                </div>
                {doctor.registration && (
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={15} className="shrink-0 text-sky-600 dark:text-sky-400" />
                    <span>নিবন্ধন: {doctor.registration}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                {doctor.phone?.trim() ? (
                  <>
                    <CallButton phone={doctor.phone} />
                    <CopyPhoneButton phone={doctor.phone} />
                    <WhatsAppButton phone={doctor.phone} />
                  </>
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    যোগাযোগের তথ্য যাচাই চলছে
                  </span>
                )}
              </div>

              <ListingMeta
                updated={doctor.lastUpdated}
                listing={doctor.name}
                section="ডাক্তার তালিকা"
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
          label="ডাক্তার"
        />
      )}
    </section>
  )
}
