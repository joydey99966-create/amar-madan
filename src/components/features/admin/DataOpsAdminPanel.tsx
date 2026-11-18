import { useRef, useState } from 'react'
import { Download, RefreshCw, Upload } from 'lucide-react'
import { dataSnapshotService, DataSnapshot } from '../../../services/dataSnapshotService'
import { freshnessService } from '../../../services/freshnessService'
import { analyticsService } from '../../../services/analyticsService'
import { useToast } from '../../../context/ToastContext'
import { toBanglaNumber } from '../../../utils/formatters'

/** Data backup, freshness and privacy analytics — all admin-controlled. */
export function DataOpsAdminPanel() {
  const { addToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState(() => freshnessService.scan())
  const [stats, setStats] = useState(() => analyticsService.get())

  const refresh = () => {
    setRows(freshnessService.scan())
    setStats(analyticsService.get())
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const snapshot = JSON.parse(await file.text()) as DataSnapshot
      const written = dataSnapshotService.importAll(snapshot)
      addToast(`${toBanglaNumber(written)} টি ডেটা সেট পুনরুদ্ধার করা হয়েছে`, 'success')
      refresh()
    } catch {
      addToast('ফাইলটি সঠিক স্ন্যাপশট নয়', 'error')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const totalViews = Object.values(stats.views).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ডেটা ব্যাকআপ ও স্থানান্তর</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          সব ডেটা এক ফাইলে রপ্তানি বা পুনরুদ্ধার করুন। রপ্তানি করা JSON ফাইলটি <code>public/data/snapshot.json</code> হিসেবে ডিপ্লয় করলে সব দর্শক admin-এর তথ্য দেখতে পাবেন — কোনো সার্ভার লাগবে না।
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { dataSnapshotService.downloadSnapshot(); addToast('স্ন্যাপশট ডাউনলোড করা হয়েছে', 'success') }}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Download size={15} /> স্ন্যাপশট রপ্তানি
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
          >
            <Upload size={15} /> ফাইল থেকে পুনরুদ্ধার
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">তথ্যের পুরনো তারিখ (Freshness)</h3>
          <button onClick={refresh} className="flex items-center gap-1 text-xs text-forest dark:text-emerald-300">
            <RefreshCw size={13} /> রিফ্রেশ
          </button>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">যেসব তালিকা দীর্ঘদিন আপডেট হয়নি প্রথমে দেখানো হয়।</p>
        <div className="mt-3 space-y-1.5">
          {rows.map((row) => (
            <div key={row.section} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-white/[0.07]">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{row.label}</span>
              <span className="text-slate-500 dark:text-slate-400">{toBanglaNumber(row.count)} টি · {row.oldest || 'তারিখ নেই'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">স্থানীয় দর্শন সংখ্যা (গোপনীয়)</h3>
          <button onClick={() => { analyticsService.reset(); refresh(); addToast('কাউন্টার রিসেট হয়েছে', 'info') }} className="text-xs text-forest dark:text-emerald-300">রিসেট</button>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">মোট {toBanglaNumber(totalViews)} টি দর্শন — খালি হলে কোনো তথ্য বাইরে যায় না।</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(stats.views).map(([view, count]) => (
            <div key={view} className="rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-white/5">
              {view}: {toBanglaNumber(count)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
