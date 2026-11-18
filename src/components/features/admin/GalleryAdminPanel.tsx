import { useState } from 'react'
import { Edit2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { GalleryPhoto } from '../../../types'
import { formatBanglaToday } from '../../../utils/formatters'

interface GalleryAdminPanelProps {
  photos: GalleryPhoto[]
  onAdd: (photo: Omit<GalleryPhoto, 'id'>) => void
  onEdit: (id: string, photo: Omit<GalleryPhoto, 'id'>) => void
  onDelete: (id: string) => void
}

const EMPTY_FORM = {
  src: '',
  caption: '',
  alt: '',
  credit: '',
  license: 'CC BY-SA 4.0',
  source: '',
}

/**
 * CMS panel for the "ছবিতে মদন" gallery.
 *
 * The admin adds an image URL, a caption and the photographer credit; the
 * homepage gallery renders the list the moment it is saved.
 */
export function GalleryAdminPanel({ photos, onAdd, onEdit, onDelete }: GalleryAdminPanelProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.src.trim()) {
      setError('ছবির ঠিকানা (URL) দিন')
      return
    }
    if (!form.caption.trim()) {
      setError('ছবির ক্যাপশন দিন')
      return
    }
    const photo: Omit<GalleryPhoto, 'id'> = {
      src: form.src.trim(),
      caption: form.caption.trim(),
      alt: form.alt.trim() || form.caption.trim(),
      credit: form.credit.trim() || 'অজানা',
      license: form.license.trim() || 'CC BY-SA 4.0',
      source: form.source.trim() || undefined,
    }
    if (editingId) onEdit(editingId, photo)
    else onAdd(photo)
    resetForm()
  }

  const startEdit = (photo: GalleryPhoto) => {
    setEditingId(photo.id)
    setForm({
      src: photo.src,
      caption: photo.caption,
      alt: photo.alt,
      credit: photo.credit,
      license: photo.license,
      source: photo.source ?? '',
    })
    setError('')
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ছবিতে মদন গ্যালারি</h2>
        <button
          onClick={() => {
            if (showForm) resetForm()
            else setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন ছবি'}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        ছবির URL, ক্যাপশন ও ফটোগ্রাফারের নাম এখান থেকে বদলালে হোমপেজের গ্যালারি সঙ্গে সঙ্গে বদলে যাবে।
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {editingId ? 'ছবি সম্পাদনা' : 'নতুন ছবি যোগ করুন'}
          </h3>
          <input
            type="text"
            placeholder="ছবির ঠিকানা (যেমন: /images/haor.jpg বা https://…)"
            value={form.src}
            onChange={(e) => update({ src: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="ক্যাপশন (যেমন: হাওরের ভোর)"
              value={form.caption}
              onChange={(e) => update({ caption: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
            <input
              type="text"
              placeholder="ছবির বর্ণন (alt text)"
              value={form.alt}
              onChange={(e) => update({ alt: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="ফটোগ্রাফারের নাম"
              value={form.credit}
              onChange={(e) => update({ credit: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
            <input
              type="text"
              placeholder="লাইসেন্স (যেমন: CC BY-SA 4.0)"
              value={form.license}
              onChange={(e) => update({ license: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
            <input
              type="text"
              placeholder="মূল ছবির লিংক (ঐচ্ছিক)"
              value={form.source}
              onChange={(e) => update({ source: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </div>

          {form.src.trim() && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-2 dark:border-white/10">
              <img
                src={form.src.trim()}
                alt="প্রিভিউ"
                width={80}
                height={56}
                className="h-14 w-20 rounded-lg object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">ছবির প্রিভিউ</span>
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            ছবি প্রকাশ করুন
          </button>
        </form>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <ImageIcon size={32} className="mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">কোনো ছবি নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                width={80}
                height={56}
                loading="lazy"
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 dark:text-white">{photo.caption}</p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {photo.credit} · {photo.license}
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {photo.src}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => startEdit(photo)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                  aria-label="সম্পাদনা করুন"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(photo.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                  aria-label="মুছে ফেলুন"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        সর্বশেষ হালনাগাদ: {formatBanglaToday()}
      </p>
    </div>
  )
}
