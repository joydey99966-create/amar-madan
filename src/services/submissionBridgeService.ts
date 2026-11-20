import { storageService } from './storageService'
import { cleanPhone } from '../utils/formatters'

const COORDINATOR_KEY = 'amar-madan-coordinator-whatsapp'
const DEFAULT_COORDINATOR_PHONE = '8801700000000'

export interface DonorSubmissionData {
  name: string
  bloodGroup: string
  unionArea: string
  phone: string
  lastDonationDate?: string
}

export interface PriceSubmissionData {
  itemName: string
  category: string
  price: number
  unit: string
  marketName: string
  reporterPhone?: string
}

export interface LostFoundSubmissionData {
  title: string
  category: 'lost' | 'found'
  location: string
  contactPhone: string
  description?: string
}

export const submissionBridgeService = {
  getCoordinatorPhone(): string {
    const custom = storageService.get<string | null>(COORDINATOR_KEY, null)
    return cleanPhone(custom || DEFAULT_COORDINATOR_PHONE)
  },

  setCoordinatorPhone(phone: string): void {
    storageService.set(COORDINATOR_KEY, phone)
  },

  buildDonorWhatsAppUrl(data: DonorSubmissionData): string {
    const phone = this.getCoordinatorPhone()
    const text = [
      '🩸 *নতুন রক্তদাতা নিবন্ধন (আমার মদন)*',
      '────────────────────',
      `👤 নাম: ${data.name}`,
      `💉 রক্তের গ্রুপ: ${data.bloodGroup}`,
      `📍 এলাকা/ইউনিয়ন: ${data.unionArea}`,
      `📱 মোবাইল: ${data.phone}`,
      data.lastDonationDate ? `📅 শেষ রক্তদান: ${data.lastDonationDate}` : '📅 শেষ রক্তদান: নতুন ডোনার',
      '────────────────────',
      'আমার মদন ওয়েবসাইটে ভেরিফাই ও অন্তর্ভুক্তির জন্য পাঠানো হলো।',
    ].join('\n')

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  },

  buildPriceWhatsAppUrl(data: PriceSubmissionData): string {
    const phone = this.getCoordinatorPhone()
    const text = [
      '🌾 *বাজারদর হালনাগাদ রিপোর্ট (আমার মদন)*',
      '────────────────────',
      `📦 পণ্য: ${data.itemName}`,
      `🏷️ ধরণ: ${data.category}`,
      `💰 মূল্য: ৳${data.price} (${data.unit})`,
      `🏬 বাজার: ${data.marketName}`,
      data.reporterPhone ? `📱 রিপোর্টকারীর মোবাইল: ${data.reporterPhone}` : '',
      '────────────────────',
      'আমার মদন বাজারে যাচাইয়ের জন্য পাঠানো হলো।',
    ]
      .filter(Boolean)
      .join('\n')

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  },

  buildLostFoundWhatsAppUrl(data: LostFoundSubmissionData): string {
    const phone = this.getCoordinatorPhone()
    const typeLabel = data.category === 'lost' ? 'হারানো বিজ্ঞপ্তি' : 'প্রাপ্তি বিজ্ঞপ্তি'
    const text = [
      `📢 *${typeLabel} (আমার মদন)*`,
      '────────────────────',
      `🏷️ শিরোনাম: ${data.title}`,
      `📍 স্থান: ${data.location}`,
      `📱 যোগাযোগের নম্বর: ${data.contactPhone}`,
      data.description ? `📝 বিবরণ: ${data.description}` : '',
      '────────────────────',
      'আমার মদন ওয়েবসাইটে প্রকাশের জন্য পাঠানো হলো।',
    ]
      .filter(Boolean)
      .join('\n')

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  },
}
