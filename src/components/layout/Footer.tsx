import { Heart, Lock, Phone, MapPin, Mail, AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { displayOrderService } from '../../services/displayOrderService'
import { useDataVersion } from '../../hooks/useDataVersion'
import { emergencyVisual } from '../../constants'
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts'
import { ViewId } from '../../types'
import { InstallAppButton } from '../common/InstallAppButton'

interface FooterProps {
  onNavigate: (id: ViewId) => void
}

const quickLinks: { key: string; label: string; id: ViewId }[] = [
  { key: 'home', label: 'হোম', id: 'home' },
  { key: 'services', label: 'সব সেবা', id: 'services' },
  { key: 'blood', label: 'রক্তদাতা', id: 'emergency' },
  { key: 'hotline', label: 'জরুরি', id: 'emergency' },
  { key: 'market', label: 'বাজার দর', id: 'market' },
  { key: 'fish', label: 'হাওরের মাছ', id: 'fish' },
  { key: 'transport', label: 'যাতায়াত', id: 'transport' },
  { key: 'lostfound', label: 'হারানো ও প্রাপ্তি', id: 'lostfound' },
  { key: 'news', label: 'সংবাদ ও প্রেসক্লাব', id: 'news' },
  { key: 'jobs', label: 'চাকরি ও টিউশনি', id: 'jobs' },
  { key: 'citizens', label: 'নাগরিক সেবা', id: 'citizens' },
  { key: 'doctors', label: 'ডিরেক্টরি', id: 'directory' },
  { key: 'profile', label: 'প্রোফাইল', id: 'profile' },
]

export function Footer({ onNavigate }: FooterProps) {
  const { requestAdminAccess, isAuthenticated } = useAdmin()
  const contacts = useEmergencyContacts()
  const orderVersion = useDataVersion('order')
  const orderedQuick = useMemo(
    () => displayOrderService.sortByKey(quickLinks, displayOrderService.get().footer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderVersion],
  )

  return (
    <footer className="mt-8 border-t border-slate-200/80 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400 sm:pt-8">
      <div className="space-y-6">
        {/* Emergency hotlines — highlighted, full width */}
        <div className="rounded-2xl border border-rose-200/70 bg-[#fff5f4] p-4 dark:border-rose-900/40 dark:bg-[#201516] sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
              <AlertTriangle size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">জরুরি হটলাইন</h3>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">যেকোনো সময় সরাসরি কল করুন</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => {
              const { icon: Icon } = emergencyVisual(contact.category)
              return (
                <a
                  key={contact.id}
                  href={`tel:${contact.dial}`}
                  className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Icon size={14} className="shrink-0 text-rose-500" />
                  <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{contact.name}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{contact.phone}</span>
                </a>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Contact */}
          <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#182420]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest dark:bg-emerald-900/40 dark:text-emerald-300">
                <Phone size={16} />
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">যোগাযোগ</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone size={13} className="shrink-0 text-forest dark:text-emerald-300" />
                <span className="text-slate-500 dark:text-slate-400">
                  যোগাযোগের তথ্য যাচাই চলছে
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="shrink-0 text-forest dark:text-emerald-300" />
                <a
                  href="mailto:info@amarmadan.app"
                  className="transition hover:text-forest dark:hover:text-emerald-300"
                >
                  info@amarmadan.app
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={13} className="shrink-0 text-forest dark:text-emerald-300" />
                <span>উপজেলা পরিষদ, মদন</span>
              </li>
            </ul>
            <div className="pt-1">
              <h4 className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">দ্রুত লিংক</h4>
              <div className="flex flex-wrap gap-1.5">
                {orderedQuick.map((link) => (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => onNavigate(link.id)}
                    className="min-h-[32px] rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-forest hover:text-forest dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-300"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#182420]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <Heart size={16} />
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">আমার মদন</h3>
            </div>
            <p className="leading-5">
              মদন উপজেলার স্থানীয় সেবা, তথ্য ও জরুরি যোগাযোগের একটি ডিজিটাল প্ল্যাটফর্ম।
              স্থানীয় মানুষের জন্য, স্থানীয় মানুষের দ্বারা।
            </p>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MapPin size={13} className="shrink-0" />
              <span>মদন, নেত্রকোণা, বাংলাদেশ</span>
            </div>
            <div className="pt-1">
              <InstallAppButton compact />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 py-5 text-xs sm:flex-row dark:border-white/10">
        <div className="flex items-center gap-2">
          <p>© ২০২৬ আমার মদন · মদন, নেত্রকোণা</p>
          <button
            onClick={requestAdminAccess}
            title={isAuthenticated ? 'অ্যাডমিন ড্যাশবোর্ড' : 'অ্যাডমিন লগইন'}
            className="rounded p-1 text-slate-400 hover:text-forest dark:hover:text-emerald-300"
            aria-label="অ্যাডমিন অ্যাক্সেস"
          >
            <Lock size={12} />
          </button>
        </div>
        <p className="flex items-center gap-1.5">
          <Heart size={13} className="text-rose-500" /> স্থানীয় মানুষের জন্য, স্থানীয় মানুষের দ্বারা
        </p>
      </div>
    </footer>
  )
}