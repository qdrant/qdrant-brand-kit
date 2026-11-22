import { ImageIcon } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

// A placeholder for an image, a product screenshot or an illustration that a page will supply: a hairline frame
// with a dotted ground and a quiet label, so layouts can be reviewed before the media exists. Replace it with
// the real image on a page; never ship a placeholder.
export function MediaFrame({ label = "Image", className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
      />
      <span className="relative flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase">
        <ImageIcon className="size-4" aria-hidden />
        {label}
      </span>
    </div>
  )
}
