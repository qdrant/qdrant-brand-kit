"use client"

import { cn } from "@qdrant/design-system/lib/utils"
import { HexIcon, marks, type HexStyle } from "@qdrant/web/lib/hex-icon"
import { toneAt } from "@qdrant/web/lib/tone"

const styles: { id: HexStyle; name: string; note: string }[] = [
  { id: "halftone", name: "Halftone", note: "14 across, four sizes from the center out, largest in the middle." },
  {
    id: "tones",
    name: "Tones",
    note: "A fine grid, 22 across: solid parts in full hexagons, shaded parts in small ones, two tones in one mark.",
  },
  {
    id: "outline",
    name: "Outline",
    note: "20 across: full hexagons along each shape's edge, small ones inside, an outline with a light fill.",
  },
  {
    id: "matrix",
    name: "Matrix",
    note: "A coarse grid, 10 across: even white hexagons, a little smaller at the edges, on a gradient tile with a faint field.",
  },
]

const tile = (style: HexStyle, i: number) =>
  cn("web-icon-tile grid shrink-0 place-items-center overflow-hidden", `web-tone-${toneAt(i)}`, style === "matrix" && "web-mark-matrix")

// Every product mark in every style, large and at the menu's size (the Docs tab's Product marks page). A client
// component, since the marks are drawn in the browser.
export function ProductMarksGrid() {
  const entries = Object.entries(marks)
  return (
    <>
      {styles.map((style) => (
        <section key={style.id} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{style.name}</h2>
            <p className="text-sm text-muted-foreground">{style.note}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {entries.map(([id, mark], i) => (
              <figure key={id} className="flex flex-col items-center gap-3">
                <span className={cn(tile(style.id, i), "size-32 rounded-3xl")}>
                  <HexIcon mark={id} variant={style.id} className="size-24" />
                </span>
                <figcaption className="text-xs text-muted-foreground">{mark.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Menu size</span>
            {entries.map(([id], i) => (
              <span key={id} className={cn(tile(style.id, i), "size-12 rounded-xl")}>
                <HexIcon mark={id} variant={style.id} className="size-9" />
              </span>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
