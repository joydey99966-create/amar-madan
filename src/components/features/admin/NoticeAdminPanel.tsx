import { useState } from 'react'
import { CheckCircle2, Edit2, Eye, EyeOff, Plus, Trash2, XCircle } from 'lucide-react'
import { AdminNotice } from '../../../types'
import { NOTICE_CATEGORIES, noticeCategoryColor } from '../../../constants'
import { formatBanglaDate, toBanglaNumber } from '../../../utils/formatters'
import { countSentences } from '../../../data/noticeNewsSeed'

export type { AdminNotice }

interface NoticeAdminPanelProps {
  notices: AdminNotice[]
  onDelete: (id: string) => void
  onAdd: (notice: Omit<AdminNotice, 'id'>) => void
  onEdit: (id: string, notice: Omit<AdminNotice, 'id'>) => void
  onApprove: (id: string, approved: boolean) => void
  onVisibility: (id: string, visible: boolean) => void
}

const CATEGORY_OPTIONS = Array.from(
  new Set([...NOTICE_CATEGORIES.map((category) => category.id), 'জরুরি নোটিশ', 'খেলাধুলা']),
)

const EMPTY_FORM = {
  title: '',
  summary: '',
  content: '',
  category: NOTICE_CATEGORIES[0].id as string,
  date: '',
  source: '',
  image: '',
  priority: 'normal' as AdminNotice['priority'],
  visible: true,
}

/**
 * Admin CMS for the single notice/news dataset. Saving here updates both the
 * homepage "আজকের নোটিশ" strip and the /news list.
 */
export function NoticeAdminPanel({
  notices,
  onDelete,
  onAdd,
  onEdit,
  onApprove,
  onVisibility,
}: NoticeAdminPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  /** Keeps the stored date when the admin edits without picking a new one. */
  const [editingDate, setEditingDate] = useState('')

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setEditingDate('')
    setShowForm(false)
  }

  const update = (patch: Partial<typeof EMPTY_FORM>) => setForm((prev) => ({ ...prev, ...patch }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    const notice: Omit<AdminNotice, 'id'> = {
      title: form.title.trim(),
      summary: form.summary.trim() || form.content.trim(),
      content: form.content.trim(),
      category: form.category,
      date: form.date ? formatBanglaDate(form.date) : editingDate || formatBanglaDate(new Date()),
      source: form.source.trim() || 'উপজেলা কার্যালয়, মদন',
      image: form.image.trim() || undefined,
      priority: form.priority,
      visible: form.visible,
    }
    if (editingId) onEdit(editingId, notice)
    else onAdd(notice)
    resetForm()
  }

  const startEdit = (notice: AdminNotice) => {
    setEditingId(notice.id)
    setEditingDate(notice.date)
    setForm({
      title: notice.title,
      summary: notice.summary,
      content: notice.content,
      category: notice.category,
      date: '',
      source: notice.source,
      image: notice.image ?? '',
      priority: notice.priority,
      visible: notice.visible !== false,
    })
    setShowForm(true)
  }

  const pendingCount = notices.filter((notice) => !notice.approved).length
  const shortBodies = notices.filter((notice) => countSentences(notice.content) < 3).length
  const formSentences = countSentences(form.content)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">নোটিশ ও সংবাদ পরিচালনা</h2>
        <button
          onClick={() => {
            if (showForm) resetForm()
            else setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Plus size={16} /> {showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন নোটিশ'}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        একই তালিকা হোমপেজের নোটিশ বোর্ড ও /news পেজে দেখানো হয়। নতুন আইটেম অনুমোদনের পরেই পাবলিকে যাবে।
        প্রকাশের তারিখ ও বিস্তারিত বিবরণ ছাড়া কোনো সংবাদ প্রকাশ করা যাবে না। প্রতিটি সংবাদের বিবরণ কমপক্ষে ৩টি বাক্যের হতে হবে।
        {pendingCount > 0 ? ` ${toBanglaNumber(pendingCount)} টি অনুমোদনের অপেক্ষায়।` : ''}
        {shortBodies > 0 ? ` সতর্কতা: ${toBanglaNumber(shortBodies)} টি আইটেমের বিবরণ ৩টির কম বাক্যের — প্রকাশের আগে সম্পাদনা করুন।` : ''}
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {editingId ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ যোগ করুন'}
          </h3>
          <input
            type="text"
            placeholder="নোটিশের শিরোনাম"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            required
          />
          <input
            type="text"
            placeholder="সংক্ষিপ্ত বিবরণ (বোর্ডে দেখাবে)"
            value={form.summary}
            onChange={(e) => update({ summary: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
          <textarea
            placeholder="বিস্তারিত বিবরণ (একাধিক অনুচ্ছেদ লিখতে খালি লাইন রাখুন)..."
            value={form.content}
            onChange={(e) => update({ content: e.target.value })}
            rows={7}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            aria-label="সংবাদের বিস্তারিত বিবরণ"
            required
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            একটি অনুচ্ছেদ থেকে অন্য অনুচ্ছেদ আলাদা করতে খালি লাইন ব্যবহার করুন। বর্তমানে {toBanglaNumber(formSentences)}টি বাক্য।
          </p>
          {form.content.trim() && formSentences < 3 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
              ⚠ সতর্কতা: এই সংবাদের বিবরণ ৩টির কম বাক্যের। প্রকাশের আগে কমপক্ষে ৩টি বাক্য লিখুন।
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={form.category}
              onChange={(e) => update({ category: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label="নোটিশের ক্যাটাগরি"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update({ date: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              aria-label="প্রকাশের তারিখ"
              required
            />
            <input
              type="text"
              placeholder="উৎস (যেমন: উপজেলা কার্যালয়)"
              value={form.source}
              onChange={(e) => update({ source: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </div>
          <input
            type="text"
            placeholder="ছবির URL (ঐচ্ছিক)"
            value={form.image}
            onChange={(e) => update({ image: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="priority"
                checked={form.priority === 'normal'}
                onChange={() => update({ priority: 'normal' })}
              />
              সাধারণ
            </label>
            <label className="flex items-center gap-2 text-sm text-amber-700 font-medium dark:text-amber-300">
              <input
                type="radio"
                name="priority"
                checked={form.priority === 'urgent'}
                onChange={() => update({ priority: 'urgent' })}
              />
              জরুরি
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => update({ visible: e.target.checked })}
              />
              প্রদর্শন করুন
            </label>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
          >
            নোটিশ প্রকাশ করুন
          </button>
        </form>
      )}

      {notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
          <Eye size={32} className="text-slate-400 mb-2" />
          <p className="text-slate-500 dark:text-slate-400">কোনো নোটিশ নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-white">{notice.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${noticeCategoryColor(notice.category)}`}
                  >
                    {notice.category}
                  </span>
                  {notice.priority === 'urgent' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      জরুরি
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      notice.approved
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {notice.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                  </span>
                  {notice.visible === false && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      লুকানো
                    </span>
                  )}
                  {countSentences(notice.content) < 3 && (
                    <span
                      title="প্রকাশের আগে কমপক্ষে ৩টি বাক্যের বিবরণ যোগ করুন"
                      className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      ⚠ সংক্ষিপ্ত বিবরণ
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-500 dark:text-slate-400">{notice.content}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {formatBanglaDate(notice.date)} · {notice.source}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onApprove(notice.id, !notice.approved)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40"
                  title={notice.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                  aria-label={notice.approved ? 'অনুমোদন বাতিল' : 'অনুমোদন করুন'}
                >
                  {notice.approved ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                </button>
                <button
                  onClick={() => onVisibility(notice.id, !notice.visible)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                  title={notice.visible !== false ? 'লুকান' : 'দেখান'}
                  aria-label={notice.visible !== false ? 'লুকান' : 'দেখান'}
                >
                  {notice.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => startEdit(notice)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                  aria-label="সম্পাদনা করুন"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(notice.id)}
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
