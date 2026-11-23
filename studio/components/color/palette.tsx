import type { CSSProperties } from "react"

import {
  paletteVar,
  contrast,
  families,
  onSolid,
  scales,
  stepGroups,
  stepHex,
  steps,
  type FamilyId,
  type Primitives,
} from "@/lib/color"

const modes = ["light", "dark"] as const
type Mode = (typeof modes)[number]

// The background each row sits on: background/default in that theme.
const ground: Record<Mode, string> = { light: "neutral-25", dark: "neutral-950" }

const grid = "grid grid-cols-[56px_repeat(10,minmax(0,1fr))] gap-2"

// The palette: every color as ten steps, in light and in dark (lib/color.ts).
export function PaletteTab({ primitives }: { primitives: Primitives }) {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stepGroups.map((g) => (
          <div key={g.group} className="flex flex-col gap-1 rounded-lg border p-4">
            <span className="font-mono text-xs text-muted-foreground">Steps {g.range}</span>
            <span className="text-sm font-semibold">{g.group}</span>
            <span className="text-sm text-muted-foreground">{g.note}</span>
          </div>
        ))}
      </section>

      <section className="flex max-w-3xl flex-col gap-2 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Built from the primitives.</span> In light, steps 1 to 10
          run down each ramp from 50 to 950. In dark they run back up: 975, the 950 for the soft and active
          backgrounds, then 900 to 400, and 200 for text (a trial: it was 100, and 200 keeps the light tints that art on dark backgrounds uses).
          Step 7, the solid, is the family&apos;s 600 in both themes, so the brand colors never change. Neutral is the
          ramp from 50 to 900, reversed in dark.
        </p>
        <p>
          <span className="font-semibold text-foreground">One new step per color.</span> A ramp has six tints
          lighter than its 600 but only four shades darker. So each color got a 975, halfway from its 950 to black like
          neutral-975 (2026-11-19), and in dark the 950 covers two steps. The semantic tokens (Assets) never point at a
          step: each one points at a primitive in each theme, so changing the palette never moves them.
        </p>
        <p>
          <span className="font-semibold text-foreground">Names.</span> The steps are numbered 1 to 10, as{" "}
          <code className="font-mono text-xs">--qd-palette-red-2</code> here and{" "}
          <code className="font-mono text-xs">palette/red/2</code> in Figma, so they never read as a primitive like
          red-200. Steps 9 and 10 show their contrast on background/default, the solid its text&apos;s contrast, and
          steps 1 to 3 step 9 on them, as a badge would.
        </p>
      </section>

      <div className="flex flex-col gap-8">
        <div className={`${grid} sticky top-12 z-10 border-b bg-background py-2`}>
          <span />
          {steps.map((s) => (
            <span key={s.step} className="flex min-w-0 flex-col">
              <span className="font-mono text-xs">{s.step}</span>
              <span className="truncate text-[11px] text-muted-foreground" title={s.job}>
                {s.job}
              </span>
            </span>
          ))}
        </div>

        {families.map((f) => (
          <section key={f.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-base font-semibold">{f.label}</h2>
              <span className="text-sm text-muted-foreground">{f.use}</span>
              <span className="font-mono text-xs text-muted-foreground">
                Text on solid: {onSolid(f.id, primitives)}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border">
              {modes.map((mode) => (
                <div
                  key={mode}
                  data-theme={mode}
                  className={`${grid} bg-(--qd-color-background-default) p-3 text-foreground`}
                >
                  <span className="self-start pt-1 font-mono text-[11px] text-muted-foreground uppercase">
                    {mode}
                  </span>
                  {scales[f.id][mode].map((primitive, i) => (
                    <Swatch
                      key={i}
                      family={f.id}
                      step={i + 1}
                      primitive={primitive}
                      mode={mode}
                      primitives={primitives}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Swatch({
  family,
  step,
  primitive,
  mode,
  primitives,
}: {
  family: FamilyId
  step: number
  primitive: string
  mode: Mode
  primitives: Primitives
}) {
  const hex = primitives[primitive] ?? "#000000"
  const textOn = onSolid(family, primitives)
  const step9 = stepHex(family, 9, mode, primitives)

  // What the swatch shows inside, and the contrast under it.
  let sample: { color: string; ratio: number } | null = null
  if (step <= 3) sample = { color: `var(${paletteVar(family, 9)})`, ratio: contrast(step9, hex) }
  if (step === 7 || step === 8)
    sample = { color: `var(--qd-color-${textOn})`, ratio: contrast(primitives[textOn], hex) }
  const onGround = step >= 9 ? contrast(hex, primitives[ground[mode]]) : null

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        title={`${family} ${step}: ${primitive}, ${hex}`}
        className="grid h-12 place-items-center rounded-md border border-transparent"
        style={{ background: `var(${paletteVar(family, step)})` } as CSSProperties}
      >
        {sample && (
          <span className="text-sm font-semibold" style={{ color: sample.color }}>
            Aa
          </span>
        )}
      </div>
      <span className="truncate font-mono text-[11px]" title={primitive}>
        {primitive.startsWith(`${family}-`) ? primitive.slice(family.length + 1) : primitive}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{hex}</span>
      {(sample || onGround) && (
        <span
          className={onGround ? "font-mono text-[10px]" : "font-mono text-[10px] text-muted-foreground"}
          style={{ color: onGround ? `var(${paletteVar(family, step)})` : undefined }}
        >
          {(onGround ?? sample!.ratio).toFixed(1)}:1
        </span>
      )}
    </div>
  )
}
