import { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { ToastMessage, ToastType } from '../../types'
import { useToast } from '../../context/ToastContext'

interface ToastItemProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const bgColors: Record<ToastType, string> = {
    success: 'bg-emerald-600 dark:bg-emerald-700',
    error: 'bg-rose-600 dark:bg-rose-700',
    info: 'bg-blue-600 dark:bg-blue-700',
  }

  const icons: Record<ToastType, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }

  const Icon = icons[toast.type] || CheckCircle2

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl ${bgColors[toast.type]} px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-950/20 backdrop-blur-md transition-all animate-slide-up`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={18} className="shrink-0" />
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
        aria-label="বার্তা বন্ধ করুন"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 z-50 mx-auto w-full max-w-md -translate-x-1/2 px-4 sm:bottom-28">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}
