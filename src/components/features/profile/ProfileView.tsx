import { ChevronRight, Droplets, MessageSquarePlus, TrendingUp, UserRound } from 'lucide-react'
import { ViewId } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'
import { InstallAppButton } from '../../common/InstallAppButton'
import { ProfileText } from '../../../services/profileContentService'
import { displayOrderService } from '../../../services/displayOrderService'
import { useDataVersion } from '../../../hooks/useDataVersion'

export interface ProfileStat {
  label: string
  value: number
  unit?: string
  /** Breakdown of a combined count, e.g. "১০ জন ডাক্তার • ৭ টি হাসপাতাল". */
  detail?: string
  /** When set, the number links to this section (e.g. notices → /news). */
  view?: ViewId
}

export interface MySubmission {
  id: string
  label: string
  detail: string
  status: 'pending' | 'approved' | 'rejected'
}

/** Real activity this browser has stored, grouped by where it came from. */
export interface ProfileActivity {
  donors: MySubmission[]
  bookings: MySubmission[]
  prices: MySubmission[]
  /** The site does not store saved/bookmarked services yet — always empty. */
  saved: MySubmission[]
}

interface ProfileViewProps {
  /** Live statistics, calculated from the real data. */
  stats: ProfileStat[]
  /**
   * The ONE source of this visitor's stored activity. Every contribution is
   * rendered exactly once here, under "আমার প্রোফাইল", so no section can drift
   * or show the same item twice.
   */
  activity: ProfileActivity
  /** All labels and empty-state texts, editable from the admin panel. */
  text: ProfileText
  onRegisterDonor: () => void
  onSuggestPrice: () => void
  onNavigate: (view: ViewId) => void
}

const QUICK_LINKS: { id: string; view: ViewId }[] = [
  { id: 'services', view: 'services' },
  { id: 'emergency-blood', view: 'emergency' },
  { id: 'emergency-help', view: 'emergency' },
  { id: 'market', view: 'market' },
  { id: 'fish', view: 'fish' },
  { id: 'transport', view: 'transport' },
  { id: 'lostfound', view: 'lostfound' },
  { id: 'news', view: 'news' },
  { id: 'jobs', view: 'jobs' },
  { id: 'citizens', view: 'citizens' },
  { id: 'directory', view: 'directory' },
]

/**
 * The profile page — the visitor's own stored activity first, with the site
 * statistics kept in a separate, clearly labelled section.
 */
export function ProfileView({
  stats,
  activity,
  text,
  onRegisterDonor,
  onSuggestPrice,
  onNavigate,
}: ProfileViewProps) {
  const statusLabel = (s: MySubmission['status']) =>
    s === 'approved' ? text.statusApproved : s === 'rejected' ? text.statusRejected : text.statusPending
  const statusClass = (s: MySubmission['status']) =>
    s === 'approved'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : s === 'rejected'
        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'

  const quickLabels = text.quickLinks.split('\n').map((line) => line.trim()).filter(Boolean)
  const orderVersion = useDataVersion('order')
  const orderedQuick = displayOrderService.sortById(QUICK_LINKS, displayOrderService.get().quick)
    .map((link) => ({ ...link, label: quickLabels[QUICK_LINKS.findIndex((q) => q.id === link.id)] ?? '' }))

  /** One grouped activity card — never shows an invented entry. */
  const activityCard = (
    title: string,
    items: MySubmission[],
    emptyText: string,
    actionLabel: string,
    onAction: () => void,
  ) => (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft-sm dark:border-white/10 dark:bg-[#182420]">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h4>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
          {toBanglaNumber(items.length)}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-center dark:border-white/10">
          <p className="text-xs text-slate-500 dark:text-slate-400">{emptyText}</p>
          <button
            type="button"
            onClick={onAction}
            className="mt-2 text-[11px] font-semibold text-forest underline decoration-dotted underline-offset-2 transition hover:text-emerald-800 dark:text-emerald-300"
          >
            {actionLabel} <ChevronRight size={12} className="inline" />
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/[0.07] dark:bg-white/5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-white">{sub.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{sub.detail}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(sub.status)}`}>
                {statusLabel(sub.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-soft-sm dark:border-white/10 dark:bg-[#182420] sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest dark:bg-emerald-900/40 dark:text-emerald-300">
            <UserRound size={26} />
          </span>
          <div>
            <div className="section-eyebrow">{text.heroEyebrow}</div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {text.heroTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text.heroBody}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRegisterDonor}
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
          >
            <Droplets size={16} /> {text.registerDonorLabel}
          </button>
          <button
            type="button"
            onClick={onSuggestPrice}
            className="flex items-center gap-2 rounded-xl bg-[#386bc1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5eae]"
          >
            <MessageSquarePlus size={16} /> {text.suggestPriceLabel}
          </button>
          <InstallAppButton />
        </div>
      </div>

      {/* REAL PROFILE CONTENT — only what this browser actually stored. */}
      <div>
        <div className="section-eyebrow">{text.myEyebrow}</div>
        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{text.myTitle}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text.myIntro}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {activityCard(
            text.donorTitle,
            activity.donors,
            text.donorEmpty,
            text.registerDonorLabel,
            onRegisterDonor,
          )}
          {activityCard(
            text.bookingTitle,
            activity.bookings,
            text.bookingEmpty,
            text.viewLinkLabel,
            () => onNavigate('services'),
          )}
          {activityCard(
            text.priceTitle,
            activity.prices,
            text.priceEmpty,
            text.suggestPriceLabel,
            onSuggestPrice,
          )}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft-sm dark:border-white/10 dark:bg-[#182420]">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">{text.savedTitle}</h4>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                {toBanglaNumber(activity.saved.length)}
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-center dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">{text.savedEmpty}</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400 dark:text-slate-500">{text.savedNote}</p>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="mt-2 text-[11px] font-semibold text-forest underline decoration-dotted underline-offset-2 transition hover:text-emerald-800 dark:text-emerald-300"
              >
                {text.viewLinkLabel} <ChevronRight size={12} className="inline" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SITE STATISTICS — kept separate from the personal profile above. */}
      <div>
        <div className="section-eyebrow">{text.statsEyebrow}</div>
        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{text.statsTitle}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft-sm dark:border-white/10 dark:bg-[#182420]"
            >
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              {stat.view ? (
                <button
                  type="button"
                  onClick={() => onNavigate(stat.view!)}
                  title={`${stat.label} দেখুন`}
                  className="mt-1 text-left text-xl font-bold text-forest underline decoration-dotted underline-offset-2 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  {toBanglaNumber(stat.value)}
                  {stat.unit ? <span className="text-xs font-semibold text-slate-400"> {stat.unit}</span> : null}
                </button>
              ) : (
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {toBanglaNumber(stat.value)}
                  {stat.unit ? <span className="text-xs font-semibold text-slate-400"> {stat.unit}</span> : null}
                </p>
              )}
              {stat.detail && (
                <p className="mt-0.5 text-[10px] leading-4 text-slate-400 dark:text-slate-500">{stat.detail}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <TrendingUp size={13} /> {text.statsNote}
        </p>
      </div>

      <div>
        <div className="section-eyebrow">{text.quickEyebrow}</div>
        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{text.quickTitle}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {orderedQuick.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.view)}
              className="flex min-h-[36px] items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-300"
            >
              {link.label} <ChevronRight size={13} />
            </button>
          ))}
        </div>
      </div>

    </section>
  )
}
