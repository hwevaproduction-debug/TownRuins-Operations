import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"

type FooterLinkPlugin = {
  options?: {
    links?: Record<string, string>
  }
}

type FooterLinkConfig = {
  configuration?: {
    plugins?: FooterLinkPlugin[]
  }
}

const CustomFooter: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const year = new Date().getFullYear()
  const locale = cfg.locale ?? "en-US"
  const footerLinks = ((cfg as FooterLinkConfig).configuration?.plugins ?? []).flatMap((plugin) => {
    const links = plugin.options?.links
    return links ? Object.entries(links) : []
  })

  return (
    <footer lang={locale}>
      <p>
        Town Ruins Operations Portal &copy; {year}
      </p>
      {footerLinks.length > 0 && (
        <ul>
          {footerLinks.map(([text, href]) => (
            <li key={`${text}:${href}`}>
              <a href={href}>{text}</a>
            </li>
          ))}
        </ul>
      )}
    </footer>
  )
}

export default (() => CustomFooter) satisfies QuartzComponentConstructor
