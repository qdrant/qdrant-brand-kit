import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

// A text link with a chevron after it, in the link color (indigo, web.css) ("Read the Docs >"). A link, not a call-to-action button, so it may
// carry the icon.
export function ArrowLink({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "web-link inline-flex items-center gap-1 text-(length:--qd-font-size-16) leading-(--qd-line-height-150) font-medium underline-offset-4 hover:underline",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="size-4 shrink-0" aria-hidden />
    </a>
  )
}
