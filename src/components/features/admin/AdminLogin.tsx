import { useState } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { useAdmin } from '../../../context/AdminContext'

interface AdminLoginProps {
  onSuccess?: () => void
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { isAuthenticated, login, logout } = useAdmin()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(pin)) {
      setPin('')
      setError('')
      onSuccess?.()
    } else {
      setError('সঠিক পিন প্রবেশ করুন')
      setPin('')
    }
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-slate-500 sm:inline">অ্যাডমিন সক্রিয়</span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">লগআউট</span>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative">
        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError('')
          }}
          placeholder="অ্যাডমিন পিন"
          maxLength={12}
          autoComplete="off"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 dark:border-white/10 dark:bg-[#1a2420] dark:text-white sm:w-36 sm:px-4"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#104b38]"
      >
        <Lock size={14} />
        <span>লগইন করুন</span>
      </button>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </form>
  )
}
