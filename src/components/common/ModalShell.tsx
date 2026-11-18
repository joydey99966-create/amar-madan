import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalShellProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  /** id used by aria-labelledby; must be unique on the page. */
  titleId: string
  children: ReactNode
  footer: ReactNode
  maxWidthClass?: string
}

/**
 * Shared bottom-sheet / dialog frame: sticky header, scrollable body and a
 * sticky action bar. Escape closes it and the page behind it cannot scroll.
 */
export function ModalShell({
  isOpen,
  onClose,
  title,
  description,
  titleId,
  children,
  footer,
  maxWidthClass = 'max-w-md',
}: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[90dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-[#0f1411] sm:max-h-[calc(90dvh-2rem)] sm:rounded-[32px]`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {children}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/10 sm:px-6">
          {footer}
        </div>
      </div>
    </div>
  )
}

/** Shared input / select styling for the Step 5 forms. */
export const formFieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition dark:border-white/10 dark:bg-[#1a2420] text-slate-800 dark:text-white'

export const formLabelClass = 'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300'

export const formErrorClass = 'mt-1 text-xs text-rose-600 dark:text-rose-400'
