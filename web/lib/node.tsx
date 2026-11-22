import { cn } from "@qdrant/design-system/lib/utils"

// A node (Juan, 2026-11-22): the small hexagon where the website's lines meet, and the mark before a kicker, a step
// or a tab. It stands like the logo's brandmark, a point at the top and the bottom, 7 by 8px. Hollow by default;
// `solid` fills it with the page's background so a line under it stops at its edge; `active` fills it with indigo.
// Its colors are in styles/web.css (.web-hex).
export function Node({
  solid,
  active,
  className,
}: {
  solid?: boolean
  active?: boolean
  className?: string
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 7 8"
      className={cn("web-hex block h-2 w-[7px] shrink-0 overflow-visible", solid && "web-hex-solid", active && "web-hex-active", className)}
    >
      <polygon points="3.5,0.5 6.53,2.25 6.53,5.75 3.5,7.5 0.47,5.75 0.47,2.25" />
    </svg>
  )
}
