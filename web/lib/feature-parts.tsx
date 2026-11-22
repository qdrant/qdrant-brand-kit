import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { type } from "./type"

// The optional parts of a feature (content/sections.ts), shared by the sections that show features.

// Who or what a feature applies to, above its title, in mono capitals.
export function FeatureTag({ tag, className }: { tag?: string; className?: string }) {
  if (!tag) return null
  return (
    <Badge variant="outline" className={cn("font-mono uppercase", className)}>
      {tag}
    </Badge>
  )
}

// Lines after a feature's text, each on a row with a hairline between them, with an optional bold label.
export function FeaturePoints({ points, className }: { points?: Feature["points"]; className?: string }) {
  if (!points?.length) return null
  return (
    <div className={cn("flex flex-col", className)}>
      {points.map((p, i) => (
        <p key={p.label ?? p.text} className={cn(type.body, "py-4 first:pt-0 last:pb-0", i > 0 && "web-rule")}>
          {p.label && <strong className="font-semibold text-foreground">{p.label}</strong>} {p.text}
        </p>
      ))}
    </div>
  )
}
