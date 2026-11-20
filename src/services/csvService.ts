/** Minimal, dependency-free CSV import/export for admin lists. */

function escapeCell(value: unknown): string {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return ''
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
  ]
  return lines.join('\r\n')
}

/** Parses CSV text into rows. Returns errors instead of silently dropping rows. */
export function fromCsv(text: string): { rows: Array<Record<string, string>>; errors: string[] } {
  const errors: string[] = []
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) return { rows: [], errors: ['ফাইল খালি'] }
  const parseLine = (line: string): string[] => {
    const cells: string[] = []
    let cell = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cell += '"'; i++ }
        else quoted = !quoted
      } else if (ch === ',' && !quoted) {
        cells.push(cell); cell = ''
      } else cell += ch
    }
    cells.push(cell)
    return cells
  }
  const headers = parseLine(lines[0]).map((h) => h.trim())
  const rows: Array<Record<string, string>> = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i])
    if (cells.length !== headers.length) {
      errors.push(`লাইন ${i + 1}: ${cells.length} কলাম, অপেক্ষিত ${headers.length}`)
      continue
    }
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = (cells[idx] ?? '').trim() })
    rows.push(row)
  }
  return { rows, errors }
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
