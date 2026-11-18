import { useCallback, useEffect, useState } from 'react'
import {
  WeatherSettings,
  WeatherSnapshot,
  weatherService,
} from '../services/weatherService'
import { subscribeToDataChanges } from '../services/dataEvents'

export type WeatherStatus = 'disabled' | 'loading' | 'refreshing' | 'ready' | 'error'

export interface WeatherState {
  status: WeatherStatus
  /** The value to show — only set once a real value was read. */
  snapshot: WeatherSnapshot | null
  settings: WeatherSettings
  /** Re-reads the source right away. */
  refresh: () => void
}

/**
 * Loads the weather for the homepage.
 *
 * While the first request is running no temperature is shown at all (the
 * widget renders a placeholder). Once a value was read it is cached, so later
 * visits show the last known temperature with a "হালনাগাদ হচ্ছে…" label while
 * it refreshes — never a made-up number.
 */
export function useWeather(): WeatherState {
  const [settings, setSettings] = useState<WeatherSettings>(() => weatherService.getSettings())
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(() => weatherService.getCached())
  const [status, setStatus] = useState<WeatherStatus>(() =>
    weatherService.getSettings().enabled ? 'loading' : 'disabled',
  )
  const [reloadToken, setReloadToken] = useState(0)

  const refresh = useCallback(() => setReloadToken((value) => value + 1), [])

  useEffect(() => {
    // The admin may switch the widget off or move it to another location.
    const applySettings = () => {
      const next = weatherService.getSettings()
      setSettings(next)
      if (!next.enabled) {
        setStatus('disabled')
        return
      }
      setStatus((current) => (current === 'ready' || current === 'error' ? current : 'loading'))
    }
    applySettings()
    const unsubscribe = subscribeToDataChanges((section) => {
      if (!section || section === 'weather') applySettings()
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!settings.enabled) {
      setStatus('disabled')
      return
    }

    let cancelled = false

    const load = async () => {
      // A cached value is shown straight away, flagged as "updating".
      const cached = weatherService.getCached()
      if (cached) {
        setSnapshot(cached)
        setStatus('refreshing')
      } else {
        setSnapshot(null)
        setStatus('loading')
      }

      try {
        const fresh = await weatherService.fetchWeather(settings)
        if (cancelled) return
        weatherService.setCached(fresh)
        setSnapshot(fresh)
        setStatus('ready')
      } catch {
        if (cancelled) return
        setStatus('error')
      }
    }

    load()
    const interval = window.setInterval(
      load,
      Math.max(1, settings.refreshMinutes) * 60 * 1000,
    )
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [settings, reloadToken])

  return { status, snapshot, settings, refresh }
}
