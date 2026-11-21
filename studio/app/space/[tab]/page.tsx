import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"
import { type } from "@qdrant/web/lib/type"

import { spaceScenes } from "@/components/space"
import { SAMPLE, SpaceSections } from "@/components/space/sections"
import { spaceOptions, spaceTabs, type SpaceOption } from "@/lib/space"

import "../space.css"
import "@/components/space/backgrounds/backgrounds.css"
import "@/components/space/signatures/signatures.css"
import "@/components/space/surfaces/surfaces.css"
import "@/components/space/shaders/shaders.css"

export const metadata = { title: "Space · Qdrant Studio" }

export function generateStaticParams() {
  return spaceTabs.map(({ id }) => ({ tab: id }))
}

// The space theme (Step 9): options for section backgrounds, signature visuals and card surfaces, built on
// the palette and checked in dark and light. Explorations to compare, not decisions (lib/space.ts).
export default async function SpaceTab({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params
  const current = spaceTabs.find(({ id }) => id === tab)
  if (!current) notFound()
  const options = spaceOptions.filter((o) => o.tab === current.id)

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Space</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{current.intro}</p>
      </header>

      <nav aria-label="Space" className="flex flex-wrap items-center gap-1">
        {spaceTabs.map(({ id, label }) => (
          <Link
            key={id}
            href={`/space/${id}`}
            aria-current={id === current.id ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm hover:bg-muted",
              id === "sections" && "ml-3",
              id === current.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {label}{" "}
            {id !== "sections" && (
              <span className="font-mono text-xs text-muted-foreground">
                {spaceOptions.filter((o) => o.tab === id).length}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {current.id === "sections" ? (
        <SpaceSections />
      ) : (
        <div className="grid gap-x-8 gap-y-12 xl:grid-cols-2">
          {options.map((option, i) => (
            <Option key={option.id} option={option} number={`${CODES[option.tab]}-${String(i + 1).padStart(2, "0")}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// A short code per option, to point at one when choosing ("SH-07").
const CODES: Record<SpaceOption["tab"], string> = {
  backgrounds: "BG",
  signatures: "SG",
  surfaces: "SF",
  shaders: "SH",
}

function Option({ option, number }: { option: SpaceOption; number: string }) {
  const Scene = spaceScenes[option.id]
  const backdrop = option.tab === "backgrounds" || option.tab === "shaders"
  return (
    <article className="flex flex-col gap-4">
      <div
        data-theme={option.darkOnly ? "dark" : undefined}
        className={cn(
          "space-scene relative isolate overflow-hidden rounded-lg border",
          backdrop && "h-[400px]",
          option.tab === "signatures" && "h-[420px]",
          option.tab === "surfaces" && "grid h-[440px] place-items-center p-8"
        )}
      >
        {option.backdrop && (
          <div aria-hidden className="sp-backdrop">
            <div className="sp-stars" />
          </div>
        )}
        <Scene />
        {backdrop && <Copy />}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-xs text-muted-foreground">{number}</span>
          <h2 className="text-base font-semibold">{option.name}</h2>
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {[option.tech, option.motion, option.darkOnly && "Dark only"].filter(Boolean).join(" · ")}
          </span>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">{option.idea}</p>
        <p className="text-xs text-muted-foreground">From the Brand Direction: {option.source}</p>
      </div>
    </article>
  )
}

// Where a section's copy would sit, to judge each background with content on it.
function Copy() {
  return (
    <div className="relative flex h-full max-w-sm flex-col justify-center gap-6 p-10">
      <div className="flex flex-col gap-3">
        <span className={type.kicker}>Kicker</span>
        <h3 className={type.h5}>{SAMPLE}</h3>
      </div>
      <div>
        <Button size="lg">Primary</Button>
      </div>
    </div>
  )
}
