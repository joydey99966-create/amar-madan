import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, RotateCcw, Save } from 'lucide-react'
import { DEFAULT_ORDER, DisplayOrder, displayOrderService } from '../../../services/displayOrderService'
import { useToast } from '../../../context/ToastContext'

const LABELS: Record<string, Record<string, string>> = {
  categories: {
    emergency: 'জরুরি সেবা ও হটলাইন', blood: 'রক্তদাতা', ambulance: 'অ্যাম্বুলেন্স',
    doctors: 'ডাক্তার ও হাসপাতাল', citizens: 'নাগরিক সেবা', market: 'বাজারদর',
    fish: 'হাওরের মাছ', transport: 'যাতায়াত', tuition: 'চাকরি ও টিউশনি',
    news: 'সংবাদ', lostfound: 'হারানো ও প্রাপ্তি', agro: 'কৃষি যন্ত্রপাতি', education: 'শিক্ষা প্রতিষ্ঠান',
  },
  nav: {
    home: 'হোম', emergency: 'জরুরি ও রক্ত', market: 'বাজার দর',
    directory: 'স্থানীয় ডিরেক্টরি', jobs: 'চাকরি ও টিউশনি',
  },
  bottomNav: {
    home: 'হোম', emergency: 'জরুরি ও রক্ত', market: 'বাজার দর',
    directory: 'স্থানীয় ডিরেক্টরি', jobs: 'চাকরি ও টিউশনি',
  },
  side: {
    'directory-doctors': 'ডাক্তার ও হাসপাতাল', citizens: 'নাগরিক সেবা', fish: 'হাওরের মাছ',
    transport: 'যাতায়াত', news: 'সংবাদ ও নোটিশ', lostfound: 'হারানো ও প্রাপ্তি',
    'directory-education': 'শিক্ষা প্রতিষ্ঠান', services: 'সব সেবা', profile: 'প্রোফাইল',
  },
  quick: {
    'emergency-blood': 'রক্তদাতা তালিকা', 'emergency-help': 'জরুরি সেবা', citizens: 'নাগরিক সেবা',
    market: 'বাজার দর', fish: 'হাওরের মাছ', transport: 'যাতায়াত', lostfound: 'হারানো ও প্রাপ্তি',
    jobs: 'চাকরি ও টিউশনি', news: 'সংবাদ ও প্রেস ক্লাব', services: 'সব সেবা', directory: 'স্থানীয় ডিরেক্টরি',
  },
  footer: {
    home: 'হোম', blood: 'রক্তদাতা', hotline: 'জরুরি', doctors: 'ডিরেক্টরি',
    citizens: 'নাগরিক সেবা', market: 'বাজার দর', fish: 'হাওরের মাছ', transport: 'যাতায়াত',
    jobs: 'চাকরি ও টিউশনি', news: 'সংবাদ', lostfound: 'হারানো ও প্রাপ্তি', services: 'সব সেবা', profile: 'প্রোফাইল',
  },
}

const TITLES: Record<keyof DisplayOrder, string> = {
  categories: 'হোমপেজের সেবা টাইল',
  nav: 'ডেস্কটপ হেডার নভ',
  bottomNav: 'মোবাইল বটম নভ (চাকরি এখানে নেই)',
  side: 'সাইড মেনু',
  quick: 'প্রোফাইলের দ্রুত লিংক',
  footer: 'ফুটারের দ্রুত লিংক',
}

export function OrderAdminPanel() {
  const { addToast } = useToast()
  const [order, setOrder] = useState<DisplayOrder>(() => displayOrderService.get())
  useEffect(() => setOrder(displayOrderService.get()), [])

  const move = (list: keyof DisplayOrder, index: number, direction: -1 | 1) => {
    const ids = [...order[list]]
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    setOrder((prev) => ({ ...prev, [list]: ids }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">সেবার অর্ডার (Usefulness Rank)</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            সবচেয়ে দরকারি সেবা প্রথমে দেখানো হয়। তীর চিহ্ন দিয়ে অর্ডার বদলান — ডিফল্ট অর্ডার ব্যবহারযোগ্যতা অনুসারে সাজানো।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setOrder(displayOrderService.reset()); addToast('ডিফল্ট অর্ডার ফিরে এসেছে', 'info') }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
          >
            <RotateCcw size={14} /> ডিফল্ট
          </button>
          <button
            onClick={() => { displayOrderService.save(order); addToast('অর্ডার সেভ করা হয়েছে', 'success') }}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Save size={15} /> সেভ করুন
          </button>
        </div>
      </div>

      {(Object.keys(DEFAULT_ORDER) as (keyof DisplayOrder)[]).map((list) => (
        <div key={list} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{TITLES[list]}</h3>
          <div className="mt-3 space-y-1">
            {order[list].map((id, index) => (
              <div key={id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 dark:border-white/[0.07]">
                <span className="w-6 shrink-0 text-center text-[10px] font-bold text-slate-400">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {LABELS[list]?.[id] ?? id}
                </span>
                <button onClick={() => move(list, index, -1)} disabled={index === 0} aria-label="উপরে" className="rounded border border-slate-200 p-1 text-slate-500 disabled:opacity-30 dark:border-white/10">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => move(list, index, 1)} disabled={index === order[list].length - 1} aria-label="নিচে" className="rounded border border-slate-200 p-1 text-slate-500 disabled:opacity-30 dark:border-white/10">
                  <ArrowDown size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
