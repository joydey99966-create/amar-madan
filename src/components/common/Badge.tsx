import { ReactNode } from 'react'

export type BadgeType = 'default' | 'urgent' | 'approved' | 'pending' | 'success'

interface BadgeProps {
  children: ReactNode
  type?: BadgeType
  className?: string
}

export function Badge({ children, type = 'default', className = '' }: BadgeProps) {
  const styles: Record<BadgeType, string> = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    urgent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[type]} ${className}`}>
      {children}
    </span>
  )
}
