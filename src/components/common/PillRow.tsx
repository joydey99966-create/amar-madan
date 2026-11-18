import { ReactNode, useEffect, useRef, useState } from 'react'

interface PillRowProps {
  children: ReactNode
  /** Wrapper classes (the sticky card etc.). */
  className?: string
  /** Classes of the scrolling track. */
  trackClassName?: string
  /** Gradient colour that fades the clipped edge — matches the card behind it. */
  fadeClassName?: string
}

/**
 * A horizontally scrollable row of pills.
 *
 * A fade on each scrollable edge is a clear cue that more labels exist, so a
 * clipped pill never looks like a finished word. The active pill is scrolled
 * fully into view whenever it changes.
 */
export function PillRow({
  children,
  className = '',
  trackClassName = 'flex gap-2 overflow-x-auto scrollbar-hide pb-1',
  fadeClassName = 'from-white dark:from-[#1a2420]',
}: PillRowProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const updateEdges = () => {
    const el = trackRef.current
    if (!el) return
    setEdges({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    })
  }

  useEffect(() => {
    const active = trackRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    updateEdges()
  }, [children])

  return (
    <div className={`relative ${className}`}>
      <div ref={trackRef} onScroll={updateEdges} className={trackClassName}>
        {children}
      </div>
      {edges.left && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r ${fadeClassName} to-transparent`}
        />
      )}
      {edges.right && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l ${fadeClassName} to-transparent`}
        />
      )}
    </div>
  )
}
