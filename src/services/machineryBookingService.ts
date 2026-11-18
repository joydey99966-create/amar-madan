import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

export type BookingStatus = 'pending' | 'approved' | 'rejected'

export interface MachineryBooking {
  id: string
  /** id of the AgroMachineryItem being requested */
  itemId: string
  machineName: string
  ownerPhone?: string
  /** Requested booking date (YYYY-MM-DD or free Bangla text) */
  date: string
  /** Contact phone of the requester */
  contact: string
  requesterName?: string
  note?: string
  status: BookingStatus
  createdAt: string
}

const BOOKINGS_KEY = 'amar-madan-machinery-bookings'

function getAll(): MachineryBooking[] {
  const stored = storageService.get<MachineryBooking[] | null>(BOOKINGS_KEY, null)
  return Array.isArray(stored) ? stored : []
}

function saveAll(bookings: MachineryBooking[]): void {
  storageService.set(BOOKINGS_KEY, bookings)
  notifyDataChanged('machinery-bookings')
}

function add(input: Omit<MachineryBooking, 'id' | 'status' | 'createdAt'>): MachineryBooking {
  const bookings = getAll()
  const booking: MachineryBooking = {
    ...input,
    id: `bk-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  saveAll([booking, ...bookings])
  return booking
}

function updateStatus(id: string, status: BookingStatus): MachineryBooking[] {
  const updated = getAll().map((b) => (b.id === id ? { ...b, status } : b))
  saveAll(updated)
  return updated
}

function approve(id: string): MachineryBooking[] {
  return updateStatus(id, 'approved')
}

function reject(id: string): MachineryBooking[] {
  return updateStatus(id, 'rejected')
}

function remove(id: string): MachineryBooking[] {
  const remaining = getAll().filter((b) => b.id !== id)
  saveAll(remaining)
  return remaining
}

function getPending(): MachineryBooking[] {
  return getAll().filter((b) => b.status === 'pending')
}

/** The requester can see the status of their own bookings by contact phone. */
function getByContact(contact: string): MachineryBooking[] {
  const clean = contact.replace(/[^0-9]/g, '')
  return getAll().filter((b) => b.contact.replace(/[^0-9]/g, '') === clean)
}

export const machineryBookingService = {
  getAll,
  saveAll,
  add,
  updateStatus,
  approve,
  reject,
  remove,
  getPending,
  getByContact,
}
