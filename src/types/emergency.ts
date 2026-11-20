import { LucideIcon } from 'lucide-react'

/** Categories used by the shared emergency-contact visuals. */
export type EmergencyCategory =
  | 'police'
  | 'fire'
  | 'ambulance'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'helpline'
  | 'women'
  | 'other'

/**
 * One emergency contact record, owned by the admin panel and read by every
 * surface of the site (homepage, footer, emergency page, directory, services,
 * profile). No component stores a number of its own.
 */
export interface EmergencyContact {
  id: string
  name: string
  /** Bengali display number. */
  phone: string
  /** Digits-only number used by `tel:` links. */
  dial: string
  category: EmergencyCategory
  /** Hidden contacts are not shown on any public surface. */
  visible: boolean
  /** New contacts stay hidden from the public until an admin approves them. */
  approved: boolean
  /** Admin-controlled: show this contact in the homepage quick-dial block. */
  homepage?: boolean
}

/** Icon mapping only — never contains a phone number. */
export interface EmergencyVisual {
  icon: LucideIcon
  emoji: string
}
