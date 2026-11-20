import { NavTabId, ViewId } from '../types'

/**
 * The single source of truth for "which screen does this id open?".
 *
 * Every tile, header button, footer link and notice card resolves through one
 * of these ids, and the router refuses anything that is not listed here —
 * that is what keeps a click from ever producing a blank page.
 */
export const VIEW_IDS: ViewId[] = [
  'home',
  'market',
  'emergency',
  'jobs',
  'directory',
  'services',
  'profile',
  'transport',
  'lostfound',
  'news',
  'fish',
  'citizens',
  'banks',
  'pharmacies',
  'government',
  'mechanics',
  'agriculture',
  'veterinary',
  'postal',
]

export const VIEW_META: Record<ViewId, { eyebrow: string; title: string; description: string }> = {
  home: {
    eyebrow: 'আপনার এলাকা',
    title: 'আমার মদন',
    description: 'মদন উপজেলার স্থানীয় সেবা, তথ্য ও জরুরি যোগাযোগ — সবকিছু এক জায়গায়।',
  },
  market: {
    eyebrow: 'বাজার ও কৃষি',
    title: 'বাজার দর ও কৃষি সেবা',
    description: 'প্রতিদিনের বাজার দর, সার ও বীজের ডিলার এবং যন্ত্রপাতি ভাড়ার তথ্য।',
  },
  emergency: {
    eyebrow: 'জরুরি সেবা ও রক্তদাতা',
    title: 'জরুরি যোগাযোগ ও রক্ত ব্যাংক',
    description: 'হটলাইন, অ্যাম্বুলেন্স, ডাক্তার, মিস্ত্রি ও রক্তদাতার তালিকা।',
  },
  jobs: {
    eyebrow: 'শিক্ষা ও কর্মসংস্থান',
    title: 'টিউশনি ও কর্মসংস্থান',
    description: 'স্থানীয় টিউশনি কেন্দ্র ও চাকরির বিজ্ঞপ্তি — মেয়াদোত্তীর্ণগুলো আর দেখানো হয় না।',
  },
  directory: {
    eyebrow: 'স্থানীয় তথ্য',
    title: 'স্থানীয় ডিরেক্টরি',
    description: 'ডাক্তার, হাসপাতাল ও শিক্ষা প্রতিষ্ঠানের সরকারি তালিকা।',
  },
  services: {
    eyebrow: 'আপনার প্রয়োজন',
    title: 'সব সেবা',
    description: 'মদন উপজেলার সব সেবা এক তালিকায় — যেকোনো সেবায় সরাসরি যান।',
  },
  profile: {
    eyebrow: 'সাইটের তথ্য',
    title: 'সাইটের তথ্য ও পরিসংখ্যান',
    description: 'সাইটে প্রকাশিত তথ্যের সংখ্যা ও দ্রুত লিংক।',
  },
  transport: {
    eyebrow: 'যাতায়াত',
    title: 'যাতায়াত ও গাড়ি ভাড়া',
    description: 'গাড়ি ভাড়ার প্রদানকারী এবং সাধারণ যাতায়াত ভাড়ার অনুমান।',
  },
  lostfound: {
    eyebrow: 'হারানো ও প্রাপ্তি',
    title: 'হারানো ও প্রাপ্তি',
    description: 'হারানো জিনিস খুঁজে পাওয়া এবং পাওয়া জিনিস ফেরত দেওয়ার তালিকা।',
  },
  news: {
    eyebrow: 'সংবাদ ও প্রেসক্লাব',
    title: 'সংবাদ ও প্রেস ক্লাব',
    description: 'স্থানীয় সংবাদ, প্রেস ক্লাবের তথ্য এবং সাংবাদিক তালিকা।',
  },
  fish: {
    eyebrow: 'হাওরের মাছ',
    title: 'হাওরের মাছ বাজার',
    description: 'নীল হাওরের মাছের দৈনিক দর এবং মাছ আড়তের তালিকা।',
  },
  banks: {
    eyebrow: 'ব্যাংক ও এটিএম',
    title: 'ব্যাংক, এটিএম ও আর্থিক সেবা',
    description: 'মদন উপজেলার ব্যাংক শাখা ও এটিএম তথ্য — যখন প্রকাশিত হবে তখন দেখা যাবে।',
  },
  pharmacies: {
    eyebrow: 'ফার্মাসি',
    title: 'ফার্মাসি ও ওষুধের দোকান',
    description: 'স্থানীয় ফার্মাসি ও ওষুধের দোকানের তালিকা।',
  },
  government: {
    eyebrow: 'সরকারি অফিস',
    title: 'সরকারি অফিস',
    description: 'ইউএনও সহ উপজেলার সরকারি অফিস ও দপ্তরের তালিকা।',
  },
  mechanics: {
    eyebrow: 'মিস্ত্রি ও মেরামত',
    title: 'মিস্ত্রি ও মেরামত সেবা',
    description: 'ইলেকট্রিক, প্লাম্বার, মেকানিকসহ স্থানীয় মিস্ত্রির তালিকা।',
  },
  agriculture: {
    eyebrow: 'কৃষি কর্মকর্তা',
    title: 'কৃষি কর্মকর্তা ও সেবা',
    description: 'কৃষি সম্প্রসারণ কর্মকর্তা ও সংশ্লিষ্ট সেবার তালিকা।',
  },
  veterinary: {
    eyebrow: 'ভেটেরিনারি',
    title: 'ভেটেরিনারি ও পশু স্বাস্থ্য',
    description: 'পশু চিকিৎসা ও ভেটেরিনারি সেবার তালিকা।',
  },
  postal: {
    eyebrow: 'পোস্টাল ও কুরিয়ার',
    title: 'পোস্টাল ও কুরিয়ার',
    description: 'পোস্ট অফিস ও কুরিয়ার সেবার তালিকা।',
  },
  citizens: {
    eyebrow: 'সরকারি সেবা',
    title: 'নাগরিক সেবা',
    description: 'NID, জন্ম নিবন্ধন, জমি, পাসপোর্ট ও ইউনিয়ন পরিষদের সেবা — অফিস, ফি ও প্রয়োজনীয় কাগজপত্রসহ।',
  },
}

/** Maps every homepage category tile to the view that actually serves it. */
export const CATEGORY_VIEW_MAP: Record<string, ViewId> = {
  blood: 'emergency',
  ambulance: 'emergency',
  doctors: 'directory',
  emergency: 'emergency',
  transport: 'transport',
  lostfound: 'lostfound',
  market: 'market',
  fish: 'fish',
  agro: 'market',
  tuition: 'jobs',
  education: 'directory',
  news: 'news',
  citizens: 'citizens',
}

/**
 * Keeps the matching header / bottom navigation item highlighted.
 *
 * Sections that are not one of the five main tabs (news, transport, profile …)
 * deliberately map to `null`: no tab is highlighted there, so a wrong tab is
 * never shown as active.
 */
export const NAV_TAB_BY_VIEW: Record<ViewId, NavTabId | null> = {
  home: 'home',
  market: 'market',
  emergency: 'emergency',
  jobs: 'jobs',
  directory: 'directory',
  services: null,
  profile: null,
  transport: null,
  lostfound: null,
  news: null,
  fish: null,
  citizens: null,
  banks: null,
  pharmacies: null,
  government: null,
  mechanics: null,
  agriculture: null,
  veterinary: null,
  postal: null,
}

/** Unit shown after the live count badge of a category tile. */
export const CATEGORY_COUNT_UNITS: Record<string, string> = {
  blood: 'জন',
  ambulance: 'টি',
  doctors: 'জন',
  emergency: 'টি',
  transport: 'টি',
  lostfound: 'টি',
  market: 'টি',
  fish: 'টি',
  agro: 'টি',
  tuition: 'টি',
  education: 'টি',
  news: 'টি',
  citizens: 'টি',
}

export function isViewId(value: string): value is ViewId {
  return (VIEW_IDS as string[]).includes(value)
}
