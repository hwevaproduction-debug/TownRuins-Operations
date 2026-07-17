import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children, fileData }: QuartzComponentProps) => {
  const slug = fileData?.slug ?? ""
  const isHomepage = slug === "index"
  const bodyClass = isHomepage ? "full-width-homepage" : "reading-mode"

  return <div id="quartz-body" class={bodyClass}>{children}</div>
}

export default (() => Body) satisfies QuartzComponentConstructor
