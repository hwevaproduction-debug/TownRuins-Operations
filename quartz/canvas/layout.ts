import { HUB_DEFINITIONS } from "./hub-config"
import type { CanvasPosition } from "./types"

/** Base (unscaled) hub card size — design default when stage is wide enough. */
export const CARD_WIDTH = 240
export const CARD_WIDTH_LEAF = 200
export const CARD_GAP = 24
export const CARD_HEIGHT = 120
export const CLUSTER_GAP = 32
export const CLUSTER_PADDING = 24
export const SNAP_GRID = 8
export const LABEL_HEIGHT = 28

/** Readable floor for fit-to-stage scaling (R-CANVAS-8). */
export const MIN_CARD_WIDTH = 160
export const MIN_CARD_GAP = 12
export const MIN_CARD_HEIGHT = 96

export type ClusterBounds = {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  hubIds: string[]
}

/** Per-layout hub geometry after fit-to-stage scale. */
export type LayoutMetrics = {
  cardWidth: number
  cardHeight: number
  cardGap: number
  scale: number
}

export type ClusterLayoutResult = {
  positions: Record<string, CanvasPosition>
  clusters: ClusterBounds[]
  metrics: LayoutMetrics
}

function rowWidth(count: number, cardW: number, gap: number): number {
  if (count <= 0) return 0
  return count * cardW + Math.max(0, count - 1) * gap
}

function placeHubRow(
  ids: string[],
  originX: number,
  originY: number,
  cardW: number,
  gap: number,
): { positions: Record<string, CanvasPosition>; width: number } {
  const positions: Record<string, CanvasPosition> = {}
  if (ids.length === 0) return { positions, width: 0 }

  ids.forEach((id, index) => {
    positions[id] = {
      x: originX + index * (cardW + gap),
      y: originY,
    }
  })

  return { positions, width: rowWidth(ids.length, cardW, gap) }
}

/**
 * Fit hub card width/gap (and height if needed) so each Roles/Systems single row
 * fits the stage with even edge padding. One row per tier; no pan (R-CANVAS-8).
 */
export function computeFitMetrics(
  stageWidth: number,
  stageHeight: number,
  roleCount: number,
  systemCount: number,
): LayoutMetrics {
  const n = Math.max(roleCount, systemCount, 0)
  const EDGE = Math.max(CLUSTER_GAP, 40)

  if (n === 0) {
    return {
      cardWidth: CARD_WIDTH,
      cardHeight: CARD_HEIGHT,
      cardGap: CARD_GAP,
      scale: 1,
    }
  }

  // Horizontal: row must fit inside stage minus edges and cluster padding
  const availableW = Math.max(0, stageWidth - 2 * EDGE - 2 * CLUSTER_PADDING)
  const idealRow = rowWidth(n, CARD_WIDTH, CARD_GAP)
  let scale = idealRow > 0 ? Math.min(1, availableW / idealRow) : 1

  // Vertical: two cluster blocks + gap + edges
  const baseClusterBlock = LABEL_HEIGHT + CARD_HEIGHT + CLUSTER_PADDING * 2
  const idealH = baseClusterBlock * 2 + CLUSTER_GAP + 2 * EDGE
  if (idealH > stageHeight && idealH > 0) {
    scale = Math.min(scale, stageHeight / idealH)
  }

  let cardWidth = Math.max(MIN_CARD_WIDTH, Math.floor(CARD_WIDTH * scale))
  let cardGap = Math.max(MIN_CARD_GAP, Math.floor(CARD_GAP * scale))
  let cardHeight = Math.max(MIN_CARD_HEIGHT, Math.floor(CARD_HEIGHT * scale))

  // If floor still overflows width, shrink gap then width slightly below floor only as last resort
  let fitted = rowWidth(n, cardWidth, cardGap)
  if (fitted > availableW && availableW > 0) {
    // Recompute continuous scale against floors
    const s2 = availableW / idealRow
    cardWidth = Math.max(MIN_CARD_WIDTH, Math.floor(CARD_WIDTH * s2))
    cardGap = Math.max(MIN_CARD_GAP, Math.floor(CARD_GAP * s2))
    cardHeight = Math.max(MIN_CARD_HEIGHT, Math.floor(CARD_HEIGHT * s2))
    fitted = rowWidth(n, cardWidth, cardGap)
    if (fitted > availableW) {
      // Last resort: pack into available width at min gap
      cardGap = MIN_CARD_GAP
      cardWidth = Math.max(
        120,
        Math.floor((availableW - (n - 1) * cardGap) / n),
      )
      cardHeight = Math.max(
        MIN_CARD_HEIGHT,
        Math.floor(CARD_HEIGHT * (cardWidth / CARD_WIDTH)),
      )
    }
  }

  const effectiveScale = cardWidth / CARD_WIDTH
  return {
    cardWidth,
    cardHeight,
    cardGap,
    scale: effectiveScale,
  }
}

export function computeClusterLayout(
  width: number,
  height: number,
  hubIds: string[],
): ClusterLayoutResult {
  const roleHubs = hubIds.filter((id) => HUB_DEFINITIONS.find((h) => h.id === id)?.tier === "role")
  const domainHubs = hubIds.filter(
    (id) => HUB_DEFINITIONS.find((h) => h.id === id)?.tier === "domain",
  )

  const metrics = computeFitMetrics(width, height, roleHubs.length, domainHubs.length)
  const { cardWidth, cardHeight, cardGap } = metrics

  const positions: Record<string, CanvasPosition> = {}
  const clusters: ClusterBounds[] = []

  const rolesMeasure = placeHubRow(roleHubs, 0, 0, cardWidth, cardGap)
  const systemsMeasure = placeHubRow(domainHubs, 0, 0, cardWidth, cardGap)

  const rolesClusterWidth = rolesMeasure.width + CLUSTER_PADDING * 2
  const systemsClusterWidth = systemsMeasure.width + CLUSTER_PADDING * 2
  const clusterContentHeight = cardHeight
  const clusterBlockHeight = LABEL_HEIGHT + clusterContentHeight + CLUSTER_PADDING * 2

  const totalWidth = Math.max(rolesClusterWidth, systemsClusterWidth, 0)
  const EDGE = Math.max(CLUSTER_GAP, 40)
  const contentHeight = clusterBlockHeight * 2 + CLUSTER_GAP
  const startX = Math.max(EDGE, (width - totalWidth) / 2)
  const startY = Math.max(EDGE, (height - contentHeight) / 2)
  const rolesY = startY
  const systemsY = rolesY + clusterBlockHeight + CLUSTER_GAP

  const rolesOriginX =
    startX + CLUSTER_PADDING + Math.max(0, (totalWidth - rolesMeasure.width) / 2)
  const rolesOriginY = rolesY + CLUSTER_PADDING + LABEL_HEIGHT
  Object.assign(
    positions,
    placeHubRow(roleHubs, rolesOriginX, rolesOriginY, cardWidth, cardGap).positions,
  )

  clusters.push({
    id: "roles",
    label: "Roles",
    x: startX,
    y: rolesY,
    width: totalWidth,
    height: clusterBlockHeight,
    hubIds: roleHubs,
  })

  const systemsOriginX =
    startX + CLUSTER_PADDING + Math.max(0, (totalWidth - systemsMeasure.width) / 2)
  const systemsOriginY = systemsY + CLUSTER_PADDING + LABEL_HEIGHT
  Object.assign(
    positions,
    placeHubRow(domainHubs, systemsOriginX, systemsOriginY, cardWidth, cardGap).positions,
  )

  clusters.push({
    id: "systems",
    label: "Systems",
    x: startX,
    y: systemsY,
    width: totalWidth,
    height: clusterBlockHeight,
    hubIds: domainHubs,
  })

  return { positions, clusters, metrics }
}

/** @deprecated Use computeClusterLayout — returns hub positions only */
export function computeTier1Layout(
  width: number,
  height: number,
  hubIds: string[],
): Record<string, CanvasPosition> {
  return computeClusterLayout(width, height, hubIds).positions
}

export function snapToGrid(value: number, grid = SNAP_GRID): number {
  return Math.round(value / grid) * grid
}

export function clusterForHub(clusters: ClusterBounds[], hubId: string): ClusterBounds | undefined {
  return clusters.find((cluster) => cluster.hubIds.includes(hubId))
}

export function clampHubPosition(
  position: CanvasPosition,
  cluster: ClusterBounds,
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
): CanvasPosition {
  const minX = cluster.x + CLUSTER_PADDING
  const minY = cluster.y + CLUSTER_PADDING + LABEL_HEIGHT
  const maxX = cluster.x + cluster.width - CLUSTER_PADDING - cardWidth
  const maxY = cluster.y + cluster.height - CLUSTER_PADDING - cardHeight

  return {
    x: Math.min(Math.max(position.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(position.y, minY), Math.max(minY, maxY)),
  }
}
