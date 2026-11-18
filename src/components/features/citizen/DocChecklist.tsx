import { useState } from 'react'
import { storageService } from '../../../services/storageService'

const KEY = 'amar-madan-doc-checklist'

/** A tickable "documents ready" checklist, remembered on this device only. */
export function DocChecklist({ serviceId, docs }: { serviceId: string; docs: string[] }) {
  const [checked, setChecked] = useState<string[]>(() => {
    const all = storageService.get<Record<string, string[]>>(KEY, {})
    return all[serviceId] ?? []
  })

  const toggle = (doc: string) => {
    const next = checked.includes(doc) ? checked.filter((d) => d !== doc) : [...checked, doc]
    setChecked(next)
    const all = storageService.get<Record<string, string[]>>(KEY, {})
    storageService.set(KEY, { ...all, [serviceId]: next })
  }

  if (docs.length === 0) return null
  const done = checked.length

  return (
    <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          প্রয়োজনীয় কাগজপত্র
        </p>
        <span className="text-[10px] font-semibold text-forest dark:text-emerald-300">
          {done}/{docs.length} প্রস্তুত
        </span>
      </div>
      <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
        {docs.map((doc) => (
          <li key={doc}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-0.5 transition hover:bg-white/60 dark:hover:bg-white/5">
              <input
                type="checkbox"
                checked={checked.includes(doc)}
                onChange={() => toggle(doc)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-forest"
              />
              <span className={checked.includes(doc) ? 'text-slate-400 line-through dark:text-slate-500' : ''}>
                {doc}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
