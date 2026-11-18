import { STORAGE_KEYS } from '../constants'
import { initialJobPostings } from '../data'
import { JobPosting } from '../types'
import { storageService } from './storageService'
import { mergeSeed } from './seedMerge'

/** A posting is visible until the day of its deadline ends. */
export function isDeadlineActive(deadline: string): boolean {
  if (!deadline) return true
  const deadlineDate = new Date(deadline)
  if (Number.isNaN(deadlineDate.getTime())) return true
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deadlineDate.setHours(23, 59, 59, 999)
  return deadlineDate.getTime() >= today.getTime()
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0]
}

/** A posting is public once it is approved (or pre-dates the approval flow). */
function isPublic(posting: JobPosting): boolean {
  return posting.isApproved !== false && !posting.isRejected
}

/**
 * Every posting has ONE kind: a tuition post or a real job, never both.
 * This is the single decision used by the tabs, the homepage tile and /services.
 */
export function isTuitionPosting(posting: JobPosting): boolean {
  return posting.type === 'টিউশনি'
}

export type NewJobPosting = Omit<
  JobPosting,
  'id' | 'postedAt' | 'isApproved' | 'isRejected' | 'lastUpdated'
>

export const jobPostingService = {
  getAll(): JobPosting[] {
    const stored = storageService.get<JobPosting[]>(STORAGE_KEYS.JOB_POSTINGS, initialJobPostings)
    return mergeSeed(stored, initialJobPostings)
  },

  saveAll(postings: JobPosting[]): void {
    storageService.set(STORAGE_KEYS.JOB_POSTINGS, postings)
  },

  /** Published postings whose deadline has not passed yet. */
  getActive(): JobPosting[] {
    return jobPostingService.getAll().filter(
      (posting) => isPublic(posting) && isDeadlineActive(posting.deadline),
    )
  },

  /**
   * Tuition posts only (the Tuition tab and its counter). Expired posts are
   * excluded from every public list — the page promises that expired notices
   * are not shown. Expired records remain in getAll()/getForAdmin() so the
   * admin can still see and manage them.
   */
  getTuition(): JobPosting[] {
    return jobPostingService.getActive().filter(isTuitionPosting)
  },

  /** Real jobs only — tuition posts are never counted here. */
  getJobs(): JobPosting[] {
    return jobPostingService.getActive().filter((posting) => !isTuitionPosting(posting))
  },

  /** Submitted by visitors, waiting for admin approval. */
  getPending(): JobPosting[] {
    return jobPostingService
      .getAll()
      .filter((posting) => posting.isApproved === false && !posting.isRejected)
  },

  /** Every posting, including expired and pending ones (admin view). */
  getForAdmin(): JobPosting[] {
    return jobPostingService.getAll()
  },

  /** A visitor-submitted posting always starts as pending. */
  addPending(input: NewJobPosting): JobPosting {
    const postings = jobPostingService.getAll()
    const posting: JobPosting = {
      ...input,
      id: 'jp-' + Date.now(),
      postedAt: todayIso(),
      lastUpdated: todayIso(),
      isApproved: false,
      isRejected: false,
    }
    jobPostingService.saveAll([posting, ...postings])
    return posting
  },

  approve(id: string): JobPosting[] {
    const updated = jobPostingService
      .getAll()
      .map((posting) =>
        posting.id === id
          ? { ...posting, isApproved: true, isRejected: false, lastUpdated: todayIso() }
          : posting,
      )
    jobPostingService.saveAll(updated)
    return updated
  },

  reject(id: string): JobPosting[] {
    const updated = jobPostingService
      .getAll()
      .map((posting) =>
        posting.id === id
          ? { ...posting, isApproved: false, isRejected: true, lastUpdated: todayIso() }
          : posting,
      )
    jobPostingService.saveAll(updated)
    return updated
  },

  /** Edits any posting field — including its single type/category. */
  update(id: string, patch: Partial<JobPosting>): JobPosting[] {
    const updated = jobPostingService
      .getAll()
      .map((posting) => (posting.id === id ? { ...posting, ...patch, lastUpdated: todayIso() } : posting))
    jobPostingService.saveAll(updated)
    return updated
  },

  remove(id: string): JobPosting[] {
    const updated = jobPostingService.getAll().filter((posting) => posting.id !== id)
    jobPostingService.saveAll(updated)
    return updated
  },
}
