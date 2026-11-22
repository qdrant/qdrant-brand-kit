"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { styleQuery } from "./blocks"
import { FrameView } from "./frame-view"

type Mode = "dark" | "light" | "both"
type Viewport = "desktop" | "phone"

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs",
            value === o.value ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// A section's variants, each in a frame, in dark, light or both, at desktop or phone width.
export function VariantsView({
  section,
  variants,
}: {
  section: string
  variants: { id: string; name: string; description: string }[]
}) {
  const [mode, setMode] = React.useState<Mode>("both")
  const [viewport, setViewport] = React.useState<Viewport>("desktop")
  const [lines, setLines] = React.useState<"on" | "off">("on")
  const [material, setMaterial] = React.useState<"on" | "off">("on")
  const [typeSet, setTypeSet] = React.useState<"trial" | "current">("trial")
  const modes: ("dark" | "light")[] = mode === "both" ? ["dark", "light"] : [mode]
  const width = viewport === "desktop" ? 1440 : 390

  return (
    <section className="flex flex-col gap-6">
      <div className="sticky top-12 z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 bg-background/90 px-2 py-2 backdrop-blur">
        <h2 className="text-lg font-semibold">Variants</h2>
        <div className="flex gap-2">
          <Toggle
            label="Color mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "both", label: "Both" },
            ]}
          />
          <Toggle
            label="Lines"
            value={lines}
            onChange={setLines}
            options={[
              { value: "on", label: "Lines" },
              { value: "off", label: "Off" },
            ]}
          />
          <Toggle
            label="Material"
            value={material}
            onChange={setMaterial}
            options={[
              { value: "on", label: "Material" },
              { value: "off", label: "Off" },
            ]}
          />
          <Toggle
            label="Type"
            value={typeSet}
            onChange={setTypeSet}
            options={[
              { value: "trial", label: "Trial type" },
              { value: "current", label: "Current" },
            ]}
          />
          <Toggle
            label="Viewport"
            value={viewport}
            onChange={setViewport}
            options={[
              { value: "desktop", label: "Desktop" },
              { value: "phone", label: "Phone" },
            ]}
          />
        </div>
      </div>
      {variants.map((v) => (
        <article key={v.id} id={v.id} className="flex min-w-0 scroll-mt-28 flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold">
              {v.name} <code className="ml-1 font-mono text-xs font-normal text-muted-foreground">{v.id}</code>
            </h3>
            <p className="text-sm text-muted-foreground">{v.description}</p>
          </div>
          <div className={cn("grid gap-4", viewport === "phone" && "grid-cols-[repeat(auto-fill,390px)]")}>
            {modes.map((m) => (
              <div key={m} className="flex min-w-0 flex-col gap-1.5">
                <span className="font-mono text-[11px] text-muted-foreground uppercase">{m}</span>
                <FrameView
                  section={section}
                  variant={v.id}
                  theme={m}
                  width={width}
                  query={styleQuery({ lines: lines === "on", material: material === "on", trialType: typeSet === "trial" })}
                />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}
