import { useMemo } from 'react'
import { Calendar, Droplets, MapPin } from 'lucide-react'
import { BloodDonor } from '../../../types'
import { getDonorStatus } from '../../../services/bloodDonorService'
import { donorSettingsService } from '../../../services/donorSettingsService'
import { useDataVersion } from '../../../hooks/useDataVersion'
import { formatDate } from '../../../utils/formatters'
import { ModalShell } from '../../common/ModalShell'
import { CallButton, CopyPhoneButton, WhatsAppButton } from '../../common/ContactActions'

interface DonorDetailDialogProps {
  donor: BloodDonor | null
  onClose: () => void
}

/**
 * Full detail for a single donor, opened by tapping the donor's name. Uses the
 * shared ModalShell so it is capped at ~90vh, scrolls internally and closes on
 * Escape / backdrop click. Call & WhatsApp appear only for contactable donors.
 * Respects the admin-controlled donor phone masking preference.
 */
export function DonorDetailDialog({ donor, onClose }: DonorDetailDialogProps) {
  const donorSettingsVersion = useDataVersion('donor-settings')
  const phoneMasked = useMemo(() => donorSettingsService.get().phoneDisplay === 'masked', [donorSettingsVersion])
  const displayPhone = (phone: string) =>
    phoneMasked ? `••••${String(phone ?? '').slice(-4)}` : phone

  if (!donor) return null
  const status = getDonorStatus(donor)

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      title={donor.name}
      description="রক্তদাতার বিস্তারিত তথ্য"
      titleId="donor-detail-title"
      maxWidthClass="max-w-md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          বন্ধ করুন
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
          {donor.bloodGroup}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {status.availabilityBadge}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {status.readinessLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="shrink-0 text-forest dark:text-emerald-300" />
          <span>{donor.unionArea}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {donor.lastDonationDate
              ? `গত রক্তদান: ${formatDate(donor.lastDonationDate)}`
              : 'গত রক্তদানের তথ্য নেই'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={16} className="shrink-0 text-rose-500" />
          <span>মোবাইল: {displayPhone(donor.phone)}</span>
        </div>
      </div>

      {status.canContact ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
          <CallButton phone={donor.phone} label={displayPhone(donor.phone)} />
          {!phoneMasked && <CopyPhoneButton phone={donor.phone} />}
          {!phoneMasked && <WhatsAppButton phone={donor.phone} />}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
          যাচাইয়ের অপেক্ষায় — অনুমোদনের পর যোগাযোগের সুবিধা পাওয়া যাবে।
        </p>
      )}
    </ModalShell>
  )
}
