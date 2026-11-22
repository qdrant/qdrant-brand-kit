import { icons as lucide, type LucideIcon } from "lucide-react"

// Lucide icons by name (PascalCase, as on lucide.dev: "Database", "ShieldCheck"), for content kept as data
// (web/content) and edited in the page builder. Any Lucide icon works; never an icon that isn't Lucide.
export const icons = lucide as Record<string, LucideIcon>

export function Icon({ name, className }: { name?: string; className?: string }) {
  const Component = name ? icons[name] : undefined
  return Component ? <Component className={className} aria-hidden /> : null
}
