import { Download, Smartphone } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { useToast } from '../../context/ToastContext'

interface InstallAppButtonProps {
  className?: string
  /** Compact variant for the footer. */
  compact?: boolean
}

/**
 * "অ্যাপ ইনস্টল করুন" button. Uses the browser's native install sheet; when the
 * browser has not offered one yet it explains the manual menu route instead.
 */
export function InstallAppButton({ className = '', compact = false }: InstallAppButtonProps) {
  const { canInstall, installed, install } = usePwaInstall()
  const { addToast } = useToast()

  if (installed) {
    return (
      <p className={`flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 ${className}`}>
        <Smartphone size={14} /> অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে
      </p>
    )
  }

  const handleClick = async () => {
    if (!canInstall) {
      addToast(
        'ব্রাউজারের মেনু থেকে “Add to Home screen” বা “Install app” বেছে নিন।',
        'info',
      )
      return
    }
    const outcome = await install()
    if (outcome === 'accepted') addToast('অ্যাপ ইনস্টল শুরু হয়েছে!', 'success')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-xl bg-forest font-semibold text-white transition hover:bg-[#104b38] ${
        compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-sm'
      } ${className}`}
    >
      <Download size={compact ? 13 : 16} />
      অ্যাপ ইনস্টল করুন
    </button>
  )
}
