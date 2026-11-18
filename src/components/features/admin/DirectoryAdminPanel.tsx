import { useState } from 'react'
import { Plus, Trash2, Check, Eye, EyeOff, Pencil, X } from 'lucide-react'
import { Doctor, Ambulance, ServiceProvider } from '../../../types'
import { DOCTOR_SPECIALTIES, doctorSpecialty } from '../../../utils/doctorMeta'

interface DirectoryAdminPanelProps {
  doctors: Doctor[]
  ambulances: Ambulance[]
  dealers: ServiceProvider[]
  onDeleteDoctor: (id: string) => void
  onDeleteAmbulance: (id: string) => void
  onDeleteDealer: (id: string) => void
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void
  onAddAmbulance: (ambulance: Omit<Ambulance, 'id'>) => void
  onAddDealer: (dealer: Omit<ServiceProvider, 'id'>) => void
  onEditDoctor: (id: string, patch: Partial<Doctor>) => void
  onApproveDoctor: (id: string, approved: boolean) => void
  onDoctorVisibility: (id: string, visible: boolean) => void
}

export function DirectoryAdminPanel({
  doctors,
  ambulances,
  dealers,
  onDeleteDoctor,
  onDeleteAmbulance,
  onDeleteDealer,
  onAddDoctor,
  onAddAmbulance,
  onAddDealer,
  onEditDoctor,
  onApproveDoctor,
  onDoctorVisibility,
}: DirectoryAdminPanelProps) {
  const [subTab, setSubTab] = useState<'doctors' | 'ambulance' | 'agro'>('doctors')
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [area, setArea] = useState('মদন পৌরসভা')
  const [phone, setPhone] = useState('')
  const [newSpecialty, setNewSpecialty] = useState<string>(DOCTOR_SPECIALTIES[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Doctor>>({})

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    if (subTab === 'doctors') {
      onAddDoctor({
        name: name.trim(),
        specialty: newSpecialty as Doctor['specialty'],
        chamber: details.trim() || 'মদন',
        area: area.trim() || 'মদন পৌরসভা',
        visitingHours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
        phone: phone.trim(),
      })
    } else if (subTab === 'ambulance') {
      onAddAmbulance({
        name: name.trim(),
        vehicleType: 'AC',
        area: area.trim() || 'মদন পৌরসভা',
        phone: phone.trim(),
        driverName: details.trim() || name.trim(),
      })
    } else {
      onAddDealer({
        name: name.trim(),
        details: details.trim() || name.trim(),
        area: area.trim() || 'মদন পৌরসভা',
        phone: phone.trim(),
        category: 'agro',
      })
    }
    setName('')
    setDetails('')
    setArea('মদন পৌরসভা')
    setPhone('')
    setShowAddForm(false)
  }

  const startEdit = (doctor: Doctor) => {
    setEditingId(doctor.id)
    setDraft({
      name: doctor.name,
      specialty: doctorSpecialty(doctor),
      chamber: doctor.chamber,
      area: doctor.area,
      phone: doctor.phone,
      fee: doctor.fee ?? '',
      visitingDays: doctor.visitingDays ?? '',
      registration: doctor.registration ?? '',
      visitingHours: doctor.visitingHours ?? '',
    })
  }

  const saveEdit = () => {
    if (!editingId || !draft.name?.trim()) return
    onEditDoctor(editingId, draft)
    setEditingId(null)
    setDraft({})
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white'

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'doctors', label: 'ডাক্তার' },
          { id: 'ambulance', label: 'অ্যাম্বুলেন্স' },
          { id: 'agro', label: 'এগ্রো ডিলার' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as typeof subTab)}
            className={`px-4 py-2 text-sm font-medium transition ${
              subTab === tab.id
                ? 'border-b-2 border-forest font-semibold text-forest dark:border-emerald-400 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          {subTab === 'doctors' ? 'ডাক্তার' : subTab === 'ambulance' ? 'অ্যাম্বুলেন্স' : 'এগ্রো ডিলার'} পরিচালনা
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            মোট {subTab === 'doctors' ? doctors.length : subTab === 'ambulance' ? ambulances.length : dealers.length} টি এন্ট্রি
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Plus size={14} /> {showAddForm ? 'ফর্ম বন্ধ' : 'নতুন যোগ'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">নতুন এন্ট্রি যোগ করুন</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="text"
              placeholder={subTab === 'doctors' ? 'চেম্বার' : subTab === 'ambulance' ? 'চালকের নাম' : 'বিবরণ'}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={inputClass}
            />
          </div>
          {subTab === 'doctors' && (
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">বিশেষত্ব</label>
              <select
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                className={inputClass}
              >
                {DOCTOR_SPECIALTIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="এলাকা"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="ফোন নম্বর"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            যোগ করুন
          </button>
        </form>
      )}

      {subTab === 'doctors' && (
        <div className="space-y-2">
          {doctors.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
              {editingId === doc.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="নাম" className={inputClass} />
                    <select
                      value={draft.specialty ?? 'মেডিসিন'}
                      onChange={(e) => setDraft({ ...draft, specialty: e.target.value as Doctor['specialty'] })}
                      className={inputClass}
                    >
                      {DOCTOR_SPECIALTIES.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <input value={draft.chamber ?? ''} onChange={(e) => setDraft({ ...draft, chamber: e.target.value })} placeholder="চেম্বার" className={inputClass} />
                    <input value={draft.area ?? ''} onChange={(e) => setDraft({ ...draft, area: e.target.value })} placeholder="এলাকা" className={inputClass} />
                    <input value={draft.phone ?? ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="ফোন" className={inputClass} />
                    <input value={draft.fee ?? ''} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} placeholder="পরামর্শ ফি" className={inputClass} />
                    <input value={draft.visitingDays ?? ''} onChange={(e) => setDraft({ ...draft, visitingDays: e.target.value })} placeholder="চেম্বারের দিন" className={inputClass} />
                    <input value={draft.visitingHours ?? ''} onChange={(e) => setDraft({ ...draft, visitingHours: e.target.value })} placeholder="চেম্বারের সময়" className={inputClass} />
                    <input value={draft.registration ?? ''} onChange={(e) => setDraft({ ...draft, registration: e.target.value })} placeholder="নিবন্ধন নম্বর" className={inputClass} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveEdit}
                      className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
                    >
                      সেভ করুন
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setDraft({}) }}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300"
                    >
                      <X size={14} /> বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-white">{doc.name}</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {doctorSpecialty(doc)} • {doc.chamber} • {doc.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveDoctor(doc.id, doc.approved === false)}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                        doc.approved === false
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}
                    >
                      <Check size={13} /> {doc.approved === false ? 'অনুমোদন' : 'অনুমোদিত'}
                    </button>
                    <button
                      onClick={() => onDoctorVisibility(doc.id, doc.visible === false)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      {doc.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                      {doc.visible === false ? 'লুকানো' : 'দেখানো'}
                    </button>
                    <button
                      onClick={() => startEdit(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                      aria-label="সম্পাদনা"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteDoctor(doc.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                      aria-label="মুছে ফেলুন"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {subTab === 'ambulance' && (
        <div className="space-y-2">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-white">{amb.name}</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {amb.vehicleType} • চালক: {amb.driverName} • {amb.phone}
                </p>
              </div>
              <button
                onClick={() => onDeleteAmbulance(amb.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                aria-label="মুছে ফেলুন"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'agro' && (
        <div className="space-y-2">
          {dealers.map((dealer) => (
            <div
              key={dealer.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-white">{dealer.name}</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {dealer.details} • {dealer.area} • {dealer.phone}
                </p>
              </div>
              <button
                onClick={() => onDeleteDealer(dealer.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                aria-label="মুছে ফেলুন"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
