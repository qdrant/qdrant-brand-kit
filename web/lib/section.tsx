import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// What every website section accepts, so pages and the page builder can set them the same way on any section
// (Juan, 2026-11-21). theme: dark or light, or the page's when left out. surface: the background role,
// default (background/default) or raised (background/raised, a band one step up); web/styles/web.css maps the
// design system's colors to them inside the website.
export type SectionTheme = "dark" | "light"
export type SectionSurface = "default" | "raised"
export type SectionProps = {
  theme?: SectionTheme
  surface?: SectionSurface
  id?: string
  className?: string
}

const widths = {
  // The 1200px content container (primitives/spacing, "Web and landing page layout").
  content: "max-w-(--qd-layout-content-width)",
  // 800px, for FAQ, prose and centered statements.
  narrow: "max-w-(--qd-layout-narrow-content)",
  // Edge to edge, for bands and media that bleed.
  full: "max-w-none",
} as const

const spacings = {
  // 80px on phones, 120px from lg.
  default: "py-(--qd-layout-section-padding-min) lg:py-(--qd-layout-section-padding-max)",
  // 80px at every size, the least a section has: CTAs inside a page, logo strips, stats.
  compact: "py-(--qd-layout-section-padding-min)",
  // None, for the site's chrome (the announcement bar, the navbar).
  none: "",
} as const

// A page section: the theme and surface, the vertical padding, the side padding (24px on phones, 40px from md),
// the centered container, and the website's lines (web.css): the rails 24px outside the container, a seam at the top
// and a node where they meet. `lines={false}` leaves them out; `seam={false}` keeps the rails without the seam.
export function Section({
  theme,
  surface = "default",
  width = "content",
  spacing = "default",
  lines = true,
  seam = true,
  className,
  innerClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "id"> &
  SectionProps & {
    width?: keyof typeof widths
    spacing?: keyof typeof spacings
    lines?: boolean
    seam?: boolean
    innerClassName?: string
  }) {
  return (
    <section
      data-theme={theme}
      data-surface={surface === "default" ? undefined : surface}
      className={cn(
        "relative overflow-hidden bg-background px-6 text-foreground md:px-10",
        lines && seam && "web-seam",
        spacings[spacing],
        className
      )}
      {...props}
    >
      {lines && (
        <div
          aria-hidden
          className="web-rails pointer-events-none absolute inset-y-0 inset-x-0 mx-auto max-w-[calc(var(--qd-layout-content-width)+48px)] md:inset-x-4"
        >
          {seam && (
            <>
              <span className="web-node -left-1" />
              <span className="web-node -right-1" />
            </>
          )}
        </div>
      )}
      <div className={cn("relative mx-auto w-full", widths[width], innerClassName)}>{children}</div>
    </section>
  )
}
