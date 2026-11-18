import { useEffect, useMemo, useState } from 'react'
import { Bike, Bus, Car, CarTaxiFront, Clock, MapPin, Phone, Ship } from 'lucide-react'
import { ServiceProvider, TransportMode, TransportRoute } from '../../../types'
import { ServiceCard } from '../../common/ContactCard'
import { EmptyState } from '../../common/EmptyState'
import { SearchFilterBanner } from '../../common/SearchFilterBanner'
import { ListingMeta } from '../../common/ListingMeta'
import { cleanPhone, toBanglaNumber, parseFare, formatPrice } from '../../../utils/formatters'
import { TRANSPORT_MODES } from '../../../services/transportService'
import { matchesSectionQuery, SECTION_SUGGESTIONS } from '../../../utils/sectionSearch'
import { useSectionQuery } from '../../../hooks/useSectionQuery'
import { useUrlFilter } from '../../../hooks/useUrlFilter'
import { PillRow } from '../../common/PillRow'

interface TransportViewProps {
  routes: TransportRoute[]
  /** Vehicle rental providers (rent-a-car entries of the directory). */
  providers: ServiceProvider[]
  onBack?: () => void
  /** Free-text query carried from the homepage search. */
  query?: string
  onClearQuery?: () => void
}

const MODE_ICONS: Record<TransportMode, typeof Bus> = {
  বাস: Bus,
  বোট: Ship,
  রিকশা: Bike,
  সিএনজি: CarTaxiFront,
  মাইক্রোবাস: Car,
}

const MODE_STYLES: Record<TransportMode, string> = {
  বাস: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
  বোট: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  রিকশা: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  সিএনজি: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  মাইক্রোবাস: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
}

export function TransportView({
  routes,
  providers,
  onBack,
  query = '',
  onClearQuery,
}: TransportViewProps) {
  const [mode, setMode] = useUrlFilter<'all' | TransportMode>(
    'filter',
    'all',
    ['all', ...TRANSPORT_MODES] as const,
  )
  const [activeQuery, setActiveQuery] = useSectionQuery(query)

  // A homepage search such as "বোট" should open the right mode directly. A
  // query that names no mode leaves the URL filter (from ?filter=) untouched,
  // so a shared/refreshable filtered view keeps its mode.
  useEffect(() => {
    const text = activeQuery.trim()
    if (!text) return
    const matched = TRANSPORT_MODES.find((item) => text.includes(item))
    if (matched) setMode(matched)
  }, [activeQuery])

  const visibleRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (mode !== 'all' && route.mode !== mode) return false
      return matchesSectionQuery('transport', activeQuery, [
        route.name,
        route.mode,
        route.from,
        route.to,
        route.schedule.join(' '),
      ])
    })
  }, [routes, mode, query])

  const visibleProviders = useMemo(() => {
    return providers.filter((provider) =>
      matchesSectionQuery('transport', activeQuery, [
        provider.name,
        provider.details,
        provider.area,
      ]),
    )
  }, [providers, query])

  const modesWithRoutes = useMemo(
    () => TRANSPORT_MODES.filter((item) => routes.some((route) => route.mode === item)),
    [routes],
  )

  // When two routes share a name (e.g. "মদন → নেত্রকোণা" by বাস and সিএনজি),
  // show the travel mode in the heading so identical headings never repeat.
  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>()
    routes.forEach((route) => counts.set(route.name, (counts.get(route.name) ?? 0) + 1))
    return new Set(Array.from(counts.entries()).filter(([, n]) => n > 1).map(([name]) => name))
  }, [routes])

  // Real fare estimator, driven only by the admin-editable published fare
  // table. A route (from → to) can have several vehicle types; offer only the
  // ones that actually exist for the chosen route. Total = fare × passengers.
  const routeNames = useMemo(() => Array.from(new Set(routes.map((r) => r.name))), [routes])
  const [estName, setEstName] = useState('')
  const [estMode, setEstMode] = useState<TransportMode | ''>('')
  const [estPassengers, setEstPassengers] = useState(1)

  // Vehicle types available for the selected route — never offer ones that
  // the fare table does not have for this route.
  const estModes = useMemo(
    () => (estName ? Array.from(new Set(routes.filter((r) => r.name === estName).map((r) => r.mode))) : []),
    [routes, estName],
  )
  const estRoute = estName && estMode ? routes.find((r) => r.name === estName && r.mode === estMode) : undefined
  const farePerPerson = estRoute ? parseFare(estRoute.fare) : 0
  const passengers = Number.isFinite(estPassengers) && estPassengers > 0 ? Math.floor(estPassengers) : 1
  const estTotal = farePerPerson * passengers

  const chooseRoute = (name: string) => {
    setEstName(name)
    const modes = Array.from(new Set(routes.filter((r) => r.name === name).map((r) => r.mode)))
    // Pre-select the only vehicle type when a route has just one.
    setEstMode(modes.length === 1 ? modes[0] : '')
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-200">
        🚌 {toBanglaNumber(routes.length)} টি রুটের ভাড়া ও সময়সূচি — বাস, বোট, রিকশা, সিএনজি ও
        মাইক্রোবাস। ভাড়া ও সময় পরিবর্তন হতে পারে, তাই যাত্রার আগে ফোনে নিশ্চিত করুন।
      </div>

      <div className="rounded-[24px] bg-white p-3 shadow-md dark:bg-[#1a2420] sm:p-4">
        <PillRow trackClassName="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            type="button"
            data-active={mode === 'all' ? 'true' : 'false'}
            onClick={() => setMode('all')}
            className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === 'all'
                ? 'bg-forest text-white'
                : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
            }`}
          >
            🚏 সব রুট
          </button>
          {modesWithRoutes.map((item) => {
            const Icon = MODE_ICONS[item]
            const count = routes.filter((route) => route.mode === item).length
            return (
              <button
                key={item}
                type="button"
                data-active={mode === item ? 'true' : 'false'}
                onClick={() => setMode(item)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-forest text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
                }`}
              >
                <Icon size={15} />
                {item}
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    mode === item ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'
                  }`}
                >
                  {toBanglaNumber(count)}
                </span>
              </button>
            )
          })}
        </PillRow>
      </div>

      <SearchFilterBanner
        query={activeQuery}
        count={visibleRoutes.length}
        label="রুট"
        onClear={() => {
          setActiveQuery('')
          onClearQuery?.()
        }}
      />

      {routes.length > 0 && (
        <div className="rounded-[24px] border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/20">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">ভাড়ার অনুমান</h3>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
            রুট, যানবাহন ও যাত্রীসংখ্যা বেছে নিন — প্রকাশিত ভাড়া থেকে মোট খরচ হিসাব করা হবে।
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label htmlFor="fare-route" className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              রুট
              <select
                id="fare-route"
                aria-label="ভাড়ার অনুমানের রুট"
                value={estName}
                onChange={(e) => chooseRoute(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              >
                <option value="">রুট বেছে নিন</option>
                {routeNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label htmlFor="fare-vehicle" className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              যানবাহন
              {/*
               * The combobox itself is ALWAYS enabled so it stays fully
               * keyboard-operable (arrow keys + Enter, Tab to move on). Before a
               * route is chosen only the placeholder option is disabled — the
               * available vehicle options below are never marked disabled, so
               * assistive technology sees them as selectable once a route exists.
               */}
              <select
                id="fare-vehicle"
                aria-label="ভাড়ার অনুমানের যানবাহন"
                aria-disabled={!estName || estModes.length === 0 ? 'true' : 'false'}
                value={estMode}
                onChange={(e) => setEstMode(e.target.value as TransportMode | '')}
                className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-[#0f1411] dark:text-white ${
                  !estName || estModes.length === 0 ? 'opacity-60' : ''
                }`}
              >
                <option value="" disabled={!estName}>
                  {estName ? 'যানবাহন বেছে নিন' : 'আগে রুট বেছে নিন'}
                </option>
                {estModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label htmlFor="fare-passengers" className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              যাত্রী
              <input
                id="fare-passengers"
                aria-label="যাত্রীসংখ্যা"
                type="number"
                min={1}
                max={50}
                value={estPassengers}
                onChange={(e) => setEstPassengers(Number(e.target.value))}
                className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              />
            </label>
            {estRoute && (
              <div className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-forest shadow-sm dark:bg-[#0f1411] dark:text-emerald-300">
                আনুমানিক মোট ভাড়া: {formatPrice(estTotal)}
              </div>
            )}
          </div>
          {estRoute && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span>প্রতি জন: {formatPrice(estRoute.fare)}</span>
              {estRoute.duration && <span>সময়: {estRoute.duration}</span>}
              <span>দূরত্ব: {estRoute.distance}</span>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">ভাড়া ও সময়সূচি</h3>
        {visibleRoutes.length === 0 ? (
          <EmptyState
            title="এই রুটের তথ্য পাওয়া যায়নি"
            description="অন্য গন্তব্য বা যানবাহনের নাম লিখে আবার খুঁজুন।"
            actionLabel="ফিরে যান"
            onAction={onBack}
            suggestions={SECTION_SUGGESTIONS.transport}
            onSuggest={setActiveQuery}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleRoutes.map((route) => {
              const Icon = MODE_ICONS[route.mode]
              return (
                <article
                  key={route.id}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/[0.07] dark:bg-[#1a2420] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${MODE_STYLES[route.mode]}`}
                      >
                        <Icon size={18} />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                          {route.name}
                          {duplicateNames.has(route.name) && ` (${route.mode})`}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {route.from} → {route.to}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-forest dark:text-emerald-300">
                        {route.fare}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{route.mode}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {route.distance}
                    </span>
                    {route.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {route.duration}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      ছাড়ার সময়
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {route.schedule.map((time) => (
                        <span
                          key={time}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {route.note && (
                    <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                      ℹ️ {route.note}
                    </p>
                  )}

                  {route.phone && (
                    <a
                      href={`tel:${cleanPhone(route.phone)}`}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#104b38]"
                    >
                      <Phone size={14} />
                      যোগাযোগ: {route.phone}
                    </a>
                  )}

                  <ListingMeta
                    updated={route.lastUpdated}
                    listing={`${route.mode}: ${route.name}`}
                    section="যাতায়াত"
                    className="mt-3 border-t border-slate-100 pt-2.5 dark:border-white/10"
                  />
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">গাড়ি ভাড়ার প্রদানকারী</h3>
        {visibleProviders.length === 0 ? (
          <EmptyState
            title="কোনো গাড়ি ভাড়ার তথ্য পাওয়া যায়নি"
            description="অন্য নাম বা এলাকা লিখে আবার খুঁজুন।"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleProviders.map((provider) => (
              <ServiceCard
                key={provider.id}
                title={provider.name}
                subtitle={provider.details}
                location={provider.area}
                phone={provider.phone}
                category="গাড়ি ভাড়া"
                section="গাড়ি ভাড়া"
                updated={provider.lastUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
