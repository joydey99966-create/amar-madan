import { useState } from 'react'
import { CloudSun, RefreshCw, Save } from 'lucide-react'
import {
  DEFAULT_WEATHER_SETTINGS,
  WeatherSettings,
  weatherService,
} from '../../../services/weatherService'
import { notifyDataChanged } from '../../../hooks/useDataVersion'

interface WeatherAdminPanelProps {
  settings: WeatherSettings
  onChange: (settings: WeatherSettings) => void
}

/**
 * Admin controls for the homepage weather widget: switch it on or off, point
 * it at another source or location, and refresh the value right away.
 */
export function WeatherAdminPanel({ settings, onChange }: WeatherAdminPanelProps) {
  const [form, setForm] = useState<WeatherSettings>(settings)
  const [saved, setSaved] = useState(false)

  const update = (patch: Partial<WeatherSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  const handleSave = () => {
    const next = weatherService.saveSettings(form)
    setForm(next)
    onChange(next)
    setSaved(true)
  }

  const handleRefresh = () => {
    weatherService.clearCache()
    notifyDataChanged('weather')
    onChange(weatherService.getSettings())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">আবহাওয়া উইজেট</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span>{form.enabled ? 'চালু' : 'বন্ধ'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.enabled}
            aria-label="আবহাওয়া উইজেট চালু বা বন্ধ"
            onClick={() => update({ enabled: !form.enabled })}
            className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${
              form.enabled ? 'bg-forest' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                form.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        উইজেট বন্ধ থাকলে হোমপেজে আবহাওয়ার কার্ড দেখাবে না। তথ্য না আসা পর্যন্ত কোনো তাপমাত্রা দেখানো হবে না।
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            তথ্যের উৎস
          </span>
          <select
            value={form.source}
            onChange={(e) => update({ source: e.target.value as WeatherSettings['source'] })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          >
            <option value="open-meteo">লাইভ — Open-Meteo</option>
            <option value="custom">নিজস্ব API লিংক</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            এলাকার নাম
          </span>
          <input
            type="text"
            value={form.locationName}
            onChange={(e) => update({ locationName: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            অক্ষাংশ (Latitude)
          </span>
          <input
            type="text"
            value={String(form.latitude)}
            onChange={(e) => update({ latitude: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            দ্রাঘিমাংশ (Longitude)
          </span>
          <input
            type="text"
            value={String(form.longitude)}
            onChange={(e) => update({ longitude: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            কত মিনিপরপর হালনাগাদ হবে
          </span>
          <input
            type="number"
            min={1}
            value={form.refreshMinutes}
            onChange={(e) => update({ refreshMinutes: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
          />
        </label>

        {form.source === 'custom' && (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              API লিংক ({'{lat}'} ও {'{lon}'} বসানো যাবে)
            </span>
            <input
              type="text"
              value={form.customUrl}
              onChange={(e) => update({ customUrl: e.target.value })}
              placeholder="https://example.com/weather?lat={lat}&lon={lon}"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1411] dark:text-white"
            />
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#104b38]"
        >
          <Save size={15} /> সংরক্ষণ করুন
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          <RefreshCw size={15} /> এখনই হালনাগাদ করুন
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CloudSun size={13} /> সেভ করা হয়েছে — হোমপেজে সঙ্গে সঙ্গে প্রয়োগ হয়েছে
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        ডিফল্ট: {DEFAULT_WEATHER_SETTINGS.locationName} • অক্ষাংশ {DEFAULT_WEATHER_SETTINGS.latitude} •{' '}
        দ্রাঘিমাংশ {DEFAULT_WEATHER_SETTINGS.longitude}
      </p>
    </div>
  )
}
