import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { ServiceProvider } from '../../../types'
import { copyToClipboard } from '../../../utils/clipboard'
import { useToast } from '../../../context/ToastContext'
import { cleanPhone } from '../../../utils/formatters'
import { CallButton, CopyPhoneButton } from '../../common/ContactActions'
import { isPlaceholderPhone, UNVERIFIED } from '../../../utils/placeholderData'
import { EmptyState } from '../../common/EmptyState'
import { ListingMeta } from '../../common/ListingMeta'
import { useEmergencyContacts } from '../../../hooks/useEmergencyContacts'
import { emergencyVisual } from '../../../constants'
import { PillRow } from '../../common/PillRow'

interface EmergencyContactsProps {
  ambulances: ServiceProvider[]
  doctors: ServiceProvider[]
  technicians: ServiceProvider[]
}

const fareEstimates = [
  { route: 'মদন সদর → উপজেলা স্বাস্থ্য কমপ্লেক্স', fare: '৭০০ টাকা', distance: '৩-৪ কিমি' },
  { route: 'মদন সদর → নেত্রকোণা জেলা হাসপাতাল', fare: '১৭৫০ টাকা', distance: '৩০-৩৫ কিমি' },
  { route: 'কাইটাইল → মদন সদর', fare: '৯০০ টাকা', distance: '১৫-১৮ কিমি' },
  { route: 'চানগাঁও → উপজেলা স্বাস্থ্য কমপ্লেক্স', fare: '৯০০ টাকা', distance: '১০-১২ কিমি' },
]

type EmergencyTab = 'hotlines' | 'ambulances' | 'doctors' | 'technicians' | 'fares'

export function EmergencyContacts({ ambulances, doctors, technicians }: EmergencyContactsProps) {
  const contacts = useEmergencyContacts()
  const [activeTab, setActiveTab] = useState<EmergencyTab>('hotlines')
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleCopy = (phone: string) => {
    copyToClipboard(
      phone,
      () => {
        setCopiedPhone(phone)
        addToast('নম্বর কপি করা হয়েছে!', 'success')
        setTimeout(() => setCopiedPhone(null), 2000)
      },
      () => addToast('কপি করতে ব্যর্থ হয়েছে', 'error'),
    )
  }

  const tabButtons: { id: EmergencyTab; label: string }[] = [
    { id: 'hotlines', label: '🆘 জরুরি হটলাইন' },
    { id: 'ambulances', label: '🚑 অ্যাম্বুলেন্স' },
    { id: 'doctors', label: '👨‍⚕️ ডাক্তার' },
    { id: 'technicians', label: '🔧 প্লাম্বার/মিস্ত্রি' },
    { id: 'fares', label: '💰 ভাড়া তালিকা' },
  ]

  return (
    <section className="scroll-mt-24 space-y-6">
      <div className="sticky top-20 z-20 rounded-[24px] bg-white p-3 shadow-md dark:bg-[#1a2420] sm:p-4">
        <PillRow trackClassName="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              data-active={activeTab === tab.id ? 'true' : 'false'}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-rose-500 text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-rose-300 dark:border-white/10 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </PillRow>
      </div>

      {activeTab === 'hotlines' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-red-50 p-4 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-200">
            ⚠️ <strong>জরুরি পরিস্থিতিতে নিম্নলিখিত নম্বরে অবিলম্বে ফোন করুন:</strong>
          </div>

          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900/30 dark:bg-[#1a2420] sm:p-5"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{emergencyVisual(contact.category).emoji}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{contact.name}</h3>
                  <div className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {isPlaceholderPhone(contact.dial ?? contact.phone) ? UNVERIFIED : contact.phone}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <CallButton phone={contact.phone} dial={contact.dial} />
                <CopyPhoneButton phone={contact.phone} copied={copiedPhone === contact.phone} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ambulances' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            🚑 ২৪ ঘণ্টা অ্যাম্বুলেন্স সেবা উপলব্ধ
          </div>

          {ambulances.length === 0 ? (
            <EmptyState
              title="অ্যাম্বুলেন্স পাওয়া যায়নি"
              description="বর্তমানে কোনো অ্যাম্বুলেন্স তালিকাভুক্ত নেই।"
            />
          ) : (
            ambulances.map((amb) => (
              <div
                key={amb.id}
                className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900/30 dark:bg-[#1a2420] sm:p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{amb.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{amb.details}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-base">📍</span>
                  <span>{amb.area}</span>
                </div>

                <ListingMeta listing={amb.name} section="জরুরি সেবা (অ্যাম্বুলেন্স)" />

                <div className="flex flex-wrap gap-2 border-t border-emerald-100 pt-3 dark:border-emerald-900/30">
                  <CallButton phone={amb.phone} />
                  <button
                    onClick={() => handleCopy(amb.phone)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    title="নম্বর কপি করুন"
                    aria-label="নম্বর কপি করুন"
                  >
                    {copiedPhone === amb.phone ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://wa.me/${cleanPhone(amb.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-blue-50 p-4 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            👨‍⚕️ জরুরি চিকিৎসা সেবার জন্য নিকটতম ডাক্তার
          </div>

          {doctors.length === 0 ? (
            <EmptyState
              title="ডাক্তার পাওয়া যায়নি"
              description="বর্তমানে কোনো জরুরি ডাক্তারের তালিকা উপলব্ধ নেই।"
            />
          ) : (
            doctors.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/30 dark:bg-[#1a2420] sm:p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{doc.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{doc.details}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-base">📍</span>
                  <span>{doc.area}</span>
                </div>

                <ListingMeta listing={doc.name} section="জরুরি সেবা (ডাক্তার)" />

                <div className="flex flex-wrap gap-2 border-t border-blue-100 pt-3 dark:border-blue-900/30">
                  <CallButton phone={doc.phone} />
                  <button
                    onClick={() => handleCopy(doc.phone)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    title="নম্বর কপি করুন"
                    aria-label="নম্বর কপি করুন"
                  >
                    {copiedPhone === doc.phone ? <Check size={14} className="text-blue-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://wa.me/${cleanPhone(doc.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'technicians' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            🔧 দ্রুত মেরামত ও রক্ষণাবেক্ষণ সেবা
          </div>

          {technicians.length === 0 ? (
            <EmptyState
              title="টেকনিশিয়ান পাওয়া যায়নি"
              description="বর্তমানে কোনো টেকনিশিয়ানের তথ্য উপলব্ধ নেই।"
            />
          ) : (
            technicians.map((tech) => (
              <div
                key={tech.id}
                className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900/30 dark:bg-[#1a2420] sm:p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{tech.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tech.details}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-base">📍</span>
                  <span>{tech.area}</span>
                </div>

                <ListingMeta listing={tech.name} section="প্লাম্বার ও মিস্ত্রি" />

                <div className="flex flex-wrap gap-2 border-t border-amber-100 pt-3 dark:border-amber-900/30">
                  <CallButton phone={tech.phone} />
                  <button
                    onClick={() => handleCopy(tech.phone)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 text-amber-700 transition hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    title="নম্বর কপি করুন"
                    aria-label="নম্বর কপি করুন"
                  >
                    {copiedPhone === tech.phone ? <Check size={14} className="text-amber-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://wa.me/${cleanPhone(tech.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'fares' && (
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl bg-purple-50 p-4 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
            💰 <strong>অ্যাম্বুলেন্স ভাড়া তালিকা (আনুমানিক):</strong> বাস্তব দর অ্যাম্বুলেন্স প্রদানকারীর সাথে নিশ্চিত করুন।
          </div>

          {fareEstimates.map((estimate, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900/30 dark:bg-[#1a2420] sm:p-5"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{estimate.route}</h3>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">দূরত্ব: {estimate.distance}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{estimate.fare}</div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-800 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-200">
            📌 <strong>নোট:</strong> দাম যানবাহনের ধরন, সময় ও জরুরি পরিস্থিতির উপর নির্ভর করে পরিবর্তনশীল। অ্যাম্বুলেন্স প্রদানকারীকে সরাসরি যোগাযোগ করুন।
          </div>
        </div>
      )}
    </section>
  )
}
