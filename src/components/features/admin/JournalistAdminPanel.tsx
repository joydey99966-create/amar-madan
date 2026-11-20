import { useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { Journalist } from '../../../types'
import { publishBlockers } from '../../../utils/placeholderData'

interface Props {
  journalists: Journalist[]
  onSave: (list: Journalist[]) => void
}

const EMPTY = { name: '', mediaName: '', designation: '', phone: '', area: '' }

/** Admin CMS for the press-club journalist contacts. */
export function JournalistAdminPanel({ journalists, onSave }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) { setError('নাম লিখে দিন'); return }
    const blockers = publishBlockers({ phone: form.phone })
    if (blockers.length) { setError(`প্রকাশ ব্লক করা হয়েছে — ${blockers.join(' · ')}`); return }
    setError('')
    const record: Journalist = { ...form, id: editingId ?? `j-${Date.now()}` }
    onSave(editingId ? journalists.map((j) => (j.id === editingId ? record : j)) : [record, ...journalists])
    setForm(EMPTY); setEditingId(null); setShowForm(false)
  }

  const startEdit = (j: Journalist) => {
    setEditingId(j.id)
    setForm({ name: j.name, mediaName: j.mediaName, designation: j.designation, phone: j.phone, area: j.area })
    setShowForm(true)
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">সাংবাদিক পরিচালনা</h2>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY); setError('') }}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showForm ? 'ফর্ম বন্ধ' : 'নতুন সাংবাদিক'}
        </button>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      {showForm && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420] sm:grid-cols-2">
          {(Object.keys(EMPTY) as Array<keyof typeof EMPTY>).map((key) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{key}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              />
            </label>
          ))}
          <button type="submit" className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38] sm:col-span-2">
            সেভ করুন
          </button>
        </form>
      )}

      <div className="space-y-2">
        {journalists.length === 0 && <p className="py-8 text-center text-sm text-slate-500">কোনো সাংবাদিক নেই</p>}
        {journalists.map((j) => (
          <div key={j.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{j.name}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{j.mediaName} • {j.designation} • {j.area}</p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => startEdit(j)} aria-label="সম্পাদনা করুন" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"><Edit2 size={14} /></button>
              <button type="button" onClick={() => onSave(journalists.filter((x) => x.id !== j.id))} aria-label="মুছে ফেলুন" className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 dark:border-rose-900/40"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
