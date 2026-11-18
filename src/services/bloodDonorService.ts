import { STORAGE_KEYS } from '../constants'
import { initialBloodDonors } from '../data'
import { BloodDonor } from '../types'
import { toBanglaNumber } from '../utils/formatters'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

export type DonorStatus = 'ready' | 'waiting' | 'unknown'

export interface DonorReadiness {
  status: DonorStatus
  daysSince: number | null
  daysRemaining: number
  isAvailable: boolean
}

export interface DonorMeta extends DonorReadiness {
  /** Approved and has a verified last-donation date. */
  isVerified: boolean
  /** Call / WhatsApp / copy actions only appear for approved, dated donors. */
  canContact: boolean
  /** The single readiness label used by every card, list and dialog. */
  readinessLabel: string
  /** The single availability badge — never contradicts the readiness label. */
  availabilityBadge: string
}

/** Date-only part of the status, with no UI wording — used by getDonorStatus. */
function readinessFromDate(lastDonationDate: string | null | undefined): DonorReadiness {
  if (!lastDonationDate) {
    return { status: 'unknown', daysSince: null, daysRemaining: 0, isAvailable: false }
  }
  const lastDate = new Date(lastDonationDate)
  if (Number.isNaN(lastDate.getTime())) {
    return { status: 'unknown', daysSince: null, daysRemaining: 0, isAvailable: false }
  }
  const elapsed = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  const daysSince = Math.max(0, Math.floor(elapsed))
  const ready = daysSince >= 56
  return {
    status: ready ? 'ready' : 'waiting',
    daysSince,
    daysRemaining: ready ? 0 : 56 - daysSince,
    isAvailable: ready,
  }
}

/**
 * The ONE donor-status decision in the codebase. Every donor card, dialog,
 * list, filter and count reads this function — there is no second copy.
 *
 * - A donor with no (or an invalid) last-donation date is "unknown" and is
 *   never ready, never counted as available, and never exposes a call action.
 * - Within 56 days  -> waiting, with the exact days remaining.
 * - 56+ days ago    -> ready.
 * - Only approved donors with a verified date may be contacted.
 */
export function getDonorStatus(donor: BloodDonor): DonorMeta {
  const readiness = readinessFromDate(donor.lastDonationDate)
  const approved = donor.approved !== false
  const isVerified = approved && readiness.status !== 'unknown'
  const isAvailable =
    approved && readiness.status === 'ready' && (donor.availability ?? 'available') === 'available'
  const canContact = isVerified

  let availabilityBadge: string
  if (!canContact) availabilityBadge = 'যাচাইয়ের অপেক্ষায়'
  else if (isAvailable) availabilityBadge = 'উপলব্ধ'
  else if (donor.availability === 'busy') availabilityBadge = 'ব্যস্ত'
  else availabilityBadge = 'অপেক্ষমান'

  const readinessLabel =
    readiness.status === 'ready'
      ? '✓ রক্তদানে প্রস্তুত'
      : readiness.status === 'waiting'
        ? `⏳ অপেক্ষমান · ${toBanglaNumber(readiness.daysRemaining)} দিন বাকি`
        : '◌ তথ্য যাচাই চলছে'

  return {
    ...readiness,
    isAvailable,
    isVerified,
    canContact,
    readinessLabel,
    availabilityBadge,
  }
}

/** Thin delegate kept for callers that only have a date — no separate logic. */
export function getDonorReadiness(lastDonationDate: string | null | undefined): DonorReadiness {
  return readinessFromDate(lastDonationDate)
}

/** Thin delegate kept for older callers — the decision lives in getDonorStatus. */
export function isAvailableDonor(donor: BloodDonor): boolean {
  return getDonorStatus(donor).isAvailable
}

/** Legacy delegate used by older eligibility checks. */
export function isEligibleToDonate(lastDonationDate: string | null | undefined): boolean {
  return readinessFromDate(lastDonationDate).status === 'ready'
}

export const bloodDonorService = {
  getAll(): BloodDonor[] {
    return storageService.get<BloodDonor[]>(STORAGE_KEYS.BLOOD_DONORS, initialBloodDonors).map(
      (donor) => ({
        ...donor,
        // Existing demo donors stay visible; newly added ones wait for approval.
        approved: donor.approved !== false,
        visible: donor.visible !== false,
      }),
    )
  },

  /** Donors the public site is allowed to show. */
  getPublic(): BloodDonor[] {
    return this.getAll().filter((donor) => donor.approved && donor.visible !== false)
  },

  saveAll(donors: BloodDonor[]): void {
    storageService.set(STORAGE_KEYS.BLOOD_DONORS, donors)
    notifyDataChanged('donors')
  },

  add(newDonor: Omit<BloodDonor, 'id'>): BloodDonor {
    const existing = this.getAll()
    const nextId = String(
      Math.max(0, ...existing.map((d) => parseInt(d.id, 10) || 0)) + 1,
    )
    const donor: BloodDonor = {
      ...newDonor,
      id: nextId,
      approved: newDonor.approved ?? false,
      visible: newDonor.visible ?? true,
    }
    this.saveAll([donor, ...existing])
    return donor
  },

  update(id: string, patch: Partial<Omit<BloodDonor, 'id'>>): BloodDonor[] {
    const updated = this.getAll().map((donor) =>
      donor.id === id ? { ...donor, ...patch, id } : donor,
    )
    this.saveAll(updated)
    return updated
  },

  delete(id: string): BloodDonor[] {
    const updated = this.getAll().filter((donor) => donor.id !== id)
    this.saveAll(updated)
    return updated
  },

  approve(id: string, approved: boolean): BloodDonor[] {
    return this.update(id, { approved })
  },

  setVisible(id: string, visible: boolean): BloodDonor[] {
    return this.update(id, { visible })
  },
}
