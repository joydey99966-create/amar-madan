import { useCallback, useEffect, useMemo, useState } from 'react'
import { categories, isViewId, NAV_TAB_BY_VIEW, VIEW_IDS, VIEW_META } from './constants'
import { directoryService } from './services'
import { noticeService } from './services/noticeService'
import { lostFoundService } from './services/lostFoundService'
import { marketService } from './services/marketService'
import { jobPostingService } from './services/jobPostingService'
import { hospitalService } from './services/hospitalService'
import { citizenService } from './services/citizenService'
import { transportService } from './services/transportService'
import { searchSettingsService } from './services/searchSettingsService'
import { useBloodDonors } from './hooks/useBloodDonors'
import { useEmergencyContacts } from './hooks/useEmergencyContacts'
import { recordsService } from './services/recordsService'
import { machineryBookingService } from './services/machineryBookingService'
import { priceModerationService } from './services/priceModerationService'
import { profileContentService } from './services/profileContentService'
import { bloodDonorService } from './services/bloodDonorService'
import { initialBloodDonors } from './data'
import type { ProfileActivity } from './components/features/profile/ProfileView'
import { useAppRouter } from './hooks/useAppRouter'
import { useDataVersion } from './hooks/useDataVersion'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AdminProvider } from './context/AdminContext'
import { ReportProvider } from './context/ReportContext'
import { Header, Hero, BottomNav, Footer } from './components/layout'
import { ToastContainer } from './components/common/Toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { EmptyState } from './components/common/EmptyState'
import {
  SearchBar,
  SearchResults,
  CulturalBanner,
  CategoriesGrid,
  NoticesSection,
  CommunityBanner,
  EmergencyStrip,
  TodayInfo,
  EmergencyBlood,
  LocalDirectory,
  JobsTuitions,
  AgroMarket,
  AddPriceModal,
  RegisterDonorModal,
  AdminDashboard,
  NoticeDetailView,
  AllServicesView,
  ProfileView,
  type ProfileStat,
  TransportView,
  LostFoundView,
  NewsView,
  FishMarketView,
  CitizenServicesView,
  PhotoGallery,
} from './components/features'
import { Notice, NavTabId, NewsItem, ViewId } from './types'
import {
  DirectoryTab,
} from './components/features/directory/LocalDirectory'
import { EmergencyBloodTab } from './components/features/emergency/EmergencyBlood'
import { JobsTab, canonicalJobsTab } from './components/features/jobs/JobsTuitions'
import { AgroTab } from './components/features/agro/AgroMarket'
import {
  bestSectionForQuery,
  countHits,
  detectIntents,
  SearchHit,
  searchEverything,
} from './utils/search'
import { buildSectionCounts, totalsBySection } from './utils/counts'
import { scrollToTop } from './utils/scroll'
import { formatPrice } from './utils/formatters'
import { analyticsService } from './services/analyticsService'
import { displayOrderService } from './services/displayOrderService'

/** Which section sub-tab a homepage tile should open. */
const CATEGORY_TABS: Record<string, string> = {
  blood: 'blood',
  ambulance: 'emergency',
  emergency: 'emergency',
  doctors: 'doctors',
  education: 'education',
  market: 'prices',
  agro: 'dealers',
  tuition: 'tuition',
}

function AppContent() {
  const { route, navigate } = useAppRouter()
  const activeView = route.view

  const [searchInput, setSearchInput] = useState(route.query)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showAddPriceModal, setShowAddPriceModal] = useState(false)

  // Admin approvals in another view must refresh the public lists and counters.
  const lostFoundVersion = useDataVersion('lostfound')
  const jobsVersion = useDataVersion('jobs')
  // The notice board and the directory are admin-managed, so they are read
  // again whenever the admin panel publishes something.
  const noticesVersion = useDataVersion('notices')
  const directoryVersion = useDataVersion('directory')
  const marketVersion = useDataVersion('market')
  const searchVersion = useDataVersion('search')
  const recordsVersion = useDataVersion('records')
  const bookingsVersion = useDataVersion('machinery-bookings')
  const emergencyVersion = useDataVersion('emergency')
  const profileVersion = useDataVersion('profile')
  const orderVersion = useDataVersion('order')

  const { donors, addDonor } = useBloodDonors()
  const emergencyContacts = useEmergencyContacts()

  // Keep the visible search box in sync with the URL (back/forward friendly).
  useEffect(() => {
    setSearchInput(route.query)
  }, [route.query])

  // Memoize heavy computations
  const emergencyServices = useMemo(() => directoryService.getEmergencyServices(), [directoryVersion])
  const educationInstitutions = useMemo(() => directoryService.getEducation(), [directoryVersion])
  const hospitals = useMemo(() => hospitalService.getAll(), [])
  const citizenServices = useMemo(() => citizenService.getAll(), [])
  const transportRoutes = useMemo(() => transportService.getRoutes(), [])
  const lostFoundItems = useMemo(
    () => lostFoundService.getAll().filter((item) => item.isApproved !== false),
    [lostFoundVersion],
  )
  const jobPostings = useMemo(() => jobPostingService.getActive(), [jobsVersion])
  const marketPrices = useMemo(() => marketService.getLiveMarketPrices(), [marketVersion])
  const fishPrices = useMemo(() => marketService.getFishPrices(), [recordsVersion])
  const machinery = useMemo(() => recordsService.machinery(), [recordsVersion])
  const fishWholesalers = useMemo(() => marketService.getFishWholesalers(), [])
  const journalists = useMemo(() => directoryService.getJournalists(), [])
  // A notice detail is a deep link (/news/:id), so it survives reloads and
  // back/forward navigation without local state.
  const newsItems = useMemo(() => noticeService.getPublishedNews(), [noticesVersion])
  /** The homepage notice board — the same records the /news list shows. */
  const notices = useMemo(() => noticeService.getPublishedNotices(), [noticesVersion])
  const selectedNotice = useMemo(
    () => (route.noticeId ? noticeService.getPublishedById(route.noticeId) ?? null : null),
    [route.noticeId, noticesVersion],
  )

  const filteredCategories = useMemo(() => {
    // Admin-controlled usefulness order; unlisted items keep their old tail.
    const ordered = displayOrderService.sortById(categories, displayOrderService.get().categories)
    const terms = searchInput.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return ordered
    return ordered.filter((category) => {
      const searchableText = `${category.name} ${category.english} ${category.keywords ?? ''}`.toLocaleLowerCase()
      return terms.every((term) => searchableText.includes(term))
    })
  }, [searchInput, orderVersion])

  /** Donors the admin has not marked as unavailable. */
  const activeDonors = useMemo(
    () => donors.filter((donor) => donor.availability !== 'busy').length,
    [donors],
  )

  /**
   * Every number shown on the site is calculated from the data that is
   * actually published — no inflated marketing counters.
   *
   * Every counter comes from one helper, and a section that shows several
   * lists (doctors + hospitals, tuition + jobs, emergency cards + ambulances +
   * technicians, machinery + BCIC dealers) counts all of them.
   */
  const sectionCounts = useMemo(() => {
    // One published list, split by the single type helper — never double-count.
    // Both come from the same helpers the tabs render, so counts match the UI.
    const tuitionPosts = jobPostingService.getTuition().length
    const realJobs = jobPostingService.getJobs().length

    return buildSectionCounts({
      donors: activeDonors,
      doctors: emergencyServices.doctors.length,
      hospitals: hospitals.length,
      ambulances: emergencyServices.ambulance.length,
      technicians: emergencyServices.technicians.length,
      emergencyCards: emergencyContacts.length,
      rentACars: emergencyServices.rentacar.length,
      machinery: machinery.length,
      agroDealers: emergencyServices.agro.length,
      tuitionPosts,
      jobs: realJobs,
      lostFound: lostFoundItems.length,
      marketPrices: marketPrices.length,
      fishPrices: fishPrices.length,
      news: newsItems.length,
      citizens: citizenServices.length,
      education: educationInstitutions.length,
      routes: transportRoutes.length,
    })
  }, [
    activeDonors,
    emergencyServices,
    emergencyContacts.length,
    hospitals.length,
    educationInstitutions,
    machinery.length,
    jobPostings.length,
    lostFoundItems.length,
    marketPrices.length,
    fishPrices.length,
    newsItems.length,
    citizenServices.length,
    transportRoutes.length,
  ])

  const counts = useMemo(() => totalsBySection(sectionCounts), [sectionCounts])
  /** "১০ জন ডাক্তার • ৭ টি হাসপাতাল" — how a combined count is built. */
  const countDetails = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(sectionCounts).map(([key, value]) => [key, value.detail]),
      ),
    [sectionCounts],
  )
  /** The unit of each total, e.g. mixed lists count as "টি". */
  const countUnits = useMemo(
    () =>
      Object.fromEntries(Object.entries(sectionCounts).map(([key, value]) => [key, value.unit])),
    [sectionCounts],
  )

  const profileStats = useMemo<ProfileStat[]>(
    () => [
      { label: 'রক্তদাতা', value: counts.blood, unit: 'জন', detail: sectionCounts.blood.detail },
      {
        label: 'ডাক্তার ও হাসপাতাল',
        value: counts.doctors,
        unit: 'টি',
        detail: sectionCounts.doctors.detail,
      },
      { label: 'অ্যাম্বুলেন্স', value: counts.ambulance, unit: 'টি', detail: sectionCounts.ambulance.detail },
      { label: 'শিক্ষা প্রতিষ্ঠান', value: counts.education, unit: 'টি', detail: sectionCounts.education.detail },
      {
        label: 'সক্রিয় বিজ্ঞপ্তি',
        value: newsItems.length,
        unit: 'টি',
        detail: 'প্রকাশিত সংবাদ ও নোটিশ',
        view: 'news',
      },
      { label: 'বাজারদর পণ্য', value: counts.market, unit: 'টি', detail: sectionCounts.market.detail },
      { label: 'হাওরের মাছের দর', value: counts.fish, unit: 'টি', detail: sectionCounts.fish.detail },
      { label: 'হারানো ও প্রাপ্তি', value: counts.lostfound, unit: 'টি', detail: sectionCounts.lostfound.detail },
      {
        label: 'চাকরি ও টিউশনি',
        value: jobPostings.length,
        unit: 'টি',
        detail: sectionCounts.tuition.detail,
        view: 'jobs',
      },
      {
        label: 'জরুরি সেবা ও মিস্ত্রি',
        value: counts.emergency,
        unit: 'টি',
        detail: sectionCounts.emergency.detail,
      },
      { label: 'হাসপাতাল', value: counts.hospitals, unit: 'টি', detail: '' },
      { label: 'নাগরিক সেবা', value: counts.citizens, unit: 'টি', detail: sectionCounts.citizens.detail },
      { label: 'যাতায়াত রুট', value: transportRoutes.length, unit: 'টি', detail: '' },
    ],
    [counts, sectionCounts, jobPostings.length, newsItems.length, transportRoutes.length],
  )

  /** All /profile wording, editable from the admin panel. */
  const profileText = useMemo(() => profileContentService.getText(), [profileVersion])

  /**
   * Real activity stored by this browser only. A donor counts as "mine" when
   * its id is not one of the bundled demo ids — i.e. it was added locally.
   * Nothing is invented; sections with no stored data stay empty.
   */
  const myProfileActivity = useMemo<ProfileActivity>(() => {
    const seedIds = new Set(initialBloodDonors.map((donor) => donor.id))
    const donors = bloodDonorService
      .getAll()
      .filter((donor) => !seedIds.has(donor.id))
      .map((donor) => ({
        id: donor.id,
        label: donor.name,
        detail: `${donor.bloodGroup} • ${donor.unionArea}`,
        status: (donor.approved === false ? 'pending' : 'approved') as 'pending' | 'approved',
      }))
    const bookings = machineryBookingService.getAll().map((b) => ({
      id: b.id,
      label: `${b.machineName} — বুকিং`,
      detail: `তারিখ ${b.date} • মোবাইল ${b.contact}`,
      status: b.status,
    }))
    const prices = priceModerationService.getAll().map((s) => ({
      id: s.id,
      label: `${s.productName} — দামের সাজেশন`,
      detail: `${formatPrice(s.suggestedPrice)} • ${s.location}`,
      status: s.status,
    }))
    return { donors, bookings, prices, saved: [] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingsVersion])

  /** Every published dataset, assembled once and shared by all search views. */
  const searchData = useMemo(
    () => ({
      donors,
      doctors: emergencyServices.doctors,
      hospitals,
      ambulances: emergencyServices.ambulance,
      dealers: emergencyServices.agro,
      transport: emergencyServices.rentacar,
      routes: transportRoutes,
      prices: marketPrices,
      fishPrices,
      wholesalers: fishWholesalers,
      jobs: jobPostings,
      institutions: educationInstitutions,
      news: newsItems,
      notices,
      lostFound: lostFoundItems,
      citizens: citizenServices,
    }),
    [
      donors,
      emergencyServices,
      hospitals,
      transportRoutes,
      marketPrices,
      fishPrices,
      fishWholesalers,
      jobPostings,
      educationInstitutions,
      newsItems,
      notices,
      lostFoundItems,
      citizenServices,
    ],
  )

  /** Admin-controlled section switches and custom items. */
  const searchConfig = useMemo(
    () => searchSettingsService.getSettings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchVersion],
  )

  /** Full results for the current query. */
  const searchGroups = useMemo(
    () => searchEverything(searchInput, searchData, searchConfig),
    [searchInput, searchData, searchConfig],
  )

  /** Debounced suggestions while typing (capped at eight in the search box). */
  const debouncedQuery = useDebouncedValue(searchInput, 160)
  const suggestionGroups = useMemo(
    () =>
      debouncedQuery.trim()
        ? searchEverything(debouncedQuery, searchData, searchConfig)
        : [],
    [debouncedQuery, searchData, searchConfig],
  )

  const searchTotal = useMemo(() => countHits(searchGroups), [searchGroups])
  const searchIntents = useMemo(() => detectIntents(searchInput), [searchInput])

  const closeAddPriceModal = useCallback(() => {
    setShowAddPriceModal(false)
  }, [])

  /**
   * The single navigation entry point. Unknown ids are rejected, so a stale
   * link can never render a blank screen.
   */
  const goTo = useCallback(
    (view: string, options: { q?: string; group?: string | null; tab?: string | null; noticeId?: string | null } = {}) => {
      const targetView: ViewId = isViewId(view) ? view : 'home'
      navigate(targetView, {
        q: options.q ?? '',
        group: options.group ?? null,
        tab: options.tab ?? null,
        noticeId: options.noticeId ?? null,
      })
      scrollToTop()
    },
    [navigate],
  )

  const handleNavigate = useCallback(
    (view: ViewId, tab?: string) => goTo(view, tab ? { tab } : {}),
    [goTo],
  )

  /** A tile opens its section on the exact sub-tab it stands for. */
  const handleSelectCategory = useCallback(
    (view: ViewId, categoryId: string) => {
      goTo(view, { tab: CATEGORY_TABS[categoryId] ?? null })
    },
    [goTo],
  )

  /** Keeps the current search when the visitor switches a section sub-tab. */
  const handleTabChange = useCallback(
    (tab: string) => {
      goTo(activeView, { q: route.query, group: route.group, tab })
    },
    [goTo, activeView, route.query, route.group],
  )

  const clearSearch = useCallback(() => {
    setSearchInput('')
    goTo(activeView, { tab: route.tab })
  }, [goTo, activeView, route.tab])

  const submitSearch = useCallback(
    (value: string) => {
      const term = value.trim()
      if (!term) return
      const best = bestSectionForQuery(term, searchGroups)
      // A query that matches nothing stays on the homepage, where the
      // grouped results area shows the Bengali empty state.
      if (best.view === 'home') return
      goTo(best.view, {
        q: best.q ?? term,
        group: best.group ?? null,
        tab: best.tab ?? null,
      })
    },
    [goTo, searchGroups],
  )

  const openSearchHit = useCallback(
    (hit: SearchHit) => {
      goTo(hit.view, { q: hit.query, group: hit.group ?? null, tab: hit.tab ?? null })
    },
    [goTo],
  )

  const openNotice = useCallback(
    (notice: Notice) => {
      goTo('news', { noticeId: notice.id })
    },
    [goTo],
  )

  const openNews = useCallback(
    (item: NewsItem) => {
      goTo('news', { noticeId: item.id })
    },
    [goTo],
  )

  const backToNewsList = useCallback(() => goTo('news'), [goTo])

  const backHome = useCallback(() => goTo('home'), [goTo])

  // Scroll to the top whenever the section itself changes (covers back/forward).
  useEffect(() => {
    scrollToTop()
    analyticsService.record(activeView)
  }, [activeView])

  const activeNav: NavTabId | null = NAV_TAB_BY_VIEW[activeView] ?? null

  // Sub-tabs are derived from the URL, so a link like
  // `/directory?tab=education` opens the right list directly.
  const emergencyTab: EmergencyBloodTab =
    route.group || route.tab === 'blood' ? 'blood' : 'emergency'
  const directoryTab: DirectoryTab =
    route.tab === 'education' ||
    route.tab === 'transport' ||
    route.tab === 'lostfound' ||
    route.tab === 'hospitals'
      ? (route.tab as DirectoryTab)
      : 'doctors'
  const jobsTab: JobsTab = canonicalJobsTab(route.tab)
  const marketTab: AgroTab =
    route.tab === 'dealers' || route.tab === 'machinery' ? (route.tab as AgroTab) : 'prices'

  return (
    <div id="home" className="min-h-screen bg-[#f7f9f8] text-slate-800 transition-colors dark:bg-[#101816] dark:text-slate-100">
      <ErrorBoundary onBack={backHome} backLabel="হোমে ফিরে যান">
        <Header
          activeNav={activeNav}
          onNavigate={handleNavigate}
          onOpenRegisterModal={() => setShowRegisterModal(true)}
        />
      </ErrorBoundary>

      <main
        className={`mx-auto max-w-7xl px-4 pb-28 sm:px-6 sm:pt-8 lg:px-8 lg:pb-12 xl:px-10 ${
          activeView === 'home' ? 'pt-4' : 'pt-6'
        }`}
      >
        <ErrorBoundary onBack={backHome} backLabel="হোমে ফিরে যান">
          {selectedNotice ? (
            <div className="mt-6 sm:mt-9">
              <NoticeDetailView notice={selectedNotice} onBack={backToNewsList} />
            </div>
          ) : (
            <>
              {activeView === 'home' && (
                <div className="mt-4 flex flex-col gap-4 sm:gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
                  <div className="lg:col-span-2">
                    <Hero />
                  </div>
                  <div className="lg:col-span-2">
                    <EmergencyStrip
                      ambulancePhone={emergencyServices.ambulance[0]?.phone}
                      onNavigate={(view, tab) => goTo(view, { tab: tab ?? null })}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <SearchBar
                      value={searchInput}
                      onChange={setSearchInput}
                      onSubmit={submitSearch}
                      resultCount={searchInput.trim() ? searchTotal : undefined}
                      groups={suggestionGroups}
                      onSelectHit={openSearchHit}
                    />
                    {searchInput.trim() && (
                      <SearchResults
                        query={searchInput.trim()}
                        groups={searchGroups}
                        total={searchTotal}
                        intents={searchIntents}
                        onSelectHit={openSearchHit}
                        onSelectIntent={(intent) =>
                          goTo(intent.view, { q: searchInput.trim(), tab: intent.tab ?? null })
                        }
                        onClear={() => setSearchInput('')}
                        onSuggestQuery={setSearchInput}
                      />
                    )}
                  </div>

                  {/* Mobile: one column ordered by the `order-*` classes.
                      Desktop: two independent columns (main + sidebar). */}
                  <div className="contents lg:col-start-1 lg:row-start-4 lg:flex lg:flex-col lg:gap-6">
                    <div className="order-2 lg:order-none">
                      <CategoriesGrid
                        categories={filteredCategories}
                        counts={counts}
                        countDetails={countDetails}
                        countUnits={countUnits}
                        onSelectCategory={handleSelectCategory}
                      />
                    </div>
                    <div className="order-5 lg:order-none">
                      <CulturalBanner />
                    </div>
                    <div className="order-6 lg:order-none">
                      <PhotoGallery />
                    </div>
                  </div>
                  <div className="contents lg:col-start-2 lg:row-start-4 lg:flex lg:flex-col lg:gap-6">
                    <div className="order-1 lg:order-none">
                      <TodayInfo price={marketPrices[0]} onOpenMarket={() => goTo('market', { tab: 'prices' })} />
                    </div>
                    <div id="notices" className="order-3 scroll-mt-24 lg:order-none">
                      <NoticesSection notices={notices} onSelectNotice={openNotice} />
                    </div>
                    <div className="order-4 lg:order-none">
                      <CommunityBanner onRegisterDonor={() => setShowRegisterModal(true)} />
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'market' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="market" />
                  <AgroMarket
                    dealers={emergencyServices.agro}
                    prices={marketPrices}
                    query={route.query}
                    onClearQuery={clearSearch}
                    initialTab={marketTab}
                    onAddPrice={() => setShowAddPriceModal(true)}
                  />
                </div>
              )}

              {activeView === 'emergency' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="emergency" />
                  <EmergencyBlood
                    donors={donors}
                    ambulances={emergencyServices.ambulance}
                    doctors={emergencyServices.doctors}
                    technicians={emergencyServices.technicians}
                    onRegisterDonor={() => setShowRegisterModal(true)}
                    activeTab={emergencyTab}
                    onTabChange={handleTabChange}
                    query={route.query}
                    bloodGroup={route.group}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {activeView === 'jobs' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="jobs" />
                  <JobsTuitions
                    institutions={educationInstitutions}
                    query={route.query}
                    onClearQuery={clearSearch}
                    initialTab={jobsTab}
                  />
                </div>
              )}

              {activeView === 'directory' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="directory" />
                  <LocalDirectory
                    doctors={emergencyServices.doctors}
                    hospitals={hospitals}
                    institutions={educationInstitutions}
                    transport={emergencyServices.rentacar}
                    activeTab={directoryTab}
                    onTabChange={handleTabChange}
                    query={route.query}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {activeView === 'services' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="services" />
                  <AllServicesView
                    counts={counts}
                    countDetails={countDetails}
                    countUnits={countUnits}
                    onSelectView={handleNavigate}
                  />
                </div>
              )}

              {activeView === 'profile' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="profile" />
                  <ProfileView
                    stats={profileStats}
                    activity={myProfileActivity}
                    text={profileText}
                    onRegisterDonor={() => setShowRegisterModal(true)}
                    onSuggestPrice={() => setShowAddPriceModal(true)}
                    onNavigate={handleNavigate}
                  />
                </div>
              )}

              {activeView === 'transport' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="transport" />
                  <TransportView
                    routes={transportRoutes}
                    providers={emergencyServices.rentacar}
                    onBack={backHome}
                    query={route.query}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {activeView === 'lostfound' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="lostfound" />
                  <LostFoundView
                    items={lostFoundItems}
                    onBack={backHome}
                    query={route.query}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {activeView === 'news' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="news" />
                  <NewsView
                    news={newsItems}
                    journalists={journalists}
                    onSelectNews={openNews}
                    onBack={backHome}
                    query={route.query}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {activeView === 'citizens' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="citizens" />
                  <CitizenServicesView
                    services={citizenServices}
                    query={route.query}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {activeView === 'fish' && (
                <div className="mt-6 sm:mt-9">
                  <SectionHeading view="fish" />
                  <FishMarketView
                    prices={fishPrices}
                    wholesalers={fishWholesalers}
                    onBack={backHome}
                    query={route.query}
                    onClearQuery={clearSearch}
                  />
                </div>
              )}

              {/* Safety net: an unknown view id can never blank the page. */}
              {!isKnownView(activeView) && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#182420] sm:mt-9">
                  <EmptyState
                    title="এই অংশটি এখনো প্রস্তুত হয়নি"
                    description="আপনি যে অংশটি খুঁজছেন সেটি সাময়িকভাবে সরিয়ে রাখা হয়েছে। হোমে ফিরে গিয়ে অন্য সেবা ব্যবহার করুন।"
                    actionLabel="হোমে ফিরে যান"
                    onAction={backHome}
                  />
                </div>
              )}
            </>
          )}
        </ErrorBoundary>
        <Footer onNavigate={handleNavigate} />
      </main>

      <BottomNav activeNav={activeNav} onNavigate={handleNavigate} />

      <RegisterDonorModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSubmit={addDonor}
      />

      <AddPriceModal isOpen={showAddPriceModal} onClose={closeAddPriceModal} />

      <AdminDashboard />
      <ToastContainer />
    </div>
  )
}

/** Runtime guard so an unknown view id can never render an empty screen. */
function isKnownView(view: string): boolean {
  return (VIEW_IDS as string[]).includes(view)
}

/** Shared section header — eyebrow + title, identical styling on every view. */
function SectionHeading({ view }: { view: ViewId }) {
  const meta = VIEW_META[view]
  return (
    <div className="mb-6">
      <div className="section-eyebrow">{meta.eyebrow}</div>
      <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
        {meta.title}
      </h2>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminProvider>
          <ReportProvider>
            <AppContent />
          </ReportProvider>
        </AdminProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
