import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * Every user-facing label on /profile is stored here so the admin can edit it
 * from the dashboard. Defaults are the original site wording — nothing changes
 * visually until Joy edits a field.
 */
export interface ProfileText {
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  registerDonorLabel: string
  suggestPriceLabel: string

  myEyebrow: string
  myTitle: string
  myIntro: string
  donorTitle: string
  donorEmpty: string
  bookingTitle: string
  bookingEmpty: string
  priceTitle: string
  priceEmpty: string
  savedTitle: string
  savedEmpty: string
  savedNote: string
  statusPending: string
  statusApproved: string
  statusRejected: string
  viewLinkLabel: string

  statsEyebrow: string
  statsTitle: string
  statsNote: string

  quickEyebrow: string
  quickTitle: string
  /** One label per line, in the same order as the fixed quick-link targets. */
  quickLinks: string
}

export const DEFAULT_PROFILE_TEXT: ProfileText = {
  heroEyebrow: 'সাইটের তথ্য',
  heroTitle: 'মদনবাসীর সেবামঞ্জলি',
  heroBody:
    'এই পেজে আপনি নিজের জমা দেওয়া তথ্য ও সাইটে প্রকাশিত তথ্যের সংখ্যা দেখতে পারবেন। নিজের এলাকার সঠিক তথ্য যোগ করে পাশে থাকুন।',
  registerDonorLabel: '+ রক্তদাতা হোন',
  suggestPriceLabel: 'বাজারের তথ্য দিন',

  myEyebrow: 'আপনার তথ্য',
  myTitle: 'আমার প্রোফাইল',
  myIntro: 'এই ব্রাউজার থেকে আপনি যেগুলো জমা দিয়েছেন — শুধু সেগুলোই এখানে দেখানো হয়।',
  donorTitle: 'রক্তদাতা নিবন্ধন',
  donorEmpty: 'এখনো কোনো তথ্য নেই',
  bookingTitle: 'যন্ত্রপাতি বুকিং',
  bookingEmpty: 'এখনো কোনো তথ্য নেই',
  priceTitle: 'দামের সাজেশন',
  priceEmpty: 'এখনো কোনো তথ্য নেই',
  savedTitle: 'সংরক্ষিত সেবা ও সংবাদ',
  savedEmpty: 'এখনো কোনো তথ্য নেই',
  savedNote: 'এই সাইটে সেবা বা সংবাদ সংরক্ষণের সুবিধা এখনো নেই।',
  statusPending: 'অপেক্ষমাণ',
  statusApproved: 'অনুমোদিত',
  statusRejected: 'বাতিল',
  viewLinkLabel: 'দেখুন',

  statsEyebrow: 'সাইটের তথ্য',
  statsTitle: 'সাইটের তথ্য ও পরিসংখ্যান',
  statsNote: 'সব সংখ্যা তালিকার প্রকৃত দৈর্ঘ্য থেকে হিসাব করা হয়েছে।',

  quickEyebrow: 'দ্রুত লিংক',
  quickTitle: 'যেকোনো সেবায় সরাসরি যান',
  quickLinks: [
    'সব সেবা',
    'রক্তদাতা তালিকা',
    'জরুরি সেবা',
    'বাজার দর',
    'হাওরের মাছ',
    'যাতায়াত',
    'হারানো ও প্রাপ্তি',
    'সংবাদ ও প্রেস ক্লাব',
    'চাকরি ও টিউশনি',
    'নাগরিক সেবা',
    'স্থানীয় ডিরেক্টরি',
  ].join('\n'),
}

/** Admin-editable profile wording — no login system or invented personal data. */
export const profileContentService = {
  getText(): ProfileText {
    const stored = storageService.get<Partial<ProfileText> | null>(
      STORAGE_KEYS.PROFILE_TEXT,
      null,
    )
    const merged: ProfileText = { ...DEFAULT_PROFILE_TEXT }
    if (!stored || typeof stored !== 'object') return merged
    ;(Object.keys(DEFAULT_PROFILE_TEXT) as (keyof ProfileText)[]).forEach((key) => {
      const value = stored[key]
      if (typeof value === 'string' && value.trim()) merged[key] = value
    })
    return merged
  },

  saveText(text: ProfileText): ProfileText {
    storageService.set(STORAGE_KEYS.PROFILE_TEXT, text)
    notifyDataChanged('profile')
    return text
  },

  resetText(): ProfileText {
    storageService.remove(STORAGE_KEYS.PROFILE_TEXT)
    notifyDataChanged('profile')
    return { ...DEFAULT_PROFILE_TEXT }
  },
}
