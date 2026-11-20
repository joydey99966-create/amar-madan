import { useState } from 'react'
import { CheckCircle2, Edit2, Eye, EyeOff, Plus, Trash2, XCircle } from 'lucide-react'
import {
  MANAGED_RECORD_TYPES,
  ManagedRecordType,
  recordsService,
} from '../../../services/recordsService'

interface ManagedRecord {
  id: string
  approved?: boolean
  visible?: boolean
  [key: string]: unknown
}

type FieldType = 'text' | 'textarea' | 'select' | 'checkbox'

interface FieldSpec {
  key: string
  label: string
  type?: FieldType
  options?: string[]
  placeholder?: string
  /** Comma separated values are split into an array. */
  list?: boolean
}

interface TypeSpec {
  fields: FieldSpec[]
  /** Builds a full record from the form values. */
  build: (values: Record<string, string | boolean>) => Record<string, unknown>
  /** One-line summary shown in the list. */
  summary: (record: ManagedRecord) => string
}

const HOSPITAL_TYPES = [
  'উপজেলা স্বাস্থ্য কমপ্লেক্স',
  'কমিউনিটি ক্লিনিক',
  'বেসরকারি ক্লিনিক',
  'ডায়াগনস্টিক সেন্টার',
]

const EDUCATION_TYPES = ['কলেজ', 'স্কুল', 'মাদরাসা', 'কোচিং', 'আইটি সেন্টার']

const TRANSPORT_MODES = ['বাস', 'বোট', 'রিকশা', 'সিএনজি', 'মাইক্রোবাস', 'অটোরিকশা', 'মিশ্র যাতায়াত']

const SPECS: Record<ManagedRecordType, TypeSpec> = {
  hospitals: {
    fields: [
      { key: 'name', label: 'প্রতিষ্ঠানের নাম' },
      { key: 'type', label: 'ধরন', type: 'select', options: HOSPITAL_TYPES },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'services', label: 'সেবাসমূহ (কমা দিয়ে)', type: 'textarea', list: true },
      { key: 'openingHours', label: 'খোলার সময়' },
      { key: 'beds', label: 'শয্যা সংখ্যা' },
      { key: 'emergency', label: 'জরুরি সেবা আছে', type: 'checkbox' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? HOSPITAL_TYPES[0]),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      services: String(values.services ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      beds: Number(values.beds ?? 0) || undefined,
      emergency: Boolean(values.emergency),
      openingHours: String(values.openingHours ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) =>
      `${record.type ?? ''} • ${record.address ?? ''} • ${record.phone ?? ''}`,
  },
  education: {
    fields: [
      { key: 'name', label: 'প্রতিষ্ঠানের নাম' },
      { key: 'type', label: 'ধরন', type: 'select', options: EDUCATION_TYPES },
      { key: 'area', label: 'এলাকা' },
      { key: 'headName', label: 'প্রধান' },
      { key: 'eiin', label: 'EIIN' },
      { key: 'phone', label: 'ফোন নম্বর' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? EDUCATION_TYPES[0]),
      area: String(values.area ?? ''),
      headName: String(values.headName ?? ''),
      eiin: String(values.eiin ?? '').trim() || null,
      phone: String(values.phone ?? ''),
    }),
    summary: (record) =>
      `${record.type ?? ''} • ${record.area ?? ''} • ${record.headName ?? ''}`,
  },
  fishPrices: {
    fields: [
      { key: 'itemName', label: 'মাছের নাম' },
      { key: 'wholesalePrice', label: 'পাইকারি দাম' },
      { key: 'retailPrice', label: 'খুচরা দাম' },
      { key: 'unit', label: 'একক' },
    ],
    build: (values) => ({
      itemName: String(values.itemName ?? ''),
      wholesalePrice: String(values.wholesalePrice ?? ''),
      retailPrice: String(values.retailPrice ?? ''),
      unit: String(values.unit ?? ''),
      trend: 'stable',
      updated: 'আজ',
      date: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) =>
      `পাইকারি ${record.wholesalePrice ?? ''} • খুচরা ${record.retailPrice ?? ''} • ${record.unit ?? ''}`,
  },
  routes: {
    fields: [
      { key: 'name', label: 'রুটের নাম' },
      { key: 'mode', label: 'যাতায়াতের ধরন', type: 'select', options: TRANSPORT_MODES },
      { key: 'from', label: 'যাত্রার শুরু' },
      { key: 'to', label: 'গন্তব্য' },
      { key: 'fare', label: 'ভাড়া' },
      { key: 'distance', label: 'দূরত্ব' },
      { key: 'schedule', label: 'সময়সূচি (কমা দিয়ে)', type: 'textarea', list: true },
      { key: 'phone', label: 'ফোন নম্বর' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      mode: String(values.mode ?? TRANSPORT_MODES[0]),
      from: String(values.from ?? ''),
      to: String(values.to ?? ''),
      fare: String(values.fare ?? ''),
      distance: String(values.distance ?? ''),
      schedule: String(values.schedule ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      phone: String(values.phone ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) =>
      `${record.mode ?? ''} • ${record.fare ?? ''} • ${record.from ?? ''} → ${record.to ?? ''}`,
  },
  citizens: {
    fields: [
      { key: 'name', label: 'সেবার নাম' },
      { key: 'office', label: 'অফিস' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'fee', label: 'ফি' },
      { key: 'processingTime', label: 'সময় লাগে' },
      { key: 'requiredDocs', label: 'প্রয়োজনীয় কাগজ (কমা দিয়ে)', type: 'textarea', list: true },
      { key: 'steps', label: 'যেভাবে আবেদন করবেন (কমা দিয়ে)', type: 'textarea', list: true },
      { key: 'online', label: 'অনলাইন আবেদনের লিংক (থাকলে)' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      office: String(values.office ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      fee: String(values.fee ?? ''),
      processingTime: String(values.processingTime ?? ''),
      requiredDocs: String(values.requiredDocs ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      steps: String(values.steps ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      online: String(values.online ?? '').trim() || undefined,
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.office ?? ''} • ${record.fee ?? ''}`,
  },
  machinery: {
    fields: [
      { key: 'name', label: 'যন্ত্রপাতির নাম' },
      { key: 'price', label: 'ভাড়া' },
      { key: 'area', label: 'এলাকা' },
      { key: 'phone', label: 'মালিকের ফোন' },
      { key: 'ownerName', label: 'মালিকের নাম' },
      {
        key: 'availability',
        label: 'অবস্থা',
        type: 'select',
        options: ['available', 'busy', 'offline'],
      },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      price: String(values.price ?? ''),
      area: String(values.area ?? ''),
      phone: String(values.phone ?? ''),
      ownerName: String(values.ownerName ?? ''),
      availability: (['available', 'busy', 'offline'].includes(String(values.availability))
        ? String(values.availability)
        : 'available') as 'available' | 'busy' | 'offline',
    }),
    summary: (record) => `${record.price ?? ''} • ${record.area ?? ''} • ${record.phone ?? 'ফোন নেই'}`,
  },
  banks: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
  pharmacies: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
  government: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
  mechanics: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
  agriculture: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
  veterinary: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
  postal: {
    fields: [
      { key: 'name', label: 'নাম' },
      { key: 'type', label: 'ধরন' },
      { key: 'area', label: 'এলাকা' },
      { key: 'address', label: 'ঠিকানা' },
      { key: 'phone', label: 'ফোন নম্বর' },
      { key: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ],
    build: (values) => ({
      name: String(values.name ?? ''),
      type: String(values.type ?? ''),
      area: String(values.area ?? ''),
      address: String(values.address ?? ''),
      phone: String(values.phone ?? ''),
      details: String(values.details ?? ''),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }),
    summary: (record) => `${record.type ?? ''} • ${record.area ?? ''} • ${record.phone ?? ''}`,
  },
}
interface RecordsAdminPanelProps {
  /** Called after every change so the dashboard and the site can refresh. */
  onChange: () => void
}

/**
 * Admin CMS for the remaining counted lists (hospitals, schools, haor fish
 * prices, transport routes, citizen services and agro machinery). Every change
 * here moves the homepage counters by one, with no code change.
 */
export function RecordsAdminPanel({ onChange }: RecordsAdminPanelProps) {
  const [type, setType] = useState<ManagedRecordType>('hospitals')
  const [showForm, setShowForm] = useState(false)
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const spec = SPECS[type]
  const records = recordsService.all<ManagedRecord>(type)

  const resetForm = () => {
    setValues({})
    setEditingId(null)
    setError('')
    setShowForm(false)
  }

  const update = (key: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!String(values.name ?? values.itemName ?? '').trim()) {
      setError('নাম লিখে দিন')
      return
    }
    const record = spec.build(values)
    if (editingId) recordsService.update(type, editingId, record)
    // The admin authors the record, so it is published right away.
    else recordsService.add(type, { ...record, approved: true, visible: true })
    resetForm()
    onChange()
  }

  const startEdit = (record: ManagedRecord) => {
    setEditingId(record.id)
    setValues(
      Object.fromEntries(
        spec.fields.map((field) => {
          const value = record[field.key]
          if (field.type === 'checkbox') return [field.key, Boolean(value)]
          if (Array.isArray(value)) return [field.key, value.join(', ')]
          return [field.key, value === undefined || value === null ? '' : String(value)]
        }),
      ),
    )
    setError('')
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">সেবার তথ্য পরিচালনা</h2>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন এন্ট্রি'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-1 dark:border-white/10">
        {MANAGED_RECORD_TYPES.map((info) => (
          <button
            key={info.id}
            onClick={() => {
              setType(info.id)
              resetForm()
            }}
            className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-xs font-semibold transition ${
              type === info.id
                ? 'border-b-2 border-forest font-semibold text-forest dark:border-emerald-400 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {info.label} ({recordsService.all<ManagedRecord>(info.id).length})
          </button>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {editingId ? 'এন্ট্রি সম্পাদনা' : 'নতুন এন্ট্রি'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {spec.fields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {field.label}
                </span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={String(values[field.key] ?? '')}
                    onChange={(e) => update(field.key, e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={String(values[field.key] ?? field.options?.[0] ?? '')}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.key])}
                    onChange={(e) => update(field.key, e.target.checked)}
                    className="h-4 w-4 accent-forest"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(values[field.key] ?? '')}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                  />
                )}
              </label>
            ))}
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

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Eye size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">কোনো এন্ট্রি নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {String(record.name ?? record.itemName ?? '')}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      record.approved === false
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}
                  >
                    {record.approved === false ? 'অপেক্ষমাণ' : 'অনুমোদিত'}
                  </span>
                  {record.visible === false && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      লুকানো
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {spec.summary(record)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => {
                    recordsService.update(type, record.id, { approved: record.approved === false })
                    onChange()
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40"
                  title={record.approved === false ? 'অনুমোদন করুন' : 'অনুমোদন বাতিল'}
                  aria-label={record.approved === false ? 'অনুমোদন করুন' : 'অনুমোদন বাতিল'}
                >
                  {record.approved === false ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </button>
                <button
                  onClick={() => {
                    recordsService.update(type, record.id, { visible: record.visible === false })
                    onChange()
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                  title={record.visible === false ? 'দেখান' : 'লুকান'}
                  aria-label={record.visible === false ? 'দেখান' : 'লুকান'}
                >
                  {record.visible === false ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => startEdit(record)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                  aria-label="সম্পাদনা করুন"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm('এই এন্ট্রিটি মুছে ফেলুন?\n\nএই কাজটি ফিরিয়ে আনা যাবে না।')
                    ) {
                      recordsService.remove(type, record.id)
                      onChange()
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
  )
}
