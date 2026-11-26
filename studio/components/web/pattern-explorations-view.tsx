"use client"

import * as React from "react"
import { ChevronDownIcon, Maximize2Icon, TriangleAlertIcon } from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@qdrant/design-system/components/ui/dialog"
import { NativeSelect, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"
import { allPatterns, getPattern } from "@qdrant/web/patterns"
import { getSection, sections } from "@qdrant/web/registry"

import { StarButton, useFavorites } from "./favorites"
import { FrameView } from "./frame-view"
import { explorationGroups, type Exploration, type Slot } from "./pattern-explorations"
import { Choice, TONES, toneQuery, type Tone } from "./patterns-view"

// The Patterns tab's Explorations (2026-11-24): the patterns on real sections from web/registry, with their real
// copy. Each pairing has a code to point at and its color to switch, and Open shows it large, in a dialog
// (2026-11-25). The cards stay clean, with no description, so the discussion is about the visual (2026-11-25).
// They're grouped by component, one group per section (2026-11-26). A star marks a favorite, which moves to a
// Favorites group at the top (2026-11-26, favorites.tsx). "Try your own" at the end puts any pattern on
// any section. Nothing here is a decision.

type Theme = "dark" | "light"
type Themes = Theme | "both"

// ---- One pairing --------------------------------------------------------------------------------------------------

const slotLabel = (slot: Slot) => (slot === "background" ? "behind the section" : "in the cards")

// What a pairing stretches: the CTA's own rule, amaranth as a background, and the pattern's own rule notes.
function flagsFor(e: Pick<Exploration, "section" | "pattern">, tone: Tone) {
  const flags: { rule: string; source: string }[] = []
  if (e.section === "cta")
    flags.push({
      rule: "No glows or patterns on a call to action for now (Juan, 2026-11-21)",
      source: "web/registry/cta.ts",
    })
  if (tone === "primary")
    flags.push({
      rule: "Amaranth as a background needs a yes: brand patterns are violet by default, red only with a yes",
      source: "web/guidelines.ts, Patterns and effects; AGENTS.md, Never",
    })
  const notes = getPattern(e.pattern)?.notes?.length ?? 0
  if (notes)
    flags.push({
      rule: `${getPattern(e.pattern)?.name} has ${notes === 1 ? "1 rule note" : `${notes} rule notes`} in the Library`,
      source: `Patterns, Library, ${getPattern(e.pattern)?.name}`,
    })
  return flags
}

type Pairing = Omit<Exploration, "code" | "tone">

// A pairing's favorite key: what it is, not its code, since codes move when pairings are added or removed.
const favoriteKey = (e: Pairing) => [e.section, e.variant, e.slot, e.pattern, ...(e.also ?? [])].join("/")

// The pairing's patterns by name, its extra layers after a plus: "Dust halo + Qbot peek".
const namesOf = (e: Pairing) => [e.pattern, ...(e.also ?? [])].map((id) => getPattern(id)?.name ?? id).join(" + ")

// The frame reads the section's patterns from the query (components/web/frame.tsx).
const pairingQuery = (e: Pairing, tone: Tone) => ({
  // A background with its extra layers (also), in order; the frame takes a comma-separated list.
  ...(e.slot === "background" ? { pattern: [e.pattern, ...(e.also ?? [])].join(",") } : { "card-pattern": e.pattern }),
  ...(e.room ? { room: String(e.room) } : {}),
  ...(e.bandBottom ? { "band-bottom": String(e.bandBottom) } : {}),
  ...(e.pad ? { pad: String(e.pad) } : {}),
  ...toneQuery(tone),
})

function Previews({
  e,
  tone,
  themes,
  onOpen,
}: {
  e: Pairing
  tone: Tone
  themes: Themes
  onOpen: (theme: Theme) => void
}) {
  const list: Theme[] = themes === "both" ? ["dark", "light"] : [themes]
  return (
    <div className={themes === "both" ? "grid gap-3 xl:grid-cols-2" : "grid"}>
      {list.map((t) => (
        <div key={t} className="group relative min-w-0">
          <FrameView section={e.section} variant={e.variant} theme={t} query={pairingQuery(e, tone)} />
          {/* Only the chip takes clicks, so the pointer reaches the preview and its hover moment (2026-11-25). */}
          <button
            type="button"
            onClick={() => onOpen(t)}
            aria-label={`Open ${getSection(e.section)?.name}, ${t}, in detail`}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Maximize2Icon className="size-3.5" strokeWidth={1.5} />
            Open
          </button>
        </div>
      ))}
    </div>
  )
}

// A pairing large (2026-11-25): the section at the website's width, scaled only when the dialog is narrower,
// scrolling when it's taller, with its theme and color to switch. The color is the card's own.
function ExplorationDetail({
  e,
  title,
  theme,
  onTheme,
  tone,
  onTone,
  onClose,
}: {
  e: Pairing & { code?: string }
  title: string
  theme: Theme
  onTheme: (theme: Theme) => void
  tone: Tone
  onTone: (tone: Tone) => void
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[calc(100svh-4rem)] w-[calc(100vw-4rem)] max-w-none flex-col sm:max-w-none">
        <DialogHeader className="flex-row flex-wrap items-end justify-between gap-4 pr-8">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {e.code && <Badge variant="outline">{e.code}</Badge>}
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription>
              {namesOf(e)}, {slotLabel(e.slot)}
            </DialogDescription>
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
        <div className="min-h-0 flex-1 overflow-y-auto">
          <FrameView
            key={`${theme}-${tone}`}
            section={e.section}
            variant={e.variant}
            theme={theme}
            query={pairingQuery(e, tone)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Flags({ flags }: { flags: { rule: string; source: string }[] }) {
  if (!flags.length) return null
  return (
    <ul className="flex flex-col gap-2 rounded-lg border border-border p-4 text-sm">
      {flags.map((f, i) => (
        <li key={`${i}-${f.rule}`} className="flex items-start gap-2">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1} />
          <span className="flex flex-col gap-0.5">
            <span>{f.rule}</span>
            <code className="font-mono text-xs text-muted-foreground">{f.source}</code>
          </span>
        </li>
      ))}
    </ul>
  )
}

function ExplorationCard({
  e,
  themes,
  tone,
  onTone,
  favorite,
  onFavorite,
}: {
  e: Exploration
  themes: Themes
  tone: Tone
  onTone: (tone: Tone) => void
  favorite: boolean
  onFavorite: () => void
}) {
  const section = getSection(e.section)
  const variant = section?.variants.find((v) => v.id === e.variant)
  const [open, setOpen] = React.useState<Theme | null>(null)
  return (
    <article id={e.code} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{e.code}</Badge>
            <h3 className="font-semibold">
              {section?.name} <span className="font-normal text-muted-foreground">· {variant?.name}</span>
            </h3>
            <StarButton on={favorite} label={e.code} onToggle={onFavorite} />
          </div>
          <p className="text-sm">
            {namesOf(e)}, {slotLabel(e.slot)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Choice label={`${e.code} pattern color`} value={tone} onChange={onTone} options={TONES} />
        </div>
      </div>
      <Previews e={e} tone={tone} themes={themes} onOpen={setOpen} />
      <Flags flags={flagsFor(e, tone)} />
      {open && (
        <ExplorationDetail
          e={e}
          title={`${section?.name} · ${variant?.name}`}
          theme={open}
          onTheme={setOpen}
          tone={tone}
          onTone={onTone}
          onClose={() => setOpen(null)}
        />
      )}
    </article>
  )
}

// ---- Try your own: any pattern on any section ----------------------------------------------------------------------

function TryYourOwn({ themes }: { themes: Themes }) {
  const [sectionId, setSectionId] = React.useState("hero")
  const section = getSection(sectionId)
  const [variant, setVariant] = React.useState(section?.variants[0]?.id ?? "")
  const [slot, setSlot] = React.useState<Slot>("background")
  const options = allPatterns().filter((p) => p.kind === (slot === "background" ? "background" : "surface"))
  const [pattern, setPattern] = React.useState(options[0]?.id ?? "")
  const [tone, setTone] = React.useState<Tone>("secondary")
  const [open, setOpen] = React.useState<Theme | null>(null)

  const pickSection = (id: string) => {
    setSectionId(id)
    setVariant(getSection(id)?.variants[0]?.id ?? "")
  }
  const pickSlot = (next: Slot) => {
    setSlot(next)
    setPattern(allPatterns().find((p) => p.kind === (next === "background" ? "background" : "surface"))?.id ?? "")
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Try your own</h2>
        <p className="text-sm text-muted-foreground">
          Any pattern on any section, to try a pairing that isn&apos;t above.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect size="sm" aria-label="Section" value={sectionId} onChange={(ev) => pickSection(ev.target.value)}>
          {sections.map((s) => (
            <NativeSelectOption key={s.id} value={s.id}>
              {s.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect size="sm" aria-label="Variant" value={variant} onChange={(ev) => setVariant(ev.target.value)}>
          {section?.variants.map((v) => (
            <NativeSelectOption key={v.id} value={v.id}>
              {v.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Choice
          label="Where"
          value={slot}
          onChange={pickSlot}
          options={[
            { value: "background", label: "Background" },
            { value: "cards", label: "Cards" },
          ]}
        />
        <NativeSelect size="sm" aria-label="Pattern" value={pattern} onChange={(ev) => setPattern(ev.target.value)}>
          {options.map((p) => (
            <NativeSelectOption key={p.id} value={p.id}>
              {p.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Choice label="Pattern color" value={tone} onChange={setTone} options={TONES} />
      </div>
      {section && (
        <Previews e={{ section: sectionId, variant, slot, pattern }} tone={tone} themes={themes} onOpen={setOpen} />
      )}
      <Flags flags={flagsFor({ section: sectionId, pattern }, tone)} />
      {section && open && (
        <ExplorationDetail
          e={{ section: sectionId, variant, slot, pattern }}
          title={`${section.name} · ${section.variants.find((v) => v.id === variant)?.name}`}
          theme={open}
          onTheme={setOpen}
          tone={tone}
          onTone={setTone}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}

// ---- The page -----------------------------------------------------------------------------------------------------

const all = explorationGroups.flatMap((g) => g.items)

export function PatternExplorationsView() {
  const [themes, setThemes] = React.useState<Themes>("both")
  const [tones, setTones] = React.useState<Record<string, Tone>>({})
  const toneOf = (e: Exploration) => tones[e.code] ?? e.tone
  const favorites = useFavorites("qd-studio-favorite-explorations")
  const isFavorite = (e: Exploration) => favorites.has(favoriteKey(e))
  const starred = all.filter(isFavorite)
  // The groups: Favorites first when there are any, then each component without its starred pairings.
  const groups = [
    ...(starred.length
      ? [{ title: "Favorites", hint: "The explorations you starred, first. Kept in this browser.", items: starred }]
      : []),
    ...explorationGroups
      .map((g) => ({ ...g, items: g.items.filter((e) => !isFavorite(e)) }))
      .filter((g) => g.items.length),
  ]

  return (
    <div className="flex flex-col gap-10 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex max-w-3xl flex-col gap-2">
          <h1 className="text-2xl font-semibold">Component Explorations</h1>
          <p className="text-sm text-muted-foreground">
            The patterns on real sections, with their real copy, to see how they could work on the website. No pairing
            puts the pattern under any letters, at any size. These are trials, not decisions: the sections keep their
            own patterns until Juan says yes to one.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {all.length} explorations · {explorationGroups.length} components
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Choice
            label="Themes"
            value={themes}
            onChange={setThemes}
            options={[
              { value: "both", label: "Both" },
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </div>
      </header>

      {groups.map((g) => {
        const items = g.items
        return (
          <details key={g.title} open className="group/kind flex flex-col">
            <summary className="flex w-fit cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
              <ChevronDownIcon
                aria-hidden
                strokeWidth={1.5}
                className="mt-1 size-5 shrink-0 -rotate-90 text-muted-foreground transition-transform group-open/kind:rotate-0"
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  {g.title} <span className="text-base font-normal text-muted-foreground">({items.length})</span>
                </h2>
                <p className="text-sm text-muted-foreground">{g.hint}</p>
              </div>
            </summary>
            <div className="mt-8 flex flex-col gap-14">
              {items.map((e) => (
                <ExplorationCard
                  key={e.code}
                  e={e}
                  themes={themes}
                  tone={toneOf(e)}
                  onTone={(t) => setTones((prev) => ({ ...prev, [e.code]: t }))}
                  favorite={isFavorite(e)}
                  onFavorite={() => favorites.toggle(favoriteKey(e))}
                />
              ))}
            </div>
          </details>
        )
      })}

      <TryYourOwn themes={themes} />
    </div>
  )
}
