import { STORAGE_KEYS } from '../constants'
import { emergencyContactSeed } from '../data/emergencyContacts'
import { EmergencyContact } from '../types'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * The single source of truth for emergency contacts.
 *
 * Every public surface reads this service. The bundled seed is used only when
 * nothing is stored yet; after that the admin-controlled list is authoritative.
 */
function normalize(contact: Partial<EmergencyContact> & { id: string }): EmergencyContact {
  const dial = (contact.dial ?? '').replace(/[^\d+]/g, '')
  return {
    id: contact.id,
    name: (contact.name ?? '').trim() || 'জরুরি সেবা',
    phone: (contact.phone ?? '').trim() || dial,
    dial,
    category: contact.category ?? 'other',
    visible: contact.visible !== false,
    approved: contact.approved !== false,
  }
}

export const emergencyContactService = {
  /** All contacts, including pending/hidden ones (for the admin panel). */
  getAll(): EmergencyContact[] {
    const stored = storageService.get<EmergencyContact[] | null>(STORAGE_KEYS.EMERGENCY_CONTACTS, null)
    if (Array.isArray(stored)) {
      return stored
        .filter((contact) => contact && typeof contact.id === 'string')
        .map((contact) => normalize(contact))
    }
    storageService.set(STORAGE_KEYS.EMERGENCY_CONTACTS, emergencyContactSeed)
    return emergencyContactSeed
  },

  /** Contacts that are both visible and approved — what the public sees. */
  getPublic(): EmergencyContact[] {
    return emergencyContactService.getAll().filter((contact) => contact.visible && contact.approved)
  },

  /** A published contact by category, used by inline "call …" guidance. */
  getByCategory(category: EmergencyContact['category']): EmergencyContact | undefined {
    return emergencyContactService.getPublic().find((contact) => contact.category === category)
  },

  saveAll(contacts: EmergencyContact[]): EmergencyContact[] {
    const normalized = contacts.map((contact) => normalize(contact))
    storageService.set(STORAGE_KEYS.EMERGENCY_CONTACTS, normalized)
    notifyDataChanged('emergency')
    return normalized
  },

  add(input: Omit<EmergencyContact, 'id'>): EmergencyContact[] {
    const contact = normalize({ ...input, id: `ec-${Date.now()}` })
    return emergencyContactService.saveAll([contact, ...emergencyContactService.getAll()])
  },

  update(id: string, input: Partial<Omit<EmergencyContact, 'id'>>): EmergencyContact[] {
    return emergencyContactService.saveAll(
      emergencyContactService
        .getAll()
        .map((contact) => (contact.id === id ? normalize({ ...contact, ...input, id }) : contact)),
    )
  },

  remove(id: string): EmergencyContact[] {
    return emergencyContactService.saveAll(
      emergencyContactService.getAll().filter((contact) => contact.id !== id),
    )
  },

  approve(id: string, approved: boolean): EmergencyContact[] {
    return emergencyContactService.update(id, { approved })
  },

  setVisible(id: string, visible: boolean): EmergencyContact[] {
    return emergencyContactService.update(id, { visible })
  },
}
