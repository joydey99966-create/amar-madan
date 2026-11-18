import { useMemo } from 'react'
import { EmergencyContact } from '../types'
import { emergencyContactService } from '../services/emergencyContactService'
import { useDataVersion } from './useDataVersion'

/** Public emergency contacts, refreshed whenever the admin panel edits them. */
export function useEmergencyContacts(): EmergencyContact[] {
  const version = useDataVersion('emergency')
  return useMemo(
    () => emergencyContactService.getPublic(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  )
}
