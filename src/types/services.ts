export type ServiceCategory =
  | 'doctors'
  | 'ambulance'
  | 'rentacar'
  | 'technicians'
  | 'agro'
  | 'fish'
  | 'news'
  | 'education'
  | 'lostfound'

export interface ServiceProvider {
  id: string
  name: string
  details: string
  area: string
  phone: string
  category: ServiceCategory
  /** Doctor / chamber extras — optional so every existing record stays valid. */
  specialty?: string
  chamber?: string
  visitingDays?: string
  visitingHours?: string
  fee?: string
  registration?: string
  /** Short list of services offered (hospitals, clinics, diagnostic centres). */
  services?: string[]
  /** ISO date of the last verified update. */
  lastUpdated?: string
}

export type DoctorSpecialty =
  | 'মেডিসিন'
  | 'শিশু'
  | 'গাইনি'
  | 'হৃদরোগ'
  | 'চর্মরোগ'
  | 'চক্ষু'
  | 'অর্থোপেডিক'
  | 'দন্তচিকিৎসা'

export interface Doctor {
  id: string
  name: string
  specialty: DoctorSpecialty
  chamber: string
  area: string
  visitingHours: string
  phone: string
  /** Consultation fee, e.g. "৫০০ টাকা". */
  fee?: string
  /** BMDC registration number shown under the name. */
  registration?: string
  /** Days the chamber stays open, e.g. "রবি, মঙ্গল, বৃহস্পতি". */
  visitingDays?: string
  lastUpdated?: string
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}

export type AmbulanceVehicleType = 'AC' | 'Non-AC' | 'অক্সিজেন সুবিধাসহ' | 'জরুরি অক্সিজেন সুবিধাসহ'

export interface Ambulance {
  id: string
  name: string
  vehicleType: AmbulanceVehicleType
  area: string
  phone: string
  driverName: string
}

/** A rentable agro machine (tiller, pump, …) with its local rate. */
export interface AgroMachineryItem {
  id: string
  name: string
  price: string
  area: string
  /** Contact owner (admin-editable) so a rentable item is actually bookable. */
  phone?: string
  ownerName?: string
  availability?: 'available' | 'busy' | 'offline'
  /** Admin approval flag — unpublished records stay out of the public list. */
  approved?: boolean
  /** Admin visibility switch. */
  visible?: boolean
}
