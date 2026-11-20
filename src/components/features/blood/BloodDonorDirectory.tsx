import { useEffect, useMemo, useState } from 'react'
import { Calendar, Search, X } from 'lucide-react'
import { BloodDonor, BloodGroup } from '../../../types'
import { bloodGroups, unionAreas } from '../../../constants'
import { getDonorStatus } from '../../../services/bloodDonorService'
import { formatDate } from '../../../utils/formatters'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { useUrlFilter } from '../../../hooks/useUrlFilter'
import { DonorDetailDialog } from './DonorDetailDialog'
import { donorSettingsService } from '../../../services/donorSettingsService'
import { useDataVersion } from '../../../hooks/useDataVersion'

interface BloodDonorDirectoryProps {
  donors: BloodDonor[]
  /** Blood group carried from a search such as "O+ রক্ত". */
  initialGroup?: BloodGroup | 'সব'
  /** Free-text query carried from the homepage search. */
  query?: string
  /** Clears the query in the URL. */
  onClearQuery?: () => void
}

export function BloodDonorDirectory({
  donors,
  initialGroup = 'সব',
  query = '',
  onClearQuery,
}: BloodDonorDirectoryProps) {
  const [selectedBloodGroup, setSelectedBloodGroupState] = useUrlFilter<BloodGroup | 'সব'>(
    'blood',
    initialGroup,
    ['সব', ...bloodGroups] as (BloodGroup | 'সব')[],
  )
  const setSelectedBloodGroup = (group: BloodGroup | 'সব') => setSelectedBloodGroupState(group)
  const [selectedArea, setSelectedArea] = useState<string>('সব')
  const [availableFilter, setAvailableFilter] = useUrlFilter<'0' | '1' | ''>('available', '', ['', '0', '1'] as const)
  const availableOnly = availableFilter === '1'
  const [textQuery, setTextQuery] = useState(query)
  const [selectedDonor, setSelectedDonor] = useState<BloodDonor | null>(null)
  const donorSettingsVersion = useDataVersion('donor-settings')
  const phoneMasked = useMemo(() => donorSettingsService.get().phoneDisplay === 'masked', [donorSettingsVersion])
  const displayPhone = (phone: string) =>
    phoneMasked ? `••••${String(phone ?? '').slice(-4)}` : phone

  // Keep the local filters in sync when the URL query changes (back/forward).
  useEffect(() => {
    setTextQuery(query)
  }, [query])

  useEffect(() => {
    if (initialGroup) setSelectedBloodGroup(initialGroup)
  }, [initialGroup])

  const filtered = useMemo(() => {
    return donors.filter((donor) => {
      const matchBlood = selectedBloodGroup === 'সব' || donor.bloodGroup === selectedBloodGroup
      const matchArea = selectedArea === 'সব' || donor.unionArea === selectedArea
      const status = getDonorStatus(donor)
      const matchAvailability = !availableOnly || status.isAvailable
      const matchText = matchesSectionQuery('donors', textQuery, [
        donor.name,
        donor.unionArea,
        donor.bloodGroup,
        status.canContact ? donor.phone : '',
        status.readinessLabel,
        status.availabilityBadge,
      ])
      return matchBlood && matchArea && matchAvailability && matchText
    })
  }, [donors, selectedBloodGroup, selectedArea, availableOnly, textQuery])

  const handleReset = () => {
    setSelectedBloodGroup('সব')
    setSelectedArea('সব')
    setAvailableFilter('')
    setTextQuery('')
    onClearQuery?.()
  }

  return (
    <section className="scroll-mt-24 space-y-6">
      <div className="sticky top-20 z-20 space-y-2 rounded-2xl bg-white p-2.5 shadow-md dark:bg-[#1a2420] sm:p-3">
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-white/10 dark:bg-[#0f1411]">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={textQuery}
            onChange={(event) => setTextQuery(event.target.value)}
            placeholder="নাম, এলাকা বা গ্রুপ দিয়ে খুঁজুন..."
            aria-label="রক্তদাতা খুঁজুন"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {textQuery && (
            <button
              type="button"
              onClick={() => {
                setTextQuery('')
                onClearQuery?.()
              }}
              className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label="সার্চ মুছুন"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">গ্রুপ:</span>
            <button
              onClick={() => setSelectedBloodGroup('সব')}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                selectedBloodGroup === 'সব'
                  ? 'bg-forest text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
              }`}
            >
              সব
            </button>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg as BloodGroup)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                  selectedBloodGroup === bg
                    ? 'bg-rose-500 text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-rose-300 dark:border-white/10 dark:text-slate-300'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 dark:border-white/10 dark:bg-[#0f1411] dark:text-slate-200 sm:w-44"
          >
            <option value="সব">সব এলাকা</option>
            {unionAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableFilter(e.target.checked ? '1' : '')}
            className="h-3.5 w-3.5 accent-forest"
          />
          শুধু উপলব্ধ
        </label>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{filtered.length} জন পাওয়া গেছে</span>
          {(selectedBloodGroup !== 'সব' || selectedArea !== 'সব' || availableOnly || textQuery) && (
            <button
              onClick={handleReset}
              className="font-semibold text-forest hover:underline dark:text-emerald-300"
            >
              মুছুন
            </button>
          )}
        </div>
      </div>

      <SearchFilterBanner
        query={query}
        count={filtered.length}
        label="রক্তদাতা"
        onClear={handleReset}
      />

      <div className="grid gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="এই ফিল্টারে কোনো রক্তদাতা নেই"
            description="অন্য কোনো রক্তের গ্রুপ বা এলাকা নির্বাচন করুন অথবা নিচের পরামর্শগুলো চেষ্টা করুন।"
            onReset={handleReset}
            suggestions={SECTION_SUGGESTIONS.donors}
            onSuggest={setTextQuery}
          />
        ) : (
          filtered.map((donor) => {
            const status = getDonorStatus(donor)
            return (
              <div
                key={donor.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDonor(donor)}
                      className="text-sm font-bold text-slate-800 underline decoration-dotted underline-offset-2 transition hover:text-forest dark:text-white dark:hover:text-emerald-300"
                      aria-label={`${donor.name} — বিস্তারিত দেখুন`}
                    >
                      {donor.name}
                    </button>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                      {donor.bloodGroup}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        status.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      {status.availabilityBadge}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div>📍 {donor.unionArea}</div>
                    {donor.lastDonationDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        গত রক্তদান: {formatDate(donor.lastDonationDate)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        গত রক্তদানের তথ্য নেই
                      </div>
                    )}
                  </div>
                  <div
                    className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      status.status === 'unknown'
                        ? 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}
                  >
                    {status.readinessLabel}
                  </div>
                  <ListingMeta
                    listing={`রক্তদাতা: ${donor.name}`}
                    section="রক্তদাতা ডিরেক্টরি"
                    className="mt-2"
                  />
                </div>

                {status.canContact ? (
                  <div className="flex flex-col items-center gap-2">
                    <CallButton phone={donor.phone} label={displayPhone(donor.phone)} className="max-w-[84px]" />
                    <CopyPhoneButton phone={donor.phone} />
                    <WhatsAppButton phone={donor.phone} />
                  </div>
                ) : (
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 px-2 py-3 text-center dark:border-white/10">
                    <span className="text-[10px] font-semibold leading-tight text-slate-500 dark:text-slate-400">
                      যাচাইয়ের অপেক্ষায়
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <DonorDetailDialog donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
    </section>
  )
}
