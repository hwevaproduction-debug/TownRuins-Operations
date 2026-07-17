import {
  loadQuartzConfig,
  loadQuartzLayout,
  type QuartzLayout,
} from "./quartz/plugins/loader/config-loader"
import type { FullPageLayout } from "./quartz/cfg"
import type { QuartzComponent } from "./quartz/components/types"
import { componentRegistry } from "./quartz/components/registry"
import ConditionalRender from "./quartz/components/ConditionalRender"
import CustomFooter from "./quartz/components/CustomFooter"
import KnowledgeCanvas from "./quartz/components/KnowledgeCanvas"
import RelatedCards from "./quartz/components/RelatedCards"
import WorkspaceNav from "./quartz/components/WorkspaceNav"
import { getCondition } from "./quartz/plugins/loader/conditions"

componentRegistry.register(
  "footer",
  CustomFooter,
  "custom-footer",
  {
    name: "footer",
    displayName: "Custom Footer",
    description: "Project-specific footer without Quartz branding",
    version: "1.0.0",
  },
)

componentRegistry.register("knowledge-canvas", KnowledgeCanvas, "knowledge-canvas", {
  name: "knowledge-canvas",
  displayName: "Knowledge Canvas",
  description: "Card-based knowledge workspace for the homepage",
  version: "1.0.0",
})

componentRegistry.register("workspace-nav", WorkspaceNav, "workspace-nav", {
  name: "workspace-nav",
  displayName: "Workspace Navigation",
  description: "Back to workspace link for reading mode",
  version: "1.0.0",
})

componentRegistry.register("related-cards", RelatedCards, "related-cards", {
  name: "related-cards",
  displayName: "Related Cards",
  description: "Related documentation cards below article body",
  version: "1.0.0",
})

const indexCondition = getCondition("index")!
const notIndexCondition = getCondition("not-index")!

const KnowledgeCanvasOnIndex = ConditionalRender({
  component: KnowledgeCanvas(),
  condition: indexCondition,
})

const WorkspaceNavOnDocs = ConditionalRender({
  component: WorkspaceNav(),
  condition: notIndexCondition,
})

const RelatedCardsOnDocs = ConditionalRender({
  component: RelatedCards(),
  condition: notIndexCondition,
})

function appendLayoutComponent(
  layout: Partial<FullPageLayout>,
  slot: "beforeBody" | "afterBody",
  component: QuartzComponent,
): void {
  layout[slot] = [...(layout[slot] ?? []), component]
}

function prependLayoutComponent(
  layout: Partial<FullPageLayout>,
  slot: "header",
  component: QuartzComponent,
): void {
  layout[slot] = [component, ...(layout[slot] ?? [])]
}

function applyKnowledgeCanvasLayout(baseLayout: QuartzLayout): void {
  // defaults.* is ignored when a page type defines its own slot (e.g. content
  // pages replace beforeBody entirely), so merge into every layout bucket.
  appendLayoutComponent(baseLayout.defaults, "beforeBody", KnowledgeCanvasOnIndex)
  prependLayoutComponent(baseLayout.defaults, "header", WorkspaceNavOnDocs)
  appendLayoutComponent(baseLayout.defaults, "afterBody", RelatedCardsOnDocs)

  for (const pageType of Object.keys(baseLayout.byPageType)) {
    const pageLayout = baseLayout.byPageType[pageType]
    appendLayoutComponent(pageLayout, "beforeBody", KnowledgeCanvasOnIndex)
    prependLayoutComponent(pageLayout, "header", WorkspaceNavOnDocs)
    appendLayoutComponent(pageLayout, "afterBody", RelatedCardsOnDocs)
  }
}

const config = await loadQuartzConfig(undefined, applyKnowledgeCanvasLayout)
export default config

// Legacy fallback for loadQuartzLayout() when quartz.config.yaml is absent
const layoutSnapshot = await loadQuartzLayout()
applyKnowledgeCanvasLayout(layoutSnapshot)
export const layout = layoutSnapshot