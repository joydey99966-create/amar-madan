import { STORAGE_KEYS } from '../constants'
import { assetUrl, sitePhotos } from '../data/photos'
import { GalleryPhoto } from '../types'
import { storageService } from './storageService'
import { notifyDataChanged } from './dataEvents'

/**
 * The "ছবিতে মদন" gallery is a CMS list: the admin panel owns it and the
 * homepage renders whatever is stored.
 *
 * The bundled photographs are only a seed — the first read writes them into
 * localStorage, and from then on the stored list is the single truth (so a
 * photo deleted by the admin stays deleted).
 */
function normalize(photo: Partial<GalleryPhoto> & { id: string }): GalleryPhoto {
  const caption = (photo.caption ?? '').trim()
  // Base-aware URL + legacy triple-prefix repair so a stored photo keeps
  // working on GitHub Pages even if an older version saved a broken path.
  const src = (photo.src ?? '').trim()
  const finalSrc = /^(https?:|data:|blob:)/i.test(src) ? src : assetUrl(src)
  return {
    id: photo.id,
    src: finalSrc,
    caption: caption || 'মদনের একটি মুহূর্ত',
    alt: (photo.alt ?? '').trim() || caption || 'মদনের ছবি',
    credit: (photo.credit ?? '').trim() || 'অজানা',
    license: (photo.license ?? '').trim() || 'CC BY-SA 4.0',
    source: (photo.source ?? '').trim() || undefined,
  }
}

/** A photo without a usable image URL cannot be rendered. */
function isRenderable(photo: GalleryPhoto): boolean {
  return photo.src.length > 0
}

export const galleryService = {
  /** The gallery as it is shown on the homepage. */
  getPhotos(): GalleryPhoto[] {
    const stored = storageService.get<GalleryPhoto[] | null>(STORAGE_KEYS.GALLERY, null)
    // The key is missing on the very first visit — that is the only moment the
    // bundled photographs are used. Once the admin list exists it is the only
    // truth, so a deleted photo stays deleted and an emptied gallery stays
    // empty.
    if (Array.isArray(stored)) {
      return stored
        .filter((photo) => photo && typeof photo.id === 'string')
        .map((photo) => normalize(photo))
        .filter(isRenderable)
    }
    const seeded = sitePhotos.map((photo) => normalize(photo))
    storageService.set(STORAGE_KEYS.GALLERY, seeded)
    return seeded
  },

  addPhoto(input: Omit<GalleryPhoto, 'id'>): GalleryPhoto[] {
    const photo = normalize({ ...input, id: `ph-${Date.now()}` })
    const updated = [photo, ...galleryService.getPhotos()]
    storageService.set(STORAGE_KEYS.GALLERY, updated)
    notifyDataChanged('gallery')
    return updated
  },

  updatePhoto(id: string, input: Omit<GalleryPhoto, 'id'>): GalleryPhoto[] {
    const updated = galleryService
      .getPhotos()
      .map((photo) => (photo.id === id ? normalize({ ...photo, ...input, id }) : photo))
    storageService.set(STORAGE_KEYS.GALLERY, updated)
    notifyDataChanged('gallery')
    return updated
  },

  deletePhoto(id: string): GalleryPhoto[] {
    const updated = galleryService.getPhotos().filter((photo) => photo.id !== id)
    storageService.set(STORAGE_KEYS.GALLERY, updated)
    notifyDataChanged('gallery')
    return updated
  },
}
