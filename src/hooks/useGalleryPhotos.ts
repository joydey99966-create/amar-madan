import { useMemo } from 'react'
import { GalleryPhoto } from '../types'
import { galleryService } from '../services/galleryService'
import { useDataVersion } from './useDataVersion'

/**
 * The photos shown in the "ছবিতে মদন" gallery.
 *
 * The list is admin-managed, so it is re-read whenever the admin panel
 * publishes a change — in this tab as well as in any other open tab.
 */
export function useGalleryPhotos(): GalleryPhoto[] {
  const version = useDataVersion('gallery')

  return useMemo(
    () => galleryService.getPhotos(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  )
}
