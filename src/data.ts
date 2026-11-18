export * from './constants/unions'
export * from './data/mockData'
export * from './data/priceModerationQueue'
import { bloodDonorService } from './services/bloodDonorService'
import { lostFoundService } from './services/lostFoundService'
import { directoryService } from './services/directoryService'
import { BloodDonor, LostFoundItem, ServiceCategory, ServiceProvider } from './types'

export function loadBloodDonors(): BloodDonor[] {
  return bloodDonorService.getAll()
}

export function saveBloodDonors(donors: BloodDonor[]): void {
  bloodDonorService.saveAll(donors)
}

export function loadLostFound(): LostFoundItem[] {
  return lostFoundService.getAll()
}

export function saveLostFound(items: LostFoundItem[]): void {
  lostFoundService.saveAll(items)
}

export function loadEmergencyServices(): Record<ServiceCategory, ServiceProvider[]> {
  return directoryService.getEmergencyServices()
}
