"use client"

import { backgroundPatterns, surfacePatterns, type PatternDefinition } from "@qdrant/web/patterns"

import { FrameView } from "./frame-view"

function PatternCard({ p }: { p: PatternDefinition }) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-semibold">
          {p.name} <code className="ml-1 font-mono text-xs font-normal text-muted-foreground">{p.id}</code>
        </h3>
        <p className="text-sm text-muted-foreground">{p.description}</p>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {(["dark", "light"] as const).map((t) => (
          <FrameView key={t} section="" variant="" theme={t} query={{ "pattern-preview": p.id }} />
        ))}
      </div>
    </article>
  )
}

// The website's patterns (web/patterns), each on its own in dark and light (Juan, 2026-11-21).
export function PatternsView() {
  return (
    <div className="flex flex-col gap-10 p-8">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-2xl font-semibold">Patterns</h1>
        <p className="text-sm text-muted-foreground">
          Layers for the website's space, data and vector themes: backgrounds behind a section&apos;s
          content, and surfaces inside its cards. Set them on a section with <code className="font-mono">pattern</code>{" "}
          and <code className="font-mono">cardPattern</code>, or in the Builder. To add one, write{" "}
          <code className="font-mono">web/patterns/&lt;id&gt;.tsx</code> and list it in{" "}
          <code className="font-mono">web/patterns/index.tsx</code>; it shows here and in the Builder.
        </p>
      </header>
      <section className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold">Backgrounds</h2>
        {backgroundPatterns().length === 0 && (
          <p className="text-sm text-muted-foreground">
            None yet. Add a <code className="font-mono">kind: &quot;background&quot;</code> pattern in{" "}
            <code className="font-mono">web/patterns</code>.
          </p>
        )}
        {backgroundPatterns().map((p) => (
          <PatternCard key={p.id} p={p} />
        ))}
      </section>
      <section className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold">Surfaces</h2>
        {surfacePatterns().length === 0 && (
          <p className="text-sm text-muted-foreground">
            None yet. Add a <code className="font-mono">kind: &quot;surface&quot;</code> pattern in{" "}
            <code className="font-mono">web/patterns</code>.
          </p>
        )}
        {surfacePatterns().map((p) => (
          <PatternCard key={p.id} p={p} />
        ))}
      </section>
    </div>
  )
}
