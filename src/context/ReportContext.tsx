import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'
import { reportService } from '../services/reportService'
import { ReportModal } from '../components/common/ReportModal'

export interface ReportTarget {
  /** Human readable name of the listing, e.g. "ডাক্তার: ডাঃ মোঃ আলী ওসমান". */
  listing: string
  /** Section name, e.g. "ডাক্তার তালিকা". */
  section: string
}

interface ReportContextValue {
  requestReport: (target: ReportTarget) => void
}

const ReportContext = createContext<ReportContextValue | undefined>(undefined)

/**
 * Lets any listing on any page open the shared "ভুল তথ্য জানান" dialog without
 * threading modal props through every card component.
 */
export function ReportProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ReportTarget | null>(null)

  const requestReport = useCallback((next: ReportTarget) => setTarget(next), [])
  const closeReport = useCallback(() => setTarget(null), [])

  const submitReport = useCallback(
    (input: { reason: string; details: string; contact?: string }) => {
      if (!target) return
      reportService.add({
        listing: target.listing,
        section: target.section,
        reason: input.reason,
        details: input.details,
        contact: input.contact,
      })
    },
    [target],
  )

  const value = useMemo(() => ({ requestReport }), [requestReport])

  return (
    <ReportContext.Provider value={value}>
      {children}
      <ReportModal
        isOpen={target !== null}
        target={target}
        onClose={closeReport}
        onSubmit={submitReport}
      />
    </ReportContext.Provider>
  )
}

export function useReport(): ReportContextValue {
  const context = useContext(ReportContext)
  if (!context) throw new Error('useReport must be used inside <ReportProvider>')
  return context
}
