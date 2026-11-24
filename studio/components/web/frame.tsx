"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"
import { Plate } from "@qdrant/web/lib/plate"
import { Section } from "@qdrant/web/lib/section"
import { getPattern } from "@qdrant/web/patterns"

import { RenderBlock, defaultStyle, styleAttributes, styleFromQuery, styleSwitches, type Block, type Style, type WebPage } from "./blocks"

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
  // The website's style switches (blocks.tsx), on unless the query or the builder's page turns them off.
  const style: Style = isBuilder ? { ...defaultStyle, ...page?.style } : styleFromQuery(params)
  const styleAttrs = styleAttributes(style)
  const styleKey = JSON.stringify(styleAttrs)

  // <body> carries them too, for menus and sheets that open in a portal.
  React.useEffect(() => {
    const b = document.body
    for (const s of styleSwitches) b.removeAttribute(s.attr[0])
    for (const [k, v] of Object.entries(JSON.parse(styleKey) as Record<string, string>)) b.setAttribute(k, v)
  }, [styleKey])

  // Hide Next.js's dev indicator (the "N" button) inside frames, so it never covers a section (Juan, 2026-11-21).
  React.useEffect(() => {
    const style = document.createElement("style")
    style.textContent = "nextjs-portal{display:none!important}"
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  // Keep <html> on this frame's theme, even if the studio's theme provider changes it.
  React.useEffect(() => {
    const html = document.documentElement
    const apply = () => {
      if (html.dataset.theme !== pageTheme) html.dataset.theme = pageTheme
    }
    apply()
    document.body.setAttribute("data-web", "")
    document.body.setAttribute("data-context", "marketing")
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

  // On the canvas, the frame passes the wheel and the Space key to the canvas, so it can pan and zoom over frames
  // while the sections stay interactive.
  const onCanvas = params.get("canvas") === "1"
  React.useEffect(() => {
    if (!onCanvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      window.parent.postMessage(
        { type: "qd-wheel", key, dx: e.deltaX, dy: e.deltaY, zoom: e.ctrlKey || e.metaKey, x: e.clientX, y: e.clientY },
        "*"
      )
    }
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.code === "Space") window.parent.postMessage({ type: "qd-space", key, down }, "*")
    }
    const keydown = onKey(true)
    const keyup = onKey(false)
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", keydown)
    window.addEventListener("keyup", keyup)
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("keyup", keyup)
    }
  }, [onCanvas, key])

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
      <div ref={root} data-web data-context="marketing" data-theme={pageTheme} {...styleAttrs} className="min-h-svh bg-background text-foreground">
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

  // A pattern on its own, for the Patterns tab: a background behind an empty section, or a surface in three cards.
  const previewId = params.get("pattern-preview")
  if (previewId) {
    const def = getPattern(previewId)
    return (
      <div ref={root} data-web data-context="marketing" data-theme={theme} {...styleAttrs} className="bg-background text-foreground">
        {def?.kind === "surface" ? (
          <Section cardPattern={previewId} spacing="compact" innerClassName="grid gap-6 md:grid-cols-3">
            {["Plate", "Plate", "Plate"].map((label, i) => (
              <Plate key={i} className="flex h-48 items-end rounded-xl p-6 font-mono text-xs text-muted-foreground uppercase">
                {def.name}
              </Plate>
            ))}
          </Section>
        ) : (
          <Section pattern={[previewId]} innerClassName="grid min-h-80 place-items-center">
            <p className="font-mono text-xs text-muted-foreground uppercase">{def?.name ?? previewId}</p>
          </Section>
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
    <div
      ref={root}
      data-web
      data-context="marketing"
      data-theme={theme}
      {...styleAttrs}
      className="bg-background text-foreground"
      style={{ minHeight: min || undefined }}
    >
      <RenderBlock block={block} />
    </div>
  )
}
