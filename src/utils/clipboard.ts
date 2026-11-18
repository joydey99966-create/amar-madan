export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: (err: unknown) => void,
): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      onSuccess?.()
      return true
    }
    // Fallback for older environments
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (successful) {
      onSuccess?.()
      return true
    }
    throw new Error('Copy command failed')
  } catch (error) {
    console.error('Clipboard copy error:', error)
    onError?.(error)
    return false
  }
}
