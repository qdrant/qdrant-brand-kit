import { surfaces, type Primitives } from "@/lib/color"
import { figmaValueCss, paperElevation } from "@/lib/color-figma"

const modes = ["light", "dark"] as const

// How to use the four surfaces (Juan, 2026-11-19).
const rules = [
  "Start every layout on default, then step up one surface for each layer that sits on top. Don't skip straight from default to highlight for a card.",
  "In dark mode, each surface is a little lighter than the one below, which is how depth reads on dark backgrounds. In light mode, raised and overlay are both white, so add a border or shadow to separate them.",
  "Keep highlight for emphasis, not as a general card color, so it keeps its meaning.",
  "Use the surfaces for layout and containers. Illustrations, gradients and artwork use the color palette directly.",
  "All four switch between light and dark with the theme, and the dark values come from the Deep Space neutral ramp, so every surface stays in the same color family as the rest of the brand.",
]

export function SurfacesTab({ primitives }: { primitives: Primitives }) {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Brand background surfaces</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40 font-mono text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-normal">Surface</th>
                <th className="px-4 py-2 font-normal">Use it for</th>
                <th className="px-4 py-2 font-normal">Light</th>
                <th className="px-4 py-2 font-normal">Dark</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {surfaces.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-mono text-xs">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.use}</td>
                  {modes.map((mode) => (
                    <td key={mode} className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <span
                          className="size-8 shrink-0 rounded-sm border"
                          style={{ background: `var(--qd-color-${s[mode]})` }}
                        />
                        <span className="flex flex-col">
                          <span className="font-mono text-xs">{s[mode]}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{primitives[s[mode]]}</span>
                        </span>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The repo already has these four as its background roles (primitives/colors), and Figma&apos;s palette has
          them next to paper elevation. What&apos;s new is the rule below, and using only these four in brand and
          marketing work.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">How to use them</h2>
        <ul className="flex max-w-3xl list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {modes.map((mode) => (
          <SurfaceStack key={mode} mode={mode} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">What they replace</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            The 25 paper-elevation levels in Figma&apos;s palette. In dark, the four surfaces are levels 0, 1, 8 and
            24. In light every level above 0 is white, and highlight isn&apos;t one of them.
          </p>
        </div>
        {(["dark", "light"] as const).map((mode) => (
          <div
            key={mode}
            data-theme={mode}
            className="flex flex-col gap-2 overflow-x-auto rounded-lg border bg-(--qd-color-background-default) p-4 text-foreground"
          >
            <span className="font-mono text-[11px] text-muted-foreground uppercase">{mode}</span>
            <div className="grid min-w-[880px] grid-cols-[repeat(25,minmax(0,1fr))] gap-1">
              {paperElevation.map((level, i) => {
                const here = surfaces
                  .filter((s) => paperElevation.findIndex((l) => l[mode] === s[mode]) === i)
                  .map((s) => s.id)
                  .join(", ")
                return (
                  <div key={level.name} className="flex flex-col gap-1">
                    <span
                      title={`${level.name}: ${level[mode]}`}
                      className="h-10 rounded-sm border"
                      style={{ background: figmaValueCss(level[mode]) }}
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">{i}</span>
                    {here && <span className="font-mono text-[10px] leading-tight">{here}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// The four surfaces stacked as a layout would use them: a card on the base, a menu floating over it, a chip and
// a selected item on highlight.
function SurfaceStack({ mode }: { mode: "light" | "dark" }) {
  const label = "font-mono text-[11px] text-muted-foreground"
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-xs text-muted-foreground uppercase">{mode}</figcaption>
      <div
        data-theme={mode}
        className="relative flex min-h-[300px] flex-col gap-4 rounded-lg border bg-(--qd-color-background-default) p-6 text-foreground"
      >
        <span className={label}>background/default</span>
        <div className="flex w-[68%] flex-col gap-3 rounded-md border bg-(--qd-color-background-raised) p-5 light:shadow-sm">
          <span className={label}>background/raised</span>
          <h3 className="text-lg font-semibold">Card title</h3>
          <p className="text-sm text-muted-foreground">
            A card on the base. In light it&apos;s white on neutral-25, so its border does the separating.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-(--qd-color-background-highlight) px-3 py-1 text-xs">
              background/highlight
            </span>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">Chip</span>
          </div>
        </div>
        <div className="absolute top-24 right-6 flex w-[38%] flex-col gap-0.5 rounded-md border bg-(--qd-color-background-overlay) p-1.5 shadow-lg">
          <span className={`${label} px-2 py-1`}>background/overlay</span>
          <span className="rounded-sm px-2 py-1.5 text-sm">Menu item</span>
          <span className="rounded-sm bg-(--qd-color-background-highlight) px-2 py-1.5 text-sm">Selected item</span>
          <span className="rounded-sm px-2 py-1.5 text-sm">Menu item</span>
        </div>
      </div>
    </figure>
  )
}
