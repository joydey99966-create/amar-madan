import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { adminService } from '../services'

interface AdminContextType {
  isAuthenticated: boolean
  isDashboardOpen: boolean
  login: (pin: string) => boolean
  logout: () => void
  /** The ONE gate used by every admin entry point. */
  requestAdminAccess: () => void
  openDashboard: () => void
  closeDashboard: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => adminService.isAuthenticated())
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)

  /**
   * SINGLE ADMIN GATE.
   *
   * No entry point may set isDashboardOpen directly. Every caller goes through
   * here: the footer link, the side-menu link and the #admin / /admin routes.
   * The gate never skips authentication — the dashboard always renders the PIN
   * dialog itself until login() succeeds.
   */
  const requestAdminAccess = useCallback(() => {
    setIsAuthenticated(adminService.isAuthenticated())
    setIsDashboardOpen(true)
  }, [])

  // Re-check the session whenever it could have gone stale.
  useEffect(() => {
    const verify = () => {
      const valid = adminService.isAuthenticated()
      setIsAuthenticated(valid)
      if (!valid) setIsDashboardOpen(false)
      return valid
    }
    const timer = window.setInterval(verify, 30_000)
    const onFocus = () => verify()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') verify()
    }
    // A refresh or a closed tab ends the session: the next visit asks for PIN.
    const onUnload = () => adminService.endSession()
    window.addEventListener('focus', onFocus)
    window.addEventListener('beforeunload', onUnload)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('beforeunload', onUnload)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Listen for admin hash route (#admin or /admin) — via the central gate.
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        requestAdminAccess()
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('popstate', handleHash)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('popstate', handleHash)
    }
  }, [requestAdminAccess])

  const login = (pin: string): boolean => {
    const success = adminService.login(pin)
    if (success) setIsAuthenticated(true)
    return success
  }

  const logout = useCallback(() => {
    adminService.logout()
    setIsAuthenticated(false)
    setIsDashboardOpen(false)
  }, [])

  const closeDashboard = useCallback(() => {
    // Closing the panel ends the session — reopening always asks for the PIN.
    adminService.endSession()
    setIsAuthenticated(false)
    setIsDashboardOpen(false)
    if (window.location.hash === '#admin') {
      window.location.hash = ''
    }
  }, [])

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isDashboardOpen,
        login,
        logout,
        requestAdminAccess,
        openDashboard: requestAdminAccess,
        closeDashboard,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
