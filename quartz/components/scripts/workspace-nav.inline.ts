function wireWorkspaceLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>("[data-kc-workspace-link]").forEach((link) => {
    if (link.dataset.kcWired === "true") return
    link.dataset.kcWired = "true"
    link.addEventListener("click", (event) => {
      event.preventDefault()
      const url = new URL("/", window.location.origin)
      if (typeof window.spaNavigate === "function") {
        window.spaNavigate(url, false)
      } else {
        window.location.assign(url.toString())
      }
    })
  })
}

document.addEventListener("nav", wireWorkspaceLinks)
wireWorkspaceLinks()