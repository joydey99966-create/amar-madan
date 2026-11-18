import { useEffect, useState } from 'react'
import { RotateCcw, Save, UserRound } from 'lucide-react'
import {
  DEFAULT_PROFILE_TEXT,
  ProfileText,
  profileContentService,
} from '../../../services/profileContentService'
import { useToast } from '../../../context/ToastContext'

type Field = { key: keyof ProfileText; label: string; multiline?: boolean }

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: 'প্রোফাইল হেডার',
    fields: [
      { key: 'heroEyebrow', label: 'হেডার আইব্রো' },
      { key: 'heroTitle', label: 'হেডার শিরোনাম' },
      { key: 'heroBody', label: 'হেডার বিবরণ', multiline: true },
      { key: 'registerDonorLabel', label: 'রক্তদাতা বাটন' },
      { key: 'suggestPriceLabel', label: 'দামের তথ্য বাটন' },
    ],
  },
  {
    title: 'আমার প্রোফাইল',
    fields: [
      { key: 'myEyebrow', label: 'সেকশন আইব্রো' },
      { key: 'myTitle', label: 'সেকশন শিরোনাম' },
      { key: 'myIntro', label: 'সেকশন বিবরণ', multiline: true },
      { key: 'donorTitle', label: 'রক্তদাতা কার্ড শিরোনাম' },
      { key: 'donorEmpty', label: 'রক্তদাতা খালি বার্তা' },
      { key: 'bookingTitle', label: 'বুকিং কার্ড শিরোনাম' },
      { key: 'bookingEmpty', label: 'বুকিং খালি বার্তা' },
      { key: 'priceTitle', label: 'দামের সাজেশন শিরোনাম' },
      { key: 'priceEmpty', label: 'দামের সাজেশন খালি বার্তা' },
      { key: 'savedTitle', label: 'সংরক্ষিত সেবা শিরোনাম' },
      { key: 'savedEmpty', label: 'সংরক্ষিত সেবা খালি বার্তা' },
      { key: 'savedNote', label: 'সংরক্ষিত সেবা নোট' },
      { key: 'statusPending', label: 'অপেক্ষমাণ স্ট্যাটাস' },
      { key: 'statusApproved', label: 'অনুমোদিত স্ট্যাটাস' },
      { key: 'statusRejected', label: 'বাতিল স্ট্যাটাস' },
      { key: 'viewLinkLabel', label: 'লিংক লেবেল' },
    ],
  },
  {
    title: 'সাইটের তথ্য ও দ্রুত লিংক',
    fields: [
      { key: 'statsEyebrow', label: 'পরিসংখ্যান আইব্রো' },
      { key: 'statsTitle', label: 'পরিসংখ্যান শিরোনাম' },
      { key: 'statsNote', label: 'পরিসংখ্যান নোট' },
      { key: 'quickEyebrow', label: 'দ্রুত লিংক আইব্রো' },
      { key: 'quickTitle', label: 'দ্রুত লিংক শিরোনাম' },
      {
        key: 'quickLinks',
        label: 'দ্রুত লিংকের লেবেল (এক লাইনে একটি, ক্রম ঠিক রাখুন)',
        multiline: true,
      },
    ],
  },
]

/** Admin CMS for every label shown on /profile. */
export function ProfileTextAdminPanel() {
  const { addToast } = useToast()
  const [form, setForm] = useState<ProfileText>(() => profileContentService.getText())

  useEffect(() => {
    setForm(profileContentService.getText())
  }, [])

  const update = (key: keyof ProfileText, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    profileContentService.saveText(form)
    addToast('প্রোফাইলের লেখা সেভ করা হয়েছে', 'success')
  }

  const handleReset = () => {
    setForm(profileContentService.resetText())
    addToast('প্রোফাইলের লেখা ডিফল্টে ফিরে গেছে', 'info')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
            <UserRound size={18} /> প্রোফাইল পেজের লেখা
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            /profile পেজের প্রতিটি লেবেল, শিরোনাম ও খালি-অবস্থার বার্তা এখান থেকে সম্পাদনা করুন। কোনো
            ব্যবহারকারীর তথ্য এখানে তৈরি করা হয় না — শুধু দৃশ্যমান লেখা।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
          >
            <RotateCcw size={14} /> ডিফল্ট
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Save size={15} /> সেভ করুন
          </button>
        </div>
      </div>

      {GROUPS.map((group) => (
        <div
          key={group.title}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
        >
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{group.title}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.fields.map((field) => (
              <label key={field.key} className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {field.label}
                {field.multiline ? (
                  <textarea
                    value={form[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                    rows={field.key === 'quickLinks' ? 11 : 3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                  />
                )}
              </label>
            ))}
          </div>
          {group.title === 'আমার প্রোফাইল' && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              ডিফল্ট লেখা: {DEFAULT_PROFILE_TEXT.myTitle} · {DEFAULT_PROFILE_TEXT.statsTitle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
