"use client"

import * as React from "react"
import { ChevronDownIcon, Maximize2Icon, TriangleAlertIcon } from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@qdrant/design-system/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@qdrant/design-system/components/ui/toggle-group"
import { Plate } from "@qdrant/web/lib/plate"
import { allPatterns, type PatternDefinition } from "@qdrant/web/patterns"

import { StarButton, useFavorites } from "./favorites"
import { FrameView, frameSrc, useFrameKey } from "./frame-view"

// The website's patterns (web/patterns), each on its own in dark and light (design lead, 2026-11-21): approved patterns
// and the ones being explored (web/patterns/explorations, 2026-11-23), with their rule notes. Each has a Primary
// or Secondary color to compare, and opens large in a dialog (2026-11-24). A star marks a favorite, which moves to a
// Favorites group at the top (2026-11-26, favorites.tsx).

const KINDS = [
  {
    kind: "background",
    title: "Backgrounds",
    hint: "Behind a section's content",
  },
  { kind: "surface", title: "Surfaces", hint: "Inside each card of a section" },
] as const

type Theme = "dark" | "light"

// The pattern's color (2026-11-24): Secondary is the patterns as they are, in indigo; Primary turns them amaranth
// (web.css, Pattern color). A choice to compare, not a decision.
export type Tone = "secondary" | "primary"
// Each with a dot in its role's color: primary.primary (amaranth 600) and secondary.secondary (indigo 600).
export const TONES: Option<Tone>[] = [
  { value: "primary", label: "Primary", swatch: "var(--qd-color-primary)" },
  {
    value: "secondary",
    label: "Secondary",
    swatch: "var(--qd-color-secondary)",
  },
]
export const toneQuery = (tone: Tone): Record<string, string> =>
  tone === "primary" ? { "pattern-tone": "primary" } : {}

type Option<T extends string> = { value: T; label: string; swatch?: string }

// A row of two to three options, one always on.
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      size="sm"
      spacing={0}
      value={[value]}
      onValueChange={(next: string[]) => next[0] && onChange(next[0] as T)}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value}>
          {o.swatch && <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: o.swatch }} />}
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

// A surface pattern in one card on the website's page color, in a theme. Drawn here rather than in a frame
// (frame.tsx shows it in a row of three cards), so each pattern is seen on its own (2026-11-23). The card has the
// Deploy Card's shape, 350 by 400, which the Pattern Studio looks were made for: at that size in a preview, and
// as large as the dialog allows in detail.
function SurfaceStage({ p, theme, tone, large }: { p: PatternDefinition; theme: Theme; tone: Tone; large?: boolean }) {
  // data-web outside and the theme inside: web.css reads "[data-theme] [data-web]" from the studio's own <html>,
  // which would turn a light preview's card dark under the studio's dark theme.
  return (
    <div data-web className={large ? "flex min-h-0 flex-1 flex-col" : "min-w-0"}>
      <div
        data-theme={theme}
        data-web-pattern-tone={tone === "primary" ? tone : undefined}
        className={cn(
          "flex justify-center rounded-lg border border-border bg-background text-foreground",
          large ? "min-h-0 flex-1 p-8" : "p-10"
        )}
      >
        {/* A new card for each theme and color: canvas patterns read their colors once, when they start. */}
        <Plate
          key={`${theme}-${tone}`}
          pattern={p.id}
          className={cn(
            "flex max-w-full items-end rounded-xl p-8 font-mono text-xs text-muted-foreground uppercase",
            large ? "aspect-[350/400] h-full" : "h-[400px] w-[350px]"
          )}
        >
          {p.name}
        </Plate>
      </div>
    </div>
  )
}

// A pattern's preview in a theme, as a button that opens it in detail.
function Preview({ p, theme, tone, onOpen }: { p: PatternDefinition; theme: Theme; tone: Tone; onOpen: () => void }) {
  return (
    <div className="group relative min-w-0">
      {p.kind === "surface" ? (
        <SurfaceStage p={p} theme={theme} tone={tone} />
      ) : (
        <FrameView section="" variant="" theme={theme} query={{ "pattern-preview": p.id, ...toneQuery(tone) }} />
      )}
      {/* Only the chip takes clicks, so the pointer reaches the preview and its hover moment (2026-11-25). */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${p.name}, ${theme}, in detail`}
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Maximize2Icon className="size-3.5" strokeWidth={1.5} />
        Open
      </button>
    </div>
  )
}

// A pattern large, with its theme and color to switch (2026-11-24): a background at the website's real size (one
// pixel for one pixel), filling the dialog; a surface in one card as tall as the dialog. A surface is drawn for
// the card's size, so the larger card shows more of a pattern with a fixed unit (Hex pulse) and a larger version
// of one that scales with the card.
function PatternDetail({
  p,
  theme,
  onTheme,
  tone,
  onTone,
  onClose,
}: {
  p: PatternDefinition
  theme: Theme
  onTheme: (theme: Theme) => void
  tone: Tone
  onTone: (tone: Tone) => void
  onClose: () => void
}) {
  const key = useFrameKey()
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[calc(100svh-4rem)] w-[calc(100vw-4rem)] max-w-none flex-col sm:max-w-none">
        <DialogHeader className="flex-row flex-wrap items-end justify-between gap-4 pr-8">
          <div className="flex flex-col gap-1">
            <DialogTitle>{p.name}</DialogTitle>
            <DialogDescription>{p.description}</DialogDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Choice
              label="Theme"
              value={theme}
              onChange={onTheme}
              options={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
            />
            <Choice label="Color" value={tone} onChange={onTone} options={TONES} />
          </div>
        </DialogHeader>
        {p.kind === "surface" ? (
          <SurfaceStage p={p} theme={theme} tone={tone} large />
        ) : (
          <iframe
            key={`${theme}-${tone}`}
            title={`${p.name}, ${theme}, in detail`}
            src={frameSrc("", "", theme, key, {
              "pattern-preview": p.id,
              fill: "1",
              ...toneQuery(tone),
            })}
            scrolling="no"
            className="min-h-0 w-full flex-1 rounded-lg border border-border"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// One pattern: what it is, its previews and anything that stretches a rule.
function PatternCard({ p, favorite, onFavorite }: { p: PatternDefinition; favorite: boolean; onFavorite: () => void }) {
  const exploring = p.status === "exploring"
  const [tone, setTone] = React.useState<Tone>("secondary")
  const [detail, setDetail] = React.useState<Theme | null>(null)
  return (
    <article id={p.id} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{p.name}</h3>
            <Badge variant={exploring ? "outline" : "secondary"}>{exploring ? "Exploring" : "Approved"}</Badge>
            <StarButton on={favorite} label={p.name} onToggle={onFavorite} />
          </div>
          <p className="text-sm text-muted-foreground">{p.description}</p>
        </div>
        <Choice label={`${p.name} color`} value={tone} onChange={setTone} options={TONES} />
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {(["dark", "light"] as const).map((t) => (
          <Preview key={t} p={p} theme={t} tone={tone} onOpen={() => setDetail(t)} />
        ))}
      </div>
      {detail && (
        <PatternDetail
          p={p}
          theme={detail}
          onTheme={setDetail}
          tone={tone}
          onTone={setTone}
          onClose={() => setDetail(null)}
        />
      )}
      {p.notes && p.notes.length > 0 && (
        <details className="rounded-lg border border-border p-4 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <TriangleAlertIcon className="size-4 text-muted-foreground" strokeWidth={1} />
            {p.notes.length === 1 ? "1 rule note" : `${p.notes.length} rule notes`}
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {p.notes.map((n, i) => (
              <li key={`${i}-${n.rule}`} className="flex flex-col gap-0.5">
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
  const favorites = useFavorites("qd-studio-favorite-patterns")
  const starred = all.filter((p) => favorites.has(p.id))
  // A group of patterns that opens and closes, like the kinds below.
  const group = (key: string, title: string, hint: string, items: PatternDefinition[], empty?: React.ReactNode) => (
    // Open by default; its heading collapses it (2026-11-24).
    <details key={key} open className="group/kind flex flex-col">
      <summary className="flex w-fit cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon
          aria-hidden
          strokeWidth={1.5}
          className="mt-1 size-5 shrink-0 -rotate-90 text-muted-foreground transition-transform group-open/kind:rotate-0"
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            {title} <span className="text-base font-normal text-muted-foreground">({items.length})</span>
          </h2>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      </summary>
      <div className="mt-8 flex flex-col gap-8">
        {items.length === 0 && empty}
        <div className="flex flex-col gap-14">
          {items.map((p) => (
            <PatternCard key={p.id} p={p} favorite={favorites.has(p.id)} onFavorite={() => favorites.toggle(p.id)} />
          ))}
        </div>
      </div>
    </details>
  )

  return (
    <div className="flex flex-col gap-10 p-8">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-2xl font-semibold">Patterns</h1>
        <p className="text-sm text-muted-foreground">
          Layers for the website&apos;s space, data and vector themes: backgrounds behind a section&apos;s content, and
          surfaces inside its cards. Approved patterns are listed in{" "}
          <code className="font-mono">web/patterns/index.tsx</code> and reach the Builder. Patterns being explored live
          in <code className="font-mono">web/patterns/explorations</code> and show only here, until the design lead says
          yes.
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {all.length} patterns · {approved} approved · {all.length - approved} exploring
        </p>
      </header>
      {starred.length > 0 &&
        group("favorites", "Favorites", "The patterns you starred, first. Kept in this browser.", starred)}
      {KINDS.map(({ kind, title, hint }) =>
        group(
          kind,
          title,
          hint,
          all.filter((p) => p.kind === kind && !favorites.has(p.id)),
          // Only when the kind has no patterns at all, not when they're all starred.
          !all.some((p) => p.kind === kind) && (
            <p className="text-sm text-muted-foreground">
              None yet. Add a <code className="font-mono">kind: &quot;{kind}&quot;</code> pattern in{" "}
              <code className="font-mono">web/patterns</code>.
            </p>
          )
        )
      )}
    </div>
  )
}
