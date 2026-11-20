import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Search, X } from 'lucide-react'
import { EmergencyContact } from '../../../types'
import { EmergencyContactsAdminPanel } from './EmergencyContactsAdminPanel'
import { toBanglaNumber } from '../../../utils/formatters'

interface Props {
  contacts: EmergencyContact[]
  onToggle: (id: string, homepage: boolean) => void
  onMove: (id: string, targetIndex: number) => void
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void
  onEdit: (id: string, contact: Partial<Omit<EmergencyContact, 'id'>>) => void
  onDelete: (id: string) => void
  onApprove: (id: string, approved: boolean) => void
  onVisibility: (id: string, visible: boolean) => void
}

const MAX = 6

/**
 * Full admin control of the homepage emergency quick-dial: pick up to six
 * contacts, reorder them, and manage every contact (add/edit/delete/approve)
 * from the embedded full editor. No data is invented.
 */
export function HomeHotlineAdminPanel({
  contacts, onToggle, onMove, onAdd, onEdit, onDelete, onApprove, onVisibility,
}: Props) {
  const [query, setQuery] = useState('')
  const selected = useMemo(
    () => contacts.filter((contact) => contact.homepage).slice(0, MAX),
    [contacts],
  )
  const others = useMemo(() => {
    const terms = query.toLocaleLowerCase('bn').split(/\s+/).filter(Boolean)
    return contacts
      .filter((contact) => !contact.homepage)
      .filter((contact) => {
        const hay = `${contact.name} ${contact.phone} ${contact.category}`.toLocaleLowerCase('bn')
        return terms.every((term) => hay.includes(term))
      })
  }, [contacts, query])

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
        <p className="font-bold">হোমপেজে দেখানো হটলাইন ({toBanglaNumber(selected.length)}/{toBanglaNumber(MAX)})</p>
        <p className="mt-1 text-[11px] opacity-80">
          নিচের তালিকা থেকে সর্বোচ্চ {toBanglaNumber(MAX)} টি হটলাইন বাছুন। উপরে/নিচে arrows দিয়ে ক্রম বদলান — সেই ক্রমেই হোমপেজে দেখাবে।
        </p>
      </div>

      <div className="space-y-2">
        {selected.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-white/10">
            এখনো কোনো হটলাইন বাছা হয়নি
          </p>
        )}
        {selected.map((contact, index) => {
          const storedIndex = contacts.findIndex((item) => item.id === contact.id)
          return (
            <div
              key={contact.id}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">{toBanglaNumber(index + 1)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{contact.name}</p>
                <p className="text-xs text-rose-600 dark:text-rose-300">{contact.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => onMove(contact.id, storedIndex - 1)}
                disabled={index === 0}
                aria-label="উপরে সরান"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => onMove(contact.id, storedIndex + 1)}
                disabled={index === selected.length - 1}
                aria-label="নিচে সরান"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => onToggle(contact.id, false)}
                aria-label="হোমপেজ থেকে সরান"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 dark:border-rose-900/40"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#1a2420]">
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10">
          <Search size={15} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="অন্য হটলাইন খুঁজুন..."
            className="w-full bg-transparent text-sm outline-none dark:text-white"
          />
        </label>
        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {others.map((contact) => (
            <div key={contact.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 dark:border-white/[0.07]">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{contact.name}</p>
                <p className="text-[11px] text-slate-500">{contact.phone} · {contact.category}</p>
              </div>
              <button
                type="button"
                disabled={selected.length >= MAX}
                onClick={() => onToggle(contact.id, true)}
                className="flex items-center gap-1 rounded-lg border border-forest/30 bg-forest/5 px-2 py-1 text-[11px] font-semibold text-forest disabled:opacity-40 dark:text-emerald-300"
              >
                <Plus size={12} /> যোগ করুন
              </button>
            </div>
          ))}
        </div>
      </div>

      <details className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#1a2420]">
        <summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-white">
          সম্পূর্ণ হটলাইন ব্যবস্থাপনা — যোগ / সম্পাদনা / মুছুন / অনুমোদন
        </summary>
        <div className="mt-3">
          <EmergencyContactsAdminPanel
            contacts={contacts}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onApprove={onApprove}
            onVisibility={onVisibility}
          />
        </div>
      </details>
    </div>
  )
}
