import { Ambulance, Droplets, Flame, Phone, Shield, Zap } from 'lucide-react'
import { EmergencyCategory, EmergencyVisual } from '../types'

/**
 * Icons and emoji for emergency contacts. This is presentation only — every
 * phone number comes from the central emergency-contact source.
 */
export const emergencyVisuals: Record<EmergencyCategory, EmergencyVisual> = {
  police: { icon: Shield, emoji: '🚔' },
  fire: { icon: Flame, emoji: '🚒' },
  ambulance: { icon: Ambulance, emoji: '🚑' },
  electricity: { icon: Zap, emoji: '⚡' },
  water: { icon: Droplets, emoji: '💧' },
  gas: { icon: Flame, emoji: '🔥' },
  helpline: { icon: Phone, emoji: '☎️' },
  women: { icon: Shield, emoji: '🛡️' },
  other: { icon: Phone, emoji: '📞' },
}

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  'police',
  'fire',
  'ambulance',
  'electricity',
  'water',
  'gas',
  'helpline',
  'women',
  'other',
]

export function emergencyVisual(category: string | undefined): EmergencyVisual {
  if (category && category in emergencyVisuals) {
    return emergencyVisuals[category as EmergencyCategory]
  }
  return emergencyVisuals.other
}
