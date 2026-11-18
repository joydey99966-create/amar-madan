import { useState, useEffect } from 'react'
import { storageService } from '../services/storageService'

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const value = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
    return storageService.get<T>(key, value)
  })

  useEffect(() => {
    storageService.set(key, storedValue)
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
