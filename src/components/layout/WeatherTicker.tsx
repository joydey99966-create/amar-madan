import { useEffect, useState } from 'react'
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, LucideIcon, MapPin, Snowflake, Sun } from 'lucide-react'
import { defaultNotices } from '../../constants'
import { noticeService } from '../../services/noticeService'
import { subscribeToDataChanges } from '../../services/dataEvents'
import { useWeather } from '../../hooks/useWeather'

interface WeatherCondition {
  label: string
  icon: LucideIcon
}

function getCondition(code: number): WeatherCondition {
  if (code === 0) return { label: 'পরিষ্কার আকাশ', icon: Sun }
  if (code === 1) return { label: 'প্রায় পরিষ্কার', icon: Sun }
  if (code === 2) return { label: 'আংশিক মেঘলা', icon: CloudSun }
  if (code === 3) return { label: 'মেঘলা', icon: Cloud }
  if (code === 45 || code === 48) return { label: 'কুয়াশা', icon: CloudFog }
  if (code >= 51 && code <= 55) return { label: 'হালকা বৃষ্টি', icon: CloudDrizzle }
  if (code >= 61 && code <= 65) return { label: 'বৃষ্টি', icon: CloudRain }
  if (code >= 71 && code <= 75) return { label: 'তুষারপাত', icon: Snowflake }
  if (code >= 80 && code <= 82) return { label: 'বৃষ্টির ঝাপটা', icon: CloudRain }
  if (code >= 95) return { label: 'বজ্রঝড়', icon: CloudLightning }
  return { label: 'আবহাওয়া তথ্য', icon: CloudSun }
}

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function readNotices(): string[] {
  try {
    const published = noticeService.getPublishedNotices()
    if (published.length > 0) {
      return published.map((notice) =>
        notice.priority === 'urgent' ? `⚠️ ${notice.title}` : notice.title,
      )
    }
  } catch {
    // fall back to the bundled notices
  }
  return defaultNotices.map((n) => n.title)
}

export function WeatherTicker() {
  const [notices, setNotices] = useState<string[]>(() => readNotices())
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const weather = useWeather()

  // Sync notices from storage
  useEffect(() => {
    const sync = () => setNotices(readNotices())
    sync()
    const interval = setInterval(sync, 5000)
    window.addEventListener('storage', sync)
    // The tab that publishes a notice has to refresh the ticker as well.
    const unsubscribe = subscribeToDataChanges((section) => {
      if (!section || section === 'notices') sync()
    })
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', sync)
      unsubscribe()
    }
  }, [])

  // Rotating ticker
  useEffect(() => {
    if (notices.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % notices.length)
        setVisible(true)
      }, 300)
    }, 4500)
    return () => clearInterval(interval)
  }, [notices.length])

  const currentNotice = notices[index % Math.max(notices.length, 1)] ?? notices[0]
  const showWeather = weather.status !== 'disabled'

  // A temperature is shown ONLY when the data has actually loaded. While a
  // request is in flight (first load or refresh/return) no weather value — not
  // even a cached one — is displayed, so a temperature can never appear next
  // to "হালনাগাদ হচ্ছে…".
  const snapshot = weather.snapshot
  const isBusy = weather.status === 'loading' || weather.status === 'refreshing'
  const condition = snapshot ? getCondition(snapshot.code) : getCondition(0)
  const Icon = condition.icon
  const temp = snapshot && !isBusy ? `${snapshot.temperature}°C` : ''
  const conditionLabel = snapshot && !isBusy ? condition.label : ''
  const statusLabel = snapshot && !isBusy
    ? `হালনাগাদ: ${formatUpdatedAt(snapshot.updatedAt)}`
    : 'হালনাগাদ হচ্ছে…'

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      {/* Weather widget */}
      {showWeather && (
        <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md sm:p-3">
          {weather.status === 'error' ? (
            <div className="flex items-center gap-2">
              <CloudSun size={24} className="shrink-0 text-[#fde68a]" />
              <div className="text-[11px] leading-4 text-emerald-100/90">
                আবহাওয়া তথ্য পাওয়া যায়নি
              </div>
            </div>
          ) : weather.status === 'loading' || weather.status === 'refreshing' ? (
            // No temperature is shown while a request is in flight — neither
            // on first load nor when returning with a cached value.
            <div className="flex items-center gap-2">
              <CloudSun size={24} className="shrink-0 text-[#fde68a]" />
              <div className="text-[11px] leading-4 text-emerald-100/90">
                আবহাওয়া তথ্য লোড হচ্ছে…
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon size={24} className="text-[#fde68a]" />
                <div>
                  <div className="text-xl font-bold leading-none text-white">{temp}</div>
                  <div className="mt-0.5 text-[10px] text-emerald-100/90">{conditionLabel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[10px] text-emerald-100/80">
                  <MapPin size={10} /> {weather.settings.locationName}
                </div>
                <div className="mt-0.5 text-[9px] text-emerald-200/70">{statusLabel}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick notice ticker */}
      <div className="overflow-hidden rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:p-2.5">
        <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-200/80">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
          </span>
          জরুরি নোটিশ
        </div>
        <div
          className={`text-[11px] leading-4 text-white transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {currentNotice}
        </div>
      </div>
    </div>
  )
}