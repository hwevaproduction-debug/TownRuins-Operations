import assert from "node:assert"
import { describe, test } from "node:test"
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  computeClusterLayout,
  computeFitMetrics,
  snapToGrid,
} from "./layout"
import { HUB_DEFINITIONS } from "./hub-config"

describe("layout", () => {
  test("computeClusterLayout places roles above systems with separation", () => {
    const { positions, clusters, metrics } = computeClusterLayout(1400, 800, [
      "operations",
      "developer",
      "architecture",
      "api",
    ])

    assert.ok(positions.operations)
    assert.ok(positions.architecture)
    assert.ok(positions.operations.y < positions.architecture.y)
    assert.equal(clusters.length, 2)
    assert.equal(clusters[0]?.id, "roles")
    assert.equal(clusters[1]?.id, "systems")
    assert.ok(clusters[1]!.y - (clusters[0]!.y + clusters[0]!.height) >= 32)
    // Wide stage: full-size cards
    assert.equal(metrics.cardWidth, CARD_WIDTH)
    assert.equal(metrics.cardHeight, CARD_HEIGHT)
    assert.equal(metrics.scale, 1)
  })

  test("snapToGrid rounds to nearest 8px", () => {
    assert.equal(snapToGrid(13), 16)
    assert.equal(snapToGrid(12), 16)
    assert.equal(snapToGrid(11), 8)
    assert.equal(snapToGrid(8), 8)
    assert.equal(snapToGrid(0), 0)
  })

  test("fit-to-stage: narrow width scales cards so all hubs stay in bounds", () => {
    const allHubs = HUB_DEFINITIONS.map((h) => h.id)
    const stageW = 1000
    const stageH = 560
    const { positions, clusters, metrics } = computeClusterLayout(stageW, stageH, allHubs)

    assert.ok(metrics.cardWidth <= CARD_WIDTH)
    assert.ok(metrics.scale <= 1)
    assert.ok(metrics.cardWidth >= 120)

    for (const id of allHubs) {
      const pos = positions[id]
      assert.ok(pos, `missing position for ${id}`)
      assert.ok(pos.x >= 0, `${id} x negative`)
      assert.ok(pos.y >= 0, `${id} y negative`)
      assert.ok(
        pos.x + metrics.cardWidth <= stageW + 0.5,
        `${id} right edge ${pos.x + metrics.cardWidth} exceeds stage ${stageW}`,
      )
      assert.ok(
        pos.y + metrics.cardHeight <= stageH + 0.5,
        `${id} bottom ${pos.y + metrics.cardHeight} exceeds stage ${stageH}`,
      )
    }

    // Clusters fully inside stage
    for (const c of clusters) {
      assert.ok(c.x >= 0)
      assert.ok(c.y >= 0)
      assert.ok(c.x + c.width <= stageW + 0.5)
      assert.ok(c.y + c.height <= stageH + 0.5)
    }

    // One row per tier: all roles share y; all systems share y
    const roleYs = new Set(
      HUB_DEFINITIONS.filter((h) => h.tier === "role").map((h) => positions[h.id]?.y),
    )
    const systemYs = new Set(
      HUB_DEFINITIONS.filter((h) => h.tier === "domain").map((h) => positions[h.id]?.y),
    )
    assert.equal(roleYs.size, 1)
    assert.equal(systemYs.size, 1)
  })

  test("computeFitMetrics does not upscale beyond base", () => {
    const m = computeFitMetrics(2000, 900, 5, 5)
    assert.equal(m.cardWidth, CARD_WIDTH)
    assert.equal(m.scale, 1)
  })
})
