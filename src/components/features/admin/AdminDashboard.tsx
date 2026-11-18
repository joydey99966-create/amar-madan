import { useEffect, useState } from 'react'
import {
  Users,
  TrendingUp,
  Bell,
  Stethoscope,
  Save,
  X,
  AlertCircle,
  ClipboardCheck,
  Briefcase,
  Flag,
  Image as ImageIcon,
  Search as SearchIcon,
  Siren,
  Database,
  CloudSun,
  CalendarDays,
  UserRound,
  ListChecks,
  Database as DataIcon,
  ListOrdered,
} from 'lucide-react'
import {
  BloodDonor,
  MarketPrice,
  LostFoundItem,
  Doctor,
  Ambulance,
  ServiceProvider,
  JobPosting,
  InfoReport,
  GalleryPhoto,
  EmergencyContact,
} from '../../../types'
import {
  bloodDonorService,
  marketService,
  lostFoundService,
  directoryService,
  storageService,
  jobPostingService,
  reportService,
  noticeService,
  galleryService,
  searchSettingsService,
  emergencyContactService,
  weatherService,
  SearchSettings,
  WeatherSettings,
} from '../../../services'
import { STORAGE_KEYS } from '../../../constants'
import { useToast } from '../../../context/ToastContext'
import { useAdmin } from '../../../context/AdminContext'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { usePriceModerationQueue } from '../../../hooks/usePriceModerationQueue'
import { notifyDataChanged, useDataVersion } from '../../../hooks/useDataVersion'
import { priceModerationService } from '../../../services/priceModerationService'
import { AdminLogin } from './AdminLogin'
import { DonorAdminPanel } from './DonorAdminPanel'
import { MarketAdminPanel } from './MarketAdminPanel'
import { NoticeAdminPanel, AdminNotice } from './NoticeAdminPanel'
import { LostFoundAdminPanel } from './LostFoundAdminPanel'
import { DirectoryAdminPanel } from './DirectoryAdminPanel'
import { PriceModerationAdminPanel } from './PriceModerationAdminPanel'
import { JobPostingAdminPanel } from './JobPostingAdminPanel'
import { ReportAdminPanel } from './ReportAdminPanel'
import { GalleryAdminPanel } from './GalleryAdminPanel'
import { RecordsAdminPanel } from './RecordsAdminPanel'
import { WeatherAdminPanel } from './WeatherAdminPanel'
import { SearchAdminPanel } from './SearchAdminPanel'
import { EmergencyContactsAdminPanel } from './EmergencyContactsAdminPanel'
import { MachineryBookingAdminPanel } from './MachineryBookingAdminPanel'
import { machineryBookingService } from '../../../services/machineryBookingService'
import { ProfileTextAdminPanel } from './ProfileTextAdminPanel'
import { LaunchChecklistAdminPanel } from './LaunchChecklistAdminPanel'
import { launchChecklistService } from '../../../services/launchChecklistService'
import { DataOpsAdminPanel } from './DataOpsAdminPanel'
import { OrderAdminPanel } from './OrderAdminPanel'

export type AdminTab =
  | 'donors'
  | 'market'
  | 'notices'
  | 'lostfound'
  | 'directory'
  | 'moderation'
  | 'jobs'
  | 'reports'
  | 'gallery'
  | 'search'
  | 'emergency'
  | 'records'
  | 'weather'
  | 'bookings'
  | 'profile'
  | 'launch'
  | 'dataops'
  | 'order'

export function AdminDashboard() {
  const { isDashboardOpen, closeDashboard, isAuthenticated } = useAdmin()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState<AdminTab>('donors')
  const [isSaving, setIsSaving] = useState(false)

  const [donors, setDonors] = useState<BloodDonor[]>(() => bloodDonorService.getAll())
  const [marketPrices, setMarketPrices] = useLocalStorage<MarketPrice[]>(STORAGE_KEYS.MARKET_PRICES, () => marketService.getMarketPrices())
  const [marketLastUpdated, setMarketLastUpdated] = useState<string>(() => new Date().toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' }))
  const [notices, setNotices] = useState<AdminNotice[]>(() => noticeService.getAdminNotices())
  const [lostFound, setLostFound] = useLocalStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, () => lostFoundService.getAll())
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, () => directoryService.getDoctors())
  const [ambulances, setAmbulances] = useLocalStorage<Ambulance[]>(STORAGE_KEYS.AMBULANCES, () => directoryService.getAmbulances())
  const [dealers, setDealers] = useLocalStorage<ServiceProvider[]>(STORAGE_KEYS.AGRO_DEALERS, () => directoryService.getEmergencyServices().agro)
  const [jobPostings, setJobPostings] = useLocalStorage<JobPosting[]>(STORAGE_KEYS.JOB_POSTINGS, () => jobPostingService.getAll())
  const [reports, setReports] = useLocalStorage<InfoReport[]>(STORAGE_KEYS.REPORTS, () => reportService.getAll())
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => galleryService.getPhotos())
  const [searchSettings, setSearchSettings] = useState<SearchSettings>(() => searchSettingsService.getSettings())
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => emergencyContactService.getAll())
  /** Bumped when the managed records (hospitals, schools, routes …) change. */
  const [recordsVersion, setRecordsVersion] = useState(0)
  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(() =>
    weatherService.getSettings(),
  )
  const [bookings, setBookings] = useState(() => machineryBookingService.getAll())
  const launchVersion = useDataVersion('launch')
  // Re-render the tab badge when Joy saves the launch checklist.
  void launchVersion
  
  const {
    filteredSubmissions: pendingPriceSubmissions,
    counts: priceModerationCounts,
    approveSubmission: approvePriceQueue,
    rejectSubmission: rejectPriceQueue,
    refresh: refreshPriceQueue,
  } = usePriceModerationQueue('pending')

  // The dashboard stays mounted while closed, so re-read storage every time it
  // opens — otherwise visitor-submitted posts made meanwhile would be missing.
  useEffect(() => {
    if (!isDashboardOpen) return
    setDonors(bloodDonorService.getAll())
    setMarketPrices(marketService.getAllPrices())
    setLostFound(lostFoundService.getAll())
    setJobPostings(jobPostingService.getAll())
    setReports(reportService.getAll())
    setNotices(noticeService.getAdminNotices())
    setPhotos(galleryService.getPhotos())
    setSearchSettings(searchSettingsService.getSettings())
    setContacts(emergencyContactService.getAll())
    setDoctors(directoryService.getDoctors())
    setAmbulances(directoryService.getAmbulances())
    setDealers(directoryService.getEmergencyServices().agro)
    setBookings(machineryBookingService.getAll())
    refreshPriceQueue()
  }, [isDashboardOpen])

  if (!isDashboardOpen) return null

  /** Destructive admin actions always ask before changing anything. */
  const confirmDestructive = (message: string): boolean =>
    typeof window === 'undefined' || window.confirm(`${message}\n\nএই কাজটি ফিরিয়ে আনা যাবে না।`)

  const handleSave = async () => {
    setIsSaving(true)
    // The state is already persisted by useLocalStorage, just simulate a slight delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    addToast('সব পরিবর্তন সফলভাবে সেভ করা হয়েছে!', 'success')
    setIsSaving(false)
  }

  // Handlers for Donor tab
  const handleDeleteDonor = (id: string) => {
    if (!confirmDestructive('এই রক্তদাতাকে মুছে ফেলুন?')) return
    setDonors(bloodDonorService.delete(id))
    addToast('রক্তদাতা মুছে ফেলা হয়েছে', 'info')
  }

  const handleAddDonor = (donor: Omit<BloodDonor, 'id'>) => {
    const created = bloodDonorService.add(donor)
    setDonors(bloodDonorService.getAll())
    addToast(created.approved ? 'নতুন রক্তদাতা যোগ করা হয়েছে' : 'নতুন রক্তদাতা অনুমোদনের অপেক্ষায়', 'success')
  }

  const handleEditDonor = (id: string, donor: Partial<Omit<BloodDonor, 'id'>>) => {
    setDonors(bloodDonorService.update(id, donor))
    addToast('রক্তদাতার তথ্য আপডেট করা হয়েছে', 'success')
  }

  const handleApproveDonor = (id: string, approved: boolean) => {
    setDonors(bloodDonorService.approve(id, approved))
    addToast(approved ? 'রক্তদাতা অনুমোদিত হয়েছে' : 'অনুমোদন বাতিল হয়েছে', 'info')
  }

  const handleDonorVisibility = (id: string, visible: boolean) => {
    setDonors(bloodDonorService.setVisible(id, visible))
    addToast(visible ? 'রক্তদাতা দেখানো হচ্ছে' : 'রক্তদাতা লুকানো হয়েছে', 'info')
  }

  // Handlers for Market tab — every write goes through the service so the
  // live public list, price history and the admin list stay in sync.
  const handleUpdatePrice = (id: string, patch: Partial<MarketPrice>) => {
    setMarketPrices(marketService.updatePrice(id, { ...patch, date: patch.date ?? new Date().toISOString().slice(0, 10) }))
  }

  const handleAddMarketPrice = (price: Omit<MarketPrice, 'id'>) => {
    setMarketPrices(marketService.addPrice(price))
    addToast('নতুন পণ্যের দাম যোগ করা হয়েছে', 'success')
  }

  const handleRemoveMarketPrice = (id: string) => {
    if (!confirmDestructive('এই পণ্যের দাম মুছে ফেলুন?')) return
    setMarketPrices(marketService.removePrice(id))
    addToast('পণ্যের দাম মুছে ফেলা হয়েছে', 'info')
  }

  const handleApproveMarketPrice = (id: string, approved: boolean) => {
    setMarketPrices(marketService.approvePrice(id, approved))
    addToast(approved ? 'দাম অনুমোদিত হয়েছে' : 'অনুমোদন বাতিল হয়েছে', 'info')
  }

  const handleMarketPriceVisibility = (id: string, visible: boolean) => {
    setMarketPrices(marketService.setPriceVisible(id, visible))
    addToast(visible ? 'দাম দেখানো হচ্ছে' : 'দাম লুকানো হয়েছে', 'info')
  }

  const handleRefreshMarket = () => {
    setMarketPrices(marketService.getAllPrices())
    setMarketLastUpdated(new Date().toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' }))
    addToast('বাজারদর রিফ্রেশ করা হয়েছে', 'info')
  }

  // Handlers for Notice tab
  const handleDeleteNotice = (id: string) => {
    if (!confirmDestructive('এই নোটিশটি মুছে ফেলুন?')) return
    setNotices(noticeService.deleteNotice(id))
    addToast('নোটিশ মুছে ফেলা হয়েছে', 'info')
  }

  const handleAddNotice = (notice: Omit<AdminNotice, 'id'>) => {
    setNotices(noticeService.addNotice(notice))
    addToast('নতুন নোটিশ যুক্ত হয়েছে', 'success')
  }

  const handleAddLostFound = (item: Omit<LostFoundItem, 'id' | 'postedAt'>) => {
    const created = lostFoundService.add(item)
    setLostFound((prev) => [created, ...prev])
    addToast('নতুন আইটেম যোগ করা হয়েছে', 'success')
  }

  const handleEditNotice = (id: string, notice: Omit<AdminNotice, 'id'>) => {
    setNotices(noticeService.updateNotice(id, notice))
    addToast('নোটিশ আপডেট করা হয়েছে', 'success')
  }

  const handleApproveNotice = (id: string, approved: boolean) => {
    setNotices(noticeService.approveNotice(id, approved))
    addToast(approved ? 'নোটিশ অনুমোদিত হয়েছে' : 'অনুমোদন বাতিল হয়েছে', 'info')
  }

  const handleNoticeVisibility = (id: string, visible: boolean) => {
    setNotices(noticeService.setNoticeVisibility(id, visible))
    addToast(visible ? 'নোটিশ দেখানো হচ্ছে' : 'নোটিশ লুকানো হয়েছে', 'info')
  }

  // Handlers for Lost & Found tab
  const handleDeleteLostFound = (id: string) => {
    if (!confirmDestructive('এই হারানো-প্রাপ্তি আইটেমটি মুছে ফেলুন?')) return
    setLostFound((prev) => prev.filter((item) => item.id !== id))
    lostFoundService.delete(id)
    addToast('আইটেম মুছে ফেলা হয়েছে', 'info')
  }

  const handleApproveLostFound = (id: string) => {
    setLostFound((prev) => prev.map((item) => (item.id === id ? { ...item, isApproved: true } : item)))
    lostFoundService.approve(id)
    notifyDataChanged('lostfound')
    addToast('আইটেম অনুমোদিত হয়েছে', 'success')
  }

  // Handlers for the job posting moderation tab
  const handleApproveJobPosting = (id: string) => {
    setJobPostings(jobPostingService.approve(id))
    notifyDataChanged('jobs')
    addToast('চাকরির পোস্ট অনুমোদিত ও প্রকাশিত হয়েছে', 'success')
  }

  const handleRejectJobPosting = (id: string) => {
    setJobPostings(jobPostingService.reject(id))
    notifyDataChanged('jobs')
    addToast('পোস্ট বাতিল করা হয়েছে', 'info')
  }

  const handleDeleteJobPosting = (id: string) => {
    if (!confirmDestructive('এই পোস্টটি মুছে ফেলুন?')) return
    setJobPostings(jobPostingService.remove(id))
    notifyDataChanged('jobs')
    addToast('পোস্ট মুছে ফেলা হয়েছে', 'info')
  }

  const handleEditJobType = (id: string, type: JobPosting['type']) => {
    setJobPostings(jobPostingService.update(id, { type }))
    notifyDataChanged('jobs')
    addToast('পোস্টের ধরন আপডেট করা হয়েছে', 'success')
  }

  // Handlers for the emergency contacts tab
  const handleAddContact = (contact: Omit<EmergencyContact, 'id'>) => {
    setContacts(emergencyContactService.add(contact))
    addToast('নতুন জরুরি নম্বর যোগ করা হয়েছে', 'success')
  }

  const handleEditContact = (id: string, contact: Partial<Omit<EmergencyContact, 'id'>>) => {
    setContacts(emergencyContactService.update(id, contact))
    addToast('জরুরি নম্বর আপডেট করা হয়েছে', 'success')
  }

  const handleDeleteContact = (id: string) => {
    if (!confirmDestructive('এই জরুরি নম্বরটি মুছে ফেলুন?')) return
    setContacts(emergencyContactService.remove(id))
    addToast('জরুরি নম্বর মুছে ফেলা হয়েছে', 'info')
  }

  const handleApproveContact = (id: string, approved: boolean) => {
    setContacts(emergencyContactService.approve(id, approved))
    addToast(approved ? 'জরুরি নম্বর অনুমোদিত হয়েছে' : 'অনুমোদন বাতিল হয়েছে', 'info')
  }

  const handleContactVisibility = (id: string, visible: boolean) => {
    setContacts(emergencyContactService.setVisible(id, visible))
    addToast(visible ? 'জরুরি নম্বর দেখানো হচ্ছে' : 'জরুরি নম্বর লুকানো হয়েছে', 'info')
  }

  // Handlers for the community gallery tab
  const handleAddPhoto = (photo: Omit<GalleryPhoto, 'id'>) => {
    setPhotos(galleryService.addPhoto(photo))
    addToast('নতুন ছবি প্রকাশ করা হয়েছে', 'success')
  }

  const handleEditPhoto = (id: string, photo: Omit<GalleryPhoto, 'id'>) => {
    setPhotos(galleryService.updatePhoto(id, photo))
    addToast('ছবির তথ্য আপডেট করা হয়েছে', 'success')
  }

  const handleDeletePhoto = (id: string) => {
    if (!confirmDestructive('এই ছবিটি মুছে ফেলুন?')) return
    setPhotos(galleryService.deletePhoto(id))
    addToast('ছবি মুছে ফেলা হয়েছে', 'info')
  }

  // Handlers for the wrong-information report tab
  const handleResolveReport = (id: string) => {
    setReports(reportService.resolve(id))
    addToast('রিপোর্ট সমাধান হিসেবে চিহ্নিত হয়েছে', 'success')
  }

  const handleDeleteReport = (id: string) => {
    if (!confirmDestructive('এই রিপোর্টটি মুছে ফেলুন?')) return
    setReports(reportService.remove(id))
    addToast('রিপোর্ট মুছে ফেলা হয়েছে', 'info')
  }

  // Handlers for Directory tab
  const handleAddDoctor = (doctor: Omit<Doctor, 'id'>) => {
    setDoctors(directoryService.addDoctor(doctor))
    notifyDataChanged('directory')
    addToast('ডাক্তার এন্ট্রি যোগ করা হয়েছে', 'success')
  }
  const handleAddAmbulance = (ambulance: Omit<Ambulance, 'id'>) => {
    setAmbulances(directoryService.addAmbulance(ambulance))
    notifyDataChanged('directory')
    addToast('অ্যাম্বুলেন্স এন্ট্রি যোগ করা হয়েছে', 'success')
  }
  const handleAddDealer = (dealer: Omit<ServiceProvider, 'id'>) => {
    setDealers(directoryService.addAgroDealer(dealer))
    notifyDataChanged('directory')
    addToast('ডিলার এন্ট্রি যোগ করা হয়েছে', 'success')
  }

  const handleDeleteDoctor = (id: string) => {
    if (!confirmDestructive('এই ডাক্তারের এন্ট্রি মুছে ফেলুন?')) return
    setDoctors(directoryService.deleteDoctor(id))
    notifyDataChanged('directory')
    addToast('ডাক্তার এন্ট্রি মুছে ফেলা হয়েছে', 'info')
  }

  const handleEditDoctor = (id: string, patch: Partial<Doctor>) => {
    setDoctors(directoryService.updateDoctor(id, patch))
    addToast('ডাক্তারের তথ্য আপডেট করা হয়েছে', 'success')
  }

  const handleApproveDoctor = (id: string, approved: boolean) => {
    setDoctors(directoryService.approveDoctor(id, approved))
    addToast(approved ? 'ডাক্তার অনুমোদিত হয়েছে' : 'অনুমোদন বাতিল হয়েছে', 'info')
  }

  const handleDoctorVisibility = (id: string, visible: boolean) => {
    setDoctors(directoryService.setDoctorVisible(id, visible))
    addToast(visible ? 'ডাক্তার দেখানো হচ্ছে' : 'ডাক্তার লুকানো হয়েছে', 'info')
  }

  const handleDeleteAmbulance = (id: string) => {
    if (!confirmDestructive('এই অ্যাম্বুলেন্স এন্ট্রি মুছে ফেলুন?')) return
    setAmbulances(directoryService.deleteAmbulance(id))
    notifyDataChanged('directory')
    addToast('অ্যাম্বুলেন্স এন্ট্রি মুছে ফেলা হয়েছে', 'info')
  }

  const handleDeleteDealer = (id: string) => {
    if (!confirmDestructive('এই ডিলার এন্ট্রি মুছে ফেলুন?')) return
    setDealers(directoryService.deleteAgroDealer(id))
    notifyDataChanged('directory')
    addToast('ডিলার এন্ট্রি মুছে ফেলা হয়েছে', 'info')
  }

  const normalizeProductName = (value: string): string =>
    value
      .toLowerCase()
      .replace(/\\(.*?\\)/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim()

  const handleApprovePriceSubmission = (id: string) => {
    const submission =
      pendingPriceSubmissions.find((item) => item.id === id) ??
      priceModerationService.getById(id)

    if (!submission) {
      addToast('সাবমিশন পাওয়া যায়নি', 'error')
      return
    }

    try {
      const target = normalizeProductName(submission.productName)
      const matchedIds = marketPrices
        .filter((price) => {
          const current = normalizeProductName(price.itemName)
          return (
            current === target ||
            (target.length >= 2 && (current.includes(target) || target.includes(current)))
          )
        })
        .map((price) => price.id)

      // Each write goes through the service and persists immediately.
      let next = marketPrices
      for (const matchedId of matchedIds) {
        next = marketService.updatePrice(matchedId, {
          retailPrice: String(submission.suggestedPrice),
          date: new Date().toISOString().slice(0, 10),
        })
      }
      setMarketPrices(next)
      approvePriceQueue(id)

      if (matchedIds.length > 0) {
        addToast('দাম আপডেট ও অনুমোদন সম্পন্ন হয়েছে', 'success')
      } else {
        addToast(
          'পণ্য লাইভ তালিকায় পাওয়া যায়নি — শুধু অনুমোদন করা হয়েছে',
          'info',
        )
      }
    } catch (error) {
      console.error('Price moderation approve failed:', error)
      addToast('অনুমোদন করতে সমস্যা হয়েছে', 'error')
    }
  }

  const handleRejectPriceSubmission = (id: string) => {
    if (!confirmDestructive('এই দামের সাজেশনটি বাতিল করুন?')) return
    try {
      rejectPriceQueue(id)
      addToast('সাজেশন বাতিল করা হয়েছে', 'info')
    } catch (error) {
      console.error('Price moderation reject failed:', error)
      addToast('বাতিল করতে সমস্যা হয়েছে', 'error')
    }
  }

  // Handlers for machinery bookings
  const handleApproveBooking = (id: string) => {
    setBookings(machineryBookingService.approve(id))
    addToast('বুকিং অনুমোদিত হয়েছে', 'success')
  }

  const handleRejectBooking = (id: string) => {
    setBookings(machineryBookingService.reject(id))
    addToast('বুকিং বাতিল করা হয়েছে', 'info')
  }

  const handleDeleteBooking = (id: string) => {
    if (!confirmDestructive('এই বুকিংয়ের অনুরোধ মুছে ফেলুন?')) return
    setBookings(machineryBookingService.remove(id))
    addToast('বুকিং মুছে ফেলা হয়েছে', 'info')
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Users; count: number }[] = [
    { id: 'donors', label: 'রক্তদাতা', icon: Users, count: donors.length },
    { id: 'market', label: 'বাজারদর', icon: TrendingUp, count: marketPrices.length },
    { id: 'notices', label: 'নোটিশ', icon: Bell, count: notices.length },
    { id: 'lostfound', label: 'হারানো-প্রাপ্তি', icon: AlertCircle, count: lostFound.length },
    { id: 'directory', label: 'ডিরেক্টরি', icon: Stethoscope, count: doctors.length + ambulances.length + dealers.length },
    { id: 'moderation', label: 'দাম যাচাই', icon: ClipboardCheck, count: priceModerationCounts.pending },
    {
      id: 'jobs',
      label: 'চাকরি পোস্ট',
      icon: Briefcase,
      count: jobPostings.filter((posting) => posting.isApproved === false && !posting.isRejected).length,
    },
    {
      id: 'reports',
      label: 'তথ্য রিপোর্ট',
      icon: Flag,
      count: reports.filter((report) => !report.isResolved).length,
    },
    { id: 'gallery', label: 'ছবি', icon: ImageIcon, count: photos.length },
    {
      id: 'search',
      label: 'সার্চ',
      icon: SearchIcon,
      count: searchSettings.customItems.filter((item) => !item.approved).length,
    },
    {
      id: 'emergency',
      label: 'জরুরি নম্বর',
      icon: Siren,
      count: contacts.filter((contact) => !contact.approved).length,
    },
    { id: 'records', label: 'সেবার তথ্য', icon: Database, count: 0 },
    {
      id: 'weather',
      label: 'আবহাওয়া',
      icon: CloudSun,
      count: weatherSettings.enabled ? 1 : 0,
    },
    {
      id: 'bookings',
      label: 'যন্ত্রপাতি বুকিং',
      icon: CalendarDays,
      count: bookings.filter((b) => b.status === 'pending').length,
    },
    { id: 'profile', label: 'প্রোফাইল লেখা', icon: UserRound, count: 0 },
    {
      id: 'launch',
      label: 'লঞ্চ চেকলিস্ট',
      icon: ListChecks,
      count: launchChecklistService.get().items.filter((item) => !item.checked).length,
    },
    { id: 'dataops', label: 'ডেটা ও ব্যাকআপ', icon: DataIcon, count: 0 },
    { id: 'order', label: 'সেবার অর্ডার', icon: ListOrdered, count: 0 },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1411]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#1a2420]">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">অ্যাডমিন ড্যাশবোর্ড</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              মদন ২০২৬
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38] disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? 'সেভ হচ্ছে...' : 'সব সেভ করুন'}
              </button>
            )}
            <button
              onClick={closeDashboard}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              aria-label="বন্ধ করুন"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Auth Guard */}
        {!isAuthenticated ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-forest dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              অ্যাডমিন যাচাইকরণ প্রয়োজন
            </h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে আপনার অ্যাডমিন পিন প্রদান করুন।
            </p>
            <AdminLogin />
          </div>
        ) : (
          <>
            {/* Tabs Bar */}
            <div className="border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#1a2420]">
              <div className="flex gap-1 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-forest dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs ${
                        tab.id === 'moderation' && tab.count > 0
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-white/10'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Container */}
            <div className="mx-auto max-w-5xl p-4 sm:p-6">
              {activeTab === 'donors' && (
                <DonorAdminPanel
                  donors={donors}
                  onDelete={handleDeleteDonor}
                  onAdd={handleAddDonor}
                  onEdit={handleEditDonor}
                  onApprove={handleApproveDonor}
                  onVisibility={handleDonorVisibility}
                />
              )}
              {activeTab === 'market' && (
                <MarketAdminPanel
                  prices={marketPrices}
                  onUpdatePrice={handleUpdatePrice}
                  onAdd={handleAddMarketPrice}
                  onRemove={handleRemoveMarketPrice}
                  onApprove={handleApproveMarketPrice}
                  onVisibility={handleMarketPriceVisibility}
                  onRefresh={handleRefreshMarket}
                  lastUpdated={marketLastUpdated}
                />
              )}
              {activeTab === 'notices' && (
                <NoticeAdminPanel
                  notices={notices}
                  onDelete={handleDeleteNotice}
                  onAdd={handleAddNotice}
                  onEdit={handleEditNotice}
                  onApprove={handleApproveNotice}
                  onVisibility={handleNoticeVisibility}
                />
              )}
              {activeTab === 'lostfound' && (
                <LostFoundAdminPanel
                  items={lostFound}
                  onDelete={handleDeleteLostFound}
                  onApprove={handleApproveLostFound}
                  onAdd={handleAddLostFound}
                />
              )}
              {activeTab === 'directory' && (
                <DirectoryAdminPanel
                  doctors={doctors}
                  ambulances={ambulances}
                  dealers={dealers}
                  onDeleteDoctor={handleDeleteDoctor}
                  onDeleteAmbulance={handleDeleteAmbulance}
                  onDeleteDealer={handleDeleteDealer}
                  onAddDoctor={handleAddDoctor}
                  onAddAmbulance={handleAddAmbulance}
                  onAddDealer={handleAddDealer}
                  onEditDoctor={handleEditDoctor}
                  onApproveDoctor={handleApproveDoctor}
                  onDoctorVisibility={handleDoctorVisibility}
                />
              )}
              {activeTab === 'moderation' && (
                <PriceModerationAdminPanel
                  submissions={pendingPriceSubmissions}
                  pendingCount={priceModerationCounts.pending}
                  onApprove={handleApprovePriceSubmission}
                  onReject={handleRejectPriceSubmission}
                  onRefresh={refreshPriceQueue}
                />
              )}
              {activeTab === 'jobs' && (
                <JobPostingAdminPanel
                  postings={jobPostings}
                  onApprove={handleApproveJobPosting}
                  onReject={handleRejectJobPosting}
                  onDelete={handleDeleteJobPosting}
                  onEditType={handleEditJobType}
                />
              )}
              {activeTab === 'reports' && (
                <ReportAdminPanel
                  reports={reports}
                  onResolve={handleResolveReport}
                  onDelete={handleDeleteReport}
                />
              )}
              {activeTab === 'gallery' && (
                <GalleryAdminPanel
                  photos={photos}
                  onAdd={handleAddPhoto}
                  onEdit={handleEditPhoto}
                  onDelete={handleDeletePhoto}
                />
              )}
              {activeTab === 'search' && (
                <SearchAdminPanel settings={searchSettings} onChange={setSearchSettings} />
              )}
              {activeTab === 'emergency' && (
                <EmergencyContactsAdminPanel
                  contacts={contacts}
                  onAdd={handleAddContact}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                  onApprove={handleApproveContact}
                  onVisibility={handleContactVisibility}
                />
              )}
              {activeTab === 'records' && (
                <RecordsAdminPanel
                  onChange={() => {
                    setRecordsVersion((value) => value + 1)
                    notifyDataChanged('records')
                  }}
                />
              )}
              {activeTab === 'weather' && (
                <WeatherAdminPanel
                  settings={weatherSettings}
                  onChange={(next) => setWeatherSettings(next)}
                />
              )}
              {activeTab === 'bookings' && (
                <MachineryBookingAdminPanel
                  bookings={bookings}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                  onDelete={handleDeleteBooking}
                />
              )}
              {activeTab === 'profile' && <ProfileTextAdminPanel />}
              {activeTab === 'launch' && <LaunchChecklistAdminPanel />}
              {activeTab === 'dataops' && <DataOpsAdminPanel />}
              {activeTab === 'order' && <OrderAdminPanel />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
