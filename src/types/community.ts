export interface NewsItem {
  id: string
  title: string
  /** Notice/news category (notices use স্বাস্থ্য, কৃষি, শিক্ষা, সংস্কৃতি …). */
  category: string
  content: string
  date: string
  source: string
  /** Bundled photo shown above the headline, when the item has one. */
  image?: string
  /** ISO date the news desk last confirmed the item. */
  lastUpdated?: string
}

export interface Journalist {
  id: string
  name: string
  mediaName: string
  designation: string
  phone: string
  area: string
}

export interface EducationInstitution {
  id: string
  name: string
  type: 'কলেজ' | 'স্কুল' | 'মাদরাসা' | 'কোচিং' | 'আইটি সেন্টার'
  area: string
  headName: string
  eiin: string | null
  phone: string
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}

export interface LostFoundItem {
  id: string
  type: 'হারানো' | 'প্রাপ্তি'
  itemName: string
  location: string
  date: string
  description: string
  phone: string
  postedAt: string
  isApproved?: boolean
  /** ISO date of the last edit/confirmation. */
  lastUpdated?: string
}

export interface JobPosting {
  id: string
  title: string
  category: 'টিউশনি' | 'চাকরি' | 'খণ্ডকালীন'
  organization: string
  location: string
  salary: string
  /** Last date to apply, YYYY-MM-DD. */
  deadline: string
  contact: string
  description: string
  /** Employment pattern, used by the type filter. */
  type?: 'ফুল টাইম' | 'পার্ট টাইম' | 'কন্ট্রাক্ট' | 'টিউশনি'
  /** Numeric monthly salary in taka, used by the salary filter. */
  salaryAmount?: number
  /** ISO date the visitor submitted the posting. */
  postedAt?: string
  /** Postings submitted from the public form start as pending. */
  isApproved?: boolean
  isRejected?: boolean
  /** ISO date of the last moderation action. */
  lastUpdated?: string
  posterName?: string
}
