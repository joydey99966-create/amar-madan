import { STORAGE_KEYS } from '../constants'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/** Where the weather data comes from. */
export type WeatherSource = 'open-meteo' | 'custom'

export interface WeatherSettings {
  /** The admin can switch the widget off completely. */
  enabled: boolean
  source: WeatherSource
  /** Used when the source is "custom" — {lat} and {lon} are replaced. */
  customUrl: string
  locationName: string
  latitude: number
  longitude: number
  /** How often the widget refreshes itself. */
  refreshMinutes: number
}

export interface WeatherSnapshot {
  temperature: number
  /** Weather condition code from the source. */
  code: number
  /** ISO timestamp of the moment the value was read. */
  updatedAt: string
}

export const DEFAULT_WEATHER_SETTINGS: WeatherSettings = {
  enabled: true,
  source: 'open-meteo',
  customUrl: '',
  locationName: 'মদন, নেত্রকোণা',
  latitude: 24.68,
  longitude: 90.96,
  refreshMinutes: 10,
}

function normalize(settings: Partial<WeatherSettings>): WeatherSettings {
  const base = { ...DEFAULT_WEATHER_SETTINGS, ...settings }
  return {
    ...base,
    enabled: base.enabled !== false,
    source: base.source === 'custom' ? 'custom' : 'open-meteo',
    customUrl: String(base.customUrl ?? ''),
    locationName: String(base.locationName ?? '').trim() || DEFAULT_WEATHER_SETTINGS.locationName,
    latitude: Number(base.latitude) || DEFAULT_WEATHER_SETTINGS.latitude,
    longitude: Number(base.longitude) || DEFAULT_WEATHER_SETTINGS.longitude,
    refreshMinutes: Number(base.refreshMinutes) || DEFAULT_WEATHER_SETTINGS.refreshMinutes,
  }
}

function buildUrl(settings: WeatherSettings): string {
  if (settings.source === 'custom' && settings.customUrl.trim()) {
    return settings.customUrl
      .replace('{lat}', String(settings.latitude))
      .replace('{lon}', String(settings.longitude))
  }
  return `https://api.open-meteo.com/v1/forecast?latitude=${settings.latitude}&longitude=${settings.longitude}&current_weather=true`
}

export const weatherService = {
  /** Admin-controlled configuration of the weather widget. */
  getSettings(): WeatherSettings {
    const stored = storageService.get<Partial<WeatherSettings> | null>(
      STORAGE_KEYS.WEATHER_SETTINGS,
      null,
    )
    return normalize(stored ?? {})
  },

  saveSettings(settings: Partial<WeatherSettings>): WeatherSettings {
    const next = normalize({ ...weatherService.getSettings(), ...settings })
    storageService.set(STORAGE_KEYS.WEATHER_SETTINGS, next)
    notifyDataChanged('weather')
    return next
  },

  /** The last value that was loaded — shown while a refresh is running. */
  getCached(): WeatherSnapshot | null {
    return storageService.get<WeatherSnapshot | null>(STORAGE_KEYS.WEATHER_CACHE, null)
  },

  setCached(snapshot: WeatherSnapshot): void {
    storageService.set(STORAGE_KEYS.WEATHER_CACHE, snapshot)
  },

  clearCache(): void {
    storageService.remove(STORAGE_KEYS.WEATHER_CACHE)
    notifyDataChanged('weather')
  },

  /** Reads the live value; throws when the source is unreachable or unusable. */
  async fetchWeather(settings: WeatherSettings): Promise<WeatherSnapshot> {
    const res = await fetch(buildUrl(settings))
    if (!res.ok) throw new Error(`weather request failed (${res.status})`)
    const data = await res.json()
    const current = data?.current_weather ?? data?.current
    const temperature = current?.temperature ?? current?.temperature_2m
    if (typeof temperature !== 'number') throw new Error('weather response without temperature')
    return {
      temperature: Math.round(temperature),
      code: Number(current?.weathercode ?? current?.weather_code ?? 0),
      updatedAt: new Date().toISOString(),
    }
  },
}
