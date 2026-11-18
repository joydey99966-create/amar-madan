import { useMemo } from 'react'
import { navItems } from '../../constants'
import { NavTabId, ViewId } from '../../types'
import { displayOrderService } from '../../services/displayOrderService'
import { useDataVersion } from '../../hooks/useDataVersion'

interface BottomNavProps {
  /** The tab to highlight — `null` on pages outside the five main tabs. */
  activeNav: NavTabId | null
  onNavigate: (id: ViewId) => void
}

export function BottomNav({ activeNav, onNavigate }: BottomNavProps) {
  const orderVersion = useDataVersion('order')
  const items = useMemo(
    () => displayOrderService.pickById(navItems, displayOrderService.get().bottomNav),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderVersion],
  )
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-lg dark:border-white/10 dark:bg-[#111b18]/95 md:hidden"
      aria-label="মোবাইল নেভিগেশন"
    >
      <div
        className="mx-auto grid max-w-lg"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`tap-scale flex flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 text-[10px] font-medium leading-tight transition-colors ${
                isActive ? 'text-forest dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className={`flex h-7 w-10 shrink-0 items-center justify-center rounded-full ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
                }`}
              >
                <item.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              {/* The full label, wrapped over two lines — never cut to one word. */}
              <span className="min-h-[22px] w-full text-center leading-[11px]">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
