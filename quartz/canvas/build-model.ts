import { QuartzPluginData } from "../plugins/vfile"
import { HUB_DEFINITIONS } from "./hub-config"
import type { CanvasEdge, CanvasModel, CanvasNode } from "./types"

const DESCRIPTION_MAX = 120
const MAX_STACK_CHILDREN = 20

type FileRecord = {
  slug: string
  title: string
  description: string
  links: string[]
  tags: string[]
  folder: string
}

function slugDepth(slug: string): number {
  if (!slug) return 0
  return slug.split("/").filter(Boolean).length
}

function topFolder(slug: string): string {
  return slug.split("/")[0] ?? "root"
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

function deriveDescription(file: QuartzPluginData): string {
  const fm = file.frontmatter as Record<string, unknown> | undefined
  if (typeof fm?.description === "string" && fm.description.trim()) {
    return truncate(fm.description, DESCRIPTION_MAX)
  }

  const text = typeof file.text === "string" ? file.text : ""
  const line = text
    .split("\n")
    .map((row) => row.trim())
    .find((row) => row && !row.startsWith("#") && !row.startsWith("<") && !row.startsWith("---"))
  return truncate(line ?? "", DESCRIPTION_MAX)
}

function isPublishable(file: QuartzPluginData): boolean {
  const slug = file.slug ?? ""
  if (!slug || slug === "index") return false

  const fm = file.frontmatter as Record<string, unknown> | undefined
  if (fm?.draft === true || fm?.unlisted === true) return false
  if (fm?.password) return false

  return true
}

function toFileRecord(file: QuartzPluginData): FileRecord {
  const slug = file.slug ?? ""
  const fm = file.frontmatter as Record<string, unknown> | undefined
  const title =
    (typeof fm?.title === "string" && fm.title) ||
    slug.split("/").pop() ||
    "Untitled"

  return {
    slug,
    title,
    description: deriveDescription(file),
    links: Array.isArray(file.links) ? [...file.links] : [],
    tags: Array.isArray(fm?.tags) ? (fm!.tags as string[]) : [],
    folder: topFolder(slug),
  }
}

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

/** Normalize for case-insensitive comparisons (Quartz FullSlugs are lowercase). */
function normalizeSlug(slug: string): string {
  return slug.replace(/\/+$/, "").toLowerCase()
}

/**
 * Expand a configured or linked path into candidate FullSlugs that Quartz may emit.
 * Handles: lowercase, trailing slash, folder-note rewrite (`folder/folder` → `folder/index`),
 * and bare folder vs `folder/index`.
 */
export function slugLookupCandidates(raw: string): string[] {
  const trimmed = raw.replace(/\/+$/, "")
  if (!trimmed) return []

  const lower = normalizeSlug(trimmed)
  const out = new Set<string>([trimmed, lower])

  const parts = lower.split("/").filter(Boolean)
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]!
    const parent = parts[parts.length - 2]!
    // Folder-note convention: architecture/architecture → architecture/index
    if (last === parent) {
      out.add([...parts.slice(0, -1), "index"].join("/"))
    }
  }

  if (lower.endsWith("/index")) {
    out.add(lower.slice(0, -"/index".length))
  } else if (parts.length === 1) {
    out.add(`${lower}/index`)
  }

  return [...out]
}

/**
 * Resolve a config/link slug to an actual file record using exact, candidate, and
 * case-insensitive match. Returns the canonical `record.slug` via the record.
 */
export function resolveFileRecord(
  filesBySlug: Map<string, FileRecord>,
  raw: string,
): FileRecord | undefined {
  if (!raw) return undefined

  for (const candidate of slugLookupCandidates(raw)) {
    const hit = filesBySlug.get(candidate)
    if (hit) return hit
  }

  const wanted = new Set(slugLookupCandidates(raw).map(normalizeSlug))
  for (const [slug, record] of filesBySlug) {
    if (wanted.has(normalizeSlug(slug))) return record
  }

  return undefined
}

function resolveSlugString(
  filesBySlug: Map<string, FileRecord>,
  raw: string,
): string | undefined {
  return resolveFileRecord(filesBySlug, raw)?.slug
}

function buildStacks(
  filesBySlug: Map<string, FileRecord>,
  hubContentSlug: string,
  folderPrefix: string,
  pinnedStackSlugs: string[] = [],
): string[] {
  const children = new Set<string>()
  const hubNorm = normalizeSlug(hubContentSlug)

  for (const [slug] of filesBySlug) {
    if (normalizeSlug(slug) === hubNorm) continue
    const prefix = `${folderPrefix}/`
    if (slug.startsWith(prefix) && slugDepth(slug) === 2) {
      children.add(slug)
    }
  }

  const hubFile = resolveFileRecord(filesBySlug, hubContentSlug)
  if (hubFile) {
    for (const link of hubFile.links) {
      const resolved = resolveSlugString(filesBySlug, link)
      if (resolved && normalizeSlug(resolved) !== hubNorm) {
        children.add(resolved)
      }
    }
  }

  for (const pin of pinnedStackSlugs) {
    const resolved = resolveSlugString(filesBySlug, pin)
    if (resolved && normalizeSlug(resolved) !== hubNorm) {
      children.add(resolved)
    }
  }

  return [...children].slice(0, MAX_STACK_CHILDREN)
}

export function buildCanvasModel(allFiles: QuartzPluginData[]): CanvasModel {
  const filesBySlug = new Map<string, FileRecord>()
  for (const file of allFiles) {
    if (!isPublishable(file)) continue
    const record = toFileRecord(file)
    filesBySlug.set(record.slug, record)
  }

  const nodes: CanvasNode[] = []
  const nodeIds = new Set<string>()
  const stacks: Record<string, string[]> = {}
  const hubs: string[] = []

  for (const hub of HUB_DEFINITIONS) {
    const hubFile = resolveFileRecord(filesBySlug, hub.contentSlug)
    const hasFolderChildren = [...filesBySlug.keys()].some(
      (slug) => slug.startsWith(`${hub.folderPrefix}/`) && slugDepth(slug) === 2,
    )
    if (!hubFile && !hasFolderChildren) continue

    const resolvedHubSlug = hubFile?.slug ?? resolveSlugString(filesBySlug, hub.contentSlug) ?? hub.contentSlug

    const hubNode: CanvasNode = {
      id: hub.id,
      slug: resolvedHubSlug,
      title: hubFile?.title ?? hub.title,
      description: hubFile?.description ?? hub.title,
      icon: hub.icon,
      kind: "hub",
      folder: hub.folderPrefix,
      tags: hubFile?.tags ?? [],
      tier: hub.tier,
      category: hub.tier === "role" ? "Role" : "System",
    }

    nodes.push(hubNode)
    nodeIds.add(hub.id)
    hubs.push(hub.id)

    const stackSlugs = buildStacks(
      filesBySlug,
      resolvedHubSlug,
      hub.folderPrefix,
      hub.pinnedStackSlugs ?? [],
    )
    stacks[hub.id] = stackSlugs

    for (const childSlug of stackSlugs) {
      if (nodeIds.has(childSlug)) continue
      const child = resolveFileRecord(filesBySlug, childSlug)
      if (!child) continue

      nodes.push({
        id: child.slug,
        slug: child.slug,
        title: child.title,
        description: child.description,
        icon: hub.icon,
        kind: "leaf",
        hubId: hub.id,
        folder: child.folder,
        tags: child.tags,
        category: hub.title,
      })
      nodeIds.add(child.slug)
    }
  }

  const edges: CanvasEdge[] = []
  const edgeSet = new Set<string>()
  for (const record of filesBySlug.values()) {
    for (const target of record.links) {
      const resolvedTarget = resolveSlugString(filesBySlug, target)
      if (!resolvedTarget) continue
      const key = edgeKey(record.slug, resolvedTarget)
      if (edgeSet.has(key)) continue
      edgeSet.add(key)
      edges.push({ source: record.slug, target: resolvedTarget })
    }
  }

  return { hubs, nodes, edges, stacks }
}
