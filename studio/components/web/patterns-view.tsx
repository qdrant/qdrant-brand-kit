"use client"

import { TriangleAlertIcon } from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Plate } from "@qdrant/web/lib/plate"
import { allPatterns, type PatternDefinition } from "@qdrant/web/patterns"

import { FrameView } from "./frame-view"

// The website's patterns (web/patterns), each on its own in dark and light (Juan, 2026-11-21): approved patterns
// and the ones being explored (web/patterns/explorations, 2026-11-23), with their rule notes.

const KINDS = [
  { kind: "background", title: "Backgrounds", hint: "Behind a section's content" },
  { kind: "surface", title: "Surfaces", hint: "Inside each card of a section" },
] as const

// A surface pattern once, in one card on the website's page color, in a theme. Drawn here rather than in a frame
// (frame.tsx shows it in a row of three cards), so each pattern is seen on its own (2026-11-23). The card is
// 350 by 400, the Deploy Card's size, which the Pattern Studio looks were made for.
function SurfacePreview({ p, theme }: { p: PatternDefinition; theme: "dark" | "light" }) {
  // data-web outside and the theme inside: web.css reads "[data-theme] [data-web]" from the studio's own <html>,
  // which would turn a light preview's card dark under the studio's dark theme.
  return (
    <div data-web className="min-w-0">
      <div
        data-theme={theme}
        className="flex justify-center rounded-lg border border-border bg-background p-10 text-foreground"
      >
        <Plate
          pattern={p.id}
          className="flex h-[400px] w-[350px] max-w-full items-end rounded-xl p-8 font-mono text-xs text-muted-foreground uppercase"
        >
          {p.name}
        </Plate>
      </div>
    </div>
  )
}

// One pattern: what it is, its previews and anything that stretches a rule.
function PatternCard({ p }: { p: PatternDefinition }) {
  const exploring = p.status === "exploring"
  return (
    <article id={p.id} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{p.name}</h3>
          <code className="font-mono text-xs text-muted-foreground">{p.id}</code>
          <Badge variant={exploring ? "outline" : "secondary"}>{exploring ? "Exploring" : "Approved"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{p.description}</p>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {(["dark", "light"] as const).map((t) =>
          p.kind === "surface" ? (
            <SurfacePreview key={t} p={p} theme={t} />
          ) : (
            <FrameView key={t} section="" variant="" theme={t} query={{ "pattern-preview": p.id }} />
          )
        )}
      </div>
      {p.notes && p.notes.length > 0 && (
        <details className="rounded-lg border border-border p-4 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <TriangleAlertIcon className="size-4 text-muted-foreground" strokeWidth={1} />
            {p.notes.length === 1 ? "1 rule note" : `${p.notes.length} rule notes`}
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {p.notes.map((n) => (
              <li key={n.rule} className="flex flex-col gap-0.5">
                <span className="font-medium">{n.rule}</span>
                <span className="text-muted-foreground">{n.text}</span>
                <code className="font-mono text-xs text-muted-foreground">{n.source}</code>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

export function PatternsView() {
  const all = allPatterns()
  const approved = all.filter((p) => (p.status ?? "approved") === "approved").length

  return (
    <div className="flex flex-col gap-10 p-8">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-2xl font-semibold">Patterns</h1>
        <p className="text-sm text-muted-foreground">
          Layers for the website&apos;s space, data and vector themes: backgrounds behind a section&apos;s
          content, and surfaces inside its cards. Approved patterns are listed in{" "}
          <code className="font-mono">web/patterns/index.tsx</code> and reach the Builder. Patterns being
          explored live in <code className="font-mono">web/patterns/explorations</code> and show only here, until
          Juan says yes.
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {all.length} patterns · {approved} approved · {all.length - approved} exploring
        </p>
      </header>
      {KINDS.map(({ kind, title, hint }) => {
        const items = all.filter((p) => p.kind === kind)
        return (
          <section key={kind} className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">
                {title} <span className="font-mono text-sm font-normal text-muted-foreground">{items.length}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                None yet. Add a <code className="font-mono">kind: &quot;{kind}&quot;</code> pattern in{" "}
                <code className="font-mono">web/patterns</code>.
              </p>
            )}
            <div className="flex flex-col gap-14">
              {items.map((p) => (
                <PatternCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
