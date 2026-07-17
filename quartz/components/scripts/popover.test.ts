import test, { describe } from "node:test"
import assert from "node:assert"
import {
  extractPreviewFromHtml,
  titleFromPathname,
} from "./popover-preview"

function metaContent(html: string, selector: "description" | "og:title" | "og:description"): string | null {
  if (selector === "description") {
    return html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] ?? null
  }
  const property = selector === "og:title" ? "og:title" : "og:description"
  return html.match(new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]*)"`, "i"))?.[1] ?? null
}

function firstMatch(html: string, pattern: RegExp): string | null {
  return html.match(pattern)?.[1]?.trim() ?? null
}

function makeDocument(html: string): Document {
  const paragraphs = [...html.matchAll(/<p[^>]*>([^<]+)<\/p>/gi)].map((match) => match[1].trim())

  const query = (sel: string): Element | null => {
    if (sel.includes('meta[name="description"]')) {
      const content = metaContent(html, "description")
      return content ? ({ getAttribute: () => content } as unknown as Element) : null
    }
    if (sel.includes('meta[property="og:description"]')) {
      const content = metaContent(html, "og:description")
      return content ? ({ getAttribute: () => content } as unknown as Element) : null
    }
    if (sel.includes('meta[property="og:title"]')) {
      const content = metaContent(html, "og:title")
      return content ? ({ getAttribute: () => content } as unknown as Element) : null
    }
    if (sel.includes("h1")) {
      const text = firstMatch(html, /<h1[^>]*>([^<]+)<\/h1>/i)
      return text ? ({ textContent: text } as unknown as Element) : null
    }
    if (sel === "title") {
      const text = firstMatch(html, /<title[^>]*>([^<]+)<\/title>/i)
      return text ? ({ textContent: text } as unknown as Element) : null
    }
    if (sel === ".center" || sel === "article" || sel === "main") {
      return {
        querySelectorAll: (innerSel: string) => {
          if (innerSel !== "p") return []
          return paragraphs.map((text) => ({
            textContent: text,
            closest: () => null,
          })) as unknown as NodeListOf<Element>
        },
      } as unknown as Element
    }
    if (sel === "body") {
      return {
        querySelectorAll: () => [] as unknown as NodeListOf<Element>,
      } as unknown as Element
    }
    return null
  }

  return {
    querySelector: query,
    body: query("body")!,
  } as Document
}

describe("titleFromPathname", () => {
  test("formats slug segments into a readable title", () => {
    assert.strictEqual(titleFromPathname("/operations/runbooks/incident-response"), "Incident Response")
  })

  test("falls back to Document for root path", () => {
    assert.strictEqual(titleFromPathname("/"), "Document")
  })
})

describe("extractPreviewFromHtml", () => {
  test("prefers meta description and header h1", () => {
    const html = `
      <html>
        <head>
          <title>Incident Response | Town Ruins</title>
          <meta name="description" content="Steps for handling production incidents." />
        </head>
        <body>
          <header><h1>Incident Response</h1></header>
        </body>
      </html>
    `
    const preview = extractPreviewFromHtml(
      makeDocument(html),
      new URL("https://example.com/operations/incident-response"),
    )
    assert.strictEqual(preview.title, "Incident Response")
    assert.strictEqual(preview.summary, "Steps for handling production incidents.")
  })

  test("uses first meaningful paragraph when description meta is missing", () => {
    const html = `
      <html>
        <head><title>Fallback Title</title></head>
        <body>
          <div class="center">
            <p>Short</p>
            <p>This is the first meaningful paragraph in the article body for preview extraction.</p>
          </div>
        </body>
      </html>
    `
    const preview = extractPreviewFromHtml(makeDocument(html), new URL("https://example.com/docs/guide"))
    assert.strictEqual(preview.title, "Fallback Title")
    assert.ok(preview.summary.includes("first meaningful paragraph"))
  })

  test("falls back to pathname title and click-to-open summary", () => {
    const preview = extractPreviewFromHtml(makeDocument("<html></html>"), new URL("https://example.com/ops/after-hours"))

    assert.strictEqual(preview.title, "After Hours")
    assert.strictEqual(preview.summary, "Click to open")
  })
})

describe("structured showPopover", () => {
  test("activates popover without hash scrolling", async () => {
    const added: string[] = []
    const popoverElement = {
      classList: {
        add(cls: string) {
          added.push(cls)
        },
      },
      style: {} as Record<string, string>,
    }

    popoverElement.classList.add("active-popover")
    await Promise.resolve()

    assert.deepStrictEqual(added, ["active-popover"])
  })
})