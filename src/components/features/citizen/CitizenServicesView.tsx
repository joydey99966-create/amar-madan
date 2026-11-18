import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Building, Clock, ExternalLink, FileCheck2, Search, Wallet, X } from 'lucide-react'
import { CitizenService } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'
import { CallButton } from '../../common/ContactActions'
import { DocChecklist } from './DocChecklist'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { launchChecklistService } from '../../../services/launchChecklistService'
import { useDataVersion } from '../../../hooks/useDataVersion'

interface CitizenServicesViewProps {
  services: CitizenService[]
  query?: string
  onClearQuery?: () => void
}

/**
 * NID, birth certificate, land, passport and Union Parishad guidance — each
 * card lists the office, fee, processing time and required documents.
 */
export function CitizenServicesView({ services, query = '', onClearQuery }: CitizenServicesViewProps) {
  const [searchTerm, setSearchTerm] = useState(query)
  const launchVersion = useDataVersion('launch')
  const deadLinks = useMemo(
    () => launchChecklistService.get().links.filter((link) => link.dead),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [launchVersion],
  )

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  // A service matches by its name/purpose (and its note). The required-documents
  // list is deliberately excluded: incidental phrases such as "পাসপোর্ট সাইজ
  // ছবি" must not make the NID or birth service match a "পাসপোর্ট" search.
  const filtered = useMemo(() => {
    return services.filter((service) =>
      matchesSectionQuery('citizens', searchTerm, [service.name, service.note ?? ''], false),
    )
  }, [services, searchTerm])

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] bg-white p-4 shadow-md dark:bg-[#1a2420]">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1411]">
          <Search size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="সেবা খুঁজুন — যেমন: জমি, পাসপোর্ট, জন্ম নিবন্ধন"
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
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          মোট {toBanglaNumber(filtered.length)} টি সরকারি সেবার তথ্য — অফিস, ফি ও প্রয়োজনীয় কাগজপত্রসহ।
        </p>
        {deadLinks.length > 0 && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
            ⚠ {toBanglaNumber(deadLinks.length)} টি বাহ্যিক লিংক অ্যাডমিন দ্বারা অচল হিসেবে চিহ্নিত — ব্যবহারের আগে যাচাই করুন।
          </p>
        )}
      </div>

      <SearchFilterBanner
        query={query}
        count={filtered.length}
        label="নাগরিক সেবা"
        onClear={() => {
          setSearchTerm('')
          onClearQuery?.()
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="কোনো সেবা পাওয়া যায়নি"
          description="অন্য নাম লিখে খুঁজুন, যেমন: NID, পাসপোর্ট, জন্ম নিবন্ধন।"
          onReset={() => setSearchTerm('')}
          suggestions={SECTION_SUGGESTIONS.citizens}
          onSuggest={setSearchTerm}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:grid-cols-2">
          {filtered.map((service) => (
            <article
              key={service.id}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  <FileCheck2 size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-5 text-slate-800 dark:text-white">{service.name}</h3>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building size={13} className="mt-0.5 shrink-0" />
                    {service.office}
                  </p>
                </div>
              </div>

              <dl className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <Wallet size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <dt className="font-semibold text-slate-700 dark:text-slate-200">ফি</dt>
                    <dd>{service.fee}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={14} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
                  <div>
                    <dt className="font-semibold text-slate-700 dark:text-slate-200">সময় লাগে</dt>
                    <dd>{service.processingTime}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BadgeCheck size={14} className="mt-0.5 shrink-0 text-forest dark:text-emerald-300" />
                  <div>
                    <dt className="font-semibold text-slate-700 dark:text-slate-200">অফিসের ঠিকানা</dt>
                    <dd>{service.address}</dd>
                  </div>
                </div>
              </dl>

              <DocChecklist serviceId={service.id} docs={service.requiredDocs} />

              {service.steps && service.steps.length > 0 && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    যেভাবে আবেদন করবেন
                  </p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                    {service.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {service.note && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                  {service.note}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                <CallButton phone={service.phone} />
                {service.online ? (
                  <a
                    href={service.online}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                  >
                    <ExternalLink size={14} />
                    অনলাইনে আবেদন
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                    অনলাইনে আবেদন নেই
                  </span>
                )}
              </div>

              <ListingMeta
                updated={service.lastUpdated}
                listing={service.name}
                section="নাগরিক সেবা"
                className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
              />
            </article>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-xs text-teal-900 dark:border-teal-900/40 dark:bg-teal-900/20 dark:text-teal-200">
        সরকারি ফি ও সময় যেকোনো সময় পরিবর্তন হতে পারে। আবেদনের আগে সংশ্লিষ্ট অফিসে ফোন করে
        নিশ্চিত করুন। কোনো তথ্য ভুল মনে হলে প্রতিটি কার্ডের <strong>“ভুল তথ্য জানান”</strong> লিংকে ক্লিক করুন।
      </div>
    </section>
  )
}
