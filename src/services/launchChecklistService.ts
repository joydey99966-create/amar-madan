import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'
import { citizenService } from './citizenService'
import { jobPostingService } from './jobPostingService'
import { recordsService } from './recordsService'

/** A single launch-time task Joy ticks off when the real data is in place. */
export interface LaunchCheckItem {
  id: string
  label: string
  detail: string
  checked: boolean
}

/** An external link found in the site data, flagged by Joy if it is dead. */
export interface ExternalLinkFlag {
  url: string
  serviceName: string
  dead: boolean
}

export interface LaunchChecklist {
  items: LaunchCheckItem[]
  links: ExternalLinkFlag[]
}

const STORAGE_KEY = 'amar-madan-launch-checklist'

/**
 * These are ONLY reminders — none of the placeholder values are changed here.
 * The checklist is admin-controlled and lives entirely in localStorage.
 */
function defaultItems(): LaunchCheckItem[] {
  return [
    { id: 'donor-phones', label: 'রক্তদাতার ফোন নম্বর', detail: '১৫ জন ডেমো দাতার placeholder মোবাইল নম্বর বাস্তব দিয়ে বদলান।', checked: false },
    { id: 'unverified-donors', label: 'অযাচাইকৃত রক্তদাতা', detail: 'জাহিদ, কামরুল, জাফর, সাদ্দাম ও নজরুল — ৫জনের তথ্য যাচাই করুন।', checked: false },
    { id: 'doctor-phones', label: 'ডাক্তারের ফোন ও নিবন্ধন', detail: 'ডিরেক্টরির ডেমো ফোন নম্বর ও BMDC নিবন্ধন যাচাই করুন।', checked: false },
    { id: 'hospital-phones', label: 'হাসপাতালের ফোন নম্বর', detail: 'হাসপাতাল ও ক্লিনিকের placeholder নম্বর বাস্তব দিয়ে বদলান।', checked: false },
    { id: 'eiin', label: 'শিক্ষা প্রতিষ্ঠান EIIN', detail: `${recordsService.all('education').length}টি প্রতিষ্ঠানের EIIN যাচাই করুন।`, checked: false },
    { id: 'market-prices', label: 'বাজারদর', detail: '১৬টি পণ্যের ডেমো দাম বাস্তব দাম দিয়ে আপডেট করুন।', checked: false },
    { id: 'fish-prices', label: 'হাওরের মাছের দর', detail: '৬টি মাছের ডেমো দাম ও তারিখ আপডেট করুন।', checked: false },
    { id: 'transport-fares', label: 'যাতায়াত ভাড়া ও ফোন', detail: `${recordsService.all('routes').length}টি রুটের ভাড়া ও যোগাযোগ নম্বর যাচাই করুন।`, checked: false },
    { id: 'machinery', label: 'কৃষি যন্ত্রপাতি', detail: '৪টি যন্ত্রপাতির মালিকের নম্বর ও ভাড়া যাচাই করুন।', checked: false },
    { id: 'jobs', label: 'চাকরি ও টিউশনি', detail: `${jobPostingService.getAll().length}টি পোস্টের মেয়াদ ও যোগাযোগ তথ্য যাচাই করুন।`, checked: false },
    { id: 'news', label: 'সংবাদ ও নোটিশ', detail: 'সংবাদের উৎস, তারিখ ও বিবরণ বাস্তব তথ্য দিয়ে বদলান।', checked: false },
    { id: 'emergency', label: 'জরুরি নম্বর', detail: 'পানি সরবরাহের placeholder নম্বর (০১৭০-০০০০০০) বদলান; ৯৯৯/১০২ অপরিবর্তিত রাখুন।', checked: false },
    { id: 'journalists', label: 'সাংবাদিকের ফোন', detail: 'প্রেসক্লাবের ৪জন সাংবাদিকের ডেমো নম্বর বদলান।', checked: false },
  ]
}

function defaultLinks(): ExternalLinkFlag[] {
  const seen = new Set<string>()
  return citizenService
    .getAll()
    .flatMap((service) =>
      service.online ? [{ url: service.online, serviceName: service.name, dead: false }] : [],
    )
    .filter((link) => {
      if (seen.has(link.url)) return false
      seen.add(link.url)
      return true
    })
}

export const launchChecklistService = {
  get(): LaunchChecklist {
    const defaults: LaunchChecklist = { items: defaultItems(), links: defaultLinks() }
    const stored = storageService.get<LaunchChecklist | null>(STORAGE_KEY, null)
    if (!stored || typeof stored !== 'object') return defaults
    return {
      items: defaults.items.map((item) => ({
        ...item,
        checked: stored.items?.find((s) => s.id === item.id)?.checked ?? item.checked,
      })),
      links: defaults.links.map((link) => ({
        ...link,
        dead: stored.links?.find((s) => s.url === link.url)?.dead ?? link.dead,
      })),
    }
  },

  save(checklist: LaunchChecklist): LaunchChecklist {
    storageService.set(STORAGE_KEY, checklist)
    notifyDataChanged('launch')
    return checklist
  },

  reset(): LaunchChecklist {
    storageService.remove(STORAGE_KEY)
    notifyDataChanged('launch')
    return { items: defaultItems(), links: defaultLinks() }
  },
}
