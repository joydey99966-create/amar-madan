# আমার মদন — Amar Madan

মদন উপজেলা, নেত্রকোণার জন্য বাংলা ভাষার সেবা ও তথ্য ওয়েবসাইট। জরুরি নম্বর, রক্তদাতা, বাজারদর, ডাক্তার, নাগরিক সেবা — সবকিছু এক জায়গায়।

**Live site:** https://joydey99966-create.github.io/amar-madan/  
**GitHub:** https://github.com/joydey99966-create/amar-madan

---

## প্রযুক্তি (Tech stack)

| | |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 (কাস্টম `forest` থিম, darkMode: `class`) |
| Font | Hind Siliguri |
| Icons | lucide-react |
| Deploy | GitHub Actions → GitHub Pages |

---

## শুরু করুন (Getting started)

```bash
# ডিপেন্ডেন্সি ইনস্টল
npm install

# ডেভেলপমেন্ট সার্ভার (http://localhost:5173)
npm run dev

# প্রোডাকশন বিল্ড
npm run build

# বিল্ডটি locally দেখুন
npm run preview
```

> `npm run build` আগে TypeScript চেক (`tsc`) করে, পরে Vite বিল্ড করে।

---

## বৈশিষ্ট্য (Features)

- **১৩টি সেবা**, ৩টি গ্রুপ (জরুরি / কৃষি / সমাজ): রক্তদাতা, অ্যাম্বুলেন্স, ডাক্তার ও হাসপাতাল, বাজারদর, হাওরের মাছ, কৃষি যন্ত্রপাতি, চাকরি ও টিউশনি, শিক্ষা প্রতিষ্ঠান, সংবাদ, নাগরিক সেবা, হারানো ও প্রাপ্তি, যাতায়াত।
- **সব জায়গায় খুঁজুন** — ১৪ ধরনের রেকর্ড, ফোনেটিক ম্যাচিং, সাজেশন, সাম্প্রতিক অনুসন্ধান ও ভয়েস সার্চ (`bn-BD`)।
- **জরুরি ক্বিক-ডায়াল** — ৯-nine-nine, ১০২ ইত্যাদি অফলাইনেও দেখা যায় (service worker ক্যাশ)।
- **মোবাইল-ফার্স্ট ডিজাইন** — ৩৬০px থেকে ১৪৪০px পর্যন্ত রেসপন্সিভ; মোবাইলে bottom nav, ডেস্কটপে top nav।
- **অ্যাডমিন প্যানেল** — PIN-গেটেড; প্রতিটি তালিকা (ডোনার, দাম, নোটিশ, চাকরি, রুট ইত্যাদি) এডিট/অ্যাপ্রুভ/মুছে ফেলা যায়। সব লেবেল, সেবার অর্ডার, লঞ্চ চেকলিস্টও অ্যাডমিন-কন্ট্রোলড।
- **ডার্ক মোড** — সব পেজে কাজ করে।
- **PWA** — manifest + service worker (অফলাইন শেল)।

---

## প্রকল্প গঠন (Structure)

```
src/
├── App.tsx              # মূল কম্পোজিশন ও রাউট-ভিত্তিক রেন্ডার
├── main.tsx             # এন্ট্রি, snapshot সিডিং, SW রেজিস্ট্রেশন
├── constants/           # nav, categories, views, routes, notices
├── components/
│   ├── layout/          # Header, BottomNav, Hero, Footer, WeatherTicker
│   ├── common/          # ContactCard, ContactActions, ModalShell, EmptyState …
│   └── features/        # home, blood, emergency, market, jobs, news, admin …
├── hooks/               #useAppRouter, useWeather, useDataVersion …
├── services/            # storage, notice, records, market, admin, snapshot …
├── types/               # TypeScript ইন্টারফেস
└── styles.css           # Tailwind + থিম + রেসপন্সিভ টাইপোগ্রাফি
public/
├── images/, icons/      # ছবি ও PWA আইকন
├── manifest.json
├── sw.js                # Service worker (cache v5)
├── 404.html             # GitHub Pages SPA deep-link fallback
└── data/snapshot.json   # পাবলিশড ডেটা স্ন্যাপশট
```

---

## রাউটিং (Routing)

History-API ভিত্তিক ছোট রাউটার (`src/hooks/useAppRouter.ts` + `src/constants/routes.ts`)। প্রতিটি সেকশনের নিজস্ব URL আছে:

| View | Path |
|---|---|
| হোম | `/` |
| বাজার | `/bazar` |
| জরুরি ও রক্ত | `/rokto` |
| ডিরেক্টরি | `/directory` |
| চাকরি | `/jobs` |
| নাগরিক সেবা | `/nagorik-seba` |
| যাতায়াত | `/yatayat` |
| হারানো ও প্রাপ্তি | `/harano` |
| সংবাদ | `/news` (বিস্তারিত: `/news/:id`) |
| হাওরের মাছ | `/haoar-mach` |
| প্রোফাইল | `/profile` |
| সব সেবা | `/services` |

GitHub Pages-এ `/amar-madan/` বেজ ব্যবহৃত হয় — `404.html` deep link-কে `index.html`-এ পাঠায় এবং `main.tsx` URL পুনরুদ্ধার করে।

---

## অ্যাডমিন প্যানেল (Admin)

- হেডার/সাইড মেনু/ফুটারের **অ্যাডমিন অ্যাক্সেস** বাটনে ক্লিক করলে PIN ডায়ালগ আসে; সেশন শেষ হলে আবার PIN চাই।
- ড্যাশবোর্ডে আছে: ডোনার, বাজার, নোটিশ, হারানো-প্রাপ্তি, ডিরেক্টরি, দাম যাচাই, চাকরি, রিপোর্ট, গ্যালারি, রেকর্ড, সার্চ, জরুরি নম্বর, আবহাওয়া, বুকিং, প্রোফাইল লেখা, লঞ্চ চেকলিস্ট, ডেটা ও ব্যাকআপ, সেবার অর্ডার।
- **ডেটা ও ব্যাকআপ** ট্যাব থেকে পুরো ডেটা JSON-এ রপ্তানি/পুনরুদ্ধার করা যায়। রপ্তানি করা ফাইলটি `public/data/snapshot.json` হিসেবে ডিপ্লয় করলেadmin-এর সম্পাদিত তথ্য সব দর্শক দেখতে পান — কোনো সার্ভার লাগবে না।

> **মনে রাখবেন:** এই রিপোজিটরির ডেমো ফোন নম্বর, EIIN, দাম ইত্যাদি শুধু ডেমো। প্রকাশের আগে অ্যাডমিন প্যানেলের **লঞ্চ চেকলিস্ট** অনুযায়ী বাস্তব তথ্য দিয়ে বদলাতে হবে।

---

## ডিপ্লয়মেন্ট (Deployment)

`.github/workflows/deploy.yml` — `main`-এ push হলে `npm ci && npm run build` চালিয়ে `dist/` GitHub Pages-এ ডিপ্লয় করে।

- **Live (main):** https://joydey99966-create.github.io/amar-madan/
- **Branches:** `main` (প্রকাশিত), `responsive-redesign` (মোবাইল-ফার্স্ট রিডিজাইন)
- কাস্টম ডোমেইন যোগ করতে চাইলে Pages settings-এ CNAME সেট করুন।

---

## নোট (Notes)

- কোনো backend নেই — ডেটা প্রাথমিকভাবে `localStorage`-এ থাকে; পাবলিশড স্ন্যাপশট ফাইলটি 전체 visitors-এর জন্য কাজ করে।
- PIN শুধু ক্লায়েন্ট-সাইড fingerprints হিসেবে সংরক্ষিত; প্রোডাকশনে host-side auth সুপারিশকৃত।
- সব ধরনের তথ্য **verified** না হওয়া পর্যন্ত “তথ্য যাচাই চলছে” হিসেবে দেখানো হয়।

---

**Made with ❤️ for Madan Upazila.**
