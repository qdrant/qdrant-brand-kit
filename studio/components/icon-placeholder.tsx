import * as Lucide from "lucide-react"
import type { LucideProps } from "lucide-react"

// shadcn's example demos name an icon for each library they support. Qdrant uses Lucide only
// (brand-assets/icons), so this renders the Lucide one and ignores the others.
type IconPlaceholderProps = LucideProps & {
  lucide: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
}

const icons = Lucide as unknown as Record<string, React.ComponentType<LucideProps>>

function IconPlaceholder({ lucide, ...rest }: IconPlaceholderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tabler, hugeicons, phosphor, remixicon, ...props } = rest
  const Icon = icons[lucide]
  return Icon ? <Icon {...props} /> : null
}

export { IconPlaceholder }
