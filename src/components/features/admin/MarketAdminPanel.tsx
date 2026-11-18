import React, { useState } from 'react'
import { Plus, RefreshCw, Trash2, ChevronDown, Check, Eye, EyeOff, History } from 'lucide-react'
import { MarketPrice } from '../../../types'
import { formatBanglaToday, formatDate } from '../../../utils/formatters'
import { getPriceTrend, PRICE_TREND_LABELS } from '../../../utils/marketTrend'

interface MarketAdminPanelProps {
  prices: MarketPrice[]
  onUpdatePrice: (id: string, patch: Partial<MarketPrice>) => void
  onAdd: (price: Omit<MarketPrice, 'id'>) => void
  onRemove: (id: string) => void
  onApprove: (id: string, approved: boolean) => void
  onVisibility: (id: string, visible: boolean) => void
  onRefresh?: () => void
  lastUpdated?: string
}

export function MarketAdminPanel({
  prices,
  onUpdatePrice,
  onAdd,
  onRemove,
  onApprove,
  onVisibility,
  onRefresh,
  lastUpdated,
}: MarketAdminPanelProps) {
  const today = formatBanglaToday()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newWholesale, setNewWholesale] = useState('')
  const [newRetail, setNewRetail] = useState('')
  const [newUnit, setNewUnit] = useState('কেজি')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pointDate, setPointDate] = useState('')
  const [pointRetail, setPointRetail] = useState('')

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    onAdd({
      itemName: newName.trim(),
      wholesalePrice: newWholesale.trim() || '0',
      retailPrice: newRetail.trim() || '0',
      unit: newUnit.trim() || 'কেজি',
      date: new Date().toISOString().slice(0, 10),
      trend: 'stable',
      approved: true,
      visible: true,
      history: [],
    })
    setNewName('')
    setNewWholesale('')
    setNewRetail('')
    setNewUnit('কেজি')
    setShowAddForm(false)
  }

  const handleAddPoint = (price: MarketPrice) => {
    if (!pointDate || pointRetail.trim() === '') return
    const next = [...(price.history ?? []), { date: pointDate, retail: Number(pointRetail) }].sort(
      (a, b) => a.date.localeCompare(b.date),
    )
    onUpdatePrice(price.id, { history: next })
    setPointDate('')
    setPointRetail('')
  }

  const handleRemovePoint = (price: MarketPrice, index: number) => {
    const next = (price.history ?? []).filter((_, i) => i !== index)
    onUpdatePrice(price.id, { history: next })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">বাজারদর পরিচালনা</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#104b38]"
          >
            <Plus size={14} /> {showAddForm ? 'ফর্ম বন্ধ' : 'নতুন পণ্য'}
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <RefreshCw size={14} /> রিফ্রেশ
            </button>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw size={14} /> {lastUpdated ? `সর্বশেষ: ${lastUpdated}` : 'ম্যানুয়াল আপডেট মোড'}
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">নতুন পণ্যের দাম যোগ করুন</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="পণ্যের নাম"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
              required
            />
            <input
              type="text"
              placeholder="পাইকারি (টাকা)"
              value={newWholesale}
              onChange={(e) => setNewWholesale(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
            <input
              type="text"
              placeholder="খুচরা (টাকা)"
              value={newRetail}
              onChange={(e) => setNewRetail(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
            <input
              type="text"
              placeholder="একক (যেমন: কেজি)"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
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

      <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          💡 শেষ আপডেট: {today} (ইনলাইন এডিট করে সরাসরি মান, তারিখ ও দামের ইতিহাস পরিবর্তন করতে পারেন)
        </p>
      </div>

      {prices.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">কোনো দামের তালিকা নেই</div>
      ) : (
        <div className="space-y-2">
          {prices.map((price) => (
            <div
              key={price.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a2420]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <input
                  type="text"
                  value={price.itemName}
                  onChange={(e) => onUpdatePrice(price.id, { itemName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-[#0f1411] dark:text-white sm:w-36"
                />
                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">পাইকারি (টাকা)</label>
                    <input
                      type="text"
                      value={price.wholesalePrice}
                      onChange={(e) => onUpdatePrice(price.id, { wholesalePrice: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">খুচরা (টাকা)</label>
                    <input
                      type="text"
                      value={price.retailPrice}
                      onChange={(e) => onUpdatePrice(price.id, { retailPrice: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">একক</label>
                    <input
                      type="text"
                      value={price.unit}
                      onChange={(e) => onUpdatePrice(price.id, { unit: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">সর্বশেষ আপডেট</label>
                    <input
                      type="date"
                      value={price.date ?? ''}
                      onChange={(e) => onUpdatePrice(price.id, { date: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  প্রবণতা: {PRICE_TREND_LABELS[getPriceTrend(price)]} • {(price.history ?? []).length} টি ইতিহাস পয়েন্ট
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === price.id ? null : price.id)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  aria-expanded={expandedId === price.id}
                >
                  <History size={13} /> ইতিহাস
                  <ChevronDown size={13} className={expandedId === price.id ? 'rotate-180 transition' : 'transition'} />
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(price.id, price.approved === false)}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                    price.approved === false
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}
                >
                  <Check size={13} /> {price.approved === false ? 'অনুমোদন' : 'অনুমোদিত'}
                </button>
                <button
                  type="button"
                  onClick={() => onVisibility(price.id, price.visible === false)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  {price.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                  {price.visible === false ? 'লুকানো' : 'দেখানো'}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(price.id)}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40"
                  aria-label="মুছে ফেলুন"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {expandedId === price.id && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                  {(price.history ?? []).length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">এখনো কোনো ইতিহাস পয়েন্ট নেই।</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="py-1 font-medium">তারিখ</th>
                          <th className="py-1 text-right font-medium">খুচরা দর</th>
                          <th className="py-1" />
                        </tr>
                      </thead>
                      <tbody>
                        {(price.history ?? []).map((point, index) => (
                          <tr key={`${point.date}-${index}`} className="border-t border-slate-200 dark:border-white/10">
                            <td className="py-1 text-slate-600 dark:text-slate-300">{formatDate(point.date)}</td>
                            <td className="py-1 text-right font-semibold text-slate-800 dark:text-slate-100">{point.retail}</td>
                            <td className="py-1 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemovePoint(price, index)}
                                className="text-rose-600 hover:underline dark:text-rose-400"
                              >
                                মুছুন
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="flex flex-wrap items-end gap-2 pt-1">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400">তারিখ</label>
                      <input
                        type="date"
                        value={pointDate}
                        onChange={(e) => setPointDate(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400">খুচরা দর</label>
                      <input
                        type="number"
                        placeholder="টাকা"
                        value={pointRetail}
                        onChange={(e) => setPointRetail(e.target.value)}
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPoint(price)}
                      className="flex items-center gap-1 rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#104b38]"
                    >
                      <Plus size={13} /> পয়েন্ট যোগ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
