import { EmergencyContact } from '../types'

/**
 * Canonical emergency contacts.
 *
 * These are the values that already existed in the app's two lists, merged
 * into one source. The Fire Service entry keeps the central directory value
 * (১০২), so every surface now shows exactly one number for it.
 */
export const emergencyContactSeed: EmergencyContact[] = [
  { id: 'police', name: 'থানা / পুলিশ', phone: '৯৯৯', dial: '999', category: 'police', visible: true, approved: true },
  { id: 'fire', name: 'ফায়ার সার্ভিস', phone: '১০২', dial: '102', category: 'fire', visible: true, approved: true },
  { id: 'electricity', name: 'পল্লী বিদ্যুৎ', phone: '১৬৮৯৯', dial: '16899', category: 'electricity', visible: true, approved: true },
  // ১০৬ Bangladesh-এ অ্যাম্বুলেন্স নম্বর হিসেবে যাচাই করা যায়নি — Hidden until verified.
  { id: 'ambulance', name: 'জরুরি চিকিৎসা (অ্যাম্বুলেন্স)', phone: '১০৬', dial: '106', category: 'ambulance', visible: false, approved: false },
  { id: 'helpline', name: 'জাতীয় হেল্পলাইন', phone: '৩৩৩', dial: '333', category: 'helpline', visible: true, approved: true },
  { id: 'women', name: 'নারী ও শিশু নির্যাতন প্রতিরোধ', phone: '১০৯', dial: '109', category: 'women', visible: true, approved: true },
  { id: 'water', name: 'পানি সরবরাহ জরুরি সেবা', phone: '০১৭০-০০০০০০', dial: '01700000000', category: 'water', visible: true, approved: true },
  // ১৯১৬ Bangladesh-এ গ্যাস লিক নম্বর হিসেবে যাচাই করা যায়নি — Hidden until verified.
  { id: 'gas', name: 'গ্যাস লিক জরুরি সেবা', phone: '১৯১৬', dial: '1916', category: 'gas', visible: false, approved: false },
]
