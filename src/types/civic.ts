/**
 * Citizen-facing records added in Step 5: hospitals, government services and
 * public transport. They all carry `lastUpdated` so every card can show a
 * "সর্বশেষ হালনাগাদ" stamp and a report link.
 */

export type HospitalType =
  | 'উপজেলা স্বাস্থ্য কমপ্লেক্স'
  | 'কমিউনিটি ক্লিনিক'
  | 'বেসরকারি ক্লিনিক'
  | 'ডায়াগনস্টিক সেন্টার'

export interface Hospital {
  id: string
  name: string
  type: HospitalType
  /** Full street address, so a visitor can actually find the place. */
  address: string
  phone: string
  services: string[]
  beds?: number
  /** True when the hospital keeps an emergency/casualty unit open. */
  emergency?: boolean
  openingHours: string
  lastUpdated: string
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}

export interface CitizenService {
  id: string
  /** NID, জন্ম নিবন্ধন, জমি, পাসপোর্ট, ইউনিয়ন পরিষদ ... */
  name: string
  office: string
  address: string
  phone: string
  fee: string
  processingTime: string
  requiredDocs: string[]
  steps?: string[]
  /** Government portal the applicant can use from home. */
  online?: string
  note?: string
  lastUpdated: string
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}

export type TransportMode = 'বাস' | 'বোট' | 'রিকশা' | 'সিএনজি' | 'মাইক্রোবাস'

export interface TransportRoute {
  id: string
  mode: TransportMode
  /** Route headline, e.g. "মদন → নেত্রকোণা". */
  name: string
  from: string
  to: string
  fare: string
  distance: string
  /** Departure times, in Bangla numerals. */
  schedule: string[]
  duration?: string
  phone?: string
  note?: string
  lastUpdated: string
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}

/** A user-submitted correction for a listing. */
export interface InfoReport {
  id: string
  /** The listing the visitor reported, e.g. "ডাক্তার: ডাঃ রফিক". */
  listing: string
  /** Section the listing belongs to, used by the admin moderation panel. */
  section: string
  reason: string
  details: string
  contact?: string
  createdAt: string
  isResolved?: boolean
}

/**
 * A photo in the "ছবিতে মদন" community gallery.
 *
 * The admin panel owns this list: image URL, caption and the photographer
 * credit are all editable, and the homepage renders whatever is stored.
 */
export interface GalleryPhoto {
  id: string
  /** Image URL or a path inside `public/images`. */
  src: string
  /** Bengali caption shown under the picture. */
  caption: string
  /** Short description used as the alt text. */
  alt: string
  /** Photographer name — the attribution the licence requires. */
  credit: string
  /** Licence name, e.g. "CC BY-SA 4.0". */
  license: string
  /** Link to the original picture, when there is one. */
  source?: string
}
