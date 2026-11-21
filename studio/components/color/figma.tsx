import { cn } from "@qdrant/design-system/lib/utils"

import type { Primitives } from "@/lib/color"
import { figmaValueCss, figmaGroups, figmaTokens, repoRoleOf, type FigmaValue } from "@/lib/color-figma"
import { primitiveRamps } from "@/lib/color-primitives"

type Roles = Record<string, { light: string; dark: string }>

// Figma's palette collection today, every variable in both modes, and the repo's role where there is one.
export function FigmaTab({ primitives, roles }: { primitives: Primitives; roles: Roles }) {
  const compared = figmaTokens.filter((t) => repoRoleOf[t.name])
  const differ = compared.filter((t) => !matchesRepo(t.name, t.light, t.dark, roles))

  return (
    <div className="flex flex-col gap-12">
      <p className="max-w-3xl text-sm text-muted-foreground">
        {figmaTokens.length} variables in {figmaGroups.length} groups, read from Figma on 2026-11-19.{" "}
        {compared.length} of them have a matching role in the repo (primitives/colors), and {differ.length} of those
        point to different steps:{differ.map((t) => t.name).join(", ")}. A value with a percentage is the primitive at that
        opacity; the paper-elevation steps that aren&apos;t on the neutral ramp are hex values in Figma.
      </p>

      {figmaGroups.map((group) => {
        const tokens = figmaTokens.filter((t) => t.name.split("/")[0] === group)
        return (
          <section key={group} className="flex flex-col gap-3">
            <h2 className="flex items-baseline gap-2 text-base font-semibold">
              {group}
              <span className="font-mono text-xs font-normal text-muted-foreground">{tokens.length}</span>
            </h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b bg-muted/40 font-mono text-[11px] text-muted-foreground uppercase">
                  <tr>
                    <th className="w-[34%] px-4 py-2 font-normal">Variable</th>
                    <th className="w-[22%] px-4 py-2 font-normal">Light</th>
                    <th className="w-[22%] px-4 py-2 font-normal">Dark</th>
                    <th className="px-4 py-2 font-normal">Repo role</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tokens.map((t) => (
                    <tr key={t.name}>
                      <td className="px-4 py-2 font-mono text-xs">{t.name}</td>
                      <td className="px-4 py-2">
                        <Value value={t.light} mode="light" primitives={primitives} />
                      </td>
                      <td className="px-4 py-2">
                        <Value value={t.dark} mode="dark" primitives={primitives} />
                      </td>
                      <td className="px-4 py-2">
                        <RepoRole name={t.name} light={t.light} dark={t.dark} roles={roles} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Primitives</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            The ramps every Figma value and palette step comes from (primitives/colors/colors.css, the Colors
            collection in Figma).
          </p>
        </div>
        {primitiveRamps(primitives).map(({ family, steps }) => (
          <div key={family} className="grid gap-2 md:grid-cols-[96px_minmax(0,1fr)]">
            <span className="pt-2 font-mono text-xs text-muted-foreground">{family}</span>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5">
              {steps.map(({ step, hex }) => (
                <div key={step} className="flex flex-col gap-1">
                  <span
                    className="h-10 rounded-sm border"
                    style={{ background: `var(--qd-color-${family}-${step})` }}
                  />
                  <span className="font-mono text-[11px]">{step}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// One value: a swatch on that mode's background (so see-through values read as they will), its source and hex.
function Value({ value, mode, primitives }: { value: FigmaValue; mode: "light" | "dark"; primitives: Primitives }) {
  const [name, opacity] = value.split("@")
  const raw = value.startsWith("#")
  return (
    <div className="flex items-center gap-3">
      <span
        data-theme={mode}
        className="size-8 shrink-0 overflow-hidden rounded-sm border bg-(--qd-color-background-default)"
      >
        <span className="block size-full" style={{ background: figmaValueCss(value) }} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-mono text-xs">
          {raw ? "Not on the ramp" : name}
          {opacity && <span className="text-muted-foreground"> at {opacity}%</span>}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{raw ? value : primitives[name]}</span>
      </span>
    </div>
  )
}

function stripOpacity(value: string) {
  return value.split("@")[0]
}

function matchesRepo(name: string, light: string, dark: string, roles: Roles) {
  const [l, d] = repoRoleOf[name]
  return (
    !light.includes("@") &&
    !dark.includes("@") &&
    roles[l]?.light === stripOpacity(light) &&
    roles[d]?.dark === stripOpacity(dark)
  )
}

function RepoRole({ name, light, dark, roles }: { name: string; light: string; dark: string; roles: Roles }) {
  const role = repoRoleOf[name]
  if (!role) return <span className="text-xs text-muted-foreground">None</span>
  const [l, d] = role
  const same = matchesRepo(name, light, dark, roles)
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase",
          same ? "text-muted-foreground" : "border-foreground/40 text-foreground"
        )}
      >
        {same ? "Same" : "Differs"}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-mono text-xs">{l === d ? l : `${l} / ${d}`}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {roles[l]?.light} · {roles[d]?.dark}
        </span>
      </span>
    </div>
  )
}
