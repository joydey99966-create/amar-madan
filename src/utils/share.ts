export interface ShareContactParams {
  name: string
  category?: string
  area?: string
  phone: string
}

export function shareToWhatsApp({ name, category, area, phone }: ShareContactParams): void {
  const lines = [
    `আমার মদন থেকে যোগাযোগ:`,
    ``,
    `👤 ${name}`,
    category ? `📂 বিভাগ: ${category}` : '',
    area ? `📍 এলাকা: ${area}` : '',
    `📞 ফোন: ${phone}`,
    ``,
    `উৎস: আমার মদন অ্যাপ`,
  ].filter(Boolean)

  const message = lines.join('\n')
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/?text=${encodedMessage}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function shareContent(data: { title: string; text: string; url?: string }): Promise<boolean> {
  if (navigator?.share) {
    try {
      await navigator.share(data)
      return true
    } catch {
      // User cancelled or share failed
      return false
    }
  }
  return false
}
