import { computePosition, flip, inline, shift } from "@floating-ui/dom"
import { normalizeRelativeURLs } from "../../util/path"
import { extractPreviewFromHtml, renderStructuredPreview } from "./popover-preview"
import { fetchCanonical } from "./util"
import { PREVIEW_SHOW_MS, PREVIEW_HIDE_MS } from "./preview-timing"

const p = new DOMParser()

let activeAnchor: HTMLAnchorElement | null = null
let hidePopoverTimer: ReturnType<typeof setTimeout> | null = null
let showPopoverTimer: ReturnType<typeof setTimeout> | null = null

function cancelScheduledHide() {
  if (hidePopoverTimer) {
    clearTimeout(hidePopoverTimer)
    hidePopoverTimer = null
  }
}

function cancelScheduledShow() {
  if (showPopoverTimer) {
    clearTimeout(showPopoverTimer)
    showPopoverTimer = null
  }
}

function scheduleHidePopover() {
  cancelScheduledHide()
  if (showPopoverTimer) {
    clearTimeout(showPopoverTimer)
    showPopoverTimer = null
  }
  hidePopoverTimer = setTimeout(() => {
    hidePopoverTimer = null
    clearActivePopover()
  }, PREVIEW_HIDE_MS)
}

function deactivateAllPopovers() {
  document
    .querySelectorAll(".popover")
    .forEach((popoverElement) => popoverElement.classList.remove("active-popover"))
}

function popoverIdForLink(link: HTMLAnchorElement): string {
  const targetUrl = new URL(link.href)
  targetUrl.hash = ""
  targetUrl.search = ""
  return `popover-${targetUrl.pathname}`
}

function bindPopoverHover(popoverElement: HTMLElement) {
  if (popoverElement.dataset.hoverBound === "true") return
  popoverElement.dataset.hoverBound = "true"
  popoverElement.addEventListener("mouseenter", cancelScheduledHide)
  popoverElement.addEventListener("mouseleave", scheduleHidePopover)
  popoverElement.addEventListener("focusin", cancelScheduledHide)
  popoverElement.addEventListener("focusout", (event: FocusEvent) => {
    const related = event.relatedTarget
    if (
      activeAnchor &&
      related &&
      (activeAnchor === related || activeAnchor.contains(related as Node))
    ) {
      cancelScheduledHide()
      return
    }
    scheduleHidePopover()
  })
}

function activatePopoverForLink(
  link: HTMLAnchorElement,
  coords: { clientX: number; clientY: number },
  immediate = false,
) {
  cancelScheduledHide()
  // Cancel any in-flight show for a different anchor to avoid race flash
  cancelScheduledShow()
  activeAnchor = link
  if (link.dataset.noPopover === "true") {
    return
  }

  async function setPosition(popoverElement: HTMLElement) {
    const { x, y } = await computePosition(link, popoverElement, {
      strategy: "fixed",
      middleware: [inline({ x: coords.clientX, y: coords.clientY }), shift(), flip()],
    })
    // Use left/top for placement so CSS transform stays free for enter/exit polish
    // (scale animation). Mixing translate into transform caused position loss after
    // animation-fill-mode: forwards overwrote the inline translate.
    Object.assign(popoverElement.style, {
      left: `${Math.round(x)}px`,
      top: `${Math.round(y)}px`,
    })
  }

  function showPopover(popoverElement: HTMLElement) {
    cancelScheduledHide()
    deactivateAllPopovers()
    bindPopoverHover(popoverElement)
    popoverElement.classList.add("active-popover")
    void setPosition(popoverElement)
  }

  const targetUrl = new URL(link.href)
  targetUrl.hash = ""
  targetUrl.search = ""
  const popoverId = popoverIdForLink(link)
  const prevPopoverElement = document.getElementById(popoverId)

  // dont refetch if there's already a popover
  if (prevPopoverElement) {
    showPopover(prevPopoverElement)
    return
  }

  const fetchAndShow = async () => {
    // re-check: pointer/focus may have left or anchor changed while waiting
    if (activeAnchor !== link) return
    if (document.getElementById(popoverId)) {
      showPopover(document.getElementById(popoverId) as HTMLElement)
      return
    }

    const response = await fetchCanonical(targetUrl).catch((err) => {
      console.error(err)
    })

    if (!response) return
    const rawContentType = response.headers.get("Content-Type")
    if (!rawContentType) return
    const [contentType] = rawContentType.split(";")
    const [contentTypeCategory, typeInfo] = contentType.split("/")

    const popoverElement = document.createElement("div")
    popoverElement.id = popoverId
    popoverElement.classList.add("popover")
    const popoverInner = document.createElement("div")
    popoverInner.classList.add("popover-inner")
    popoverInner.dataset.contentType = contentType ?? undefined
    popoverElement.appendChild(popoverInner)

    switch (contentTypeCategory) {
      case "image": {
        const img = document.createElement("img")
        img.src = targetUrl.toString()
        img.alt = targetUrl.pathname
        popoverInner.appendChild(img)
        break
      }
      case "application":
        switch (typeInfo) {
          case "pdf": {
            const pdf = document.createElement("iframe")
            pdf.src = targetUrl.toString()
            popoverInner.appendChild(pdf)
            break
          }
          default:
            break
        }
        break
      default: {
        const contents = await response.text()
        const html = p.parseFromString(contents, "text/html")
        normalizeRelativeURLs(html, targetUrl)
        const preview = extractPreviewFromHtml(html, targetUrl)
        renderStructuredPreview(popoverInner, {
          ...preview,
          href: link.href,
        })
      }
    }

    if (document.getElementById(popoverId)) {
      return
    }

    bindPopoverHover(popoverElement)
    document.body.appendChild(popoverElement)
    if (activeAnchor !== link) {
      return
    }

    showPopover(popoverElement)
  }

  // Defer fetch until the unified show threshold elapses to avoid
  // wasted requests on drive-by hovers. Keyboard focus and cached popovers skip the delay.
  if (immediate) {
    void fetchAndShow()
  } else {
    showPopoverTimer = setTimeout(() => void fetchAndShow(), PREVIEW_SHOW_MS)
  }
}

function mouseEnterHandler(
  this: HTMLAnchorElement,
  { clientX, clientY }: { clientX: number; clientY: number },
) {
  activatePopoverForLink(this, { clientX, clientY })
}

function focusInHandler(this: HTMLAnchorElement) {
  // Keyboard path only — mouse click also focuses the link; :focus-visible excludes that.
  if (!this.matches(":focus-visible")) return
  const rect = this.getBoundingClientRect()
  activatePopoverForLink(
    this,
    { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 },
    true,
  )
}

function focusOutHandler(this: HTMLAnchorElement, event: FocusEvent) {
  const related = event.relatedTarget
  if (related) {
    const popover = document.getElementById(popoverIdForLink(this))
    if (popover?.contains(related as Node)) {
      cancelScheduledHide()
      return
    }
  }
  scheduleHidePopover()
}

function clearActivePopover() {
  cancelScheduledHide()
  cancelScheduledShow()
  activeAnchor = null
  deactivateAllPopovers()
}

function setupPopovers() {
  const links = [...document.querySelectorAll("a.internal")] as HTMLAnchorElement[]
  for (const link of links) {
    link.addEventListener("mouseenter", mouseEnterHandler)
    link.addEventListener("mouseleave", scheduleHidePopover)
    link.addEventListener("focusin", focusInHandler)
    link.addEventListener("focusout", focusOutHandler)
    window.addCleanup?.(() => {
      link.removeEventListener("mouseenter", mouseEnterHandler)
      link.removeEventListener("mouseleave", scheduleHidePopover)
      link.removeEventListener("focusin", focusInHandler)
      link.removeEventListener("focusout", focusOutHandler)
    })
  }
}

document.addEventListener("nav", setupPopovers)
document.addEventListener("render", setupPopovers)