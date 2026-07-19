// node scripts/check-hub-data-slugs.mjs
//
// Durable production gate for collision-class hub navigation (with content absolute
// hub hrefs). CrawlLinks same-folder patches under .quartz/ are NOT versioned and
// are wiped by `plugin install` — do not treat path.ts unit tests as this gate.
//
// After `npx quartz build` (or CI build):
//   npm run check:hub-slugs
//
// Asserts:
// 1) Each required folder-qualified data-slug appears on a .tr-folder-nav-item
//    anchor (hand-written hub nav), not merely somewhere on the page.
// 2) Bare collision slugs are forbidden on those hub pages when they would
//    indicate wrong-page resolution (exact data-slug="admin_guide" / "readme").
//
// Temporary regression check: inject data-slug="admin_guide" into
// public/admin/index.html and re-run — must exit 1.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, "..")
const PUBLIC = path.join(REPO_ROOT, "public")

/**
 * @typedef {{
 *   file: string
 *   requireOnNav: string[]
 *   forbidBare: string[]
 * }} HubAssert
 */

/** @type {HubAssert[]} */
const ASSERTS = [
  {
    file: "admin/index.html",
    requireOnNav: ["admin/admin_guide"],
    forbidBare: ["admin_guide"],
  },
  {
    file: "guides/index.html",
    requireOnNav: ["guides/admin_guide"],
    forbidBare: ["admin_guide"],
  },
  {
    file: "legal/index.html",
    requireOnNav: ["legal/readme"],
    forbidBare: ["readme"],
  },
]

/**
 * data-slug values on anchors that include class tr-folder-nav-item.
 * @param {string} html
 * @returns {string[]}
 */
function navItemDataSlugs(html) {
  const slugs = []
  // Match <a ... class="...tr-folder-nav-item..." ... data-slug="...">
  // Attribute order varies; allow either order of class/data-slug.
  const re =
    /<a\b[^>]*\bclass="[^"]*\btr-folder-nav-item\b[^"]*"[^>]*\bdata-slug="([^"]+)"[^>]*>|<a\b[^>]*\bdata-slug="([^"]+)"[^>]*\bclass="[^"]*\btr-folder-nav-item\b[^"]*"[^>]*>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    slugs.push(m[1] ?? m[2])
  }
  return slugs
}

/**
 * All data-slug values on the page (any element).
 * @param {string} html
 * @returns {string[]}
 */
function allDataSlugs(html) {
  const slugs = []
  const re = /\bdata-slug="([^"]+)"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    slugs.push(m[1])
  }
  return slugs
}

let failed = 0
for (const { file, requireOnNav, forbidBare } of ASSERTS) {
  const full = path.join(PUBLIC, file)
  if (!fs.existsSync(full)) {
    console.error(`FAIL missing file: public/${file}`)
    failed++
    continue
  }
  const html = fs.readFileSync(full, "utf8")
  const navSlugs = navItemDataSlugs(html)
  const pageSlugs = allDataSlugs(html)

  if (navSlugs.length === 0) {
    console.error(`FAIL public/${file}: no .tr-folder-nav-item anchors with data-slug`)
    failed++
  }

  for (const need of requireOnNav) {
    if (!navSlugs.includes(need)) {
      console.error(
        `FAIL public/${file}: .tr-folder-nav-item missing data-slug="${need}" (nav has: ${navSlugs.join(", ") || "none"})`,
      )
      failed++
    } else {
      console.log(`OK   public/${file} nav has data-slug="${need}"`)
    }
  }

  for (const bare of forbidBare) {
    // Exact bare slug only (not folder/bare)
    if (pageSlugs.includes(bare)) {
      console.error(
        `FAIL public/${file}: bare data-slug="${bare}" present (collision-class wrong target)`,
      )
      failed++
    } else {
      console.log(`OK   public/${file} has no bare data-slug="${bare}"`)
    }
  }
}

if (failed > 0) {
  console.error(`\ncheck-hub-data-slugs: ${failed} failure(s)`)
  process.exit(1)
}
console.log("\ncheck-hub-data-slugs: all hub data-slug asserts passed")
