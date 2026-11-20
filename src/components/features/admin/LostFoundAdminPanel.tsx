import { useState } from 'react'
import { CheckCircle, Trash2, Eye, Plus } from 'lucide-react'
import { LostFoundItem } from '../../../types'
import { lostFoundSettingsService, LostFoundSettings } from '../../../services/lostFoundSettingsService'

interface LostFoundAdminPanelProps {
  items: LostFoundItem[]
  onDelete: (id: string) => void
  onApprove: (id: string) => void
  onAdd: (item: Omit<LostFoundItem, 'id' | 'postedAt'>) => void
}

export function LostFoundAdminPanel({ items, onDelete, onApprove, onAdd }: LostFoundAdminPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [type, setType] = useState<'হারানো' | 'প্রাপ্তি'>('হারানো')
  const [itemName, setItemName] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [settings, setSettings] = useState<LostFoundSettings>(() => lostFoundSettingsService.getSettings())

  const handleMaskMode = (mode: LostFoundSettings['nidMaskMode']) => {
    setSettings(lostFoundSettingsService.saveSettings({ ...settings, nidMaskMode: mode }))
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !phone.trim()) return
    onAdd({
      type,
      itemName: itemName.trim(),
      location: location.trim() || 'মদন',
      date: date.trim() || 'আজ',
      description: description.trim(),
      phone: phone.trim(),
    })
    setItemName('')
    setLocation('')
    setDate('')
    setDescription('')
    setPhone('')
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">হারানো-প্রাপ্তি পরিচালনা</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showAddForm ? 'ফর্ম বন্ধ' : 'নতুন যোগ'}
        </button>
      </div>

      {/* Admin-controlled NID privacy rule — public cards never show a full NID. */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
        <label htmlFor="nid-mask-mode" className="font-semibold">এনআইডি নম্বর প্রদর্শন নীতি</label>
        <p className="mt-0.5 text-[11px] opacity-80">পাবলিক কার্ডে কখনো পুরো এনআইডি নম্বর দেখানো হয় না।</p>
        <select
          id="nid-mask-mode"
          value={settings.nidMaskMode}
          onChange={(e) => handleMaskMode(e.target.value as LostFoundSettings['nidMaskMode'])}
          className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm dark:border-amber-800 dark:bg-[#0f1411] dark:text-white"
        >
          <option value="hide">কোনো নম্বর দেখাবেন না (তথ্য যাচাই চলছে)</option>
          <option value="last4">শেষ ৪ ডিজিট মাস্ক করে দেখান</option>
        </select>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'হারানো' | 'প্রাপ্তি')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            >
              <option value="হারানো">হারানো</option>
              <option value="প্রাপ্তি">প্রাপ্তি</option>
            </select>
            <input
              type="text"
              placeholder="আইটেমের নাম"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="লোকেশন"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
            <input
              type="text"
              placeholder="তারিখ (যেমন: ১২ নভেম্বর)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </div>
          <textarea
            placeholder="বিবরণ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
          <input
            type="tel"
            placeholder="ফোন নম্বর"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            যোগ করুন
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Eye size={32} className="text-slate-400 mb-2" />
          <p className="text-slate-500 dark:text-slate-400">কোনো পোস্ট নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-white">{item.itemName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      item.type === 'হারানো'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {item.type}
                  </span>
                  {item.isApproved && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      অনুমোদিত
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.location} • {item.date} • ফোন: {item.phone}
                </p>
                <p className="mt-1 text-xs text-slate-400">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {!item.isApproved && (
                  <button
                    onClick={() => onApprove(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                    title="অনুমোদন করুন"
                    aria-label="অনুমোদন করুন"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                  title="মুছে ফেলুন"
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
  )
}
