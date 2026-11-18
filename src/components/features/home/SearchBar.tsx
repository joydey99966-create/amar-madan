import { useEffect, useMemo, useRef, useState } from 'react'
import { CornerDownLeft, Mic, Search, X } from 'lucide-react'
import { SearchGroup, SearchHit } from '../../../utils/search'
import { toBanglaNumber } from '../../../utils/formatters'
import { storageService } from '../../../services/storageService'

/** Recent searches, kept locally and admin-agnostic (a convenience, not data). */
const RECENT_KEY = 'amar-madan-recent-searches'
const RECENT_MAX = 5

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  /** Runs the search and opens the matching section. */
  onSubmit?: (value: string) => void
  placeholder?: string
  /** Total number of live records matching the current query. */
  resultCount?: number
  /** Debounced suggestion groups, grouped by section. */
  groups?: SearchGroup[]
  /** Opens the exact record a suggestion points to. */
  onSelectHit?: (hit: SearchHit) => void
}

const MAX_SUGGESTIONS = 8

/**
 * The one search control of the site.
 *
 * Suggestions appear while typing (the query is debounced by the parent),
 * are grouped by section, capped at eight, and fully keyboard navigable.
 */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'কী খুঁজছেন? (যেমন: O+ রক্ত, ডাক্তার, আলুর দাম...)',
  resultCount,
  groups = [],
  onSelectHit,
}: SearchBarProps) {
  const hasQuery = value.trim().length > 0
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [listening, setListening] = useState(false)
  const [recent, setRecent] = useState<string[]>(() => storageService.get<string[]>(RECENT_KEY, []))
  const inputRef = useRef<HTMLInputElement>(null)

  // Remember a search once it is submitted.
  useEffect(() => {
    if (!hasQuery) return
    const query = value.trim()
    setRecent((prev) => {
      const next = [query, ...prev.filter((item) => item !== query)].slice(0, RECENT_MAX)
      storageService.set(RECENT_KEY, next)
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQuery])

  const startVoiceSearch = () => {
    type SpeechCtor = new () => SpeechRecognitionLike
    const Ctor = (window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.lang = 'bn-BD'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) {
        onChange(transcript)
        inputRef.current?.focus()
      }
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  const suggestions = useMemo(() => {
    const seenKeys = new Set<string>()
    const seenTitles = new Set<string>()
    return groups
      .flatMap((group) => group.hits.map((hit) => ({ group, hit })))
      .filter(({ hit }) => {
        // De-duplicate by both the record id and its visible title, so one
        // result can never appear twice in the suggestion listbox.
        const titleKey = `${hit.kind}:${hit.title.trim().toLocaleLowerCase('bn')}`
        if (seenKeys.has(hit.key) || seenTitles.has(titleKey)) return false
        seenKeys.add(hit.key)
        seenTitles.add(titleKey)
        return true
      })
      .slice(0, MAX_SUGGESTIONS)
  }, [groups])

  const showSuggestions = open && hasQuery && suggestions.length > 0

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    if (!showSuggestions) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const selected = suggestions[activeIndex]?.hit
      if (selected) {
        onSelectHit?.(selected)
        setOpen(false)
        setActiveIndex(-1)
      }
    }
  }

  return (
    <section className="relative z-10 mx-auto -mt-5 max-w-4xl px-2 sm:-mt-7 sm:px-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          setOpen(false)
          setActiveIndex(-1)
          onSubmit?.(value)
        }}
        className="flex h-[54px] items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-3.5 shadow-soft-lg transition-all duration-300 focus-within:border-forest focus-within:ring-4 focus-within:ring-forest/10 dark:border-white/10 dark:bg-[#182420] dark:shadow-black/20 dark:focus-within:border-emerald-500/50 dark:focus-within:ring-emerald-500/20 sm:h-[64px] sm:gap-3 sm:px-5"
      >
        <Search size={21} className="shrink-0 text-forest transition-colors dark:text-emerald-400" />
        <input
          ref={inputRef}
          aria-label="খুঁজুন"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 transition-colors dark:text-white dark:placeholder:text-slate-500 sm:text-base"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setOpen(false)
              setActiveIndex(-1)
              inputRef.current?.focus()
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-90 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="সার্চ মুছুন"
          >
            <X size={17} />
          </button>
        )}
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            listening
              ? 'bg-forest text-white'
              : 'text-slate-400 hover:bg-slate-100 hover:text-forest dark:hover:bg-white/10 dark:hover:text-emerald-300'
          }`}
          aria-label="ভয়েস দিয়ে খুঁজুন"
          title="ভয়েস দিয়ে খুঁজুন"
        >
          <Mic size={18} />
        </button>
        <button
          type="submit"
          className="min-h-[44px] shrink-0 rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-500 transition-colors hover:border-forest hover:text-forest dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-emerald-300 sm:min-h-0 sm:px-4"
        >
          খুঁজুন
        </button>
      </form>

      {!hasQuery && recent.length > 0 && open && (
        <div className="absolute left-2 right-2 top-full z-40 mt-1 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-soft-lg dark:border-white/10 dark:bg-[#182420] sm:left-4 sm:right-4">
          <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">সাম্প্রতিক অনুসন্ধান</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(item)
                  onSubmit?.(item)
                  setOpen(false)
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-forest hover:text-forest dark:border-white/10 dark:text-slate-300 dark:hover:text-emerald-300"
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setRecent([]); storageService.remove(RECENT_KEY) }}
              className="rounded-full px-2 py-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              মুছুন
            </button>
          </div>
        </div>
      )}

      {showSuggestions && (
        <div
          id="search-suggestions"
          role="listbox"
          aria-label="খোঁজার পরামর্শ"
          className="absolute left-2 right-2 top-full z-40 mt-1 max-h-[min(60vh,420px)] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-soft-lg dark:border-white/10 dark:bg-[#182420] sm:left-4 sm:right-4"
        >
          {suggestions.map(({ group, hit }, index) => (
            <div key={hit.key}>
              {(index === 0 || suggestions[index - 1].group.kind !== group.kind) && (
                <div className="px-2 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {group.label}
                </div>
              )}
              <button
                id={`search-suggestion-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                type="button"
                // Keep the input focused until the click is handled.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelectHit?.(hit)
                  setOpen(false)
                  setActiveIndex(-1)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition ${
                  activeIndex === index
                    ? 'bg-forest/5 dark:bg-emerald-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {hit.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {hit.subtitle}
                  </span>
                </span>
                {activeIndex === index ? (
                  <CornerDownLeft size={13} className="shrink-0 text-forest dark:text-emerald-300" />
                ) : null}
              </button>
            </div>
          ))}
          <p className="px-2 pb-1 pt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            {toBanglaNumber(suggestions.length)} টি পরামর্শ · ↑↓ বেছে নিন, Enter দিয়ে খুলুন, Esc দিয়ে বন্ধ করুন
          </p>
        </div>
      )}

      {hasQuery && typeof resultCount === 'number' && (
        <p className="mt-1.5 px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:mt-2">
          {resultCount > 0
            ? `${toBanglaNumber(resultCount)} টি ফলাফল পাওয়া গেছে — নিচের তালিকা থেকে বেছে নিন।`
            : 'কোনো ফলাফল পাওয়া যায়নি — অন্য শব্দ দিয়ে চেষ্টা করুন।'}
        </p>
      )}
    </section>
  )
}
