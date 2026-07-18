import assert from "node:assert"
import { describe, test } from "node:test"
import {
  buildCanvasModel,
  resolveFileRecord,
  slugLookupCandidates,
} from "./build-model"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, SimpleSlug } from "../util/path"

type MockFileInput = Omit<Partial<QuartzPluginData>, "slug" | "links"> & {
  slug: string
  links?: string[]
}

function mockFile(partial: MockFileInput): QuartzPluginData {
  const { slug, links, ...rest } = partial
  return {
    frontmatter: { title: slug.split("/").pop() },
    links: (links ?? []) as SimpleSlug[],
    ...rest,
    slug: slug as FullSlug,
  } as QuartzPluginData
}

function filesMap(files: QuartzPluginData[]) {
  const map = new Map<
    string,
    {
      slug: string
      title: string
      description: string
      links: string[]
      tags: string[]
      folder: string
    }
  >()
  for (const file of files) {
    const slug = file.slug ?? ""
    map.set(slug, {
      slug,
      title: (file.frontmatter as { title?: string })?.title ?? slug,
      description: "",
      links: (file.links as string[]) ?? [],
      tags: [],
      folder: slug.split("/")[0] ?? "root",
    })
  }
  return map
}

describe("slugLookupCandidates", () => {
  test("expands folder-note and case variants", () => {
    const candidates = slugLookupCandidates("architecture/ARCHITECTURE")
    assert.ok(candidates.includes("architecture/architecture"))
    assert.ok(candidates.includes("architecture/index"))
  })

  test("expands bare folder to index form", () => {
    const candidates = slugLookupCandidates("api")
    assert.ok(candidates.includes("api"))
    assert.ok(candidates.includes("api/index"))
  })
})

describe("resolveFileRecord", () => {
  test("resolves pre-slugify path to folder-note FullSlug", () => {
    const files = filesMap([
      mockFile({ slug: "architecture/index", frontmatter: { title: "Architecture" } }),
    ])
    const hit = resolveFileRecord(files, "architecture/ARCHITECTURE")
    assert.equal(hit?.slug, "architecture/index")
  })

  test("resolves lowercase repository guide", () => {
    const files = filesMap([
      mockFile({
        slug: "reference/repository_guide",
        frontmatter: { title: "Repository Guide" },
      }),
    ])
    const hit = resolveFileRecord(files, "reference/REPOSITORY_GUIDE")
    assert.equal(hit?.slug, "reference/repository_guide")
  })
})

describe("buildCanvasModel", () => {
  test("creates operations hub with folder children and hub links", () => {
    const files: QuartzPluginData[] = [
      mockFile({
        slug: "operations",
        frontmatter: { title: "Operations", description: "Ops hub" },
        links: ["operations/operations_runbook"],
      }),
      mockFile({
        slug: "operations/operations_runbook",
        frontmatter: { title: "Operations Runbook", description: "Runbook" },
      }),
      mockFile({
        slug: "operations/deployment",
        frontmatter: { title: "Deployment", description: "Deploy" },
      }),
      mockFile({
        slug: "developer",
        frontmatter: { title: "Developer", description: "Dev hub" },
        links: ["architecture/index"],
      }),
      mockFile({
        slug: "architecture/index",
        frontmatter: { title: "Architecture", description: "Arch" },
      }),
    ]

    const model = buildCanvasModel(files)
    const operationsHub = model.nodes.find((node) => node.id === "operations")

    assert.ok(operationsHub)
    assert.equal(operationsHub?.kind, "hub")
    assert.equal(operationsHub?.category, "Role")
    assert.ok(model.stacks.operations.includes("operations/operations_runbook"))
    assert.ok(model.stacks.operations.includes("operations/deployment"))
    assert.ok(
      model.edges.some(
        (edge) =>
          edge.source === "operations" && edge.target === "operations/operations_runbook",
      ),
    )
  })

  test("resolves hub links that still use pre-slugify orthography", () => {
    const model = buildCanvasModel([
      mockFile({
        slug: "operations",
        frontmatter: { title: "Operations" },
        links: ["operations/OPERATIONS_RUNBOOK"],
      }),
      mockFile({
        slug: "operations/operations_runbook",
        frontmatter: { title: "Operations Runbook" },
      }),
    ])

    assert.ok(model.stacks.operations.includes("operations/operations_runbook"))
    assert.ok(
      model.edges.some(
        (edge) =>
          edge.source === "operations" && edge.target === "operations/operations_runbook",
      ),
    )
  })

  test("deduplicates edges and caps stack children", () => {
    const children = Array.from({ length: 25 }, (_, i) =>
      mockFile({
        slug: `operations/child-${i}`,
        frontmatter: { title: `Child ${i}` },
      }),
    )

    const model = buildCanvasModel([
      mockFile({ slug: "operations", frontmatter: { title: "Operations" } }),
      ...children,
    ])

    assert.equal(model.stacks.operations.length, 20)
    const keys = model.edges.map((edge) => `${edge.source}->${edge.target}`)
    assert.equal(keys.length, new Set(keys).size)
  })

  test("developer hub merges pinnedStackSlugs into stack (≥4 real FullSlugs)", () => {
    const files: QuartzPluginData[] = [
      mockFile({
        slug: "developer",
        frontmatter: { title: "Developer", description: "Dev hub" },
      }),
      mockFile({
        slug: "architecture/index",
        frontmatter: { title: "Architecture", description: "Arch" },
      }),
      mockFile({
        slug: "api/index",
        frontmatter: { title: "API", description: "API docs" },
      }),
      mockFile({
        slug: "database/index",
        frontmatter: { title: "Database", description: "DB docs" },
      }),
      mockFile({
        slug: "reference/repository_guide",
        frontmatter: { title: "Repository Guide", description: "Repo workflow" },
      }),
    ]

    const model = buildCanvasModel(files)
    const developerStack = model.stacks.developer ?? []
    const developerHub = model.nodes.find((node) => node.id === "developer")

    assert.ok(developerHub)
    assert.equal(developerHub?.slug, "developer")
    assert.ok(developerStack.length >= 4)
    // Pins appear first in declared hub-config order
    assert.deepEqual(developerStack.slice(0, 4), [
      "architecture/index",
      "api/index",
      "database/index",
      "reference/repository_guide",
    ])

    // Leaf nodes exist and navigate to real slugs
    for (const slug of [
      "architecture/index",
      "api/index",
      "database/index",
      "reference/repository_guide",
    ]) {
      const leaf = model.nodes.find((node) => node.id === slug)
      assert.ok(leaf, `missing leaf ${slug}`)
      assert.equal(leaf?.slug, slug)
      assert.equal(leaf?.hubId, "developer")
    }
  })

  test("pins-first stack order: pins, then hub links, then folder; no double-count", () => {
    // Folder children that would dominate insertion order without pins-first
    const folderBulk = Array.from({ length: 8 }, (_, i) =>
      mockFile({
        slug: `developer/folder-child-${i}`,
        frontmatter: { title: `Folder ${i}` },
      }),
    )

    const model = buildCanvasModel([
      mockFile({
        slug: "developer",
        frontmatter: { title: "Developer" },
        // Hub link that overlaps a pin (api) plus a unique hub-only link
        links: ["api/index", "developer/hub-only-page"],
      }),
      ...folderBulk,
      mockFile({
        slug: "developer/hub-only-page",
        frontmatter: { title: "Hub Only" },
      }),
      // Pins (also partially reachable via folder or hub links)
      mockFile({
        slug: "architecture/index",
        frontmatter: { title: "Architecture" },
      }),
      mockFile({
        slug: "api/index",
        frontmatter: { title: "API" },
      }),
      mockFile({
        slug: "database/index",
        frontmatter: { title: "Database" },
      }),
      mockFile({
        slug: "reference/repository_guide",
        frontmatter: { title: "Repository Guide" },
      }),
    ])

    const stack = model.stacks.developer ?? []

    // 1. Pins first in declared order
    assert.deepEqual(stack.slice(0, 4), [
      "architecture/index",
      "api/index",
      "database/index",
      "reference/repository_guide",
    ])

    // 2. Hub-only link after pins (api pin not double-counted)
    assert.equal(stack[4], "developer/hub-only-page")
    assert.equal(stack.filter((s) => s === "api/index").length, 1)

    // 3. Folder children follow, still present
    assert.ok(stack.includes("developer/folder-child-0"))
    assert.ok(stack.length <= 20)
  })

  test("hub without pins still builds stack from hub links then folder children", () => {
    const model = buildCanvasModel([
      mockFile({
        slug: "operations",
        frontmatter: { title: "Operations" },
        links: ["operations/operations_runbook"],
      }),
      mockFile({
        slug: "operations/operations_runbook",
        frontmatter: { title: "Operations Runbook" },
      }),
      mockFile({
        slug: "operations/deployment",
        frontmatter: { title: "Deployment" },
      }),
      mockFile({
        slug: "operations/monitoring",
        frontmatter: { title: "Monitoring" },
      }),
    ])

    const stack = model.stacks.operations ?? []
    // Hub link first (no pins on operations hub)
    assert.equal(stack[0], "operations/operations_runbook")
    // Folder children after (runbook not double-counted if also a folder child)
    assert.ok(stack.includes("operations/deployment"))
    assert.ok(stack.includes("operations/monitoring"))
    assert.equal(
      stack.filter((s) => s === "operations/operations_runbook").length,
      1,
    )
  })

  test("pins-first still enforces max stack children of 20", () => {
    const folderBulk = Array.from({ length: 25 }, (_, i) =>
      mockFile({
        slug: `developer/bulk-${i}`,
        frontmatter: { title: `Bulk ${i}` },
      }),
    )

    const model = buildCanvasModel([
      mockFile({ slug: "developer", frontmatter: { title: "Developer" } }),
      ...folderBulk,
      mockFile({ slug: "architecture/index", frontmatter: { title: "Architecture" } }),
      mockFile({ slug: "api/index", frontmatter: { title: "API" } }),
      mockFile({ slug: "database/index", frontmatter: { title: "Database" } }),
      mockFile({
        slug: "reference/repository_guide",
        frontmatter: { title: "Repository Guide" },
      }),
    ])

    const stack = model.stacks.developer ?? []
    assert.equal(stack.length, 20)
    assert.deepEqual(stack.slice(0, 4), [
      "architecture/index",
      "api/index",
      "database/index",
      "reference/repository_guide",
    ])
  })

  test("domain hubs resolve contentSlug to folder-note pages for navigation", () => {
    const model = buildCanvasModel([
      mockFile({
        slug: "architecture/index",
        frontmatter: { title: "Architecture", description: "System design" },
      }),
      mockFile({
        slug: "api/index",
        frontmatter: { title: "API", description: "API surface" },
      }),
      mockFile({
        slug: "database/index",
        frontmatter: { title: "Database", description: "Schema" },
      }),
      mockFile({
        slug: "deployment/index",
        frontmatter: { title: "Deployment", description: "Deploy guide" },
      }),
      mockFile({
        slug: "reference/index",
        frontmatter: { title: "Reference", description: "Refs" },
      }),
    ])

    const arch = model.nodes.find((node) => node.id === "architecture")
    const api = model.nodes.find((node) => node.id === "api")
    const db = model.nodes.find((node) => node.id === "database")
    const deploy = model.nodes.find((node) => node.id === "deployment")

    assert.equal(arch?.slug, "architecture/index")
    assert.equal(api?.slug, "api/index")
    assert.equal(db?.slug, "database/index")
    assert.equal(deploy?.slug, "deployment/index")
  })

  test("uses description fallback from content text", () => {
    const model = buildCanvasModel([
      mockFile({
        slug: "operations",
        frontmatter: { title: "Operations" },
        text: "# Title\n\nFallback description for operations.",
      }),
    ])

    const hub = model.nodes.find((node) => node.id === "operations")
    assert.ok(hub?.description.includes("Fallback description"))
  })
})
