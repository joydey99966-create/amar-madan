import { Tag } from 'lucide-react'

interface AddPriceButtonProps {
  onClick: () => void
  /** Label of the button — each market tab has its own wording. */
  label?: string
}

/**
 * Floating trigger for the "add a market price" form.
 * Uses fixed positioning so it never changes the existing page layout.
 */
export function AddPriceButton({ onClick, label = 'বাজারের দাম যোগ করুন' }: AddPriceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-emerald-950/25 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark hover:shadow-2xl active:scale-95 sm:right-6 sm:text-sm md:bottom-6"
      aria-label={label}
    >
      <Tag size={18} className="shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
