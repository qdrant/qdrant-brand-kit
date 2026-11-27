import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// The box a canvas diagram draws in (2026-11-26, the home page): its own width and shape, so the plate
// and tray around it hug it like any visual, narrower on phones. The scene's background is see-through, so the plate's
// material shows behind it, as with the zone globe.
export function DiagramFrame({
  width = 552,
  aspect = "4 / 3",
  className,
  children,
}: {
  width?: number
  aspect?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-diagram
      className={cn(
        "relative max-w-full [--web-scene-bg:transparent]",
        className
      )}
      style={{ width, aspectRatio: aspect }}
    >
      {children}
    </div>
  )
}
