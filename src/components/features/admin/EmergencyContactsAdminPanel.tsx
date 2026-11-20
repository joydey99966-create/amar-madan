import { useState } from 'react'
import { Check, CheckCircle2, Edit2, Eye, EyeOff, Phone, Plus, Trash2, XCircle } from 'lucide-react'
import { EmergencyContact } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'
import { publishBlockers } from '../../../utils/placeholderData'
import { EMERGENCY_CATEGORIES, emergencyVisual } from '../../../constants'

interface EmergencyContactsAdminPanelProps {
  contacts: EmergencyContact[]
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void
  onEdit: (id: string, contact: Partial<Omit<EmergencyContact, 'id'>>) => void
  onDelete: (id: string) => void
  onApprove: (id: string, approved: boolean) => void
  onVisibility: (id: string, visible: boolean) => void
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  dial: '',
  category: 'other' as EmergencyContact['category'],
  visible: true,
}

/**
 * Admin CMS for emergency contacts.
 *
 * Every public surface reads the same stored list, so saving here updates the
 * homepage, footer, emergency page, directory, services and profile at once.
 */
export function EmergencyContactsAdminPanel({
  contacts,
  onAdd,
  onEdit,
  onDelete,
  onApprove,
  onVisibility,
}: EmergencyContactsAdminPanelProps) {
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('সেবার নাম দিন')
      return
    }
    if (!form.phone.trim()) {
      setError('ফোন নম্বর দিন')
      return
    }
    const blockers = publishBlockers({ phone: form.phone, dial: form.dial || form.phone })
    if (blockers.length) {
      setError(`প্রকাশ ব্লক করা হয়েছে — ${blockers.join(' · ')}`)
      return
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      dial: (form.dial || form.phone).replace(/[^\d+]/g, ''),
      category: form.category,
      visible: form.visible,
    }
    if (editingId) onEdit(editingId, payload)
    else onAdd({ ...payload, approved: false })
    resetForm()
  }

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id)
    setForm({
      name: contact.name,
      phone: contact.phone,
      dial: contact.dial,
      category: contact.category,
      visible: contact.visible,
    })
    setError('')
    setShowForm(true)
  }

  const pendingCount = contacts.filter((contact) => !contact.approved).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">জরুরি যোগাযোগ</h2>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন যোগাযোগ'}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        এখানে বদলালে হোম, ফুটার, জরুরি পেজ, ডিরেক্টরি, সেবা ও প্রোফাইল — সব জায়গায় সঙ্গে সঙ্গে বদলে যাবে।
        {pendingCount > 0 ? ` ${toBanglaNumber(pendingCount)} টি নতুন যোগাযোগ অনুমোদনের অপেক্ষায়।` : ''}
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {editingId ? 'যোগাযোগ সম্পাদনা' : 'নতুন জরুরি যোগাযোগ'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="সেবার নাম (যেমন: ফায়ার সার্ভিস)"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
            <input
              type="text"
              placeholder="দেখানো নম্বর (বাংলা অঙ্কে)"
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="ডায়াল নম্বর (ইংরেজি অঙ্কে)"
              value={form.dial}
              onChange={(e) => update({ dial: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
            <select
              value={form.category}
              onChange={(e) => update({ category: e.target.value as EmergencyContact['category'] })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label="ক্যাটাগরি"
            >
              {EMERGENCY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => update({ visible: e.target.checked })}
            />
            পাবলিকে প্রদর্শন করুন
          </label>
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            সংরక్షণ করুন
          </button>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Phone size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">কোনো জরুরি যোগাযোগ নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const visual = emergencyVisual(contact.category)
            return (
              <div
                key={contact.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
              >
                <div className="text-xl">{visual.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-white">{contact.name}</span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                      {contact.phone}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {contact.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        contact.approved
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {contact.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                    </span>
                    {!contact.visible && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        লুকানো
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">dial: {contact.dial}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => onApprove(contact.id, !contact.approved)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40"
                    title={contact.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                    aria-label={contact.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                  >
                    {contact.approved ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  </button>
                  <button
                    onClick={() => onVisibility(contact.id, !contact.visible)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                    title={contact.visible ? 'লুকান' : 'দেখান'}
                    aria-label={contact.visible ? 'লুকান' : 'দেখান'}
                  >
                    {contact.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => startEdit(contact)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                    aria-label="সম্পাদনা করুন"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(contact.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                    aria-label="মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
        <Check size={13} /> প্রতিটি পরিবর্তন সবার জন্য একই সাথে প্রযোজ্য হয়।
      </p>
    </div>
  )
}
