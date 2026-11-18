import { useState } from 'react'
import { EducationInstitution, Hospital, ServiceProvider } from '../../../types'
import { formatDate } from '../../../utils/formatters'
import { lostFoundService } from '../../../services/lostFoundService'
import { useDataVersion } from '../../../hooks/useDataVersion'
import { SubTabBar } from '../../common/SubTabBar'
import { ServiceCard } from '../../common/ContactCard'
import { EmptyState } from '../../common/EmptyState'
import { DoctorsDirectory } from '../doctors/DoctorsDirectory'
import { EducationDirectory } from '../education/EducationDirectory'
import { HospitalsDirectory } from '../hospitals/HospitalsDirectory'

interface LocalDirectoryProps {
  doctors: ServiceProvider[]
  hospitals: Hospital[]
  institutions: EducationInstitution[]
  transport: ServiceProvider[]
  /** Controlled sub-tab, so a tile can open the list it actually points at. */
  activeTab?: DirectoryTab
  onTabChange?: (tab: DirectoryTab) => void
  /** Search text carried from the homepage. */
  query?: string
  onClearQuery?: () => void
}

export type DirectoryTab = 'doctors' | 'hospitals' | 'education' | 'transport' | 'lostfound'

export function LocalDirectory({
  doctors,
  hospitals,
  institutions,
  transport,
  activeTab,
  onTabChange,
  query = '',
  onClearQuery,
}: LocalDirectoryProps) {
  const [localTab, setLocalTab] = useState<DirectoryTab>('doctors')
  const currentTab = activeTab ?? localTab

  const handleTabChange = (id: string) => {
    const nextTab = id as DirectoryTab
    setLocalTab(nextTab)
    onTabChange?.(nextTab)
  }

  // Re-read on each render so admin-approved entries are reflected immediately.
  const lostFoundVersion = useDataVersion('lostfound')
  void lostFoundVersion
  const approvedLostFound = lostFoundService
    .getAll()
    .filter((item) => item.isApproved !== false)

  return (
    <section className="space-y-6">
      <SubTabBar
        tabs={[
          { id: 'doctors', label: '👨‍⚕️ ডাক্তার' },
          { id: 'hospitals', label: '🏥 হাসপাতাল' },
          { id: 'education', label: '🎓 শিক্ষা প্রতিষ্ঠান' },
          { id: 'transport', label: '🚗 গাড়ি ভাড়া' },
          { id: 'lostfound', label: '🔎 হারানো ও প্রাপ্তি' },
        ]}
        activeId={currentTab}
        onChange={handleTabChange}
      />

      {currentTab === 'doctors' && (
        <div role="tabpanel">
          <DoctorsDirectory doctors={doctors} query={query} onClearQuery={onClearQuery} />
        </div>
      )}

      {currentTab === 'hospitals' && (
        <div role="tabpanel">
          <HospitalsDirectory hospitals={hospitals} query={query} onClearQuery={onClearQuery} />
        </div>
      )}

      {currentTab === 'education' && (
        <div role="tabpanel">
          <EducationDirectory
            institutions={institutions}
            query={query}
            onClearQuery={onClearQuery}
          />
        </div>
      )}

      {currentTab === 'transport' && (
        <div role="tabpanel" className="grid gap-3 sm:gap-4">
          {transport.length === 0 ? (
            <EmptyState
              title="কোনো গাড়ি ভাড়ার তথ্য পাওয়া যায়নি"
              description="বর্তমানে কোনো পরিবহন সেবার তথ্য উপলব্ধ নেই।"
            />
          ) : (
            transport.map((item) => (
              <ServiceCard
                key={item.id}
                title={item.name}
                subtitle={item.details}
                location={item.area}
                phone={item.phone}
                category="গাড়ি ভাড়া"
                section="গাড়ি ভাড়া"
                updated={item.lastUpdated}
              />
            ))
          )}
        </div>
      )}

      {currentTab === 'lostfound' && (
        <div role="tabpanel" className="grid gap-3 sm:gap-4">
          {approvedLostFound.length === 0 ? (
            <EmptyState
              title="কোনো হারানো বা প্রাপ্ত জিনিস নেই"
              description="নতুন কিছু হারালে বা পেলে আমাদের জানান — অনুমোদনের পর এখানে দেখা যাবে।"
            />
          ) : (
            approvedLostFound.map((item) => (
              <ServiceCard
                key={item.id}
                title={`${item.type}: ${item.itemName}`}
                subtitle={`${item.description || 'বিস্তারিত নেই'} • ${formatDate(item.date)}`}
                location={item.location}
                phone={item.phone}
                category="হারানো ও প্রাপ্তি"
                section="হারানো ও প্রাপ্তি"
                updated={item.lastUpdated ?? item.postedAt}
                badge={
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.type === 'হারানো'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}
                  >
                    {item.type}
                  </span>
                }
              />
            ))
          )}
        </div>
      )}
    </section>
  )
}
