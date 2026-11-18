import { useState } from 'react'
import { Check, CheckCircle2, Edit2, Plus, Search, Trash2, XCircle } from 'lucide-react'
import {
  SEARCH_KINDS,
  SEARCH_LABELS,
  SearchKind,
} from '../../../utils/search'
import {
  CustomSearchItem,
  SearchSettings,
  searchSettingsService,
} from '../../../services/searchSettingsService'
import { toBanglaNumber } from '../../../utils/formatters'

interface SearchAdminPanelProps {
  settings: SearchSettings
  onChange: (settings: SearchSettings) => void
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  kind: 'price' as SearchKind,
  query: '',
}

/**
 * Admin controls for the global search: per-section switches and custom
 * searchable records with an approve step. Follows the existing admin panels.
 */
export function SearchAdminPanel({ settings, onChange }: SearchAdminPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError('')
    setShowForm(false)
  }

  const update = (patch: Partial<typeof EMPTY_FORM>) => setForm((prev) => ({ ...prev, ...patch }))

  const handleToggle = (kind: SearchKind, enabled: boolean) => {
    onChange(searchSettingsService.setSectionEnabled(kind, enabled))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('ফলাফলের শিরোনাম দিন')
      return
    }
    if (!form.query.trim()) {
      setError('খোঁজার শব্দ দিন (যেটি দিয়ে সেকশনে ফিল্টার হবে)')
      return
    }
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || SEARCH_LABELS[form.kind],
      kind: form.kind,
      query: form.query.trim(),
    }
    onChange(editingId ? searchSettingsService.updateCustomItem(editingId, payload) : searchSettingsService.addCustomItem(payload))
    resetForm()
  }

  const startEdit = (item: CustomSearchItem) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      subtitle: item.subtitle,
      kind: item.kind,
      query: item.query,
    })
    setError('')
    setShowForm(true)
  }

  const pendingCount = settings.customItems.filter((item) => !item.approved).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">সার্চ ব্যবস্থাপনা</h2>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন আইটেম'}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        যে সেকশন বন্ধ দেবেন সেটি গ্লোবাল সার্চে দেখাবে না। নতুন আইটেম অনুমোদনের পরেই পাবলিক ফলাফলে যোগ হবে।
        {pendingCount > 0 ? ` ${toBanglaNumber(pendingCount)} টি আইটেম অনুমোদনের অপেক্ষায়।` : ''}
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {editingId ? 'আইটেম সম্পাদনা' : 'নতুন সার্চ আইটেম'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="ফলাফলের শিরোনাম"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
            <input
              type="text"
              placeholder="ছোট বিবরণ"
              value={form.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.kind}
              onChange={(e) => update({ kind: e.target.value as SearchKind })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label="সার্চ সেকশন"
            >
              {SEARCH_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {SEARCH_LABELS[kind]}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="খোঁজার শব্দ (যেমন: চাল)"
              value={form.query}
              onChange={(e) => update({ query: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
          </div>
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            সংরক্ষণ করুন
          </button>
        </form>
      )}

      {/* Section switches */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-white">সার্চে সেকশন</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {SEARCH_KINDS.map((kind) => {
            const enabled = settings.sections[kind] !== false
            return (
              <label
                key={kind}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10"
              >
                <span className="text-slate-700 dark:text-slate-200">{SEARCH_LABELS[kind]}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${SEARCH_LABELS[kind]} সার্চে ${enabled ? 'চালু' : 'বন্ধ'}`}
                  onClick={() => handleToggle(kind, !enabled)}
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition ${
                    enabled ? 'bg-forest' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            )
          })}
        </div>
      </div>

      {/* Custom items */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Search size={15} /> কাস্টম সার্চ আইটেম
        </h3>
        {settings.customItems.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
            এখনো কোনো কাস্টম আইটেম নেই।
          </p>
        ) : (
          <div className="space-y-2">
            {settings.customItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{item.title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {SEARCH_LABELS[item.kind]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.approved
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {item.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.subtitle} · খোঁজার শব্দ: {item.query}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() =>
                      onChange(searchSettingsService.approveCustomItem(item.id, !item.approved))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40"
                    title={item.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                    aria-label={item.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                  >
                    {item.approved ? <XCircle size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                    aria-label="সম্পাদনা করুন"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm('এই কাস্টম সার্চ আইটেমটি মুছে ফেলুন?\n\nএই কাজটি ফিরিয়ে আনা যাবে না।')
                      ) {
                        onChange(searchSettingsService.deleteCustomItem(item.id))
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                    aria-label="মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
        <CheckCircle2 size={13} /> পরিবর্তনগুলো সঙ্গে সঙ্গে হোমপেজের সার্চে প্রয়োগ হয়।
      </p>
    </div>
  )
}
