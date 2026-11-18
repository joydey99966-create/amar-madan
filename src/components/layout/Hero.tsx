import { MapPin, ShieldCheck } from 'lucide-react'
import { WeatherTicker } from './WeatherTicker'

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/25 bg-gradient-to-br from-[#175c46]/90 via-[#14503d]/90 to-[#0e3a2b]/90 px-4 py-5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 sm:px-8 sm:py-9 lg:px-10">
      {/* Decorative Orbs with subtle glow */}
      <div className="hero-orb absolute -right-10 -top-20 h-72 w-72 rounded-full border-[35px] border-white/[0.05] blur-[1px]" />
      <div className="hero-orb absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-emerald-400/[0.07] blur-2xl" />
      <div className="hero-orb absolute top-10 left-1/3 h-40 w-40 rounded-full bg-white/[0.02] blur-xl" />

      <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur-md sm:mb-3.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a7e5a0]" />
            </span>
            আপনার এলাকার পাশে, সবসময়
          </div>

          <h1 className="lg-heading text-[26px] font-extrabold leading-[1.2] text-white sm:text-3xl md:text-4xl lg:text-[40px]">
            মদনের সব সেবা,<br className="sm:hidden" /> এখন হাতের মুঠোয়
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-white/70 sm:mt-2.5 sm:text-base">
            জরুরি সহায়তা, রক্তদাতা, হাসপাতাল ও প্রয়োজনীয় সব নাগরিক সেবা খুঁজুন সহজেই।
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-emerald-100/90 sm:mt-6 sm:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-2.5 py-1 backdrop-blur-sm">
              <MapPin size={15} className="text-[#a7e5a0]" /> মদন, নেত্রকোণা
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-2.5 py-1 backdrop-blur-sm">
              <ShieldCheck size={15} className="text-[#a7e5a0]" /> ২৪/৭ সেবা ও তথ্য
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm shrink-0 lg:max-w-xs">
          <WeatherTicker />
        </div>
      </div>
    </section>
  )
}