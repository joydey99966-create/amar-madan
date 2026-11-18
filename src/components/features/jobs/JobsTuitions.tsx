import { useEffect, useMemo, useState } from 'react'
import { Briefcase, CalendarDays, MapPin, Plus, Wallet } from 'lucide-react'
import { EducationInstitution, JobPosting } from '../../../types'
import { SubTabBar } from '../../common/SubTabBar'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { PostJobModal } from './PostJobModal'
import { jobPostingService } from '../../../services/jobPostingService'
import { useDataVersion, notifyDataChanged } from '../../../hooks/useDataVersion'
import { useUrlFilter } from '../../../hooks/useUrlFilter'
import { cleanPhone, formatDate, toBanglaNumber } from '../../../utils/formatters'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'

interface JobsTuitionsProps {
  institutions: EducationInstitution[]
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
  initialTab?: JobsTab
}

export type JobsTab = 'tuition' | 'employment'

/** Maps any legacy/alias tab value from the URL to the canonical spelling. */
export function canonicalJobsTab(value: string | null | undefined): JobsTab {
  return value === 'employment' || value === 'jobs' ? 'employment' : 'tuition'
}

const JOB_TYPES: NonNullable<JobPosting['type']>[] = ['ফুল টাইম', 'পার্ট টাইম', 'কন্ট্রাক্ট', 'টিউশনি']

const SALARY_FILTERS = [
  { id: 'all', label: 'সব বেতন', min: 0 },
  { id: '5k', label: '৫,০০০+', min: 5000 },
  { id: '10k', label: '১০,০০০+', min: 10000 },
  { id: '15k', label: '১৫,০০০+', min: 15000 },
] as const

function matchesQuery(query: string, values: Array<string | undefined>): boolean {
  return matchesSectionQuery('jobs', query, values)
}

/** The one posting card, shared by the Tuition and Employment tabs. */
function PostingCard({ posting }: { posting: JobPosting }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Briefcase size={18} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {posting.category}
              </span>
              {posting.type && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {posting.type}
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-sm font-bold text-slate-800 dark:text-white">
              {posting.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{posting.organization}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">{posting.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><MapPin size={12} /> {posting.location}</span>
        <span className="flex items-center gap-1"><Wallet size={12} /> {posting.salary}</span>
        <span className="flex items-center gap-1"><CalendarDays size={12} /> আবেদনের শেষ: {formatDate(posting.deadline)}</span>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
        <a
          href={`tel:${cleanPhone(posting.contact)}`}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg bg-forest px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#104b38]"
        >
          যোগাযোগ করুন
          <span className="text-[10px] font-medium opacity-90">{posting.contact}</span>
        </a>
      </div>
      <ListingMeta
        updated={posting.lastUpdated ?? posting.postedAt}
        listing={posting.title}
        section="চাকরি ও টিউশনি"
        className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
      />
    </article>
  )
}

export function JobsTuitions({
  institutions,
  query = '',
  onClearQuery,
  initialTab = 'tuition',
}: JobsTuitionsProps) {
  // The active tab lives in ?tab= (tuition/employment) so it survives refresh
  // and can be linked. Legacy ?tab=tution is normalised below.
  const [activeTab, setActiveTab] = useUrlFilter<JobsTab>('tab', initialTab, ['tuition', 'employment'])
  const [typeFilter, setTypeFilter] = useState<'all' | NonNullable<JobPosting['type']>>('all')
  const [salaryFilter, setSalaryFilter] = useUrlFilter<(typeof SALARY_FILTERS)[number]['id']>(
    'salary',
    'all',
    SALARY_FILTERS.map((item) => item.id) as (typeof SALARY_FILTERS)[number]['id'][],
  )
  const [showPostModal, setShowPostModal] = useState(false)
  /** Bumped after a submission so the list and counters re-read storage. */
  const [version, setVersion] = useState(0)
  /** Bumped when an admin approves/rejects a posting in another tab. */
  const dataVersion = useDataVersion('jobs')

  // Legacy alias: ?tab=tution (the old misspelling) redirects to ?tab=tuition
  // so old links keep working. The canonical value is written to the URL by
  // useUrlFilter when the tab changes or is restored on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'tution') {
      params.set('tab', 'tuition')
      const query = params.toString()
      const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash
      window.history.replaceState(window.history.state, '', url)
    }
  }, [])

  // One published list, split into two exclusive kinds — a post is either a
  // tuition post or a real job, never both.
  const matchesPosting = (posting: JobPosting) =>
    matchesQuery(query, [
      posting.title,
      posting.organization,
      posting.location,
      posting.category,
      posting.type,
      posting.description,
    ])

  const tuitionPosts = useMemo(
    () => jobPostingService.getTuition().filter(matchesPosting),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, version, dataVersion],
  )

  const activeListings = useMemo(() => {
    const postings = jobPostingService.getJobs()
    return postings.filter((posting) => {
      if (!matchesPosting(posting)) return false
      if (typeFilter !== 'all' && posting.type !== typeFilter) return false
      const salary = SALARY_FILTERS.find((item) => item.id === salaryFilter)
      if (salary && salary.min > 0 && (posting.salaryAmount ?? 0) < salary.min) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, typeFilter, salaryFilter, version, dataVersion])

  const pendingCount = useMemo(() => jobPostingService.getPending().length, [version, dataVersion])

  return (
    <section className="space-y-6">
      <SubTabBar
        tabs={[
          { id: 'tuition', label: 'টিউশনি ও কোচিং' },
          { id: 'employment', label: 'কর্মসংস্থান' },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as JobsTab)}
      />

      <SearchFilterBanner
        query={query}
        count={activeTab === 'tuition' ? tuitionPosts.length : activeListings.length}
        label={activeTab === 'tuition' ? 'টিউশনি পোস্ট' : 'সক্রিয় বিজ্ঞপ্তি'}
        onClear={() => onClearQuery?.()}
      />

      {activeTab === 'tuition' && (
        <div role="tabpanel" className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-xs text-cyan-800 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-200">
            মোট {toBanglaNumber(tuitionPosts.length)} টি টিউশনি পোস্ট তালিকাভুক্ত।
          </div>

          {tuitionPosts.length === 0 ? (
            <EmptyState
              title="কোনো টিউশনির তথ্য পাওয়া যায়নি"
              description="আপনার এলাকার টিউশনির তথ্য থাকলে আমাদের জানান।"
            />
          ) : (
            tuitionPosts.map((posting) => <PostingCard key={posting.id} posting={posting} />)
          )}

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-xs text-cyan-800 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-200">
            আপনার এলাকার টিউশনি বা কোচিং সেবার তথ্য থাকলে আমাদের জানান — অনুমোদনের পর তালিকায় যুক্ত করা হবে।
          </div>
        </div>
      )}

      {activeTab === 'employment' && (
        <div role="tabpanel" className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
            <span>
              মোট {toBanglaNumber(activeListings.length)} টি সক্রিয় বিজ্ঞপ্তি
              {pendingCount > 0 && ` • ${toBanglaNumber(pendingCount)} টি অনুমোদনের অপেক্ষায়`}
            </span>
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#104b38]"
            >
              <Plus size={14} />
              চাকরি / টিউশনি পোস্ট করুন
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#182420]">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              কাজের ধরন
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === 'all'
                    ? 'bg-forest text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
                }`}
              >
                সব
              </button>
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    typeFilter === type
                      ? 'bg-forest text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              বেতন
            </p>
            <div className="flex flex-wrap gap-2">
              {SALARY_FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSalaryFilter(option.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    salaryFilter === option.id
                      ? 'bg-forest text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {activeListings.length === 0 ? (
            <EmptyState
              title="এই ফিল্টারে কোনো বিজ্ঞপ্তি নেই"
              description="ফিল্টার বদলে দেখুন, অথবা নিজে একটি চাকরি বা টিউশনির পোস্ট দিন।"
              actionLabel="ফিল্টার মুছুন"
              onAction={() => {
                setTypeFilter('all')
                setSalaryFilter('all')
              }}
            />
          ) : (
            activeListings.map((posting) => <PostingCard key={posting.id} posting={posting} />)
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
            ✅ প্রতিটি পোস্ট অ্যাডমিন অনুমোদনের পর প্রকাশিত হয়। মেয়াদ শেষ হলে বিজ্ঞপ্তি স্বয়ংক্রিয়ভাবে
            তালিকা থেকে সরে যায়।
          </div>
        </div>
      )}

      <PostJobModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmitted={() => {
          setVersion((value) => value + 1)
          notifyDataChanged('jobs')
        }}
      />
    </section>
  )
}
