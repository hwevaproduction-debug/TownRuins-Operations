const SUMMARY_MAX = 160

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

export function titleFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean)
  const raw = parts[parts.length - 1] ?? "Document"
  const decoded = decodeURIComponent(raw)
  return decoded
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function extractTitle(html: Document): string | null {
  const ogTitle = html.querySelector('meta[property="og:title"]')?.getAttribute("content")
  if (ogTitle?.trim()) return ogTitle.trim()

  const h1 = html.querySelector("header h1, .page-header h1, article h1, h1")
  if (h1?.textContent?.trim()) return h1.textContent.trim()

  const titleTag = html.querySelector("title")?.textContent?.trim()
  if (titleTag) return titleTag.split(/\s[|\-–]\s/)[0]?.trim() ?? titleTag

  return null
}

function extractSummary(html: Document): string | null {
  const metaDesc =
    html.querySelector('meta[name="description"]')?.getAttribute("content") ??
    html.querySelector('meta[property="og:description"]')?.getAttribute("content")
  if (metaDesc?.trim()) return truncate(metaDesc.trim(), SUMMARY_MAX)

  const contentRoot =
    html.querySelector(".center") ??
    html.querySelector("article") ??
    html.querySelector("main") ??
    html.body

  for (const paragraph of contentRoot.querySelectorAll("p")) {
    if (paragraph.closest("nav, header, footer, .sidebar, .page-footer")) continue
    const text = paragraph.textContent?.trim() ?? ""
    if (text.length < 20) continue
    return truncate(text, SUMMARY_MAX)
  }

  return null
}

export type PopoverPreviewData = {
  title: string
  summary: string
}

export function extractPreviewFromHtml(html: Document, targetUrl: URL): PopoverPreviewData {
  return {
    title: extractTitle(html) ?? titleFromPathname(targetUrl.pathname),
    summary: extractSummary(html) ?? "Click to open",
  }
}

export function renderStructuredPreview(
  container: HTMLElement,
  data: PopoverPreviewData & { href: string },
): void {
  container.replaceChildren()
  container.dataset.contentType = "text/html"
  container.classList.add("popover-preview-host")

  const card = document.createElement("div")
  card.className = "tr-surface tr-surface--md popover-preview"

  const title = document.createElement("h3")
  title.className = "tr-surface__title"
  title.textContent = data.title

  const summary = document.createElement("p")
  summary.className = "tr-surface__summary"
  summary.textContent = data.summary

  const openLink = document.createElement("a")
  openLink.className = "popover-preview__open internal"
  openLink.href = data.href
  openLink.textContent = "Open document"

  card.append(title, summary, openLink)
  container.append(card)
}