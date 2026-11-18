import { initialPriceSubmissions } from '../data/priceModerationQueue'
import {
  PriceModerationStatus,
  PriceSubmission,
  PriceSubmissionInput,
  PriceSubmissionBlockReason,
  PriceSubmissionGuard,
  PriceSubmissionResult,
} from '../types/priceModeration'
import { storageService } from './storageService'
import { toBanglaNumber } from '../utils/formatters'

/**
 * Dedicated storage key for the moderation queue.
 *
 * It is deliberately NOT `STORAGE_KEYS.MARKET_PRICES`: the queue is an
 * isolated layer and approving/rejecting an item never mutates the live
 * product price list used by the rest of the app.
 */
export const PRICE_MODERATION_STORAGE_KEY = 'amar-madan-price-moderation-queue'

/**
 * Separate key used only for spam throttling. It holds timestamps, never
 * price data, and is completely independent from the live market price list.
 */
const SUBMISSION_RATE_KEY = 'amar-madan-price-submission-rate'

/** Maximum submissions a single browser may send inside the rolling window. */
export const SUBMISSION_LIMIT = 3

/** Length of the rolling window used by the rate limiter (1 hour). */
export const SUBMISSION_WINDOW_MS = 60 * 60 * 1000

/** The queue stops accepting new items once this many are pending. */
export const MAX_PENDING_SUBMISSIONS = 25

export type { PriceSubmissionBlockReason, PriceSubmissionGuard, PriceSubmissionResult }

function cloneSeed(): PriceSubmission[] {
  return initialPriceSubmissions.map((submission) => ({ ...submission }))
}

function getAll(): PriceSubmission[] {
  const stored = storageService.get<PriceSubmission[] | null>(
    PRICE_MODERATION_STORAGE_KEY,
    null,
  )

  // First run (or corrupted/removed key): persist the Bengali demo entries so
  // the moderation workflow can be tested immediately.
  if (!Array.isArray(stored)) {
    const seeded = cloneSeed()
    storageService.set(PRICE_MODERATION_STORAGE_KEY, seeded)
    return seeded
  }

  return stored
}

function saveAll(submissions: PriceSubmission[]): void {
  storageService.set(PRICE_MODERATION_STORAGE_KEY, submissions)
}

function nextId(submissions: PriceSubmission[]): string {
  const highest = submissions.reduce((max, submission) => {
    const match = submission.id.match(/(\d+)$/)
    const numericId = match ? Number(match[1]) : 0
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max
  }, 0)

  return `pmq-${highest + 1}`
}

function getById(id: string): PriceSubmission | null {
  return getAll().find((submission) => submission.id === id) ?? null
}

function add(input: PriceSubmissionInput): PriceSubmission {
  const existing = getAll()
  const submission: PriceSubmission = {
    ...input,
    id: nextId(existing),
    timestamp: input.timestamp ?? new Date().toISOString(),
    status: input.status ?? 'pending',
  }

  saveAll([submission, ...existing])
  return submission
}

function updateStatus(id: string, status: PriceModerationStatus): PriceSubmission | null {
  const existing = getAll()
  const target = existing.find((submission) => submission.id === id)
  if (!target) return null

  const updated: PriceSubmission = { ...target, status }
  saveAll(existing.map((submission) => (submission.id === id ? updated : submission)))
  return updated
}

function approve(id: string): PriceSubmission | null {
  return updateStatus(id, 'approved')
}

function reject(id: string): PriceSubmission | null {
  return updateStatus(id, 'rejected')
}

function remove(id: string): PriceSubmission[] {
  const remaining = getAll().filter((submission) => submission.id !== id)
  saveAll(remaining)
  return remaining
}

function getByStatus(status: PriceModerationStatus): PriceSubmission[] {
  return getAll().filter((submission) => submission.status === status)
}

function getPending(): PriceSubmission[] {
  return getByStatus('pending')
}

function getPendingCount(): number {
  return getPending().length
}

/** Restore the three Bengali demo entries. Useful while testing. */
function reset(): PriceSubmission[] {
  const seeded = cloneSeed()
  saveAll(seeded)
  return seeded
}

/** Remove every queue item without affecting the live market price list. */
function clear(): PriceSubmission[] {
  saveAll([])
  return []
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Timestamps of submissions made inside the current rate-limit window. */
function getRecentSubmissionTimestamps(now: number = Date.now()): number[] {
  const stored = storageService.get<unknown>(SUBMISSION_RATE_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored.filter(
    (value): value is number =>
      typeof value === 'number' && Number.isFinite(value) && now - value < SUBMISSION_WINDOW_MS,
  )
}

function recordSubmissionTimestamp(): void {
  const now = Date.now()
  storageService.set(SUBMISSION_RATE_KEY, [...getRecentSubmissionTimestamps(now), now])
}

/**
 * Finds a still-pending entry for the same product in the same market.
 * Blocks queue flooding with near-duplicate reports.
 */
function findPendingDuplicate(productName: string, location: string): PriceSubmission | null {
  const target = normalizeName(productName)
  const place = normalizeName(location)
  if (!target || !place) return null

  return (
    getPending().find(
      (submission) =>
        normalizeName(submission.productName) === target &&
        normalizeName(submission.location) === place,
    ) ?? null
  )
}

/**
 * Spam policy for public submissions. Applied before anything is written, so
 * a rejected attempt never reaches the queue.
 */
function checkSubmission(input: {
  productName: string
  location: string
}): PriceSubmissionGuard {
  const now = Date.now()
  const recent = getRecentSubmissionTimestamps(now)

  if (recent.length >= SUBMISSION_LIMIT) {
    const oldest = Math.min(...recent)
    const retryAfterMinutes = Math.max(
      1,
      Math.ceil((SUBMISSION_WINDOW_MS - (now - oldest)) / 60000),
    )
    return {
      allowed: false,
      reason: 'rate-limit',
      retryAfterMinutes,
      message: `এক ঘণ্টায় সর্বোচ্চ ${toBanglaNumber(SUBMISSION_LIMIT)} টি দাম জমা দেওয়া যাবে। অনুগ্রহ করে ${retryAfterMinutes} মিনিট পর আবার চেষ্টা করুন।`,
    }
  }

  if (getPendingCount() >= MAX_PENDING_SUBMISSIONS) {
    return {
      allowed: false,
      reason: 'queue-full',
      message: 'যাচাইয়ের তালিকা এখন ব্যস্ত আছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
    }
  }

  if (findPendingDuplicate(input.productName, input.location)) {
    return {
      allowed: false,
      reason: 'duplicate',
      message: 'এই পণ্যের দাম ইতিমধ্যে যাচাইয়ের অপেক্থায় আছে। একই দাম আর পাঠানোর দরকার নেই।',
    }
  }

  return { allowed: true }
}

/**
 * Guarded entry point for public submissions.
 *
 * Unlike {@link add}, this never writes when the spam policy rejects the
 * payload, and it always produces a `pending` item. The live market price
 * list is untouched — only the admin approval step may publish a price.
 */
function submit(input: PriceSubmissionInput): PriceSubmissionResult {
  const guard = checkSubmission(input)
  if (!guard.allowed) return { submission: null, guard }

  const submission = add({ ...input, status: 'pending' })
  recordSubmissionTimestamp()
  return { submission, guard }
}

export const priceModerationService = {
  getAll,
  saveAll,
  getById,
  add,
  submit,
  checkSubmission,
  findPendingDuplicate,
  updateStatus,
  approve,
  reject,
  remove,
  getByStatus,
  getPending,
  getPendingCount,
  reset,
  clear,
}
