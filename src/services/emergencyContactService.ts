import { STORAGE_KEYS } from '../constants'
import { emergencyContactSeed } from '../data/emergencyContacts'
import { EmergencyContact } from '../types'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * The six canonical hotlines shown on the homepage by default. The admin can
 * change this selection from the "হোমপেজ হটলাইন" panel.
 */
export const HOME_HOTLINE_IDS = [
  'police',
  'fire',
  'electricity',
  'helpline',
  'women',
  'MDN-EMG-0007', // শিশু হেল্পলাইন — replaces the unverified 106 ambulance entry
]

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
    homepage: contact.homepage ?? HOME_HOTLINE_IDS.includes(contact.id),
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

  /** Up to six admin-selected hotlines for the homepage quick-dial block. */
  getHomeHotlines(): EmergencyContact[] {
    return emergencyContactService
      .getPublic()
      .filter((contact) => contact.homepage)
      .slice(0, 6)
  },

  setHomepage(id: string, homepage: boolean): EmergencyContact[] {
    return emergencyContactService.update(id, { homepage })
  },

  /** Reorder a contact within the stored list (drives homepage order). */
  moveTo(id: string, targetIndex: number): EmergencyContact[] {
    const list = [...emergencyContactService.getAll()]
    const from = list.findIndex((contact) => contact.id === id)
    if (from < 0 || targetIndex < 0 || targetIndex >= list.length || from === targetIndex) return list
    const [item] = list.splice(from, 1)
    list.splice(targetIndex, 0, item)
    return emergencyContactService.saveAll(list)
  },
}
