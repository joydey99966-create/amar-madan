import { Hospital } from '../types'
import { recordsService } from './recordsService'

export const hospitalService = {
  getAll(): Hospital[] {
    return recordsService.hospitals()
  },

  getEmergency(): Hospital[] {
    return hospitalService.getAll().filter((hospital) => hospital.emergency)
  },
}
