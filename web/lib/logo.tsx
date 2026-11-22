import { cn } from "@qdrant/design-system/lib/utils"

// The Qdrant logo from brand-assets/logo, the dark-background version on dark and the light one on light, so it
// follows the section's theme. Never redraw or recolor it.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      <img src="/repo/brand-assets/logo/qdrant-logo-dark.svg" alt="Qdrant" width={135} height={36} className="h-full w-auto light:hidden" />
      <img src="/repo/brand-assets/logo/qdrant-logo-light.svg" alt="Qdrant" width={135} height={36} className="hidden h-full w-auto light:block" />
    </span>
  )
}
