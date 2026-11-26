"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Hand, Maximize, Minus, MousePointer2, Plus } from "lucide-react"


import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"
import { sectionsByCategory } from "@qdrant/web/registry"

import { defaultStyle, styleQuery, styleSwitches, type Style } from "./blocks"
import { frameSrc, useFrameHeight, useFrameKey } from "./frame-view"

type Mode = "dark" | "light" | "both"

// One variant at 1440px, as on a Figma page: a label above, the frame below, as tall as its content.
function CanvasFrame({
  section,
  variant,
  label,
  theme,
  interact,
  query,
}: {
  section: string
  variant: string
  label: string
  theme: "dark" | "light"
  interact: boolean
  query: Record<string, string>
}) {
  const key = useFrameKey()
  const height = useFrameHeight(key, 700)
  return (
    <figure className="flex w-[1440px] shrink-0 flex-col gap-4">
      <figcaption className="flex items-baseline gap-4 text-[28px] text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-[22px] uppercase">{theme}</span>
      </figcaption>
      <iframe
        title={`${label} ${theme}`}
        data-frame-key={key}
        src={frameSrc(section, variant, theme, key, { canvas: "1", ...query })}
        loading="lazy"
        scrolling="no"
        className={cn("w-[1440px] rounded-md border-0 shadow-[0_0_0_2px_var(--border)]", !interact && "pointer-events-none")}
        style={{ height }}
      />
    </figure>
  )
}

const MIN = 0.05
const MAX = 2

// The Web page's canvas (design lead, 2026-11-21): every section and variant of the library side by side, one row per
// section, like a Figma page. The sections are live: hover the navbar for its menus, click its buttons. Scroll to
// pan and Ctrl or Cmd with the wheel (or a pinch) to zoom, anywhere, frames included (they pass the wheel on).
// Drag an empty area, or hold Space and drag, to pan; the hand tool makes every drag pan.
export function WebCanvas() {
  const groups = sectionsByCategory()
  const viewport = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const [view, setView] = React.useState({ x: 48, y: 48, z: 0.25 })
  // The frames follow the studio's theme (the moon and sun in the top menu). Picking Dark, Light or Both here
  // holds until the studio's theme changes again.
  const { resolvedTheme } = useTheme()
  const studioTheme: "dark" | "light" = resolvedTheme === "light" ? "light" : "dark"
  const [override, setOverride] = React.useState<{ mode: Mode; under: string } | null>(null)
  const mode: Mode = override && override.under === studioTheme ? override.mode : studioTheme
  const setMode = (m: Mode) => setOverride({ mode: m, under: studioTheme })
  const [interact, setInteract] = React.useState(true)
  const [space, setSpace] = React.useState(false)
  const [style, setStyle] = React.useState<Style>(defaultStyle)
  const panning = !interact || space
  const drag = React.useRef<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const zoomAt = React.useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const z = Math.min(MAX, Math.max(MIN, v.z * factor))
      const k = z / v.z
      return { z, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
    })
  }, [])

  const wheel = React.useCallback(
    (dx: number, dy: number, zoom: boolean, clientX: number, clientY: number) => {
      const el = viewport.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (zoom) zoomAt(Math.exp(-dy * 0.01), clientX - r.left, clientY - r.top)
      else setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }))
    },
    [zoomAt]
  )

  React.useEffect(() => {
    const el = viewport.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheel(e.deltaX, e.deltaY, e.ctrlKey || e.metaKey, e.clientX, e.clientY)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [wheel])

  // The wheel and Space from inside frames, in the frame's own coordinates.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "qd-space") setSpace(Boolean(e.data.down))
      if (e.data?.type !== "qd-wheel") return
      const frame = document.querySelector<HTMLIFrameElement>(`iframe[data-frame-key="${e.data.key}"]`)
      if (!frame) return
      const r = frame.getBoundingClientRect()
      const k = r.width / frame.offsetWidth
      wheel(e.data.dx, e.data.dy, e.data.zoom, r.left + e.data.x * k, r.top + e.data.y * k)
    }
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        setSpace(true)
      }
    }
    const up = (e: KeyboardEvent) => e.code === "Space" && setSpace(false)
    window.addEventListener("message", onMessage)
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("message", onMessage)
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [wheel])

  const fit = () => {
    const el = viewport.current
    const c = content.current
    if (!el || !c) return
    const z = Math.min(MAX, Math.max(MIN, Math.min(el.clientWidth / c.scrollWidth, el.clientHeight / c.scrollHeight) * 0.95))
    setView({ z, x: (el.clientWidth - c.scrollWidth * z) / 2, y: 32 })
  }

  const center = () => {
    const el = viewport.current
    return el ? [el.clientWidth / 2, el.clientHeight / 2] : [0, 0]
  }

  const themes: ("dark" | "light")[] = mode === "both" ? ["dark", "light"] : [mode]

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={viewport}
        className={cn(
          "absolute inset-0 touch-none overflow-hidden bg-muted/30 [background-image:radial-gradient(var(--border)_1px,transparent_1px)]",
          dragging ? "cursor-grabbing" : panning ? "cursor-grab" : "cursor-default"
        )}
        style={{ backgroundSize: `${24 * view.z}px ${24 * view.z}px`, backgroundPosition: `${view.x}px ${view.y}px` }}
        onPointerDown={(e) => {
          if (!panning && (e.target as HTMLElement).tagName === "IFRAME") return
          drag.current = { x: e.clientX, y: e.clientY }
          setDragging(true)
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const dx = e.clientX - drag.current.x
          const dy = e.clientY - drag.current.y
          drag.current = { x: e.clientX, y: e.clientY }
          setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
        }}
        onPointerUp={() => {
          drag.current = null
          setDragging(false)
        }}
      >
        <div
          ref={content}
          className="absolute top-0 left-0 flex w-max origin-top-left flex-col gap-40 p-10"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}
        >
          {groups.map((g) => (
            <div key={g.id} className="flex flex-col gap-24">
              <p className="font-mono text-[40px] tracking-wider text-muted-foreground uppercase">{g.label}</p>
              {g.sections.map((s) => (
                <div key={s.id} className="flex flex-col gap-10">
                  <h2 className="text-[56px] font-semibold">{s.name}</h2>
                  <div className="flex items-start gap-24">
                    {s.variants.flatMap((v) =>
                      themes.map((t) => (
                        <CanvasFrame
                          key={`${v.id}-${t}`}
                          section={s.id}
                          variant={v.id}
                          label={v.name}
                          theme={t}
                          interact={!panning}
                          query={styleQuery(style)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border bg-popover p-1 shadow-lg">
        <Button
          variant={interact ? "ghost" : "secondary"}
          size="icon-sm"
          aria-label="Pan"
          title="Pan: drag anywhere"
          onClick={() => setInteract(false)}
        >
          <Hand />
        </Button>
        <Button
          variant={interact ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label="Interact"
          title="Interact: use the sections (menus, buttons)"
          onClick={() => setInteract(true)}
        >
          <MousePointer2 />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        {(["dark", "light", "both"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMode(m)}
            className="capitalize"
          >
            {m}
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        {styleSwitches.map((sw) => (
          <Button
            key={sw.key}
            variant={style[sw.key] ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={style[sw.key]}
            title={sw.title}
            onClick={() => setStyle((s) => ({ ...s, [sw.key]: !s[sw.key] }))}
          >
            {sw.label}
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.25, ...(center() as [number, number]))}>
          <Minus />
        </Button>
        <span className="w-12 text-center font-mono text-xs">{Math.round(view.z * 100)}%</span>
        <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => zoomAt(1.25, ...(center() as [number, number]))}>
          <Plus />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Fit everything" title="Fit everything" onClick={fit}>
          <Maximize />
        </Button>
      </div>
    </div>
  )
}
