import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// A one-color image from web/assets (a social icon, a certification badge) drawn in the current text color, so
// it follows the theme: the file stays as the Figma exported it, and CSS uses it as a mask. Size it with
// `className`, in the file's own proportions, and set the color with a text-* class.
export function MonoImage({
  src,
  label,
  className,
  style,
  ...props
}: React.ComponentProps<"span"> & { src: string; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        ...style,
      }}
      {...props}
    />
  )
}
