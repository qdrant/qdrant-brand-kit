"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// A node (design lead, 2026-11-22): the small hexagon where the website's lines meet, and the mark before a kicker, a step
// or a tab. It stands like the logo's brandmark, a point at the top and the bottom, 7 by 8px. Hollow by default;
// `solid` fills it with the page's background so a line under it stops at its edge; `active` fills it with indigo.
// Only a kicker's node blinks (`blink`, design lead, 2026-11-24), like a live readout (the Space page's telemetry
// mark): on, then dim, every 2s, each one at its own offset so they never flash together; every other node is still.
// Its colors and the blink are in styles/web.css (.web-hex).
export function Node({
  solid,
  active,
  blink,
  filled,
  className,
}: {
  solid?: boolean
  active?: boolean
  blink?: boolean
  // A fill in the node color with no outline, like a kicker's node (design lead, 2026-11-24).
  filled?: boolean
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
      style={blink ? ({ "--web-node-delay": `${delay}s` } as React.CSSProperties) : undefined}
      className={cn("web-hex block h-2 w-[7px] shrink-0 overflow-visible", solid && "web-hex-solid", active && "web-hex-active", blink && "web-hex-blink", filled && "web-hex-filled", className)}
    >
      <polygon points={filled ? "3.5,0 7,2 7,6 3.5,8 0,6 0,2" : "3.5,0.5 6.53,2.25 6.53,5.75 3.5,7.5 0.47,5.75 0.47,2.25"} />
    </svg>
  )
}

// Where a seam meets the rails, at the outer edges of a section (design lead, 2026-11-24): the corners the two lines
// make are filled with curves in the lines' own color, so the lines widen into a four-point star where they cross.
// Each corner is its own shape, drawn beside the 1px lines and never over them (the lines are translucent, so an
// overlap would read darker), with its curve tangent to both lines, so the points are sharp. 11 by 11px, centered on
// the crossing; the lines run through x and y 5 to 6. The upper or lower pair is left out where its line stops
// (styles/web.css), so a line that ends at the seam gets only the corners it has.
export function Junction({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 11 11" className={cn("web-star block size-[11px] shrink-0 overflow-visible", className)}>
      <g className="web-star-up">
        <path d="M5 0Q4.4 4.4 0 5H5Z" />
        <path d="M6 0Q6.6 4.4 11 5H6Z" />
      </g>
      <g className="web-star-down">
        <path d="M5 11Q4.4 6.6 0 6H5Z" />
        <path d="M6 11Q6.6 6.6 11 6H6Z" />
      </g>
    </svg>
  )
}
