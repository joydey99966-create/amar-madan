import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { useGalleryPhotos } from '../../../hooks/useGalleryPhotos'

/**
 * "ছবিতে মদন" — the community gallery.
 *
 * Every picture, caption and photographer credit comes from the admin-managed
 * gallery list, so publishing a new photo (or removing one) updates this
 * section right away.
 */
/** One gallery card with a resilient gradient fallback if the image fails. */
function GalleryCard({ photo }: { photo: ReturnType<typeof useGalleryPhotos>[number] }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#1a2420]">
      <div className="relative h-24 w-full bg-gradient-to-br from-emerald-100 via-teal-100 to-sky-100 dark:from-emerald-950/60 dark:via-teal-950/50 dark:to-sky-950/60 sm:h-40">
        {!failed && (
          <img
            src={photo.src}
            alt={photo.alt}
            width={400}
            height={160}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
        {failed && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-emerald-700/70 dark:text-emerald-300/70">
            <ImageOff size={22} />
            <span className="text-[10px] font-medium">ছবি লোড হয়নি</span>
          </div>
        )}
      </div>
      <figcaption className="px-2.5 py-2 sm:px-3 sm:py-2.5">
        <p className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">{photo.caption}</p>
        <p className="mt-1 truncate text-[10px] text-slate-400 dark:text-slate-500">{photo.credit} · {photo.license}</p>
      </figcaption>
    </figure>
  )
}

export function PhotoGallery() {
  const photos = useGalleryPhotos()

  return (
    <section className="mt-6 sm:mt-9">
      <div className="mb-3 flex items-end justify-between sm:mb-4">
        <div>
          <div className="section-eyebrow">ছবিতে মদন</div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            হাওর, বাজার ও প্রতিষ্ঠান
          </h2>
        </div>
        <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
          ছবি: Wikimedia Commons (CC BY-SA 4.0)
        </span>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center dark:border-white/10 dark:bg-[#1a2420]">
          <ImageOff size={28} className="mb-2 text-slate-400" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            এখনো কোনো ছবি যোগ করা হয়নি
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            অ্যাডমিন প্যানেল থেকে নতুন ছবি প্রকাশ করলে এখানে দেখা যাবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {photos.map((photo) => (
            <GalleryCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </section>
  )
}
