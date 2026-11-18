import { useState } from 'react'
import { Droplets } from 'lucide-react'
import { BloodDonor, BloodGroup, ServiceProvider } from '../../../types'
import { SubTabBar } from '../../common/SubTabBar'
import { BloodDonorDirectory } from '../blood/BloodDonorDirectory'
import { EmergencyContacts } from './EmergencyContacts'

interface EmergencyBloodProps {
  donors: BloodDonor[]
  ambulances: ServiceProvider[]
  doctors: ServiceProvider[]
  technicians: ServiceProvider[]
  onRegisterDonor: () => void
  /** Controlled sub-tab, so a tile can open the list it actually points at. */
  activeTab?: EmergencyBloodTab
  onTabChange?: (tab: EmergencyBloodTab) => void
  /** Search text carried from the homepage. */
  query?: string
  /** Blood group carried from a search such as "O+ রক্ত". */
  bloodGroup?: BloodGroup | null
  onClearQuery?: () => void
}

export type EmergencyBloodTab = 'emergency' | 'blood'

export function EmergencyBlood({
  donors,
  ambulances,
  doctors,
  technicians,
  onRegisterDonor,
  activeTab,
  onTabChange,
  query = '',
  bloodGroup = null,
  onClearQuery,
}: EmergencyBloodProps) {
  const [localTab, setLocalTab] = useState<EmergencyBloodTab>('emergency')
  const currentTab = activeTab ?? localTab

  const handleTabChange = (tab: string) => {
    const nextTab = tab as EmergencyBloodTab
    setLocalTab(nextTab)
    onTabChange?.(nextTab)
  }

  return (
    <section className="space-y-6">
      <SubTabBar
        tabs={[
          { id: 'emergency', label: '🆘 জরুরি সেবা' },
          { id: 'blood', label: '🩸 রক্তদাতা' },
        ]}
        activeId={currentTab}
        onChange={handleTabChange}
        activeClassName="bg-rose-500 text-white"
      />

      {currentTab === 'emergency' ? (
        <div role="tabpanel">
          <EmergencyContacts
            ambulances={ambulances}
            doctors={doctors}
            technicians={technicians}
          />
        </div>
      ) : (
        <div role="tabpanel" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="section-eyebrow">জীবন বাঁচান</div>
              <h3 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
                রক্তদাতা ডিরেক্টরি
              </h3>
            </div>
            <button
              type="button"
              onClick={onRegisterDonor}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
            >
              <Droplets size={16} /> + রক্তদাতা হোন
            </button>
          </div>

          <BloodDonorDirectory
            donors={donors}
            initialGroup={bloodGroup ?? 'সব'}
            query={query}
            onClearQuery={onClearQuery}
          />
        </div>
      )}
    </section>
  )
}
