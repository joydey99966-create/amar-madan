export function CulturalBanner() {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-amber-50 to-slate-50 shadow-soft-sm transition-all dark:border-emerald-900/40 dark:from-[#162a22] dark:via-[#2a2216] dark:to-[#1a2020]">
      <div className="relative px-4 py-4 sm:px-6 sm:py-8">
        {/* Decorative orbs evoking haor & fields */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl dark:bg-emerald-400/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl dark:bg-amber-400/10" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-amber-300/15 blur-xl dark:bg-amber-400/10" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
              🌾 মদনের সংস্কৃতি
            </span>
            <h3 className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100 sm:text-lg">
              হাওর, কৃষি ও স্থানীয় মানুষের প্রাণবন্ত জীবন
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm">
              নীল হাওরের জল, সবুজ ধানক্ষেত ও স্থানীয় মানুষের সহজ হাসি — এই মদন উপজেলার
              গর্ব ও পরিচয়। একসাথে গড়ি একটি সমৃদ্ধ ও সংহত সমাজ।
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <img
              src="/images/haor.jpg"
              alt="হাওরের পানিতে নৌকা ও দিগন্তে গ্রাম"
              width={96}
              height={64}
              loading="lazy"
              className="h-16 w-24 rounded-xl object-cover shadow-sm sm:h-24 sm:w-40"
            />
            <div className="hidden items-center gap-1 text-2xl sm:flex sm:text-3xl" aria-hidden="true">
              <span>🌾</span>
              <span>🚤</span>
            </div>
          </div>
        </div>

        <p className="relative mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 sm:mt-3">
          ছবি: নীল হাওর — Abdul Momin / Wikimedia Commons (CC BY-SA 4.0)
        </p>
      </div>
    </section>
  )
}