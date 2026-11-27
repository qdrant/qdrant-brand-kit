"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { defaultStyle, styleQuery, styleSwitches, type Style } from "./blocks"
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
  variants: { id: string; name: string; description: string; proposal?: string }[]
}) {
  const [mode, setMode] = React.useState<Mode>("both")
  const [viewport, setViewport] = React.useState<Viewport>("desktop")
  const [style, setStyle] = React.useState<Style>(defaultStyle)
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
          <div role="group" aria-label="Style" className="flex rounded-lg border p-0.5">
            {styleSwitches.map((sw) => (
              <button
                key={sw.key}
                data-proposal={"proposal" in sw ? "" : undefined}
                type="button"
                aria-pressed={style[sw.key]}
                title={sw.title}
                onClick={() => setStyle((st) => ({ ...st, [sw.key]: !st[sw.key] }))}
                className={cn(
                  "rounded-md px-3 py-1 text-xs data-proposal:italic",
                  style[sw.key] ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {sw.label}
              </button>
            ))}
          </div>
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
              {v.proposal && (
                <span className="ml-2 rounded border border-dashed border-current px-1.5 font-mono text-[10px] font-normal text-(--qd-color-secondary) uppercase">
                  Proposal
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{v.description}</p>
            {v.proposal && <p className="text-sm text-muted-foreground italic">{v.proposal}</p>}
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
                  query={styleQuery(style)}
                />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}
