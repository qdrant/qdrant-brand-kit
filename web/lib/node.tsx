"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// A node (Juan, 2026-11-22): the small hexagon where the website's lines meet, and the mark before a kicker, a step
// or a tab. It stands like the logo's brandmark, a point at the top and the bottom, 7 by 8px. Hollow by default;
// `solid` fills it with the page's background so a line under it stops at its edge; `active` fills it with indigo.
// Nodes blink like a live readout (the Space page's telemetry mark): on, then dim, every 2s, each one at its own
// offset so they never flash together. Its colors and the blink are in styles/web.css (.web-hex).
export function Node({
  solid,
  active,
  className,
}: {
  solid?: boolean
  active?: boolean
  className?: string
}) {
  const id = React.useId()
  // A steady offset from the node's id: the same on the server and in the browser, different for each node.
  const delay = React.useMemo(() => {
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
    return (Math.abs(h) % 8) * 0.25
  }, [id])
  return (
    <svg
      aria-hidden
      viewBox="0 0 7 8"
      style={{ "--web-node-delay": `${delay}s` } as React.CSSProperties}
      className={cn("web-hex block h-2 w-[7px] shrink-0 overflow-visible", solid && "web-hex-solid", active && "web-hex-active", className)}
    >
      <polygon points="3.5,0.5 6.53,2.25 6.53,5.75 3.5,7.5 0.47,5.75 0.47,2.25" />
    </svg>
  )
}
