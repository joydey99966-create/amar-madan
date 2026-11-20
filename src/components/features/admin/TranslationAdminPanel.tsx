import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Save, Search } from 'lucide-react'
import { DEFAULT_TRANSLATIONS, translationService } from '../../../services/translationService'

/**
 * Admin CMS for the Bangla/English interface copy. Every string shown by the
 * language toggle is editable here; Bengali stays the default and English is
 * the carefully written translation. No code change required to edit copy.
 */
export function TranslationAdminPanel() {
  const [entries, setEntries] = useState(() => translationService.getAll())
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setEntries(translationService.getAll())
    setSaved(false)
  }, [])

  const keys = useMemo(() => {
    const terms = query.toLocaleLowerCase('bn').split(/\s+/).filter(Boolean)
    return Object.keys(entries).filter((key) => {
      const entry = entries[key]
      const hay = `${key} ${entry.bn} ${entry.en}`.toLocaleLowerCase('bn')
      return terms.every((term) => hay.includes(term))
    }).sort()
  }, [entries, query])

  const update = (key: string, language: 'bn' | 'en', value: string) => {
    setEntries((prev) => ({ ...prev, [key]: { ...prev[key], [language]: value } }))
    setSaved(false)
  }

  const handleSave = () => {
    // Persist every entry so owner edits survive a reload and a re-deploy.
    translationService.saveAll(entries)
    setSaved(true)
  }

  const handleReset = () => {
    if (!window.confirm('সম্পাদিত অনুবাদ মুছে আসল অনুবাদে ফিরে যাবেন?')) return
    translationService.reset()
    setEntries({ ...DEFAULT_TRANSLATIONS })
    setSaved(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">অনুবাদ ব্যবস্থাপনা</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            হোমপেজের হেডারের EN / বাং বাটন এই অনুবাদগুলোই ব্যবহার করে। বাংলা ডিফল্ট; ইংরেজি যত্নসহকারে অনুবাদ করা।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
          >
            <RotateCcw size={14} /> আসলে ফিরুন
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Save size={14} /> সেভ করুন
          </button>
        </div>
      </div>

      {saved && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          অনুবাদ সেভ হয়েছে — হোমপেজে তাৎক্ষণিক প্রয়োগ হবে।
        </p>
      )}

      <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10">
        <Search size={15} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="কী বা key দিয়ে খুঁজুন..."
          className="w-full bg-transparent text-sm outline-none dark:text-white"
        />
      </label>

      <div className="space-y-2">
        {keys.map((key) => (
          <div key={key} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#1a2420] sm:grid-cols-3">
            <div>
              <p className="break-all font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">{key}</p>
              <p className="mt-1 text-[10px] text-slate-400">বাংলা (ডিফল্ট)</p>
            </div>
            <input
              value={entries[key].bn}
              onChange={(event) => update(key, 'bn', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label={`${key} Bangla`}
            />
            <input
              value={entries[key].en}
              onChange={(event) => update(key, 'en', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label={`${key} English`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
