import { GalleryPhoto } from '../types'

/**
 * Bundled photography of Madan and the surrounding haor country.
 *
 * The files live in `public/images`, so they load offline and are cached by the
 * service worker. All four are Creative Commons photos from Wikimedia Commons;
 * the credit line under each photo keeps the attribution requirement intact.
 *
 * They are only the seed of the gallery — `galleryService` copies them into
 * localStorage on first read, and the admin panel owns the list from then on.
 */
export type SitePhoto = GalleryPhoto

/**
 * Resolves a bundled image path against the Vite base so the gallery works on
 * GitHub Pages (served from `/amar-madan/`) as well as locally (`/`).
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

const withBase = (path: string) => assetUrl(path)

export const sitePhotos: SitePhoto[] = [
  {
    id: 'haor',
    src: withBase('images/haor.jpg'),
    caption: 'হাওরের ভোর — নীল হাওরের পানিতে ভাসমান নৌকা',
    alt: 'হাওরের পানিতে সারিবদ্ধ নৌকা ও দিগন্তে গ্রাম',
    credit: 'Abdul Momin',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Tanguar_haor,_Bangladesh_01.jpg',
  },
  {
    id: 'market',
    src: '/images/market.jpg',
    caption: 'মদন বাজারের সবজির দোকান',
    alt: 'বাজারে সবজির ঝুড়ি ও দোকানদার',
    credit: 'Jubair1985',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Vegetable_Market_of_Bangladesh.jpg',
  },
  {
    id: 'institution',
    src: '/images/institution.jpg',
    caption: 'স্থানীয় কলেজ ভবন ও ক্যাম্পাস',
    alt: 'লাল ইটের কলেজ ভবনের সামনের দৃশ্য',
    credit: 'Risadul Islam (Foisal)',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Chittagong_College_Red_Building_Front_View.jpg',
  },
  {
    id: 'town',
    src: '/images/town.jpg',
    caption: 'নেত্রকোণার নদী ও গ্রামীণ জনপদ',
    alt: 'নদীর ধারে গ্রাম ও সবুজ গাছ',
    credit: 'কুপি বাতি',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Dholai_River_at_Thakurakona,_Netrokona_1.jpg',
  },
]

export function photoById(id: string): SitePhoto | undefined {
  return sitePhotos.find((photo) => photo.id === id)
}
