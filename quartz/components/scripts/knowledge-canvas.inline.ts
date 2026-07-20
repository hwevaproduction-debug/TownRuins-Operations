import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CARD_WIDTH_LEAF,
  type ClusterBounds,
  type LayoutMetrics,
  computeClusterLayout,
} from "../../canvas/layout"
import { PREVIEW_SHOW_MS, PREVIEW_HIDE_MS } from "./preview-timing"

type CanvasNode = {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  kind: "hub" | "leaf"
  hubId?: string
  tier?: "role" | "domain"
  category?: string
}

type CanvasEdge = { source: string; target: string }

type CanvasModel = {
  hubs: string[]
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  stacks: Record<string, string[]>
}

type Position = { x: number; y: number }

/** seatOf[hubId] = home slot id (initially itself). Display pos = baseHomes[seatOf[hubId]]. */
type SessionState = {
  expandedHub: string | null
  seatOf: Record<string, string>
}

const SESSION_KEY = "tr-canvas-state-v2"
const MOBILE_BREAKPOINT = 800
const DRAG_THRESHOLD_PX = 6
/** Bridge gap between card bottom and preview top (also hit target). */
const BRIDGE_PX = 20

function appendCardContent(
  card: HTMLElement,
  node: CanvasNode,
  relatedCount: number,
  stackCount = 0,
): void {
  const icon = document.createElement("div")
  icon.className = "tr-surface__icon"
  icon.setAttribute("aria-hidden", "true")
  icon.textContent = node.icon

  const title = document.createElement("span")
  title.className = "tr-surface__title"
  title.textContent = node.title

  const summary = document.createElement("p")
  summary.className = "tr-surface__summary"
  summary.textContent = node.description

  const meta = document.createElement("div")
  meta.className = "tr-surface__meta"

  const category = document.createElement("span")
  category.className = "tr-surface__category"
  category.textContent = categoryLabel(node)
  meta.append(category)

  if (stackCount > 0) {
    const stack = document.createElement("span")
    stack.className = "kc-stack-badge"
    stack.textContent = `${stackCount} in stack`
    meta.append(stack)
  } else if (relatedCount > 0) {
    const count = document.createElement("span")
    count.className = "tr-surface__count"
    count.textContent = `${relatedCount} related`
    meta.append(count)
  }

  card.append(icon, title, summary, meta)
}

function categoryLabel(node: CanvasNode): string {
  if (node.category) return node.category
  if (node.tier === "role") return "Role"
  if (node.tier === "domain") return "System"
  if (node.hubId) {
    const hub = node.hubId.replace(/-/g, " ")
    return hub.charAt(0).toUpperCase() + hub.slice(1)
  }
  return "Document"
}

function slugToPath(slug: string): string {
  const basePath = document.body.dataset.basepath ?? ""
  const prefix = basePath.replace(/\/$/, "")

  const prefixPath = (path: string): string => {
    if (!prefix) return path
    return prefix + path
  }

  if (!slug || slug === "index") return prefixPath("/")
  let path = slug.startsWith("/") ? slug : `/${slug}`
  if (path.endsWith("/index")) path = `${path.slice(0, -"/index".length)}/`
  return prefixPath(path)
}

function relatedCountFor(node: CanvasNode, edges: CanvasEdge[]): number {
  return edges.filter(
    (edge) =>
      edge.source === node.slug ||
      edge.target === node.slug ||
      edge.source === node.id ||
      edge.target === node.id,
  ).length
}

function defaultSeats(hubs: string[]): Record<string, string> {
  const seatOf: Record<string, string> = {}
  for (const id of hubs) seatOf[id] = id
  return seatOf
}

function readSession(hubs: string[]): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionState
    const seatOf = defaultSeats(hubs)
    for (const id of hubs) {
      const seat = parsed.seatOf?.[id]
      if (seat && hubs.includes(seat)) seatOf[id] = seat
    }
    return { expandedHub: parsed.expandedHub ?? null, seatOf }
  } catch {
    return null
  }
}

function writeSession(state: SessionState): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
}

function readModelFromContainer(container: HTMLElement): CanvasModel | null {
  const raw = container.dataset.canvasModel
  if (!raw) return null
  try {
    return JSON.parse(raw) as CanvasModel
  } catch {
    return null
  }
}

async function loadModel(container?: HTMLElement): Promise<CanvasModel | null> {
  const seeded = (window as unknown as { canvasData?: CanvasModel }).canvasData
  if (seeded?.nodes?.length) return seeded

  if (container) {
    const fromAttr = readModelFromContainer(container)
    if (fromAttr?.nodes?.length) {
      ;(window as unknown as { canvasData?: CanvasModel }).canvasData = fromAttr
      return fromAttr
    }
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-component="knowledge-canvas"]')) {
    const fromAttr = readModelFromContainer(el)
    if (fromAttr?.nodes?.length) {
      ;(window as unknown as { canvasData?: CanvasModel }).canvasData = fromAttr
      return fromAttr
    }
  }

  try {
    const index = (await fetchData) as Record<string, { title?: string; links?: string[] }>
    const nodes: CanvasNode[] = Object.entries(index).map(([slug, data]) => ({
      id: slug,
      slug,
      title: data.title || slug.split("/").pop() || slug,
      description: "",
      icon: "📄",
      kind: "leaf",
      category: "Document",
    }))
    return { hubs: [], nodes, edges: [], stacks: {} }
  } catch {
    return null
  }
}

function setLayoutPos(el: HTMLElement, pos: Position) {
  el.style.left = `${pos.x}px`
  el.style.top = `${pos.y}px`
}

function initKnowledgeCanvas(container: HTMLElement, model: CanvasModel): void {
  if (container.dataset.kcReady === "true") return
  container.dataset.kcReady = "true"
  container.innerHTML = ""

  const session = readSession(model.hubs) ?? {
    expandedHub: null,
    seatOf: defaultSeats(model.hubs),
  }

  const nodeById = new Map(model.nodes.map((node) => [node.id, node]))

  const root = document.createElement("div")
  root.className = "kc-root kc-root--static"

  const viewport = document.createElement("div")
  viewport.className = "kc-viewport kc-viewport--static"

  const cardsEl = document.createElement("div")
  cardsEl.className = "kc-cards"

  const previewBridgeEl = document.createElement("div")
  previewBridgeEl.className = "kc-preview-bridge"
  previewBridgeEl.setAttribute("aria-hidden", "true")

  const previewEl = document.createElement("aside")
  previewEl.className = "tr-surface kc-preview"
  previewEl.setAttribute("aria-hidden", "true")
  previewEl.innerHTML = `
    <div class="tr-surface__icon kc-preview__icon" aria-hidden="true"></div>
    <span class="tr-surface__title kc-preview__title"></span>
    <p class="tr-surface__summary kc-preview__summary"></p>
    <div class="tr-surface__meta kc-preview__meta">
      <span class="tr-surface__category kc-preview__category"></span>
      <span class="tr-surface__count kc-preview__count"></span>
    </div>
    <button type="button" class="kc-preview__open">Open</button>
    <span class="kc-preview__hint"></span>
  `

  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT

  const hint = document.createElement("p")
  hint.className = "kc-hint"
  hint.textContent = isMobile()
    ? "Tap hub to expand · tap Open for dashboard"
    : "Drag hubs to rearrange · hover for preview · click to expand stack"

  const accordion = document.createElement("div")
  accordion.className = "kc-accordion"
  accordion.setAttribute("aria-label", "Knowledge hubs")

  root.append(viewport, hint, accordion)
  viewport.append(cardsEl, previewBridgeEl, previewEl)
  container.append(root)

  const previewIcon = previewEl.querySelector<HTMLElement>(".kc-preview__icon")!
  const previewTitle = previewEl.querySelector<HTMLElement>(".kc-preview__title")!
  const previewSummary = previewEl.querySelector<HTMLElement>(".kc-preview__summary")!
  const previewCategory = previewEl.querySelector<HTMLElement>(".kc-preview__category")!
  const previewCount = previewEl.querySelector<HTMLElement>(".kc-preview__count")!
  const previewOpen = previewEl.querySelector<HTMLButtonElement>(".kc-preview__open")!
  const previewHint = previewEl.querySelector<HTMLElement>(".kc-preview__hint")!

  const previewCtaLabel = (node: CanvasNode): string => {
    if (node.kind === "leaf") return "Open document"
    if (node.tier === "role") return "Open dashboard"
    return "Open overview"
  }

  let expandedHub: string | null = session.expandedHub
  let seatOf = { ...session.seatOf }
  let previewNodeId: string | null = null
  let previewVisible = false
  let previewShowTimer: ReturnType<typeof setTimeout> | null = null
  let previewHideTimer: ReturnType<typeof setTimeout> | null = null
  let draggingCard: string | null = null
  let dragMoved = false
  let dragOrigin: Position = { x: 0, y: 0 }
  let lastPointer = { x: 0, y: 0 }
  /** Fixed geometric homes keyed by original hub id (slot). */
  let baseHomes: Record<string, Position> = {}
  let clusters: ClusterBounds[] = []
  /** Fit-to-stage hub metrics from last layout (R-CANVAS-8). */
  let layoutMetrics: LayoutMetrics = {
    cardWidth: CARD_WIDTH,
    cardHeight: CARD_HEIGHT,
    cardGap: 24,
    scale: 1,
  }

  const persist = () => writeSession({ expandedHub, seatOf })

  const recomputeHomes = () => {
    const width = viewport.clientWidth || 960
    const height = viewport.clientHeight || 560
    const layout = computeClusterLayout(width, height, model.hubs)
    baseHomes = layout.positions
    clusters = layout.clusters
    layoutMetrics = layout.metrics
  }

  const displayPos = (hubId: string): Position => {
    const seat = seatOf[hubId] ?? hubId
    return baseHomes[seat] ?? baseHomes[hubId] ?? { x: 40, y: 40 }
  }

  const clearPreviewTimers = () => {
    if (previewShowTimer) {
      clearTimeout(previewShowTimer)
      previewShowTimer = null
    }
    if (previewHideTimer) {
      clearTimeout(previewHideTimer)
      previewHideTimer = null
    }
  }

  const hidePreview = () => {
    clearPreviewTimers()
    previewVisible = false
    previewNodeId = null
    previewEl.classList.remove("is-visible")
    previewEl.setAttribute("aria-hidden", "true")
    previewBridgeEl.classList.remove("is-visible")
  }

  /**
   * Preview left-aligned with card, same width as hub (fit-to-stage metrics),
   * directly below (or above). Bridge is a full-width strip in the gap.
   */
  const positionPreview = (pos: Position) => {
    const left = pos.x
    const cardW = layoutMetrics.cardWidth
    const cardH = layoutMetrics.cardHeight
    const previewH = Math.max(160, Math.min(200, Math.round(cardH * 1.5)))
    const viewportH = viewport.clientHeight || 560
    const spaceBelow = viewportH - (pos.y + cardH)
    const placeBelow = spaceBelow >= previewH + BRIDGE_PX || pos.y < previewH

    let previewTop: number
    let bridgeTop: number
    if (placeBelow) {
      bridgeTop = pos.y + cardH
      previewTop = bridgeTop + BRIDGE_PX
    } else {
      previewTop = Math.max(8, pos.y - previewH - BRIDGE_PX)
      bridgeTop = previewTop + previewH
    }

    previewEl.style.width = `${cardW}px`
    previewEl.style.maxWidth = `${cardW}px`
    setLayoutPos(previewEl, { x: left, y: previewTop })

    previewBridgeEl.style.left = `${left}px`
    previewBridgeEl.style.top = `${bridgeTop}px`
    previewBridgeEl.style.width = `${cardW}px`
    previewBridgeEl.style.height = `${BRIDGE_PX}px`
    previewBridgeEl.classList.add("is-visible")
  }

  const navigateTo = (slug: string) => {
    persist()
    const path = slugToPath(slug)
    const url = new URL(path, window.location.origin)
    if (typeof window.spaNavigate === "function") window.spaNavigate(url, false)
    else window.location.assign(url.toString())
  }

  const openNodeDestination = (node: CanvasNode) => {
    hidePreview()
    navigateTo(node.slug)
  }

  const populatePreview = (node: CanvasNode) => {
    const count = relatedCountFor(node, model.edges)
    previewIcon.textContent = node.icon
    previewTitle.textContent = node.title
    previewSummary.textContent = node.description
    previewCategory.textContent = categoryLabel(node)
    if (count > 0) {
      previewCount.textContent = `${count} related`
      previewCount.hidden = false
    } else {
      previewCount.textContent = ""
      previewCount.hidden = true
    }
    previewOpen.textContent = previewCtaLabel(node)
    previewOpen.onclick = (event) => {
      event.preventDefault()
      event.stopPropagation()
      openNodeDestination(node)
    }
    previewHint.textContent =
      node.kind === "hub" ? "Enter expand · O open dashboard" : "Enter open"
    previewHint.hidden = false
  }

  const showPreview = (node: CanvasNode, pos: Position) => {
    clearPreviewTimers()
    previewNodeId = node.id
    previewVisible = true
    populatePreview(node)
    positionPreview(pos)
    previewEl.classList.add("is-visible")
    previewEl.setAttribute("aria-hidden", "false")
  }

  const schedulePreviewShow = (node: CanvasNode, pos: Position, immediate = false) => {
    clearPreviewTimers()
    const delay = immediate ? 0 : PREVIEW_SHOW_MS
    previewShowTimer = setTimeout(() => showPreview(node, pos), delay)
  }

  const schedulePreviewHide = () => {
    if (previewHideTimer) clearTimeout(previewHideTimer)
    previewHideTimer = setTimeout(() => hidePreview(), PREVIEW_HIDE_MS)
  }

  const cancelHide = () => {
    if (previewHideTimer) {
      clearTimeout(previewHideTimer)
      previewHideTimer = null
    }
  }

  const isPreviewZone = (node: Node | null): boolean => {
    if (!node) return false
    if (node === previewEl || previewEl.contains(node)) return true
    if (node === previewBridgeEl || previewBridgeEl.contains(node)) return true
    return false
  }

  /** Snap drag to nearest hub seat and swap seats (uniform grid). */
  const settleToNearestSeat = (hubId: string, drop: Position) => {
    let bestSeat = seatOf[hubId] ?? hubId
    let bestD = Infinity
    for (const homeId of model.hubs) {
      const home = baseHomes[homeId]
      if (!home) continue
      const d = Math.hypot(drop.x - home.x, drop.y - home.y)
      if (d < bestD) {
        bestD = d
        bestSeat = homeId
      }
    }

    const mySeat = seatOf[hubId] ?? hubId
    if (bestSeat === mySeat) {
      // Snap home
      const el = cardsEl.querySelector<HTMLElement>(`[data-node-id="${hubId}"]`)
      if (el) setLayoutPos(el, displayPos(hubId))
      return
    }

    // Who currently sits on bestSeat?
    let occupant: string | null = null
    for (const id of model.hubs) {
      if ((seatOf[id] ?? id) === bestSeat) {
        occupant = id
        break
      }
    }

    if (occupant && occupant !== hubId) {
      seatOf[occupant] = mySeat
      seatOf[hubId] = bestSeat
      const a = cardsEl.querySelector<HTMLElement>(`[data-node-id="${hubId}"]`)
      const b = cardsEl.querySelector<HTMLElement>(`[data-node-id="${occupant}"]`)
      if (a) setLayoutPos(a, displayPos(hubId))
      if (b) setLayoutPos(b, displayPos(occupant))
    } else {
      seatOf[hubId] = bestSeat
      const el = cardsEl.querySelector<HTMLElement>(`[data-node-id="${hubId}"]`)
      if (el) setLayoutPos(el, displayPos(hubId))
    }
    persist()
  }

  const renderClusterBackdrops = () => {
    for (const cluster of clusters) {
      const el = document.createElement("div")
      el.className = "kc-cluster"
      el.dataset.clusterId = cluster.id
      el.style.width = `${cluster.width}px`
      el.style.height = `${cluster.height}px`
      setLayoutPos(el, { x: cluster.x, y: cluster.y })
      const label = document.createElement("span")
      label.className = "kc-cluster__label"
      label.textContent = cluster.label
      el.append(label)
      cardsEl.append(el)
    }
  }

  const renderStackRail = (hubId: string) => {
    const hub = nodeById.get(hubId)
    const children = model.stacks[hubId] ?? []
    if (!hub) return

    root.classList.add("is-stack-open")

    const rail = document.createElement("div")
    rail.className = "kc-stack-rail"
    rail.setAttribute("role", "region")
    rail.setAttribute("aria-label", `${hub.title} stack`)

    const head = document.createElement("div")
    head.className = "kc-stack-rail__head"
    const headTitle = document.createElement("span")
    headTitle.className = "kc-stack-rail__title"
    headTitle.textContent = `${hub.title} · ${children.length} documents`
    const openDash = document.createElement("button")
    openDash.type = "button"
    openDash.className = "kc-stack-rail__open"
    openDash.textContent = previewCtaLabel(hub)
    openDash.addEventListener("click", (e) => {
      e.stopPropagation()
      openNodeDestination(hub)
    })
    const closeBtn = document.createElement("button")
    closeBtn.type = "button"
    closeBtn.className = "kc-stack-rail__close"
    closeBtn.setAttribute("aria-label", "Close stack")
    closeBtn.textContent = "✕"
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      expandedHub = null
      persist()
      renderCards()
    })
    head.append(headTitle, openDash, closeBtn)

    const body = document.createElement("div")
    body.className = "kc-stack-rail__body"

    const prevBtn = document.createElement("button")
    prevBtn.type = "button"
    prevBtn.className = "kc-stack-rail__arrow"
    prevBtn.setAttribute("aria-label", "Scroll left")
    prevBtn.textContent = "‹"

    const nextBtn = document.createElement("button")
    nextBtn.type = "button"
    nextBtn.className = "kc-stack-rail__arrow"
    nextBtn.setAttribute("aria-label", "Scroll right")
    nextBtn.textContent = "›"

    const scrollWrap = document.createElement("div")
    scrollWrap.className = "kc-stack-rail__scroll-wrap"

    const track = document.createElement("div")
    track.className = "kc-stack-rail__track"

    for (const childId of children) {
      const child = nodeById.get(childId)
      if (!child) continue
      const leaf = document.createElement("button")
      leaf.type = "button"
      leaf.className = "tr-surface kc-stack-rail__card"
      leaf.innerHTML = `
        <span class="tr-surface__icon" aria-hidden="true">${child.icon}</span>
        <span class="tr-surface__title">${child.title}</span>
        <span class="tr-surface__summary">${child.description}</span>
      `
      leaf.addEventListener("click", (e) => {
        e.stopPropagation()
        openNodeDestination(child)
      })
      track.append(leaf)
    }

    const cardStep = CARD_WIDTH_LEAF + 16
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      track.scrollBy({ left: -cardStep, behavior: "smooth" })
    })
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      track.scrollBy({ left: cardStep, behavior: "smooth" })
    })

    const updateCenterEmphasis = () => {
      const cards = [...track.querySelectorAll<HTMLElement>(".kc-stack-rail__card")]
      const mid = track.scrollLeft + track.clientWidth / 2
      let best: HTMLElement | null = null
      let bestDist = Infinity
      for (const c of cards) {
        c.classList.remove("is-center")
        const center = c.offsetLeft + c.offsetWidth / 2
        const d = Math.abs(center - mid)
        if (d < bestDist) {
          bestDist = d
          best = c
        }
      }
      best?.classList.add("is-center")
    }
    track.addEventListener("scroll", updateCenterEmphasis, { passive: true })

    scrollWrap.append(track)
    body.append(prevBtn, scrollWrap, nextBtn)
    rail.append(head, body)
    root.append(rail)
    requestAnimationFrame(updateCenterEmphasis)
  }

  const renderAccordion = () => {
    accordion.innerHTML = ""
    for (const hubId of model.hubs) {
      const hub = nodeById.get(hubId)
      if (!hub) continue
      const details = document.createElement("details")
      details.className = "kc-accordion-item"
      if (expandedHub === hubId) details.open = true

      const summary = document.createElement("summary")
      summary.textContent = hub.title
      details.append(summary)

      const list = document.createElement("ul")
      list.className = "kc-accordion-children"
      for (const childId of model.stacks[hubId] ?? []) {
        const child = nodeById.get(childId)
        if (!child) continue
        const item = document.createElement("li")
        const link = document.createElement("button")
        link.type = "button"
        link.className = "kc-accordion-link"
        link.textContent = child.title
        link.addEventListener("click", () => navigateTo(child.slug))
        item.append(link)
        list.append(item)
      }

      const openHub = document.createElement("button")
      openHub.type = "button"
      openHub.className = "kc-accordion-link kc-accordion-hub-open"
      openHub.textContent = `Open ${hub.title}`
      openHub.addEventListener("click", () => navigateTo(hub.slug))
      list.prepend(openHub)

      details.append(list)
      details.addEventListener("toggle", () => {
        if (details.open) {
          for (const other of accordion.querySelectorAll<HTMLDetailsElement>(
            "details.kc-accordion-item",
          )) {
            if (other !== details) other.open = false
          }
          expandedHub = hubId
        } else if (expandedHub === hubId) {
          expandedHub = null
        }
        persist()
      })
      accordion.append(details)
    }
  }

  const renderCards = () => {
    hidePreview()
    cardsEl.innerHTML = ""
    root.querySelectorAll(".kc-stack-rail").forEach((el) => el.remove())
    root.classList.remove("is-stack-open")
    recomputeHomes()

    if (isMobile()) {
      root.classList.add("kc-mobile")
      renderAccordion()
      return
    }
    root.classList.remove("kc-mobile")
    accordion.innerHTML = ""
    renderClusterBackdrops()

    for (const hubId of model.hubs) {
      const node = nodeById.get(hubId)
      if (!node) continue
      const pos = displayPos(hubId)

      const card = document.createElement("article")
      card.className = "tr-surface kc-card kc-card--hub"
      card.tabIndex = 0
      card.dataset.slug = node.slug
      card.dataset.nodeId = node.id
      const stackCount = (model.stacks[node.id] ?? []).length
      card.setAttribute("role", "button")
      card.setAttribute(
        "aria-label",
        `${node.title} hub${stackCount > 0 ? `, ${stackCount} in stack` : ""}`,
      )
      card.setAttribute("aria-expanded", expandedHub === node.id ? "true" : "false")
      card.style.width = `${layoutMetrics.cardWidth}px`
      card.style.minHeight = `${layoutMetrics.cardHeight}px`
      setLayoutPos(card, pos)
      if (expandedHub === node.id) card.classList.add("is-expanded")
      if (expandedHub && expandedHub !== node.id) card.classList.add("is-dimmed")
      if (stackCount > 0 && expandedHub !== node.id) card.classList.add("has-stack")

      appendCardContent(card, node, relatedCountFor(node, model.edges), stackCount)

      card.addEventListener("click", () => {
        hidePreview()
        if (dragMoved) {
          dragMoved = false
          return
        }
        expandedHub = expandedHub === node.id ? null : node.id
        persist()
        renderCards()
      })

      card.addEventListener("mouseenter", () => {
        if (draggingCard) return
        schedulePreviewShow(node, displayPos(node.id))
      })

      card.addEventListener("mouseleave", (event) => {
        if (isPreviewZone(event.relatedTarget as Node | null)) {
          cancelHide()
          return
        }
        if (previewShowTimer) {
          clearTimeout(previewShowTimer)
          previewShowTimer = null
        }
        schedulePreviewHide()
      })

      card.addEventListener("focus", () => {
        card.classList.add("is-keyboard-focus")
        schedulePreviewShow(node, displayPos(node.id), true)
      })

      card.addEventListener("blur", () => {
        card.classList.remove("is-keyboard-focus")
        if (!previewEl.contains(document.activeElement)) hidePreview()
      })

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          card.click()
        }
        if (event.key === "o" || event.key === "O") {
          event.preventDefault()
          openNodeDestination(node)
        }
        if (event.key === "Escape") {
          if (previewVisible) {
            event.preventDefault()
            hidePreview()
            return
          }
          expandedHub = null
          persist()
          renderCards()
        }
      })

      card.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return
        draggingCard = node.id
        dragMoved = false
        dragOrigin = displayPos(node.id)
        card.classList.add("is-dragging")
        hidePreview()
        card.setPointerCapture(event.pointerId)
        lastPointer = { x: event.clientX, y: event.clientY }
        event.stopPropagation()
      })

      card.addEventListener("pointermove", (event) => {
        if (draggingCard !== node.id) return
        const rawDx = event.clientX - lastPointer.x
        const rawDy = event.clientY - lastPointer.y
        if (!dragMoved && Math.hypot(rawDx, rawDy) <= DRAG_THRESHOLD_PX) return
        dragMoved = true
        lastPointer = { x: event.clientX, y: event.clientY }
        dragOrigin = { x: dragOrigin.x + rawDx, y: dragOrigin.y + rawDy }
        setLayoutPos(card, dragOrigin)

        // Highlight nearest seat target
        let nearest: string | null = null
        let best = Infinity
        for (const homeId of model.hubs) {
          const home = baseHomes[homeId]
          if (!home) continue
          const d = Math.hypot(dragOrigin.x - home.x, dragOrigin.y - home.y)
          if (d < best) {
            best = d
            nearest = homeId
          }
        }
        for (const el of cardsEl.querySelectorAll(".kc-card")) {
          el.classList.remove("is-drop-target")
        }
        if (nearest) {
          const occ = model.hubs.find((id) => (seatOf[id] ?? id) === nearest)
          if (occ && occ !== node.id) {
            cardsEl
              .querySelector(`[data-node-id="${occ}"]`)
              ?.classList.add("is-drop-target")
          }
        }
      })

      const finishDrag = () => {
        if (draggingCard !== node.id) return
        draggingCard = null
        card.classList.remove("is-dragging")
        for (const el of cardsEl.querySelectorAll(".kc-card")) {
          el.classList.remove("is-drop-target")
        }
        if (!dragMoved) return
        settleToNearestSeat(node.id, dragOrigin)
        // Re-snap all to seats for uniformity
        for (const id of model.hubs) {
          const el = cardsEl.querySelector<HTMLElement>(`[data-node-id="${id}"]`)
          if (el) setLayoutPos(el, displayPos(id))
        }
      }

      card.addEventListener("pointerup", finishDrag)
      card.addEventListener("pointercancel", finishDrag)

      cardsEl.append(card)
    }

    if (expandedHub) renderStackRail(expandedHub)
  }

  const updateCardPositions = () => {
    if (isMobile()) {
      renderCards()
      return
    }
    recomputeHomes()
    for (const cluster of clusters) {
      const el = cardsEl.querySelector<HTMLElement>(
        `.kc-cluster[data-cluster-id="${cluster.id}"]`,
      )
      if (el) {
        el.style.width = `${cluster.width}px`
        el.style.height = `${cluster.height}px`
        setLayoutPos(el, { x: cluster.x, y: cluster.y })
      }
    }
    for (const id of model.hubs) {
      const el = cardsEl.querySelector<HTMLElement>(`[data-node-id="${id}"]`)
      if (el && draggingCard !== id) {
        el.style.width = `${layoutMetrics.cardWidth}px`
        el.style.minHeight = `${layoutMetrics.cardHeight}px`
        setLayoutPos(el, displayPos(id))
      }
    }
    if (previewVisible && previewNodeId) {
      positionPreview(displayPos(previewNodeId))
    }
  }

  previewBridgeEl.addEventListener("mouseenter", cancelHide)
  previewBridgeEl.addEventListener("mouseleave", (event) => {
    if (isPreviewZone(event.relatedTarget as Node | null)) return
    if ((event.relatedTarget as HTMLElement | null)?.closest?.(".kc-card")) return
    schedulePreviewHide()
  })

  previewEl.addEventListener("mouseenter", cancelHide)
  previewEl.addEventListener("mouseleave", (event) => {
    if (isPreviewZone(event.relatedTarget as Node | null)) return
    if ((event.relatedTarget as HTMLElement | null)?.closest?.(".kc-card")) return
    schedulePreviewHide()
  })

  let lastWasMobile = isMobile()
  const resize = () => {
    const nowMobile = isMobile()
    if (nowMobile !== lastWasMobile) {
      lastWasMobile = nowMobile
      hint.textContent = nowMobile
        ? "Tap hub to expand · tap Open for dashboard"
        : "Drag hubs to rearrange · hover for preview · click to expand stack"
      renderCards()
    } else {
      updateCardPositions()
    }
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => {
      ro.disconnect()
      clearPreviewTimers()
      hidePreview()
      draggingCard = null
      delete container.dataset.kcReady
      container.innerHTML = ""
    })
  }

  renderCards()
}

async function renderKnowledgeCanvases(): Promise<void> {
  const containers = document.querySelectorAll<HTMLElement>('[data-component="knowledge-canvas"]')
  if (containers.length === 0) return

  for (const container of containers) {
    const model = await loadModel(container)
    if (!model) continue
    initKnowledgeCanvas(container, model)
  }
}

document.addEventListener("nav", () => {
  void renderKnowledgeCanvases()
})

void renderKnowledgeCanvases()
