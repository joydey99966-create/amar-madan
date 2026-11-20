import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

export type Language = 'bn' | 'en'

export interface TranslationEntry {
  key: string
  bn: string
  en: string
}

/**
 * Professional EN copy for the site's core chrome. Bengali remains the default
 * and source of truth; English is a careful, literal-but-natural rendering.
 * The owner can edit every entry from the admin panel — no code change needed.
 */
export const DEFAULT_TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  'app.name': { bn: 'আমার মদন', en: 'My Madan' },
  'app.tagline': { bn: 'মদন উপজেলা সেবা ও তথ্য', en: 'Madan Upazila Services & Information' },

  'nav.home': { bn: 'হোম', en: 'Home' },
  'nav.market': { bn: 'বাজার দর', en: 'Market Prices' },
  'nav.emergency': { bn: 'জরুরি ও রক্ত', en: 'Emergency & Blood' },
  'nav.jobs': { bn: 'চাকরি ও টিউশনি', en: 'Jobs & Tuition' },
  'nav.directory': { bn: 'স্থানীয় ডিরেক্টরি', en: 'Local Directory' },
  'nav.home.short': { bn: 'হোম', en: 'Home' },
  'nav.market.short': { bn: 'বাজার', en: 'Market' },
  'nav.emergency.short': { bn: 'জরুরি', en: 'Emergency' },
  'nav.jobs.short': { bn: 'টিউশনি', en: 'Tuition' },
  'nav.directory.short': { bn: 'ডিরেক্টরি', en: 'Directory' },

  'header.profile': { bn: 'প্রোফাইল', en: 'Profile' },
  'header.adminAccess': { bn: 'অ্যাডমিন অ্যাক্সেস', en: 'Admin Access' },
  'header.otherServices': { bn: 'অন্যান্য সেবা', en: 'More Services' },
  'header.theme': { bn: 'থিম নির্বাচন:', en: 'Theme:' },
  'header.light': { bn: 'লাইট মোড', en: 'Light mode' },
  'header.dark': { bn: 'ডার্ক মোড', en: 'Dark mode' },
  'header.register': { bn: 'রক্তদাতা হোন', en: 'Become a donor' },
  'header.language': { bn: 'ভাষা', en: 'Language' },

  'hero.badge': { bn: 'আপনার এলাকার পাশে, সবসময়', en: 'Right beside you, always' },
  'hero.title': { bn: 'মদনের সব সেবা, এখন হাতের মুঠোয়', en: "All of Madan's services, right in your hands" },
  'hero.description': {
    bn: 'জরুরি সহায়তা, রক্তদাতা, হাসপাতাল ও প্রয়োজনীয় সব নাগরিক সেবা খুঁজুন সহজেই।',
    en: 'Find emergency help, blood donors, hospitals and every essential citizen service with ease.',
  },
  'hero.location': { bn: 'মদন, নেত্রকোণা', en: 'Madan, Netrokona' },
  'hero.available': { bn: '২৪/৭ সেবা ও তথ্য', en: '24/7 service & information' },

  'categories.eyebrow': { bn: 'আপনার প্রয়োজন', en: 'What you need' },
  'categories.title': { bn: 'সেবা খুঁজুন', en: 'Explore services' },
  'categories.all': { bn: 'সব সেবা', en: 'All services' },
  'categories.empty': {
    bn: 'কোনো সেবা পাওয়া যায়নি। অন্য কিছু লিখে খুঁজুন।',
    en: 'No services found. Try a different search.',
  },

  'notices.eyebrow': { bn: 'আপডেট থাকুন', en: 'Stay updated' },
  'notices.title': { bn: 'আজকের নোটিশ', en: "Today's notices" },

  'search.title': { bn: 'সার্চ ফলাফল', en: 'Search results' },
  'search.clear': { bn: 'মুছুন', en: 'Clear' },
  'search.empty': { bn: 'কোনো ফলাফল পাওয়া যায়নি', en: 'No results found' },
  'search.placeholder': { bn: 'কী খুঁজছেন?', en: 'What are you looking for?' },
  'search.viewAll': { bn: 'সব দেখুন', en: 'View all' },

  'footer.hotline': { bn: 'জরুরি হটলাইন', en: 'Emergency hotlines' },
  'footer.hotlineNote': { bn: 'যেকোনো সময় সরাসরি কল করুন', en: 'Call anytime, day or night' },
  'footer.contact': { bn: 'যোগাযোগ', en: 'Contact' },
  'footer.quickLinks': { bn: 'দ্রুত লিংক', en: 'Quick links' },
  'footer.about': { bn: 'আমার মদন', en: 'My Madan' },
  'footer.description': {
    bn: 'মদন উপজেলার স্থানীয় সেবা, তথ্য ও জরুরি যোগাযোগের একটি ডিজিটাল প্ল্যাটফর্ম।',
    en: 'A digital platform for local services, information and emergency contacts in Madan Upazila.',
  },

  'common.unverified': { bn: 'তথ্য যাচাই চলছে', en: 'Information being verified' },
  'common.report': { bn: 'ভুল তথ্য জানান', en: 'Report incorrect info' },
  'common.backHome': { bn: 'হোমে ফিরে যান', en: 'Back to home' },
  'common.call': { bn: 'কল করুন', en: 'Call' },
  'common.lastUpdated': { bn: 'সর্বশেষ হালনাগাদ:', en: 'Last updated:' },
  'common.allServices': { bn: 'সব সেবা', en: 'All services' },
}

const KEY = STORAGE_KEYS.TRANSLATIONS

export const translationService = {
  /** Stored overrides merged over the professional defaults. */
  getAll(): Record<string, { bn: string; en: string }> {
    const stored = storageService.get<Record<string, { bn: string; en: string }> | null>(KEY, null)
    return { ...DEFAULT_TRANSLATIONS, ...(stored && typeof stored === 'object' ? stored : {}) }
  },

  /** Only the owner's overrides — used by the admin editor. */
  getOverrides(): Record<string, { bn: string; en: string }> {
    return storageService.get<Record<string, { bn: string; en: string }>>(KEY, {})
  },

  get(key: string, language: Language): string {
    const entry = this.getAll()[key]
    if (!entry) return key
    return (entry[language] || entry.bn || key).trim()
  },

  saveAll(overrides: Record<string, { bn: string; en: string }>): void {
    storageService.set(KEY, overrides)
    notifyDataChanged('language')
  },

  reset(): void {
    storageService.remove(KEY)
    notifyDataChanged('language')
  },
}
