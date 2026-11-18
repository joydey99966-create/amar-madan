import { MessageSquarePlus } from 'lucide-react'

interface SuggestPriceButtonProps {
  onClick: () => void
}

/**
 * Floating trigger for the price suggestion form.
 * Uses fixed positioning so it never changes the existing page layout.
 */
export function SuggestPriceButton({ onClick }: SuggestPriceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-emerald-950/25 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark hover:shadow-2xl active:scale-95 sm:right-6 sm:text-sm md:bottom-6"
      aria-label="তথ্য দিয়ে সাহায্য করুন — দামের তথ্য জমা দিন"
    >
      <MessageSquarePlus size={18} className="shrink-0" />
      <span className="whitespace-nowrap">তথ্য দিয়ে সাহায্য করুন</span>
    </button>
  )
}
