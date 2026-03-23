export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function extractCaptionText(caption: unknown): string {
  if (typeof caption === 'string') return caption
  if (typeof caption === 'object' && caption !== null) {
    const c = caption as Record<string, unknown>
    return (
      (c.caption_text as string) ||
      (c.text as string) ||
      (c.caption as string) ||
      (c.content as string) ||
      JSON.stringify(caption)
    )
  }
  return String(caption)
}
