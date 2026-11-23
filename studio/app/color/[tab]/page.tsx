import Link from "next/link"
import { notFound } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

import { ColorAssets } from "@/components/color/assets"
import { GroupTab } from "@/components/color/group-tab"
import { PaletteTab } from "@/components/color/palette"
import { SemanticWorkbench } from "@/components/color/semantic-workbench"
import { colorTabs, semanticGroups } from "@/lib/color"
import { readPrimitives, readRoles } from "@/lib/color-primitives"

export const metadata = { title: "Color · Qdrant Studio" }

export function generateStaticParams() {
  return colorTabs.map(({ id }) => ({ tab: id }))
}

// The color palette and its rules, to work on in one place (Juan, 2026-11-19): the palette, one tab per group of
// Figma's Color collection with how to use it (2026-11-21), and assets that follow the semantic tokens (lib/color.ts).
export default async function ColorTab({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params
  const current = colorTabs.find(({ id }) => id === tab)
  if (!current) notFound()
  const primitives = readPrimitives()
  const group = semanticGroups.find(({ id }) => id === current.id)

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Color</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{current.intro}</p>
      </header>

      <nav aria-label="Color" className="flex flex-wrap items-center gap-1">
        {colorTabs.map(({ id, label }) => (
          <Link
            key={id}
            href={`/color/${id}`}
            aria-current={id === current.id ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm hover:bg-muted",
              id === current.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {current.id === "palette" && <PaletteTab primitives={primitives} />}
      {group && <GroupTab group={group.id} primitives={primitives} roles={readRoles()} />}
      {current.id === "assets" && (
        <SemanticWorkbench primitives={primitives}>
          <ColorAssets />
        </SemanticWorkbench>
      )}
    </div>
  )
}
