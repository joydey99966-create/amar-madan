import { CitizenService } from '../types'
import { recordsService } from './recordsService'

/**
 * "মৃত্যু নিবন্ধন" is the only service bundled without application steps.
 * Fill it from the same pattern as the other registration services so every
 * card can show "যেভাবে আবেদন করবেন" — no demo value is changed.
 */
const STEPS_BY_ID: Record<string, string[]> = {
  cs6: [
    'birthregistration.mygov.bd-এ মৃত্যু নিবন্ধনের আবেদন পূরণ করুন',
    'মৃত্যুর সনদ ও আবেদনকারীর NID কপি সংগ্রহ করুন',
    'নির্ধারিত দিনে ইউনিয়ন পরিষদে কাগজপত্র জমা দিন',
    'যাচাইয়ের পর ডিজিটাল মৃত্যু সনদ ডাউনলোড করুন',
  ],
}

export const citizenService = {
  getAll(): CitizenService[] {
    return recordsService.citizens().map((service) => {
      const steps = service.steps?.length ? service.steps : STEPS_BY_ID[service.id]
      return steps ? { ...service, steps } : service
    })
  },
}
