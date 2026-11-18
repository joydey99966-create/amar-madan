/**
 * Notice board categories.
 *
 * The chip colour of a category is fixed here, so the board keeps the same
 * green-white look no matter which category the admin picks.
 */
export const NOTICE_CATEGORIES = [
  { id: 'স্বাস্থ্য', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'কৃষি', color: 'bg-amber-100 text-amber-700' },
  { id: 'শিক্ষা', color: 'bg-blue-100 text-blue-700' },
  { id: 'প্রশাসন', color: 'bg-purple-100 text-purple-700' },
  { id: 'সংস্কৃতি', color: 'bg-amber-100 text-amber-700' },
  { id: 'জরুরি', color: 'bg-amber-100 text-amber-700' },
] as const

/** Used when a notice has no (or an unknown) category. */
export const DEFAULT_NOTICE_CATEGORY = 'সাধারণ'
export const DEFAULT_NOTICE_COLOR = 'bg-emerald-100 text-emerald-700'

/** Category id -> chip colour. */
export const NOTICE_CATEGORY_COLORS: Record<string, string> = NOTICE_CATEGORIES.reduce(
  (colors, category) => {
    colors[category.id] = category.color
    return colors
  },
  {} as Record<string, string>,
)

/** The chip colour for a category, falling back to the green default. */
export function noticeCategoryColor(category: string | undefined): string {
  if (!category) return DEFAULT_NOTICE_COLOR
  return NOTICE_CATEGORY_COLORS[category] ?? DEFAULT_NOTICE_COLOR
}
