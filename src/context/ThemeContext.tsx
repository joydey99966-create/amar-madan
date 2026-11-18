import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { STORAGE_KEYS } from '../constants'
import { storageService } from '../services'

interface ThemeContextType {
  darkMode: boolean
  toggleTheme: () => void
  setDarkMode: (val: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return storageService.get<string | null>(STORAGE_KEYS.THEME, null) === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    storageService.set(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleTheme = () => setDarkModeState((prev) => !prev)
  const setDarkMode = (val: boolean) => setDarkModeState(val)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
