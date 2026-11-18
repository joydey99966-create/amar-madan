import { PillRow } from './PillRow'

interface SubTabBarProps {
  tabs: { id: string; label: string }[]
  activeId: string
  onChange: (id: string) => void
  /** Active pill styling — defaults to the emerald brand, override per section accent. */
  activeClassName?: string
}

/**
 * Segmented sub-navigation used inside a section tab.
 * Visually mirrors the in-page tab bars already used by AgroMarket / EmergencyContacts.
 */
export function SubTabBar({
  tabs,
  activeId,
  onChange,
  activeClassName = 'bg-forest text-white',
}: SubTabBarProps) {
  return (
    <div className="rounded-[24px] bg-white p-3 shadow-md dark:bg-[#1a2420] sm:p-4">
      <PillRow>
        {tabs.map((tab) => {
          const isActive = activeId === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onChange(tab.id)}
              className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? activeClassName
                  : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </PillRow>
    </div>
  )
}
