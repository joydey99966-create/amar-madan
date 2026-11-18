import { useEffect, useMemo, useState } from 'react'
import { Building2, Clock, X } from 'lucide-react'
import { Hospital } from '../../../types'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ContactCard } from '../../common/ContactCard'
import { useEmergencyContacts } from '../../../hooks/useEmergencyContacts'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { toBanglaNumber } from '../../../utils/formatters'

interface HospitalsDirectoryProps {
  hospitals: Hospital[]
  query?: string
  onClearQuery?: () => void
}

/** Hospital / clinic list: name, address, phone and the services it provides. */
export function HospitalsDirectory({ hospitals, query = '', onClearQuery }: HospitalsDirectoryProps) {
  const police = useEmergencyContacts().find((contact) => contact.category === 'police')
  const [searchTerm, setSearchTerm] = useState(query)

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  const filtered = useMemo(() => {
    return hospitals.filter((hospital) =>
      matchesSectionQuery('hospitals', searchTerm, [
        hospital.name,
        hospital.type,
        hospital.address,
        hospital.services.join(' '),
      ]),
    )
  }, [hospitals, searchTerm])

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] bg-white p-4 shadow-md dark:bg-[#1a2420]">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1411]">
          <span className="text-slate-400 dark:text-slate-500"></span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="হাসপাতাল, ঠিকানা বা সেবা খুঁজুন..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label="সার্চ মুছুন"
            >
              <X size={17} />
            </button>
          )}
        </label>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {toBanglaNumber(filtered.length)} টি হাসপাতাল ও ক্লিনিক ·{' '}
            {toBanglaNumber(hospitals.filter((hospital) => hospital.emergency).length)}টিতে ২৪ ঘণ্টা জরুরি সেবা
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
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
        label="হাসপাতাল"
        onClear={() => {
          setSearchTerm('')
          onClearQuery?.()
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="কোনো হাসপাতাল পাওয়া যায়নি"
          description="অন্য নাম, এলাকা বা সেবার নাম লিখে আবার খুঁজুন।"
          onReset={() => setSearchTerm('')}
          suggestions={SECTION_SUGGESTIONS.hospitals}
          onSuggest={setSearchTerm}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:grid-cols-2">
          {filtered.map((hospital) => (
            <ContactCard
              key={hospital.id}
              title={hospital.name}
              subtitle={hospital.type}
              location={hospital.address}
              phone={hospital.phone}
              category="হাসপাতাল ও ক্লিনিক"
              section="হাসপাতাল তালিকা"
              updated={hospital.lastUpdated}
              extraInfo={
                hospital.emergency ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                    জরুরি ২৪/৭
                  </span>
                ) : undefined
              }
              details={
                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{hospital.openingHours}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 size={14} className="mt-0.5 shrink-0 text-forest dark:text-emerald-300" />
                    <span>
                      {hospital.beds
                        ? `${toBanglaNumber(hospital.beds)} শয্যা`
                        : 'শয্যা সংখ্যা জানা যায়নি'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hospital.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
        <strong>জরুরি অবস্থায়:</strong> সরাসরি {police?.phone ?? ''}-এ কল করুন। হাসপাতালে যাওয়ার আগে ফোন করে
        শয্যা ও ডাক্তারের উপস্থিতি নিশ্চিত করুন।
      </div>
    </section>
  )
}
