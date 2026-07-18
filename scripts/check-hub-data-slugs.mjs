// node scripts/check-hub-data-slugs.mjs
/**
 * Assert built hub pages resolve collision-prone nav links to folder-qualified data-slugs.
 * Exit 1 if any required substring is missing (or public file is absent).
 *
 * Usage:
 *   node scripts/check-hub-data-slugs.mjs
 *   npm run check:hub-slugs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, "..")
const PUBLIC = path.join(REPO_ROOT, "public")

/** @type {{ file: string, mustContain: string[] }[]} */
const ASSERTS = [
  {
    file: "admin/index.html",
    mustContain: ['data-slug="admin/admin_guide"'],
  },
  {
    file: "guides/index.html",
    mustContain: ['data-slug="guides/admin_guide"'],
  },
  {
    file: "legal/index.html",
    mustContain: ['data-slug="legal/readme"'],
  },
]

let failed = 0
for (const { file, mustContain } of ASSERTS) {
  const full = path.join(PUBLIC, file)
  if (!fs.existsSync(full)) {
    console.error(`FAIL missing file: public/${file}`)
    failed++
    continue
  }
  const html = fs.readFileSync(full, "utf8")
  for (const needle of mustContain) {
    if (!html.includes(needle)) {
      console.error(`FAIL public/${file} missing ${needle}`)
      failed++
    } else {
      console.log(`OK   public/${file} has ${needle}`)
    }
  }
}

if (failed > 0) {
  console.error(`\ncheck-hub-data-slugs: ${failed} failure(s)`)
  process.exit(1)
}
console.log("\ncheck-hub-data-slugs: all hub data-slug asserts passed")
