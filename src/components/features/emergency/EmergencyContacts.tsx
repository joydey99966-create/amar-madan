import { useState } from 'react'
import { Ambulance, AlertTriangle, Banknote, Info, MapPin, Phone, ShieldAlert, Stethoscope, Wrench } from 'lucide-react'
import { ServiceProvider } from '../../../types'
import { useEmergencyContacts } from '../../../hooks/useEmergencyContacts'
import { emergencyVisual } from '../../../constants'
import { EmptyState } from '../../common/EmptyState'
import { PillRow } from '../../common/PillRow'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'
import { ContactListCard } from './ContactListCard'

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

/** Shared notice strip with a lucide icon — replaces the old emoji banners. */
function Notice({ tone, icon: Icon, children }: { tone: 'red' | 'emerald' | 'blue' | 'amber' | 'purple' | 'orange'; icon: typeof Info; children: React.ReactNode }) {
  const tones = {
    red: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    emerald: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
    blue: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    amber: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    purple: 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
    orange: 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
  }
  return (
    <div className={`flex items-start gap-2 rounded-2xl p-4 text-sm ${tones[tone]}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function EmergencyContacts({ ambulances, doctors, technicians }: EmergencyContactsProps) {
  const contacts = useEmergencyContacts()
  const [activeTab, setActiveTab] = useState<EmergencyTab>('hotlines')

  const tabs: { id: EmergencyTab; label: string; icon: typeof Info }[] = [
    { id: 'hotlines', label: 'জরুরি হটলাইন', icon: Phone },
    { id: 'ambulances', label: 'অ্যাম্বুলেন্স', icon: Ambulance },
    { id: 'doctors', label: 'ডাক্তার', icon: Stethoscope },
    { id: 'technicians', label: 'মিস্ত্রি', icon: Wrench },
    { id: 'fares', label: 'ভাড়া তালিকা', icon: Banknote },
  ]

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="sticky top-16 z-20 rounded-2xl bg-white p-2.5 shadow-md dark:bg-[#1a2420] sm:rounded-[24px] sm:p-4">
        <PillRow>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                data-active={active ? 'true' : 'false'}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest ${
                  active
                    ? 'bg-rose-500 text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-forest dark:border-white/10 dark:text-slate-300'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </PillRow>
      </div>

      {activeTab === 'hotlines' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Notice tone="red" icon={AlertTriangle}>
              <strong>জরুরি পরিস্থিতিতে নিচের নম্বরে অবিলম্বে কল করুন।</strong>
            </Notice>
          </div>
          {contacts.map((contact) => {
            const { icon: Icon } = emergencyVisual(contact.category)
            return (
              <div key={contact.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft-sm dark:border-white/10 dark:bg-[#1a2420]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{contact.name}</h3>
                  <div className="mt-1 text-sm font-semibold text-rose-600 dark:text-rose-400">{contact.phone}</div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                  <CallButton phone={contact.phone} dial={contact.dial} />
                  <CopyPhoneButton phone={contact.phone} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'ambulances' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Notice tone="emerald" icon={Ambulance}>২৪ ঘণ্টা অ্যাম্বুলেন্স সেবা উপলব্ধ।</Notice>
          </div>
          {ambulances.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <EmptyState title="অ্যাম্বুলেন্স পাওয়া যায়নি" description="বর্তমানে কোনো অ্যাম্বুলেন্স তালিকাভুক্ত নেই।" />
            </div>
          ) : ambulances.map((amb) => (
            <ContactListCard key={amb.id} name={amb.name} details={amb.details} area={amb.area} phone={amb.phone} section="জরুরি সেবা (অ্যাম্বুলেন্স)" accent="emerald" />
          ))}
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Notice tone="blue" icon={Stethoscope}>জরুরি চিকিৎসার জন্য নিকটতম ডাক্তার।</Notice>
          </div>
          {doctors.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <EmptyState title="ডাক্তার পাওয়া যায়নি" description="বর্তমানে কোনো জরুরি ডাক্তারের তথ্য নেই।" />
            </div>
          ) : doctors.map((doc) => (
            <ContactListCard key={doc.id} name={doc.name} details={doc.details} area={doc.area} phone={doc.phone} section="জরুরি সেবা (ডাক্তার)" accent="blue" />
          ))}
        </div>
      )}

      {activeTab === 'technicians' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Notice tone="amber" icon={Wrench}>দ্রুত মেরামত ও রক্ষণাবেক্ষণ সেবা।</Notice>
          </div>
          {technicians.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <EmptyState title="টেকনিশিয়ান পাওয়া যায়নি" description="বর্তমানে কোনো টেকনিশিয়ানের তথ্য নেই।" />
            </div>
          ) : technicians.map((tech) => (
            <ContactListCard key={tech.id} name={tech.name} details={tech.details} area={tech.area} phone={tech.phone} section="প্লাম্বার ও মিস্ত্রি" accent="amber" />
          ))}
        </div>
      )}

      {activeTab === 'fares' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Notice tone="purple" icon={Banknote}>অ্যাম্বুলেন্স ভাড়া (আনুমানिक) — বাস্তব দর প্রদানকারীর সাথে নিশ্চিত করুন।</Notice>
          </div>
          {fareEstimates.map((estimate) => (
            <div key={estimate.route} className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft-sm dark:border-white/10 dark:bg-[#1a2420]">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{estimate.route}</h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><MapPin size={14} /> দূরত্ব: {estimate.distance}</div>
              <div className="mt-auto pt-2 text-base font-bold text-forest dark:text-emerald-300">{estimate.fare}</div>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <Notice tone="orange" icon={Info}>দাম যানবাহনের ধরন ও সময়ের উপর নির্ভর করে পরিবর্তনশীল।</Notice>
          </div>
        </div>
      )}
    </section>
  )
}
