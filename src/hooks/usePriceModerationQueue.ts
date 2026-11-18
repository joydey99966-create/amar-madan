import { useCallback, useMemo, useState } from 'react'
import { priceModerationService } from '../services/priceModerationService'
import {
  PriceModerationStatus,
  PriceSubmission,
  PriceSubmissionInput,
  PriceSubmissionResult,
} from '../types/priceModeration'

export type PriceModerationFilter = PriceModerationStatus | 'all'

/**
 * React state wrapper around the isolated Price Moderation Queue.
 * Nothing here reads from or writes to the live market price list.
 */
export function usePriceModerationQueue(initialFilter: PriceModerationFilter = 'pending') {
  const [submissions, setSubmissions] = useState<PriceSubmission[]>(() =>
    priceModerationService.getAll(),
  )
  const [statusFilter, setStatusFilter] = useState<PriceModerationFilter>(initialFilter)

  const refresh = useCallback(() => {
    setSubmissions(priceModerationService.getAll())
  }, [])

  const addSubmission = useCallback((input: PriceSubmissionInput) => {
    const created = priceModerationService.add(input)
    setSubmissions(priceModerationService.getAll())
    return created
  }, [])

  /**
   * Guarded entry point for public submissions: the spam policy is applied
   * before anything is written, and the result is always a `pending` item.
   */
  const submitSubmission = useCallback((input: PriceSubmissionInput): PriceSubmissionResult => {
    const result = priceModerationService.submit(input)
    setSubmissions(priceModerationService.getAll())
    return result
  }, [])

  const approveSubmission = useCallback((id: string) => {
    const updated = priceModerationService.approve(id)
    setSubmissions(priceModerationService.getAll())
    return updated
  }, [])

  const rejectSubmission = useCallback((id: string) => {
    const updated = priceModerationService.reject(id)
    setSubmissions(priceModerationService.getAll())
    return updated
  }, [])

  const removeSubmission = useCallback((id: string) => {
    priceModerationService.remove(id)
    setSubmissions(priceModerationService.getAll())
  }, [])

  const resetQueue = useCallback(() => {
    setSubmissions(priceModerationService.reset())
  }, [])

  const clearQueue = useCallback(() => {
    setSubmissions(priceModerationService.clear())
  }, [])

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === 'all') return submissions
    return submissions.filter((submission) => submission.status === statusFilter)
  }, [submissions, statusFilter])

  const pendingSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === 'pending'),
    [submissions],
  )

  const counts = useMemo(
    () => ({
      all: submissions.length,
      pending: submissions.filter((submission) => submission.status === 'pending').length,
      approved: submissions.filter((submission) => submission.status === 'approved').length,
      rejected: submissions.filter((submission) => submission.status === 'rejected').length,
    }),
    [submissions],
  )

  return {
    submissions,
    filteredSubmissions,
    pendingSubmissions,
    pendingCount: counts.pending,
    counts,
    statusFilter,
    setStatusFilter,
    addSubmission,
    submitSubmission,
    approveSubmission,
    rejectSubmission,
    removeSubmission,
    resetQueue,
    clearQueue,
    refresh,
  }
}
