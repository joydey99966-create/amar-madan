const STORAGE_VERSION_KEY = 'amar-madan-storage-version'
const CURRENT_STORAGE_VERSION = 2

export const storageService = {
  /** Checks and initializes the client storage version. */
  initVersion(): void {
    try {
      const stored = localStorage.getItem(STORAGE_VERSION_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION))
      }
    } catch {
      // Ignore private browsing quota errors
    }
  },

  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}", falling back to default:`, error)
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore
      }
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  getSession<T>(key: string, defaultValue: T): T {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return defaultValue
    }
  },

  setSession<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing sessionStorage key "${key}":`, error)
    }
  },

  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)
    }
  },
}
