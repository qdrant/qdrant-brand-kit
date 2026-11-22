"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

import { RenderBlock, type Block, type WebPage } from "./blocks"

// The inside of a frame (app/web/frame). Query: section, variant, theme and surface for one section, or
// page=builder for the page the builder sends by postMessage. It keeps <html> on the frame's theme (menus and
// sheets open in a portal on <body>, outside the sections), marks <body> as the website (web.css), and reports
// its height to the parent so the frame can be sized to fit.
export function WebFrame() {
  const params = useSearchParams()
  const key = params.get("key") ?? ""
  const isBuilder = params.get("page") === "builder"
  const theme = (params.get("theme") as "dark" | "light" | null) ?? "dark"
  const [page, setPage] = React.useState<WebPage | null>(null)
  const [selected, setSelected] = React.useState<string | null>(null)
  const root = React.useRef<HTMLDivElement>(null)

  const pageTheme = isBuilder ? (page?.theme ?? "dark") : theme

  // Keep <html> on this frame's theme, even if the studio's theme provider changes it.
  React.useEffect(() => {
    const html = document.documentElement
    const apply = () => {
      if (html.dataset.theme !== pageTheme) html.dataset.theme = pageTheme
    }
    apply()
    document.body.setAttribute("data-web", "")
    const obs = new MutationObserver(apply)
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] })
    return () => obs.disconnect()
  }, [pageTheme])

  // Report the content's height to the parent.
  React.useEffect(() => {
    const el = root.current
    if (!el || window.parent === window) return
    const send = () => window.parent.postMessage({ type: "qd-frame-height", key, height: el.scrollHeight }, "*")
    const ro = new ResizeObserver(send)
    ro.observe(el)
    send()
    return () => ro.disconnect()
  }, [key])

  // The builder sends its page and the selected block.
  React.useEffect(() => {
    if (!isBuilder) return
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "qd-page") setPage(e.data.page as WebPage)
      if (e.data?.type === "qd-select") setSelected(e.data.uid as string | null)
    }
    window.addEventListener("message", onMessage)
    window.parent.postMessage({ type: "qd-frame-ready", key }, "*")
    return () => window.removeEventListener("message", onMessage)
  }, [isBuilder, key])

  if (isBuilder) {
    return (
      <div ref={root} data-web data-theme={pageTheme} className="min-h-svh bg-background text-foreground">
        {page?.blocks.length ? (
          page.blocks.map((block: Block) => (
            <div
              key={block.uid}
              onClickCapture={(e) => {
                e.preventDefault()
                window.parent.postMessage({ type: "qd-select", uid: block.uid }, "*")
              }}
              className={cn(
                "relative cursor-pointer outline-2 -outline-offset-2 outline-transparent hover:outline-(--qd-color-primary)/50",
                selected === block.uid && "outline-(--qd-color-primary)"
              )}
            >
              <RenderBlock block={block} />
            </div>
          ))
        ) : (
          <p className="grid min-h-svh place-items-center p-10 text-sm text-muted-foreground">
            Add sections from the library on the left.
          </p>
        )}
      </div>
    )
  }

  const block: Block = {
    uid: "frame",
    section: params.get("section") ?? "",
    variant: params.get("variant") ?? "",
    theme,
    surface: (params.get("surface") as Block["surface"]) ?? undefined,
  }
  const min = Number(params.get("min") ?? 0)
  return (
    <div ref={root} data-web data-theme={theme} className="bg-background text-foreground" style={{ minHeight: min || undefined }}>
      <RenderBlock block={block} />
    </div>
  )
}
