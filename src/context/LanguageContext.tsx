import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { STORAGE_KEYS } from '../constants'
import { storageService } from '../services/storageService'
import { Language, translationService } from '../services/translationService'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  /** Translate a key; falls back to the key itself when missing. */
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function currentLanguage(): Language {
  return storageService.get<Language>(STORAGE_KEYS.LANGUAGE, 'bn') === 'en' ? 'en' : 'bn'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(currentLanguage)
  const [version, setVersion] = useState(0)

  // Keep the document language in sync for screen readers and browsers.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Re-render when the admin edits translations in another tab.
  useEffect(() => {
    const sync = () => setVersion((value) => value + 1)
    window.addEventListener('storage', sync)
    window.addEventListener('amar-madan:data-changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('amar-madan:data-changed', sync)
    }
  }, [])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    storageService.set(STORAGE_KEYS.LANGUAGE, next)
    document.documentElement.lang = next
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(currentLanguage() === 'bn' ? 'en' : 'bn')
  }, [setLanguage])

  const t = useCallback(
    (key: string) => translationService.get(key, language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, version],
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
