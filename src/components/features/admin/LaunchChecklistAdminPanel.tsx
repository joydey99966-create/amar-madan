import { useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import {
  launchChecklistService,
  LaunchChecklist,
} from '../../../services/launchChecklistService'
import { useToast } from '../../../context/ToastContext'
import { toBanglaNumber } from '../../../utils/formatters'

/**
 * Launch-time data replacement checklist. It only records which demo values
 * Joy has replaced — no value in the site data is changed here.
 */
export function LaunchChecklistAdminPanel() {
  const { addToast } = useToast()
  const [checklist, setChecklist] = useState<LaunchChecklist>(() => launchChecklistService.get())

  useEffect(() => {
    setChecklist(launchChecklistService.get())
  }, [])

  const done = checklist.items.filter((item) => item.checked).length
  const deadLinks = checklist.links.filter((link) => link.dead).length

  const toggleItem = (id: string) =>
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    }))

  const toggleLink = (url: string) =>
    setChecklist((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.url === url ? { ...link, dead: !link.dead } : link)),
    }))

  const handleSave = () => {
    launchChecklistService.save(checklist)
    addToast('লঞ্চ চেকলিস্ট সেভ করা হয়েছে', 'success')
  }

  const handleReset = () => {
    setChecklist(launchChecklistService.reset())
    addToast('লঞ্চ চেকলিস্ট রিসেট করা হয়েছে', 'info')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
            <ShieldCheck size={18} /> লঞ্চের আগে ডেমো তথ্য বদলান
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            এই চেকলিস্ট শুধু মনে করিয়ে দেয় — কোনো ডেমো মান এখন বদলানো হচ্ছে না। {toBanglaNumber(done)}/{toBanglaNumber(checklist.items.length)} সম্পন্ন।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
          >
            <RotateCcw size={14} /> রিসেট
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Save size={15} /> সেভ করুন
          </button>
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
        {checklist.items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50 dark:border-white/[0.07] dark:hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-white">
                {item.checked && <CheckCircle2 size={14} className="text-emerald-600" />}
                {item.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">{item.detail}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
          <ExternalLink size={15} /> বাহ্যিক লিংক যাচাই
        </h3>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          লিংকগুলো সরানো হয়নি। কোনো লিংক অচল হলে নিচে টিক দিন — পাবলিক পেজে সতর্কতা দেখানো হবে।
        </p>
        <div className="mt-3 space-y-2">
          {checklist.links.map((link) => (
            <label key={link.url} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 p-2.5 text-xs dark:border-white/[0.07]">
              <input
                type="checkbox"
                checked={link.dead}
                onChange={() => toggleLink(link.url)}
                className="h-4 w-4 accent-forest"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{link.serviceName}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="break-all text-forest underline dark:text-emerald-300">
                {link.url}
              </a>
              {link.dead && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  অচল লিংক
                </span>
              )}
            </label>
          ))}
        </div>
        {deadLinks > 0 && (
          <p className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            {toBanglaNumber(deadLinks)} টি বাহ্যিক লিংক অচল হিসেবে চিহ্নিত।
          </p>
        )}
      </div>
    </div>
  )
}
