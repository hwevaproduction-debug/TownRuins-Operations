import type { HubTier } from "./types"

/**
 * Hub config uses **post-slugify Quartz FullSlugs** (lowercase, folder-note rewrite).
 *
 * Mapping from content files:
 * - `architecture/ARCHITECTURE.md` → `architecture/index` (folder note)
 * - `api/API.md` → `api/index`
 * - `database/DATABASE.md` → `database/index`
 * - `deployment/DEPLOYMENT.md` → `deployment/index`
 * - `reference/REPOSITORY_GUIDE.md` → `reference/repository_guide`
 */
export type HubDefinition = {
  id: string
  contentSlug: string
  title: string
  icon: string
  tier: HubTier
  folderPrefix: string
  pinnedStackSlugs?: string[]
}

export const HUB_DEFINITIONS: HubDefinition[] = [
  {
    id: "administrator",
    contentSlug: "administrator",
    title: "Administrator",
    icon: "⚙",
    tier: "role",
    folderPrefix: "admin",
  },
  {
    id: "operations",
    contentSlug: "operations",
    title: "Operations",
    icon: "⚙",
    tier: "role",
    folderPrefix: "operations",
  },
  {
    id: "developer",
    contentSlug: "developer",
    title: "Developer",
    icon: "</>",
    tier: "role",
    folderPrefix: "developer",
    pinnedStackSlugs: [
      "architecture/index",
      "api/index",
      "database/index",
      "reference/repository_guide",
    ],
  },
  {
    id: "client",
    contentSlug: "client",
    title: "Client",
    icon: "★",
    tier: "role",
    folderPrefix: "client-handover",
  },
  {
    id: "business",
    contentSlug: "business",
    title: "Business",
    icon: "⚖",
    tier: "role",
    folderPrefix: "business",
  },
  {
    id: "architecture",
    contentSlug: "architecture/index",
    title: "Architecture",
    icon: "🏛",
    tier: "domain",
    folderPrefix: "architecture",
  },
  {
    id: "api",
    contentSlug: "api/index",
    title: "API",
    icon: "🔗",
    tier: "domain",
    folderPrefix: "api",
  },
  {
    id: "database",
    contentSlug: "database/index",
    title: "Database",
    icon: "🗄",
    tier: "domain",
    folderPrefix: "database",
  },
  {
    id: "deployment",
    contentSlug: "deployment/index",
    title: "Deployment",
    icon: "🚀",
    tier: "domain",
    folderPrefix: "deployment",
  },
  {
    id: "reference",
    contentSlug: "reference/index",
    title: "Reference",
    icon: "📚",
    tier: "domain",
    folderPrefix: "reference",
  },
]

export const HUB_IDS = HUB_DEFINITIONS.map((hub) => hub.id)

export function getHubById(id: string): HubDefinition | undefined {
  return HUB_DEFINITIONS.find((hub) => hub.id === id)
}
