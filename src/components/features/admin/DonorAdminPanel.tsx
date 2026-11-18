import { useState } from 'react'
import { CheckCircle2, Edit2, Eye, EyeOff, Plus, Trash2, XCircle } from 'lucide-react'
import { BloodDonor } from '../../../types'
import { toBanglaNumber } from '../../../utils/formatters'
import { getDonorStatus } from '../../../services/bloodDonorService'

interface DonorAdminPanelProps {
  donors: BloodDonor[]
  onDelete: (id: string) => void
  onAdd: (donor: Omit<BloodDonor, 'id'>) => void
  onEdit: (id: string, donor: Partial<Omit<BloodDonor, 'id'>>) => void
  onApprove: (id: string, approved: boolean) => void
  onVisibility: (id: string, visible: boolean) => void
}

const EMPTY_FORM = {
  name: '',
  bloodGroup: 'O+' as BloodDonor['bloodGroup'],
  unionArea: 'মদন পৌরসভা',
  phone: '',
  lastDonationDate: '',
  availability: 'available' as 'available' | 'busy',
  visible: true,
}

/**
 * Admin CMS for donors. Donation dates and readiness are owned here, so the
 * public directory, filters and "Available only" view stay in sync.
 */
export function DonorAdminPanel({
  donors,
  onDelete,
  onAdd,
  onEdit,
  onApprove,
  onVisibility,
}: DonorAdminPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError('')
    setShowAddForm(false)
  }

  const update = (patch: Partial<typeof EMPTY_FORM>) => setForm((prev) => ({ ...prev, ...patch }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('নাম ও ফোন নম্বর আবশ্যক')
      return
    }
    const payload = {
      name: form.name.trim(),
      bloodGroup: form.bloodGroup,
      unionArea: form.unionArea.trim() || 'মদন পৌরসভা',
      phone: form.phone.trim(),
      lastDonationDate: form.lastDonationDate || null,
      availability: form.availability,
      visible: form.visible,
    }
    if (editingId) onEdit(editingId, payload)
    else onAdd({ ...payload, approved: false })
    resetForm()
  }

  const startEdit = (donor: BloodDonor) => {
    setEditingId(donor.id)
    setForm({
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      unionArea: donor.unionArea,
      phone: donor.phone,
      lastDonationDate: donor.lastDonationDate ?? '',
      availability: donor.availability ?? 'available',
      visible: donor.visible !== false,
    })
    setError('')
    setShowAddForm(true)
  }

  const pendingCount = donors.filter((donor) => !donor.approved).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">রক্তদাতা পরিচালনা</h2>
        <button
          onClick={() => (showAddForm ? resetForm() : setShowAddForm(true))}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন যোগ করুন'}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        শেষ রক্তদানের তারিখ বদলালে ৫৬-দিনের হিসাব সঙ্গে সঙ্গে বদলে যাবে। তারিখ না থাকলে দাতা «তথ্য যাচাই চলছে» থাকবেন — কখনো «প্রস্তুত» নয়।
        {pendingCount > 0 ? ` ${toBanglaNumber(pendingCount)} জন অনুমোদনের অপেক্ষায়।` : ''}
      </p>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {editingId ? 'রক্তদাতা সম্পাদনা' : 'নতুন রক্তদাতা যোগ করুন'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="নাম"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
            <input
              type="tel"
              placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.bloodGroup}
              onChange={(e) => update({ bloodGroup: e.target.value as BloodDonor['bloodGroup'] })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            >
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const).map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="এলাকা"
              value={form.unionArea}
              onChange={(e) => update({ unionArea: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                শেষ রক্তদানের তারিখ (যদি থাকে)
              </label>
              <input
                type="date"
                value={form.lastDonationDate}
                onChange={(e) => update({ lastDonationDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                অ্যাভেইলবিলিটি / স্ট্যাটাস
              </label>
              <select
                value={form.availability}
                onChange={(e) => update({ availability: e.target.value as 'available' | 'busy' })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              >
                <option value="available">উপলব্ধ / প্রস্তুত</option>
                <option value="busy">ব্যস্ত / অনুপলব্ধ</option>
              </select>
            </div>
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
            সংরক্ষণ করুন
          </button>
        </form>
      )}

      {donors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Eye size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">কোনো রক্তদাতা নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {donors.map((donor) => {
            const status = getDonorStatus(donor)
            return (
              <div
                key={donor.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-white">{donor.name}</span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                      {donor.bloodGroup}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        status.isAvailable
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      {status.availabilityBadge}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        donor.approved
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {donor.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                    </span>
                    {donor.visible === false && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        লুকানো
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {donor.unionArea} • {donor.phone}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {donor.lastDonationDate ? `শেষ রক্তদান: ${donor.lastDonationDate}` : 'শেষ রক্তদানের তারিখ নেই'}
                    {status.status === 'waiting' ? ` • ${toBanglaNumber(status.daysRemaining)} দিন বাকি` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => onApprove(donor.id, !donor.approved)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40"
                    title={donor.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                    aria-label={donor.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                  >
                    {donor.approved ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  </button>
                  <button
                    onClick={() => onVisibility(donor.id, !donor.visible)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                    title={donor.visible !== false ? 'লুকান' : 'দেখান'}
                    aria-label={donor.visible !== false ? 'লুকান' : 'দেখান'}
                  >
                    {donor.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => startEdit(donor)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                    aria-label="সম্পাদনা করুন"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(donor.id)}
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
    </div>
  )
}
