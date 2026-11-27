import { cn } from "@qdrant/design-system/lib/utils"

import { Icon } from "./icon"

// The color families icons may use (web/styles/web.css, Tones), never amaranth. Indigo is the default; cycle
// through them for a set of features of equal weight, or give each item its own.
export const tones = ["indigo", "teal", "blue", "purple", "cyan", "green", "orange"] as const
export type Tone = (typeof tones)[number]

export const toneAt = (i: number): Tone => tones[i % tones.length] ?? "indigo"

const sizes = {
  sm: "size-8 rounded-md [&_svg]:size-4",
  md: "size-10 rounded-lg [&_svg]:size-5",
  lg: "size-12 rounded-xl [&_svg]:size-6",
}

// A Lucide icon on a small tile tinted with its color family, the icon in a solid color of the family.
export function IconTile({
  name,
  tone = "indigo",
  size = "md",
  className,
}: {
  name?: string
  tone?: Tone
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span className={cn("web-icon-tile grid shrink-0 place-items-center", `web-tone-${tone}`, sizes[size], className)}>
      <Icon name={name} />
    </span>
  )
}
