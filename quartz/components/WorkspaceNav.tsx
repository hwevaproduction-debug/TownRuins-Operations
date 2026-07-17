import type { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import workspaceNavScript from "./scripts/workspace-nav.inline"

const WorkspaceNav: QuartzComponent = () => {
  return (
    <a
      href="/"
      class="kc-workspace-link"
      data-kc-workspace-link
      aria-label="Back to knowledge workspace"
    >
      ← Workspace
    </a>
  )
}

WorkspaceNav.displayName = "WorkspaceNav"
WorkspaceNav.afterDOMLoaded = workspaceNavScript

export default (() => WorkspaceNav) satisfies QuartzComponentConstructor