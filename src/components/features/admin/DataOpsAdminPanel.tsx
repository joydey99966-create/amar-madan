import { useRef, useState } from 'react'
import { Download, RefreshCw, Upload } from 'lucide-react'
import {
  dataSnapshotService,
  DataSnapshot,
  getSnapshotStatus,
  SnapshotStatus,
} from '../../../services/dataSnapshotService'
import { freshnessService } from '../../../services/freshnessService'
import { analyticsService } from '../../../services/analyticsService'
import { storageService } from '../../../services/storageService'
import { useToast } from '../../../context/ToastContext'
import { toBanglaNumber } from '../../../utils/formatters'
import { fromCsv, toCsv, downloadCsv } from '../../../services/csvService'
import { notifyDataChanged } from '../../../services/dataEvents'
import { isPlaceholderPhone, isPlaceholderEiin } from '../../../utils/placeholderData'
import { STORAGE_KEYS } from '../../../constants'

/** Data backup, freshness and privacy analytics — all admin-controlled. */
export function DataOpsAdminPanel() {
  const { addToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState(() => freshnessService.scan())
  const [stats, setStats] = useState(() => analyticsService.get())
  const [snapshotStatus, setSnapshotStatus] = useState<SnapshotStatus>(() => getSnapshotStatus())
  const [syncing, setSyncing] = useState(false)
  const [csvType, setCsvType] = useState<string>(STORAGE_KEYS.BLOOD_DONORS)
  const [csvReport, setCsvReport] = useState('')
  const csvRef = useRef<HTMLInputElement>(null)

  const refresh = () => {
    setRows(freshnessService.scan())
    setStats(analyticsService.get())
    setSnapshotStatus(getSnapshotStatus())
  }

  const handleResync = async () => {
    setSyncing(true)
    try {
      await dataSnapshotService.applyPublished(true)
      addToast('প্রকাশিত তথ্য আবার সিঙ্ক করা হয়েছে', 'success')
    } catch {
      addToast('সিঙ্ক ব্যর্থ — পুরনো তথ্য রাখা হয়েছে', 'error')
    } finally {
      setSyncing(false)
      refresh()
    }
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

  const csvDatasets = Object.values(STORAGE_KEYS).filter((key) => key !== STORAGE_KEYS.ADMIN_AUTH && key !== STORAGE_KEYS.WEATHER_CACHE && key !== STORAGE_KEYS.THEME && key !== STORAGE_KEYS.LOST_FOUND_SETTINGS)

  const csvLabel = (key: string) => key.replace('amar-madan-', '').replace(/-/g, ' ')

  const handleCsvExport = () => {
    const rows = storageService.get<Array<Record<string, unknown>>>(csvType, [])
    if (!Array.isArray(rows) || rows.length === 0) {
      addToast('এই তালিকায় রপ্তানি করার মতো তথ্য নেই', 'error')
      return
    }
    downloadCsv(`${csvLabel(csvType)}.csv`, toCsv(rows))
    addToast('CSV ডাউনলোড করা হয়েছে', 'success')
  }

  const handleCsvImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const { rows, errors } = fromCsv(await file.text())
      if (rows.length === 0) {
        setCsvReport(`কোনো সারি পড়া যায়নি। ${errors.slice(0, 3).join(' · ')}`)
        addToast('CSV আমদানি ব্যর্থ', 'error')
      } else {
        const existing = storageService.get<Array<Record<string, unknown>>>(csvType, [])
        const merged = [...rows.map((row, i) => ({
          ...row,
          id: String(row.id || `${csvType}-${Date.now()}-${i}`),
        })), ...(Array.isArray(existing) ? existing : [])]
        storageService.set(csvType, merged)
        notifyDataChanged('all')
        setCsvReport(`${toBanglaNumber(rows.length)} টি সারি যোগ করা হয়েছে${errors.length ? ` · ${toBanglaNumber(errors.length)} টি ত্রুটি: ${errors.slice(0, 2).join(', ')}` : ''}`)
        addToast('CSV আমদানি সম্পন্ন', 'success')
        refresh()
      }
    } catch {
      setCsvReport('ফাইল পড়তে ব্যর্থ')
      addToast('CSV আমদানি ব্যর্থ', 'error')
    }
    if (csvRef.current) csvRef.current.value = ''
  }

  const totalViews = Object.values(stats.views).reduce((a, b) => a + b, 0)

  /** Flag placeholder phone/EIIN values across every dataset in one place. */
  const placeholderFlags = (() => {
    const labels: Record<string, string> = {
      [STORAGE_KEYS.BLOOD_DONORS]: 'রক্তদাতা',
      [STORAGE_KEYS.DOCTORS]: 'ডাক্তার',
      [STORAGE_KEYS.HOSPITALS]: 'হাসপাতাল',
      [STORAGE_KEYS.EDUCATION]: 'শিক্ষা প্রতিষ্ঠান',
      [STORAGE_KEYS.EMERGENCY_CONTACTS]: 'জরুরি নম্বর',
      [STORAGE_KEYS.ROUTES]: 'যাতায়াত',
      [STORAGE_KEYS.AGRO_DEALERS]: 'কৃষি ডিলার',
      [STORAGE_KEYS.FISH_PRICES]: 'মাছ আড়ত',
      [STORAGE_KEYS.CITIZENS]: 'নাগরিক সেবা',
      [STORAGE_KEYS.LOST_FOUND]: 'হারানো ও প্রাপ্তি',
    }
    const rows: Array<{ section: string; count: number }> = []
    Object.entries(labels).forEach(([key, label]) => {
      const list = storageService.get<Array<Record<string, unknown>>>(key, [])
      if (!Array.isArray(list)) return
      let flagged = 0
      list.forEach((record) => {
        const phone = record.phone ?? record.contact ?? record.dial
        if (phone !== undefined && isPlaceholderPhone(String(phone))) flagged++
        if (record.eiin !== undefined && isPlaceholderEiin(String(record.eiin))) flagged++
      })
      if (flagged > 0) rows.push({ section: label, count: flagged })
    })
    return rows
  })()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ডেটা ব্যাকআপ ও স্থানান্তর</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          সব ডেটা এক ফাইলে রপ্তানি বা পুনরুদ্ধার করুন। রপ্তানি করা JSON ফাইলটি <code>public/data/snapshot.json</code> হিসেবে ডিপ্লয় করলে সব দর্শক admin-এর তথ্য দেখতে পাবেন — কোনো সার্ভার লাগবে না।
        </p>
        {/* Published-snapshot sync status — visible failure, never silent. */}
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
            snapshotStatus.state === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
              : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
          }`}
        >
          <span className="font-semibold">প্রকাশিত তথ্যের অবস্থা:</span> {snapshotStatus.message}
          {snapshotStatus.exportedAt && (
            <> · স্ন্যাপশট: {snapshotStatus.exportedAt.slice(0, 10)}</>
          )}
          {snapshotStatus.appliedAt && (
            <> · সর্বশেষ সিঙ্ক: {snapshotStatus.appliedAt.slice(0, 16).replace('T', ' ')} UTC</>
          )}
          {snapshotStatus.state === 'error' && snapshotStatus.attempts > 0 && (
            <> · {toBanglaNumber(snapshotStatus.attempts)} বার চেষ্টা করা হয়েছে</>
          )}
        </div>

        {/* CSV bulk import/export for every admin list. */}
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">বাল্ক CSV আমদানি / রপ্তানি</h3>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            যেকোনো তালিকা CSV তে নামান বা CSV ফাইল থেকে নতুন সারি যোগ করুন। প্রতিটি সারির ত্রুটি এখানেই দেখানো হয় — কোনো সারি নীরবভাবে বাদ দেওয়া হয় না।
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={csvType}
              onChange={(e) => setCsvType(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label="CSV তালিকা নির্বাচন"
            >
              {csvDatasets.map((key) => (
                <option key={key} value={key}>{csvLabel(key)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCsvExport}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:text-slate-300"
            >
              CSV রপ্তানি
            </button>
            <button
              type="button"
              onClick={() => csvRef.current?.click()}
              className="rounded-lg border border-forest/30 bg-forest/5 px-3 py-2 text-xs font-semibold text-forest transition hover:bg-forest/10 dark:text-emerald-300"
            >
              CSV আমদানি
            </button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleCsvImport(e.target.files?.[0])}
            />
          </div>
          {csvReport && <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">{csvReport}</p>}
        </div>

        {placeholderFlags.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
            <p className="font-bold">⚠ যাচাই প্রয়োজন — প্লেসহোল্ডার নম্বর</p>
            <p className="mt-1 text-[11px] opacity-80">
              এই নম্বরগুলো কলযোগ্য নয়; পাবলিক কার্ডে «তথ্য যাচাই চলছে» দেখানো হচ্ছে।
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {placeholderFlags.map((row) => (
                <span key={row.section} className="rounded-full bg-white px-2 py-1 font-semibold dark:bg-white/10">
                  {row.section}: {toBanglaNumber(row.count)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleResync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg border border-forest/30 bg-forest/5 px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest/10 disabled:opacity-60 dark:border-emerald-500/30 dark:text-emerald-300"
          >
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'সিঙ্ক হচ্ছে…' : 'ডেটা রিফ্রেশ'}
          </button>
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
