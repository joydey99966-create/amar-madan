import {
  initialDoctors,
  initialAmbulances,
  initialEmergencyServices,
  initialFertilizerDealers,
  initialAgroMachinery,
  initialJournalists,
  initialEducation,
} from '../data'
import {
  Doctor,
  Ambulance,
  ServiceProvider,
  ServiceCategory,
  FertilizerDealer,
  AgroMachinery,
  Journalist,
  EducationInstitution,
} from '../types'
import { STORAGE_KEYS } from '../constants'
import { doctorSpecialty } from '../utils/doctorMeta'
import { storageService } from './storageService'
import { recordsService } from './recordsService'
import { notifyDataChanged } from './dataEvents'

/**
 * The directory is admin-managed: the admin panel writes doctors, ambulances
 * and agro dealers into localStorage, and every public list reads them from
 * there. The bundled seed is only used when nothing is stored yet.
 */
export const directoryService = {
  /**
   * Every doctor is returned with a specialty and a visiting schedule, even
   * records saved by an older version. Legacy rows that have no `visitingDays`
   * are completed from the bundled seed (matched by id) so the "today" filter
   * and the card's schedule line read the same data — a doctor can never be
   * filtered in but shown without its days, or vanish from the filter because
   * an old record lost its schedule. No demo value is changed.
   */
  getDoctors(): Doctor[] {
    const stored = storageService.get<Doctor[]>(STORAGE_KEYS.DOCTORS, initialDoctors)
    return stored.map((doctor) => {
      const seed = initialDoctors.find((item) => item.id === doctor.id)
      return {
        ...doctor,
        specialty: doctorSpecialty(doctor),
        visitingDays: (doctor.visitingDays ?? '').trim() || seed?.visitingDays || '',
      }
    })
  },

  getAmbulances(): Ambulance[] {
    return storageService.get<Ambulance[]>(STORAGE_KEYS.AMBULANCES, initialAmbulances)
  },

  getAgroDealers(): ServiceProvider[] {
    return storageService.get<ServiceProvider[]>(STORAGE_KEYS.AGRO_DEALERS, initialEmergencyServices.agro)
  },

  /**
   * Adds a doctor and writes the list straight to storage, so the public
   * lists (and their counters) see the new record immediately — not one
   * render later.
   */
  addDoctor(doctor: Omit<Doctor, 'id'>): Doctor[] {
    const created: Doctor = {
      ...doctor,
      id: `d${Date.now()}`,
      specialty: doctorSpecialty(doctor),
      approved: doctor.approved !== false,
      visible: doctor.visible !== false,
    }
    const updated = [created, ...directoryService.getDoctors()]
    storageService.set(STORAGE_KEYS.DOCTORS, updated)
    notifyDataChanged('directory')
    return updated
  },

  /** Edits any doctor field — including specialty — from the admin panel. */
  updateDoctor(id: string, patch: Partial<Doctor>): Doctor[] {
    const updated = directoryService.getDoctors().map((doctor) =>
      doctor.id === id
        ? { ...doctor, ...patch, specialty: doctorSpecialty({ ...doctor, ...patch }) }
        : doctor,
    )
    storageService.set(STORAGE_KEYS.DOCTORS, updated)
    notifyDataChanged('directory')
    return updated
  },

  approveDoctor(id: string, approved: boolean): Doctor[] {
    return directoryService.updateDoctor(id, { approved })
  },

  setDoctorVisible(id: string, visible: boolean): Doctor[] {
    return directoryService.updateDoctor(id, { visible })
  },

  deleteDoctor(id: string): Doctor[] {
    const updated = directoryService.getDoctors().filter((doctor) => doctor.id !== id)
    storageService.set(STORAGE_KEYS.DOCTORS, updated)
    notifyDataChanged('directory')
    return updated
  },

  addAmbulance(ambulance: Omit<Ambulance, 'id'>): Ambulance[] {
    const created: Ambulance = { ...ambulance, id: `a${Date.now()}` }
    const updated = [created, ...directoryService.getAmbulances()]
    storageService.set(STORAGE_KEYS.AMBULANCES, updated)
    return updated
  },

  deleteAmbulance(id: string): Ambulance[] {
    const updated = directoryService.getAmbulances().filter((ambulance) => ambulance.id !== id)
    storageService.set(STORAGE_KEYS.AMBULANCES, updated)
    return updated
  },

  addAgroDealer(dealer: Omit<ServiceProvider, 'id'>): ServiceProvider[] {
    const created: ServiceProvider = { ...dealer, id: `ag${Date.now()}` }
    const updated = [created, ...directoryService.getAgroDealers()]
    storageService.set(STORAGE_KEYS.AGRO_DEALERS, updated)
    return updated
  },

  deleteAgroDealer(id: string): ServiceProvider[] {
    const updated = directoryService.getAgroDealers().filter((dealer) => dealer.id !== id)
    storageService.set(STORAGE_KEYS.AGRO_DEALERS, updated)
    return updated
  },

  getFertilizerDealers(): FertilizerDealer[] {
    return initialFertilizerDealers
  },

  getAgroMachinery(): AgroMachinery[] {
    return initialAgroMachinery
  },

  getJournalists(): Journalist[] {
    return initialJournalists
  },

  getEducation(): EducationInstitution[] {
    return recordsService.education()
  },

  /**
   * Every emergency-service list in one place, with the admin-managed lists
   * (doctors, ambulances, agro dealers) taken from storage.
   */
  getEmergencyServices(): Record<ServiceCategory, ServiceProvider[]> {
    const seed = initialEmergencyServices
    const doctors = directoryService
      .getDoctors()
      .filter((doctor) => doctor.approved !== false && doctor.visible !== false)

    return {
      ...seed,
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        details: `${doctorSpecialty(doctor)} • ${doctor.chamber}`,
        area: doctor.area,
        phone: doctor.phone,
        category: 'doctors' as ServiceCategory,
        specialty: doctorSpecialty(doctor),
        chamber: doctor.chamber,
        visitingHours: doctor.visitingHours,
        visitingDays: doctor.visitingDays,
        fee: doctor.fee,
        registration: doctor.registration,
        lastUpdated: doctor.lastUpdated,
      })),
      ambulance: directoryService.getAmbulances().map((ambulance) => ({
        id: ambulance.id,
        name: ambulance.name,
        details: `${ambulance.vehicleType} • চালক: ${ambulance.driverName}`,
        area: ambulance.area,
        phone: ambulance.phone,
        category: 'ambulance' as ServiceCategory,
      })),
      agro: directoryService.getAgroDealers(),
    }
  },
}
