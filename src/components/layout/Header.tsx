import { useMemo, useState } from 'react'
import {
  Droplets,
  Fish,
  GraduationCap,
  LayoutGrid,
  Lock,
  MapPin,
  Menu,
  Moon,
  Newspaper,
  Search,
  Stethoscope,
  Sun,
  TramFront,
  UserRound,
  X,
} from 'lucide-react'
import { navItems } from '../../constants'
import { NavTabId, ViewId } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { useAdmin } from '../../context/AdminContext'
import { displayOrderService } from '../../services/displayOrderService'
import { useDataVersion } from '../../hooks/useDataVersion'

/** The main sections beyond the five core tabs — all reachable from the side menu. */
const MORE_SECTIONS: Array<{ key: string; id: ViewId; label: string; icon: typeof Fish; tab?: string }> = [
  { key: 'directory-doctors', id: 'directory', label: 'ডাক্তার ও হাসপাতাল', icon: Stethoscope, tab: 'doctors' },
  { key: 'directory-education', id: 'directory', label: 'শিক্ষা প্রতিষ্ঠান', icon: GraduationCap, tab: 'education' },
  { key: 'fish', id: 'fish', label: 'হাওরের মাছ', icon: Fish },
  { key: 'news', id: 'news', label: 'সংবাদ ও নোটিশ', icon: Newspaper },
  { key: 'citizens', id: 'citizens', label: 'নাগরিক সেবা', icon: LayoutGrid },
  { key: 'lostfound', id: 'lostfound', label: 'হারানো ও প্রাপ্তি', icon: Search },
  { key: 'transport', id: 'transport', label: 'যাতায়াত', icon: TramFront },
  { key: 'services', id: 'services', label: 'সব সেবা', icon: LayoutGrid },
  { key: 'banks', id: 'banks', label: 'ব্যাংক ও এটিএম', icon: LayoutGrid },
  { key: 'pharmacies', id: 'pharmacies', label: 'ফার্মাসি', icon: LayoutGrid },
  { key: 'government', id: 'government', label: 'সরকারি অফিস', icon: LayoutGrid },
  { key: 'mechanics', id: 'mechanics', label: 'মিস্ত্রি ও মেরামত', icon: LayoutGrid },
  { key: 'agriculture', id: 'agriculture', label: 'কৃষি কর্মকর্তা', icon: LayoutGrid },
  { key: 'veterinary', id: 'veterinary', label: 'ভেটেরিনারি', icon: LayoutGrid },
  { key: 'postal', id: 'postal', label: 'পোস্টাল ও কুরিয়ার', icon: LayoutGrid },
  { key: 'profile', id: 'profile', label: 'প্রোফাইল', icon: UserRound },
]

interface HeaderProps {
  /** The tab to highlight — `null` on pages outside the five main tabs. */
  activeNav: NavTabId | null
  onNavigate: (id: ViewId, tab?: string) => void
  onOpenRegisterModal: () => void
}

export function Header({ activeNav, onNavigate, onOpenRegisterModal }: HeaderProps) {
  const { darkMode, toggleTheme } = useTheme()
  const { requestAdminAccess } = useAdmin()
  const orderVersion = useDataVersion('order')
  const orderedNav = useMemo(
    () => displayOrderService.sortById(navItems, displayOrderService.get().nav),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderVersion],
  )
  const orderedMore = useMemo(
    () => displayOrderService.sortByKey(MORE_SECTIONS, displayOrderService.get().side),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderVersion],
  )
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavClick = (id: ViewId, tab?: string) => {
    onNavigate(id, tab)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6 lg:px-8 lg:pt-4">
      <div className="lg-glass lg-glass-hover mx-auto flex h-[64px] max-w-6xl flex-nowrap items-center justify-between gap-2 rounded-[22px] px-3 sm:gap-3 sm:px-4 lg:h-[72px] lg:rounded-full lg:px-5">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('home')
          }}
          className="group flex shrink-0 items-center gap-3 whitespace-nowrap tap-scale"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-forest text-white shadow-[0_6px_20px_rgba(23,92,70,0.35)] transition-transform duration-500 group-hover:scale-105 lg:h-11 lg:w-11 lg:rounded-2xl">
            <MapPin size={22} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="lg-heading whitespace-nowrap text-[19px] font-extrabold leading-6 text-[#111827] transition-colors dark:text-white sm:text-[21px]">
              আমার মদন
            </div>
            <div className="mt-0.5 hidden whitespace-nowrap text-xs font-medium text-slate-600/70 transition-colors dark:text-white/70 xs:block">
              মদন উপজেলা সেবা ও তথ্য
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-1.5 nav:flex" aria-label="প্রধান নেভিগেশন">
          {orderedNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              title={item.label}
              aria-current={activeNav === item.id ? 'page' : undefined}
              className={`tap-scale whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-500 lg:px-4 ${
                activeNav === item.id
                  ? 'bg-white/70 text-forest shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_14px_rgba(0,0,0,0.1)] dark:bg-white/15 dark:text-white'
                  : 'text-slate-700/80 hover:bg-white/15 hover:text-[#111827] dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              {item.shortLabel ?? item.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Profile shortcut — jumps to the community contribution card */}
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            className="tap-scale flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/25 bg-white/40 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-all duration-500 hover:bg-white/60 hover:text-[#111827] dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white"
            title="প্রোফাইল"
            aria-label="প্রোফাইল"
          >
            <UserRound size={19} />
          </button>

          {/* Enhanced Dark/Light Toggle */}
          <button
            type="button"
            aria-label={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            onClick={toggleTheme}
            className="group relative flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/25 bg-white/40 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-all duration-500 hover:bg-white/60 active:scale-90 dark:bg-white/10 dark:text-amber-300 dark:hover:bg-white/20"
            title={darkMode ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
          >
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
              {darkMode ? (
                <Sun size={19} className="text-amber-300 transition-transform duration-300" />
              ) : (
                <Moon size={19} className="text-slate-700 transition-transform duration-300" />
              )}
            </div>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="tap-scale hidden whitespace-nowrap items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-forest transition-all duration-200 hover:bg-forest-dark hover:shadow-lg hover:-translate-y-0.5 sm:flex"
          >
            <Droplets size={16} className="text-rose-200" /> + রক্তদাতা হোন
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/25 bg-white/40 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-all duration-500 hover:bg-white/60 active:scale-90 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 nav:hidden"
            aria-label="মেনু"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg-glass mx-2 mt-2 rounded-[24px] px-3 py-4 animate-slide-up sm:mx-4 nav:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1.5">
            {orderedNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={activeNav === item.id ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-all ${
                  activeNav === item.id
                    ? 'bg-forest/10 text-forest dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5'
                }`}
              >
                <item.icon size={19} className={activeNav === item.id ? 'text-forest dark:text-emerald-300' : 'text-slate-400'} />
                {item.label}
              </button>
            ))}

            <p className="mt-3 px-4 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              অন্যান্য সেবা
            </p>
            {orderedMore.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.id, item.tab)}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                <item.icon size={18} className="text-slate-400" />
                {item.label}
              </button>
            ))}

            {/* Admin access uses the same central gate as every other entry. */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                requestAdminAccess()
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <Lock size={18} className="text-slate-400" />
              অ্যাডমিন অ্যাক্সেস
            </button>

            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">থিম নির্বাচন:</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                {darkMode ? <Sun size={15} className="text-amber-300" /> : <Moon size={15} />}
                {darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
              </button>
            </div>

            <button
              onClick={() => {
                setMenuOpen(false)
                onOpenRegisterModal()
              }}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 font-semibold text-white shadow-forest"
            >
              <Droplets size={17} className="text-rose-200" />+ রক্তদাতা হোন
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
