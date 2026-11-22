"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"
import { getSection } from "@qdrant/web/registry"

// The frame's URL for one section variant.
export function frameSrc(section: string, variant: string, theme: "dark" | "light", key: string) {
  const q = new URLSearchParams({ section, variant, theme, key })
  const min = getSection(section)?.variants.find((v) => v.id === variant)?.frameMinHeight
  if (min) q.set("min", String(min))
  return `/web/frame?${q}`
}

// Listens for a frame's height reports (components/web/frame.tsx).
export function useFrameHeight(key: string, initial = 600) {
  const [height, setHeight] = React.useState(initial)
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "qd-frame-height" && e.data.key === key) setHeight(Math.max(40, e.data.height))
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [key])
  return height
}

// A key that matches between the server and the browser, so each frame's height reports reach the right frame.
export function useFrameKey() {
  return `f${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
}

// A section in an iframe at a real viewport width (1440 for desktop, 390 for a phone), scaled down to fit the
// space it's given, and as tall as its content.
export function FrameView({
  section,
  variant,
  theme,
  width = 1440,
  className,
}: {
  section: string
  variant: string
  theme: "dark" | "light"
  width?: number
  className?: string
}) {
  const key = useFrameKey()
  const height = useFrameHeight(key)
  const box = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  React.useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={box} className={cn("w-full min-w-0", className)}>
      <div
        className="overflow-hidden rounded-lg border border-border"
        style={{ height: height * scale, width: width * scale, maxWidth: "100%" }}
      >
        <iframe
          title={`${section} ${variant} ${theme}`}
          src={frameSrc(section, variant, theme, key)}
          loading="lazy"
          scrolling="no"
          className="origin-top-left border-0"
          style={{ width, height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  )
}
