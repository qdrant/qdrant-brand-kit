import { surfaces } from "@/lib/color"

// The background group's extras on the Color page: the four surfaces stacked as a layout would use them, and the
// MUI paper-elevation levels they replace.

const label = "font-mono text-[11px] text-(--sem-text-secondary)"

// A card on the base, a menu floating over it, a chip and a selected item on highlight. It sits in a themed frame
// that is already background/default.
export function SurfaceStack() {
  return (
    <div className="relative flex min-h-[260px] flex-col gap-4">
      <span className={label}>background/default</span>
      <div className="flex w-[68%] flex-col gap-3 rounded-md border border-(--sem-border-subtle) bg-(--sem-background-raised) p-5 light:shadow-sm">
        <span className={label}>background/raised</span>
        <h3 className="text-lg font-semibold">Card title</h3>
        <p className="text-sm text-(--sem-text-secondary)">
          A card on the base. In light it&apos;s white on neutral-25, so its border does the separating.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-(--sem-background-highlight) px-3 py-1 text-xs">background/highlight</span>
          <span className="rounded-full border border-(--sem-border-subtle) px-3 py-1 text-xs text-(--sem-text-secondary)">
            Chip
          </span>
        </div>
      </div>
      <div className="absolute top-20 right-0 flex w-[38%] flex-col gap-0.5 rounded-md border border-(--sem-border-subtle) bg-(--sem-background-overlay) p-1.5 shadow-lg">
        <span className={`${label} px-2 py-1`}>background/overlay</span>
        <span className="rounded-sm px-2 py-1.5 text-sm">Menu item</span>
        <span className="rounded-sm bg-(--sem-background-highlight) px-2 py-1.5 text-sm">Selected item</span>
        <span className="rounded-sm px-2 py-1.5 text-sm">Menu item</span>
      </div>
    </div>
  )
}

// MUI's paper elevation in the product's Figma palette (read 2026-11-19): level 0 is the base, and in light every
// level above 0 is white. In dark, the levels that aren't on the neutral ramp are hex values.
const paperDark = [
  "neutral-950",
  "neutral-925",
  "neutral-900",
  "#171E29",
  "#19212C",
  "#1B232F",
  "#1C2531",
  "#1E2734",
  "neutral-850",
  "#202936",
  "#212B38",
  "#222C39",
  "#232D3A",
  "#242E3B",
  "#262E3C",
  "#272F3D",
  "#27303E",
  "#28313F",
  "#29313F",
  "#2A3240",
  "#2A3341",
  "#2B3341",
  "#2B3442",
  "#2C3442",
  "neutral-800",
]

const paperElevation = paperDark.map((dark, i) => ({ light: i === 0 ? "neutral-25" : "neutral-0", dark }))

const valueCss = (value: string) => (value.startsWith("#") ? value : `var(--qd-color-${value})`)

export function PaperElevation() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">What they replace</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The 25 paper-elevation levels of MUI&apos;s palette. In dark, the four surfaces are levels 0, 1, 8 and 24.
          In light every level above 0 is white, and highlight isn&apos;t one of them.
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
                <div key={i} className="flex flex-col gap-1">
                  <span
                    title={`paper-elevation-${i}: ${level[mode]}`}
                    className="h-10 rounded-sm border"
                    style={{ background: valueCss(level[mode]) }}
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
  )
}
