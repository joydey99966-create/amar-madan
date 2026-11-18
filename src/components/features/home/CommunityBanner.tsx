import { ChevronRight, UsersRound } from 'lucide-react'

interface CommunityBannerProps {
  onRegisterDonor: () => void
}

export function CommunityBanner({ onRegisterDonor }: CommunityBannerProps) {
  return (
    <div
      id="profile-card"
      className="scroll-mt-24 flex flex-col justify-between rounded-[24px] bg-[#eef4ff] p-4 dark:bg-[#1b2635] sm:p-6"
    >
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300">
          <UsersRound size={19} />
        </div>
        <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white sm:mt-4">মদনবাসীর জন্য</h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          নিজের এলাকার সেবার তথ্য যোগ করে পাশে থাকুন। আপনার ছোট উদ্যোগই হতে পারে কারও বড় সহায়তা।
        </p>
      </div>
      <button
        onClick={onRegisterDonor}
        className="mt-4 flex w-fit items-center gap-2 rounded-xl bg-[#386bc1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f5eae] sm:mt-5 sm:py-2.5"
      >
        রক্তদাতা হোন <ChevronRight size={16} />
      </button>
    </div>
  )
}
