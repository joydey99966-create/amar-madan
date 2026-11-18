import { useState, useCallback, useMemo } from 'react'
import { BloodDonor, BloodGroup } from '../types'
import { bloodDonorService } from '../services/bloodDonorService'
import { useDataVersion, notifyDataChanged } from './useDataVersion'

export function useBloodDonors() {
  // Bumped whenever the admin panel (or this hook) changes the donor list.
  const donorsVersion = useDataVersion('donors')
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'সব'>('সব')
  const [selectedArea, setSelectedArea] = useState<string>('সব')

  // The stored list is the single source of truth, so an admin edit shows up
  // on the homepage counters straight away.
  const donors = useMemo(
    () => bloodDonorService.getPublic(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [donorsVersion],
  )

  const addDonor = useCallback((newDonor: Omit<BloodDonor, 'id'>) => {
    const created = bloodDonorService.add(newDonor)
    notifyDataChanged('donors')
    return created
  }, [])

  const deleteDonor = useCallback((id: string) => {
    const updated = bloodDonorService.delete(id)
    notifyDataChanged('donors')
    return updated
  }, [])

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const matchBlood = selectedBloodGroup === 'সব' || donor.bloodGroup === selectedBloodGroup
      const matchArea = selectedArea === 'সব' || donor.unionArea === selectedArea
      return matchBlood && matchArea
    })
  }, [donors, selectedBloodGroup, selectedArea])

  return {
    donors,
    filteredDonors,
    selectedBloodGroup,
    setSelectedBloodGroup,
    selectedArea,
    setSelectedArea,
    addDonor,
    deleteDonor,
    totalCount: donors.length,
    filteredCount: filteredDonors.length,
  }
}
