// Re-export shared path utilities from @quartz-community/utils
export {
  isFilePath,
  isFullSlug,
  isSimpleSlug,
  isRelativeURL,
  isAbsoluteURL,
  getFullSlug,
  slugifyFilePath,
  simplifySlug,
  joinSegments,
  endsWith,
  trimSuffix,
  stripSlashes,
  getFileExtension,
  isFolderPath,
  getAllSegmentPrefixes,
  pathToRoot,
  resolveRelative,
  splitAnchor,
  slugTag,
  transformInternalLink,
  normalizeHastElement,
} from "@quartz-community/utils"

import {
  transformLink as baseTransformLink,
  transformInternalLink,
  endsWith,
  stripSlashes,
  resolveRelative,
  splitAnchor,
} from "@quartz-community/utils"
import type { FullSlug, RelativeURL, TransformOptions } from "@quartz-community/utils"

export type {
  FilePath,
  FullSlug,
  SimpleSlug,
  RelativeURL,
  TransformOptions,
} from "@quartz-community/utils"

/**
 * Same-folder preference for `shortest` link resolution when a basename collides
 * (e.g. admin/admin_guide vs guides/admin_guide, legal/readme vs readme).
 * Upstream only resolves when the basename match is unique; multiple matches fall
 * back to a bare slug and break hub nav. Prefer the page under the source folder.
 *
 * Note: crawl-links bundles its own transformLink in `.quartz/plugins/crawl-links/dist`;
 * that copy was patched the same way so the live build picks this up.
 */
export function transformLink(
  src: FullSlug,
  target: string,
  opts: TransformOptions,
): RelativeURL {
  if (opts.strategy === "shortest") {
    const targetSlug = transformInternalLink(target)
    const effectiveSrc = (
      !endsWith(src, "index") && opts.allSlugs.includes(`${src}/index` as FullSlug)
        ? `${src}/index`
        : src
    ) as FullSlug
    const canonicalSlug = stripSlashes(targetSlug.slice(".".length))
    const [targetCanonical, targetAnchor] = splitAnchor(canonicalSlug)

    if (!targetCanonical.includes("/")) {
      const matchingFileNames = opts.allSlugs.filter((slug) => {
        const parts = slug.split("/")
        return parts.at(-1) === targetCanonical
      })

      if (matchingFileNames.length > 1) {
        const srcParts = effectiveSrc.split("/").filter((x) => x.length > 0)
        const srcDir = endsWith(effectiveSrc, "index")
          ? srcParts.slice(0, -1).join("/")
          : srcParts.slice(0, -1).join("/")
        const sameFolder = matchingFileNames.find((slug) => {
          if (srcDir === "") return slug === targetCanonical
          return slug === `${srcDir}/${targetCanonical}`
        })
        if (sameFolder) {
          return (resolveRelative(effectiveSrc, sameFolder as FullSlug) +
            targetAnchor) as RelativeURL
        }
      }
    }
  }

  return baseTransformLink(src, target, opts)
}

// --- v5-specific exports below ---

export const QUARTZ = "quartz"

// from micromorph/src/utils.ts
// https://github.com/natemoo-re/micromorph/blob/main/src/utils.ts#L5
const _rebaseHtmlElement = (el: Element, attr: string, newBase: string | URL) => {
  const rebased = new URL(el.getAttribute(attr)!, newBase)
  el.setAttribute(attr, rebased.pathname + rebased.hash)
}
export function normalizeRelativeURLs(el: Element | Document, destination: string | URL) {
  el.querySelectorAll('[href=""], [href^="./"], [href^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "href", destination)
  })
  el.querySelectorAll('[src=""], [src^="./"], [src^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "src", destination)
  })
}
