export type HubTier = "role" | "domain"

export type CanvasNodeKind = "hub" | "leaf"

export type CanvasNode = {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  kind: CanvasNodeKind
  hubId?: string
  folder: string
  tags: string[]
  tier?: HubTier
  category: string
}

export type CanvasEdge = {
  source: string
  target: string
}

export type CanvasModel = {
  hubs: string[]
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  stacks: Record<string, string[]>
}

export type CanvasPosition = {
  x: number
  y: number
}

/** Canonical canvas session — seats only (no pan/zoom/freeform positions). */
export type CanvasSessionState = {
  expandedHub: string | null
  /** hubId → seat/home id */
  seatOf: Record<string, string>
}

export const CANVAS_SESSION_KEY = "tr-canvas-state-v2"
