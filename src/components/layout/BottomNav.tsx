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
      className="fixed inset-x-3 bottom-3 z-40 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden"
      aria-label="মোবাইল নেভিগেশন"
    >
      <div
        className="lg-glass mx-auto grid max-w-md gap-0.5 rounded-full px-2 py-1.5"
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
              className={`tap-scale flex min-h-[50px] flex-col items-center justify-center gap-0.5 rounded-full px-0.5 py-1.5 text-[10px] font-semibold leading-tight transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest ${
                isActive
                  ? 'bg-white/70 text-forest shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:bg-white/15 dark:text-white'
                  : 'text-slate-600/70 hover:bg-white/15 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              <span className="flex h-6 w-9 shrink-0 items-center justify-center">
                <item.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              {/* The full label, wrapped over two lines — never cut to one word. */}
              <span className="min-h-[20px] w-full text-center leading-[11px]">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
