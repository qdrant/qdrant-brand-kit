import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// A page section (primitives/spacing, "Web page layout"): the page background, 80px of vertical padding on
// phones and 120px from lg, and the 1110px content width. `theme` switches the section to light or dark.
export function Section({
  theme,
  className,
  innerClassName,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  theme?: "light" | "dark"
  innerClassName?: string
}) {
  return (
    <section
      data-theme={theme}
      className={cn(
        "relative overflow-hidden bg-background px-6 py-(--qd-layout-section-padding-min) text-foreground lg:py-(--qd-layout-section-padding-max)",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative mx-auto w-full max-w-(--qd-layout-content-width)",
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}
