// node scripts/check-internal-links.mjs
/**
 * OE-05/OE-06: Inventory internal links in content/**/*.md and report unresolved targets.
 *
 * - Walks content/**/*.md (Node stdlib only)
 * - Extracts href="..." / href='...' (skips http(s), mailto, bare #anchors)
 * - Extracts markdown links [text](target) (skips images ![alt](...))
 * - Extracts [[wikilinks]]
 * - Builds known slug set from content paths (lowercase, spaces→-, folder-note rewrite)
 * - Resolves relative targets against the source file directory
 * - Emits JSON report to stdout; optional --csv / --out
 * - Exit 1 if any unresolved internal links are found
 *
 * Usage:
 *   node scripts/check-internal-links.mjs
 *   node scripts/check-internal-links.mjs --csv
 *   node scripts/check-internal-links.mjs --out scripts/out/internal-links.json
 *   node scripts/check-internal-links.mjs --quiet
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "..")
const CONTENT_ROOT = path.join(REPO_ROOT, "content")

const HREF_RE = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi
// [[target]], [[target|alias]], [[target#heading]], optional !embed prefix
const WIKILINK_RE = /!?\[\[([^\]]+)\]\]/g
// Markdown links; negative lookbehind skips image ![alt](url)
const MD_LINK_RE = /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g

/**
 * Align with Quartz slugifyPath (simplified): lowercase, spaces→-, &→-and-, strip ?#.
 */
function simpleSlugify(segment) {
  return segment
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/&/g, "-and-")
    .replace(/%/g, "-percent")
    .replace(/\?/g, "")
    .replace(/#/g, "")
    .replace(/-+/g, "-")
}

/**
 * Path relative to content root → slug key (posix, no leading/trailing slash, no .md).
 * Applies Quartz folder-note rule: folder/folder → folder/index.
 */
function pathToSlug(relPathFromContent) {
  let p = relPathFromContent.replace(/\\/g, "/")
  if (p.startsWith("./")) p = p.slice(2)
  p = p.replace(/^\/+/, "").replace(/\/+$/, "")
  if (p.toLowerCase().endsWith(".md")) {
    p = p.slice(0, -3)
  }
  if (p.toLowerCase().endsWith(".html")) {
    p = p.slice(0, -5)
  }
  // strip _index → index
  if (p.toLowerCase().endsWith("/_index") || p.toLowerCase() === "_index") {
    p = p.replace(/\/?_index$/i, "/index").replace(/^index$/i, "index")
  }
  const parts = p.split("/").filter(Boolean).map(simpleSlugify)
  // Folder note: last segment equals parent → index
  if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
    parts[parts.length - 1] = "index"
  }
  return parts.join("/")
}

function walkMarkdownFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walkMarkdownFiles(full, acc)
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
      acc.push(full)
    }
  }
  return acc
}

/**
 * Expand a slug into match keys: exact, without trailing /index, with /index for folder roots.
 */
function slugMatchKeys(slug) {
  const s = slug.replace(/\/+$/, "")
  const keys = new Set()
  if (!s) {
    keys.add("index")
    keys.add("")
    return keys
  }
  keys.add(s)
  if (s.endsWith("/index")) {
    const folder = s.slice(0, -"/index".length)
    keys.add(folder)
    keys.add(folder + "/")
  } else {
    keys.add(s + "/index")
    keys.add(s + "/")
  }
  return keys
}

function buildKnownSlugSet(mdFiles) {
  /** @type {Map<string, string>} slug → relative content path */
  const known = new Map()
  for (const abs of mdFiles) {
    const rel = path.relative(CONTENT_ROOT, abs)
    const slug = pathToSlug(rel)
    known.set(slug, rel.replace(/\\/g, "/"))
    for (const k of slugMatchKeys(slug)) {
      if (!known.has(k)) known.set(k, rel.replace(/\\/g, "/"))
    }
  }
  return known
}

function isExternalOrSkip(href) {
  const t = href.trim()
  if (!t) return true
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) {
    return true
  }
  if (t.startsWith("#")) return true
  return false
}

function stripQueryAndHash(href) {
  let h = href.trim()
  // strip surrounding angle brackets sometimes used in md
  if (h.startsWith("<") && h.endsWith(">")) h = h.slice(1, -1)
  const hashIdx = h.indexOf("#")
  if (hashIdx !== -1) h = h.slice(0, hashIdx)
  const qIdx = h.indexOf("?")
  if (qIdx !== -1) h = h.slice(0, qIdx)
  return h
}

/**
 * Resolve an internal href (or wikilink/md target) against the source file's directory
 * into a content-relative candidate slug.
 */
function resolveCandidate(sourceAbs, rawTarget) {
  const cleaned = stripQueryAndHash(rawTarget)
  if (!cleaned) return null

  let joined
  if (cleaned.startsWith("/")) {
    joined = path.join(CONTENT_ROOT, cleaned.replace(/^\/+/, ""))
  } else {
    const sourceDir = path.dirname(sourceAbs)
    joined = path.resolve(sourceDir, cleaned)
  }

  const rel = path.relative(CONTENT_ROOT, joined)
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return { candidate: rel.replace(/\\/g, "/"), outsideContent: true }
  }
  return { candidate: pathToSlug(rel), outsideContent: false }
}

function parseWikilinkInner(inner) {
  let target = inner.split("|")[0].trim()
  const hashIdx = target.indexOf("#")
  if (hashIdx !== -1) target = target.slice(0, hashIdx)
  return target.trim()
}

function extractLinks(_sourceAbs, text) {
  /** @type {{ kind: string, href: string }[]} */
  const links = []

  HREF_RE.lastIndex = 0
  let m
  while ((m = HREF_RE.exec(text)) !== null) {
    const href = m[1] ?? m[2] ?? ""
    if (isExternalOrSkip(href)) continue
    links.push({ kind: "href", href })
  }

  MD_LINK_RE.lastIndex = 0
  while ((m = MD_LINK_RE.exec(text)) !== null) {
    const href = (m[2] ?? "").trim()
    if (isExternalOrSkip(href)) continue
    links.push({ kind: "md", href })
  }

  WIKILINK_RE.lastIndex = 0
  while ((m = WIKILINK_RE.exec(text)) !== null) {
    const target = parseWikilinkInner(m[1] ?? "")
    if (!target) continue
    if (target.startsWith("#")) continue
    if (isExternalOrSkip(target)) continue
    links.push({ kind: "wikilink", href: target })
  }

  return links
}

function isResolved(known, candidateSlug) {
  if (known.has(candidateSlug)) return true
  for (const k of slugMatchKeys(candidateSlug)) {
    if (known.has(k)) return true
  }
  return false
}

function parseArgs(argv) {
  const opts = { csv: false, out: null, quiet: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--csv") opts.csv = true
    else if (a === "--quiet" || a === "-q") opts.quiet = true
    else if (a === "--out") {
      opts.out = argv[++i]
    } else if (a.startsWith("--out=")) {
      opts.out = a.slice("--out=".length)
    }
  }
  return opts
}

function toCsv(unresolved) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`
  const lines = ["source,kind,href,resolved_candidate"]
  for (const u of unresolved) {
    lines.push([u.source, u.kind, u.href, u.resolvedCandidate].map(esc).join(","))
  }
  return lines.join("\n") + "\n"
}

function main() {
  const opts = parseArgs(process.argv.slice(2))

  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(`content/ not found at ${CONTENT_ROOT}`)
    process.exit(2)
  }

  const mdFiles = walkMarkdownFiles(CONTENT_ROOT).sort()
  const known = buildKnownSlugSet(mdFiles)

  let filesScanned = 0
  let hrefCount = 0
  let mdCount = 0
  let wikilinkCount = 0
  /** @type {{ source: string, kind: string, href: string, resolvedCandidate: string }[]} */
  const unresolved = []
  /** @type {{ source: string, kind: string, href: string, resolvedCandidate: string }[]} */
  const resolved = []

  for (const abs of mdFiles) {
    filesScanned++
    const text = fs.readFileSync(abs, "utf8")
    const sourceRel = path.relative(REPO_ROOT, abs).replace(/\\/g, "/")
    const links = extractLinks(abs, text)

    for (const { kind, href } of links) {
      if (kind === "href") hrefCount++
      else if (kind === "md") mdCount++
      else wikilinkCount++

      const res = resolveCandidate(abs, href)
      if (!res) continue

      const entry = {
        source: sourceRel,
        kind,
        href,
        resolvedCandidate: res.candidate,
      }

      if (res.outsideContent || !isResolved(known, res.candidate)) {
        unresolved.push(entry)
      } else {
        resolved.push(entry)
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    contentRoot: "content",
    summary: {
      filesScanned,
      knownSlugs: new Set(
        [...known.keys()].filter((k) => !k.endsWith("/") && k !== ""),
      ).size,
      hrefInternal: hrefCount,
      mdLinks: mdCount,
      wikilinks: wikilinkCount,
      resolved: resolved.length,
      unresolved: unresolved.length,
    },
    unresolved,
  }

  const s = report.summary
  console.error(
    `[check-internal-links] files=${s.filesScanned} knownSlugs≈${s.knownSlugs} hrefs=${s.hrefInternal} md=${s.mdLinks} wikilinks=${s.wikilinks} resolved=${s.resolved} unresolved=${s.unresolved}`,
  )

  let body
  if (opts.csv) {
    body = toCsv(unresolved)
  } else {
    body = JSON.stringify(report, null, 2) + "\n"
  }

  if (opts.out) {
    const outPath = path.isAbsolute(opts.out) ? opts.out : path.join(REPO_ROOT, opts.out)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, body, "utf8")
    console.error(`[check-internal-links] wrote ${path.relative(REPO_ROOT, outPath).replace(/\\/g, "/")}`)
  }

  if (!opts.quiet) {
    process.stdout.write(body)
  } else if (unresolved.length > 0) {
    for (const u of unresolved) {
      console.error(`  UNRESOLVED ${u.source}  ${u.kind}  ${u.href}  →  ${u.resolvedCandidate}`)
    }
  }

  process.exit(unresolved.length > 0 ? 1 : 0)
}

main()
