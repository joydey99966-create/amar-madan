import { MapPin } from 'lucide-react'
import { ListingMeta } from '../../common/ListingMeta'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'

interface ContactListCardProps {
  name: string
  details: string
  area: string
  phone: string
  section: string
  accent: 'emerald' | 'blue' | 'amber'
}

/** One stacked card in the emergency lists; becomes a grid cell on desktop. */
export function ContactListCard({ name, details, area, phone, section, accent }: ContactListCardProps) {
  const border = {
    emerald: 'border-emerald-100 dark:border-emerald-900/30',
    blue: 'border-blue-100 dark:border-blue-900/30',
    amber: 'border-amber-100 dark:border-amber-900/30',
  }[accent]

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-soft-sm dark:bg-[#1a2420] sm:p-5 ${border}`}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{name}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{details}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <MapPin size={15} className="shrink-0 text-forest dark:text-emerald-300" />
        <span>{area}</span>
      </div>
      <ListingMeta listing={name} section={section} />
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
        <CallButton phone={phone} />
        <CopyPhoneButton phone={phone} />
        <WhatsAppButton phone={phone} />
      </div>
    </div>
  )
}
