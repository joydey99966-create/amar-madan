import { STORAGE_KEYS } from '../constants'
import {
  initialAgroMachineryItems,
  initialAgroMachinery,
  initialCitizenServices,
  initialEducation,
  initialHospitals,
  initialTransportRoutes,
  fishPrices,
} from '../data'
import {
  AgroMachineryItem,
  CitizenService,
  EducationInstitution,
  Hospital,
  MarketPrice,
  TransportRoute,
} from '../types'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * The record types the admin panel can manage on top of the existing panels
 * (donors, prices, notices, lost & found, jobs, directory, emergency numbers).
 *
 * Every list is stored in localStorage and seeded from the bundled demo data
 * on first read, so counts follow admin edits automatically.
 */
export type ManagedRecordType =
  | 'hospitals'
  | 'education'
  | 'fishPrices'
  | 'routes'
  | 'citizens'
  | 'machinery'

export interface ManagedRecordTypeInfo {
  id: ManagedRecordType
  label: string
  /** Unit used in the count badge, e.g. "টি". */
  unit: string
  storageKey: string
  seed: unknown[]
}

export const MANAGED_RECORD_TYPES: ManagedRecordTypeInfo[] = [
  {
    id: 'hospitals',
    label: 'হাসপাতাল ও ক্লিনিক',
    unit: 'টি',
    storageKey: STORAGE_KEYS.HOSPITALS,
    seed: initialHospitals,
  },
  {
    id: 'education',
    label: 'শিক্ষা প্রতিষ্ঠান',
    unit: 'টি',
    storageKey: STORAGE_KEYS.EDUCATION,
    seed: initialEducation,
  },
  {
    id: 'fishPrices',
    label: 'হাওরের মাছের দর',
    unit: 'টি',
    storageKey: STORAGE_KEYS.FISH_PRICES,
    seed: fishPrices,
  },
  {
    id: 'routes',
    label: 'যাতায়াতের রুট',
    unit: 'টি',
    storageKey: STORAGE_KEYS.ROUTES,
    seed: initialTransportRoutes,
  },
  {
    id: 'citizens',
    label: 'নাগরিক সেবা',
    unit: 'টি',
    storageKey: STORAGE_KEYS.CITIZENS,
    seed: initialCitizenServices,
  },
  {
    id: 'machinery',
    label: 'কৃষি যন্ত্রপাতি',
    unit: 'টি',
    storageKey: STORAGE_KEYS.MACHINERY,
    seed: initialAgroMachineryItems,
  },
]

function typeInfo(type: ManagedRecordType): ManagedRecordTypeInfo {
  return MANAGED_RECORD_TYPES.find((info) => info.id === type) as ManagedRecordTypeInfo
}

/** Reads a managed list — the admin list when it exists, the seed otherwise. */
function read<T>(type: ManagedRecordType): T[] {
  const info = typeInfo(type)
  const stored = storageService.get<T[] | null>(info.storageKey, null)
  if (Array.isArray(stored)) return stored
  storageService.set(info.storageKey, info.seed)
  return info.seed as T[]
}

function write<T>(type: ManagedRecordType, records: T[]): T[] {
  storageService.set(typeInfo(type).storageKey, records)
  notifyDataChanged('records')
  return records
}

/** Public, admin-editable records used by the site and the counters. */
export const recordsService = {
  hospitals(): Hospital[] {
    return recordsService.published<Hospital>('hospitals')
  },
  education(): EducationInstitution[] {
    return recordsService.published<EducationInstitution>('education')
  },
  fishPrices(): MarketPrice[] {
    return recordsService.published<MarketPrice>('fishPrices')
  },
  routes(): TransportRoute[] {
    return recordsService.published<TransportRoute>('routes')
  },
  citizens(): CitizenService[] {
    return recordsService.published<CitizenService>('citizens')
  },
  machinery(): AgroMachineryItem[] {
    const items = recordsService.published<AgroMachineryItem>('machinery')
    // Fill contact/availability from the bundled machine-owner records, matched
    // by machine type — no number is invented, existing demo values are reused.
    const matchers: Array<[string, RegExp]> = [
      ['পাওয়ার টিলার', /টিলার/],
      ['মাড়াই যন্ত্র', /মাড়াই/],
      ['ধান কাটার মেশিন', /কাটার|রিপার/],
      ['সেচ পাম্প', /পাম্প/],
      ['হারভেস্টার', /হারভেস্টার/],
    ]
    return items.map((item) => {
      if (item.phone) return item
      const owner = matchers
        .map(([type, re]) => (re.test(item.name) ? initialAgroMachinery.find((m) => m.machineType === type) : undefined))
        .find((found): found is NonNullable<typeof found> => Boolean(found))
      if (!owner) return item
      return {
        ...item,
        phone: owner.phone,
        ownerName: owner.ownerName,
        availability: owner.availability,
      }
    })
  },

  all<T>(type: ManagedRecordType): T[] {
    return read<T>(type)
  },

  /** Only approved and visible records are shown on the public site. */
  published<T extends { approved?: boolean; visible?: boolean }>(
    type: ManagedRecordType,
  ): T[] {
    return read<T>(type).filter(
      (record) => record.approved !== false && record.visible !== false,
    )
  },

  add<T extends { id: string }>(type: ManagedRecordType, record: Omit<T, 'id'>): T[] {
    const existing = read<T>(type)
    const nextId = `${type}-${Date.now()}`
    return write<T>(type, [{ ...record, id: nextId } as T, ...existing])
  },

  update<T extends { id: string; approved?: boolean; visible?: boolean }>(
    type: ManagedRecordType,
    id: string,
    patch: Partial<T>,
  ): T[] {
    return write<T>(
      type,
      read<T>(type).map((record) => (record.id === id ? { ...record, ...patch, id } : record)),
    )
  },

  remove<T extends { id: string }>(type: ManagedRecordType, id: string): T[] {
    return write<T>(
      type,
      read<T>(type).filter((record) => record.id !== id),
    )
  },
}
