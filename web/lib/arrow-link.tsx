import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// A text link with a chevron after it, in the link color (indigo, web.css) ("Read the Docs >"). A link, not a
// call-to-action button, so it may carry the icon.
//
// The chevron matches the text (design lead, 2026-11-24): it's 1em, so it follows the link's size, and its stroke is
// 2.75 on Lucide's 24-unit grid, the 0.116em stem of Mona Sans Medium, so it's as heavy as the letters. On hover and
// keyboard focus it turns into an arrow: the chevron slides right and a shaft fades in behind it (web.css,
// .web-arrow). Both shapes are Lucide's own, chevron-right (m9 18 6-6-6-6) and arrow-right's shaft (M5 12h14).
export function ArrowLink({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "web-link web-arrow-link inline-flex items-center gap-1 text-(length:--qd-font-size-16) leading-(--qd-line-height-150) font-medium underline-offset-4 hover:underline",
        className
      )}
      {...props}
    >
      {children}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="web-arrow size-[1em] shrink-0 overflow-visible"
      >
        <path className="web-arrow-shaft" d="M6 12h11.5" />
        <path className="web-arrow-head" d="m9 18 6-6-6-6" />
      </svg>
    </a>
  )
}
