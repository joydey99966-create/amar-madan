import { Hospital } from '../types'
import { recordsService } from './recordsService'

/** Records from the real-data snapshot may omit optional fields. Fill them so
 * cards never crash on `services.join()` or render a blank phone/schedule. */
function normalize(hospital: Partial<Hospital> & { id: string }): Hospital {
  return {
    ...hospital,
    services: Array.isArray(hospital.services) ? hospital.services : [],
    phone: hospital.phone ?? '',
    type: hospital.type || 'ক্লিনিক',
    address: hospital.address || 'তথ্য যাচাই চলছে',
    openingHours: hospital.openingHours || 'তথ্য যাচাই চলছে',
    emergency: hospital.emergency === true,
  } as Hospital
}

export const hospitalService = {
  getAll(): Hospital[] {
    return recordsService.hospitals().map(normalize)
  },

  getEmergency(): Hospital[] {
    return hospitalService.getAll().filter((hospital) => hospital.emergency)
  },
}
