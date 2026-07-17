import type { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { buildCanvasModel } from "../canvas/build-model"
// @ts-ignore
import knowledgeCanvasScript from "./scripts/knowledge-canvas.inline"
import knowledgeCanvasStyle from "./styles/knowledge-canvas.scss"

const KnowledgeCanvas: QuartzComponent = ({ allFiles }: QuartzComponentProps) => {
  const model = buildCanvasModel(allFiles)
  const seed = `window.canvasData = ${JSON.stringify(model)};`

  return (
    <div class="kc-home">
      <header class="kc-hero" aria-label="Welcome">
        <p class="kc-hero__eyebrow">Town Ruins · Operations Portal</p>
        <h1 class="kc-hero__title">Where to work, what to open</h1>
        <p class="kc-hero__lede">
          This portal is your map of operations knowledge. Role dashboards give curated entry
          points; the canvas below shows how hubs and documents relate. Start with a role that
          matches your job, or explore the canvas to discover docs by cluster.
        </p>
        <div class="kc-hero__ctas">
          <a class="kc-hero__cta kc-hero__cta--primary" href="#knowledge-canvas">
            Explore the canvas
          </a>
          <a class="kc-hero__cta" href="./operations">
            Operations
          </a>
          <a class="kc-hero__cta" href="./developer">
            Developer
          </a>
          <a class="kc-hero__cta" href="./administrator">
            Administrator
          </a>
          <a class="kc-hero__cta" href="./client">
            Client
          </a>
          <a class="kc-hero__cta" href="./business">
            Business
          </a>
        </div>
        <div class="kc-hero__panels">
          <div class="kc-hero__panel">
            <h2 class="kc-hero__panel-title">You are here</h2>
            <p>
              Homepage workspace — not a single runbook. Use it to orient, then open a dashboard
              or document for deep work.
            </p>
          </div>
          <div class="kc-hero__panel">
            <h2 class="kc-hero__panel-title">How to navigate</h2>
            <ol class="kc-hero__guide">
              <li>
                <strong>Hover</strong> a hub — preview appears <em>under the card</em>; move into
                it and click <em>Open dashboard</em> (or press <kbd>O</kbd>).
              </li>
              <li>
                <strong>Click</strong> a hub — expand its document stack (centered strip, ~3 cards).
              </li>
              <li>
                <strong>Drag</strong> hubs to swap seats — they snap to the grid, never stack.
              </li>
              <li>
                <strong>Dashboards</strong> — use the role CTAs above for task-oriented landing
                pages.
              </li>
            </ol>
          </div>
        </div>
      </header>
      <div
        id="knowledge-canvas"
        class="kc-mount"
        data-component="knowledge-canvas"
        data-canvas-model={JSON.stringify(model)}
        aria-label="Knowledge workspace"
      >
        <script>{seed}</script>
      </div>
    </div>
  )
}

KnowledgeCanvas.displayName = "KnowledgeCanvas"
KnowledgeCanvas.css = knowledgeCanvasStyle
KnowledgeCanvas.afterDOMLoaded = knowledgeCanvasScript

export default (() => KnowledgeCanvas) satisfies QuartzComponentConstructor