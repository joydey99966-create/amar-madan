export function scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({ top: 0, behavior })
}

export function scrollToElement(elementId: string, behavior: ScrollBehavior = 'smooth'): void {
  const el = document.getElementById(elementId)
  if (el) {
    el.scrollIntoView({ behavior, block: 'start' })
  }
}
