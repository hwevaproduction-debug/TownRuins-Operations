import type { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"

type RelatedCard = {
  slug: string
  title: string
  description: string
  category: string
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

function describeFile(file?: QuartzPluginData): string {
  if (!file) return ""
  const fm = file.frontmatter as Record<string, unknown> | undefined
  if (typeof fm?.description === "string") return truncate(fm.description, 100)
  return ""
}

function slugToHref(slug: string, basePath: string): string {
  const normalizedBasePath = basePath.replace(/\/$/, "")
  if (!slug || slug === "index") {
    return normalizedBasePath || "/"
  }
  return `${normalizedBasePath}/${slug}`.replace(/\/\/?/g, "/").replace(/([^:]\/\/)/g, "$1")
}

function categoryFromSlug(slug: string): string {
  const segment = slug.split("/").filter(Boolean)[0]
  if (!segment) return "Document"
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function collectRelatedCards(
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
): RelatedCard[] {
  const bySlug = new Map(allFiles.map((file) => [file.slug ?? "", file]))
  const currentSlug = fileData.slug ?? ""
  const seen = new Set<string>()
  const cards: RelatedCard[] = []

  const add = (slug: string) => {
    if (!slug || slug === currentSlug || seen.has(slug)) return
    const file = bySlug.get(slug)
    if (!file) return
    seen.add(slug)
    const fm = file.frontmatter as Record<string, unknown> | undefined
    cards.push({
      slug,
      title: (typeof fm?.title === "string" && fm.title) || slug.split("/").pop() || slug,
      description: describeFile(file),
      category: categoryFromSlug(slug),
    })
  }

  for (const link of fileData.links ?? []) add(link)

  const backlinks = (fileData as Record<string, unknown>).backlinks
  if (Array.isArray(backlinks)) {
    for (const entry of backlinks) {
      if (typeof entry === "string") add(entry)
      else if (entry && typeof entry === "object" && "slug" in entry) {
        add(String((entry as { slug: string }).slug))
      }
    }
  }

  return cards.slice(0, 8)
}

const RelatedCards: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
  const cards = collectRelatedCards(fileData, allFiles)
  if (cards.length === 0) return null
  const basePath = cfg.baseUrl ? new URL(`https://${cfg.baseUrl}`).pathname.replace(/\/$/, "") : ""

  return (
    <section class="kc-related-section">
      <h2>Related documents</h2>
      <div class="tr-related-strip">
        {cards.map((card) => (
          <a
            key={card.slug}
            class="tr-surface tr-surface--md tr-related-card"
            href={slugToHref(card.slug, basePath)}
          >
            <span class="tr-surface__icon" aria-hidden="true">
              📄
            </span>
            <h3 class="tr-surface__title">{card.title}</h3>
            {card.description && <p class="tr-surface__summary">{card.description}</p>}
            <div class="tr-surface__meta">
              <span class="tr-surface__category">{card.category}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

RelatedCards.displayName = "RelatedCards"

export default (() => RelatedCards) satisfies QuartzComponentConstructor