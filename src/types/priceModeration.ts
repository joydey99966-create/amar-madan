export type PriceModerationStatus = 'pending' | 'approved' | 'rejected'

/**
 * A price change proposal waiting in the moderation queue.
 *
 * This is intentionally separate from `MarketPrice`. Approving or rejecting a
 * submission only changes its status inside the queue; it never writes to the
 * live market price list.
 */
export interface PriceSubmission {
  id: string
  productName: string
  category: string
  suggestedPrice: number
  currentPrice: number
  location: string
  submittedBy?: string
  /** ISO 8601 timestamp of when the price was submitted. */
  timestamp: string
  status: PriceModerationStatus
}

/**
 * Payload used when adding a new submission to the queue.
 * `id`, `timestamp` and `status` are assigned by the service by default.
 */
export type PriceSubmissionInput = Omit<PriceSubmission, 'id' | 'timestamp' | 'status'> & {
  timestamp?: string
  status?: PriceModerationStatus
}

/** Why a public submission was refused before it could reach the queue. */
export type PriceSubmissionBlockReason = 'rate-limit' | 'duplicate' | 'queue-full'

export interface PriceSubmissionGuard {
  allowed: boolean
  reason?: PriceSubmissionBlockReason
  /** Ready-to-render Bengali copy for the blocked submission. */
  message?: string
  retryAfterMinutes?: number
}

export interface PriceSubmissionResult {
  /** The queued item, or `null` when the spam policy rejected the payload. */
  submission: PriceSubmission | null
  guard: PriceSubmissionGuard
}
