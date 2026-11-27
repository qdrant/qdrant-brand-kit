"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookmarkPlusIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  Maximize2Icon,
  ShuffleIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@qdrant/design-system/components/ui/dialog"
import { cn } from "@qdrant/design-system/lib/utils"
import { getPattern } from "@qdrant/web/patterns"

import { FrameView } from "./frame-view"
import {
  clearSection,
  encodeMix,
  getWorld,
  mixWarnings,
  optionsFor,
  randomMix,
  sectionKeys,
  shuffleSection,
  versionsOf,
  worldGroups,
  worldPage,
  type Mix,
  type PageBlock,
  type PageWorld,
} from "./page-explorations"
import { Choice } from "./patterns-view"

// The Patterns tab's Pages Explorations (2026-11-26): whole pages from the section library with a few patterns. A
// sidebar lists the pages by world (Home; Product, with Cloud), each at its own address; a page has its Randomize
// panel, its saved combinations and its versions, in groups that open and close. Each card shows the patterns it
// uses as badges, no description, so the discussion stays on the visual; Open shows it large. Randomize mixes the
// page from each section's own options in the Component Explorations, each section's shuffle changes only that
// section, and Save keeps a mix in this browser, per page.

type Theme = "dark" | "light"
type Themes = Theme | "both"

const THEMES = [
  { value: "dark" as Themes, label: "Dark" },
  { value: "light" as Themes, label: "Light" },
  { value: "both" as Themes, label: "Both" },
]

// What a card shows: a code, a name, the frame's query and the patterns it uses.
type Shown = { code: string; name: string; query: Record<string, string>; blocks: PageBlock[] }

// The patterns a page uses, in its order, once each.
function patternsOf(blocks: PageBlock[]) {
  const ids = blocks.flatMap((b) => [...(b.pattern ?? []), ...(b.cardPattern ? [b.cardPattern] : [])])
  return [...new Set(ids)].map((id) => getPattern(id)?.name ?? id)
}

// A mix as the frame's query.
const mixQuery = (world: PageWorld, mix: Mix) => ({ "page-world": world.id, "page-mix": encodeMix(mix) })

// ---- Saved mixes, in localStorage per page (it can be missing or blocked, so every read and write is guarded) ------

type SavedMix = { id: string; name: string; mix: Mix; saved: string }

const EVENT = "qd-page-mixes"
const storeOf = (world: PageWorld) => world.store ?? `qd-studio-page-mixes-${world.id}`

function readSaved(store: string): string {
  try {
    return window.localStorage.getItem(store) ?? "[]"
  } catch {
    return "[]"
  }
}

function writeSaved(store: string, list: SavedMix[]) {
  try {
    window.localStorage.setItem(store, JSON.stringify(list))
  } catch {
    // Kept for this visit only.
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function useSaved(store: string) {
  const read = React.useCallback(() => readSaved(store), [store])
  const raw = React.useSyncExternalStore(subscribe, read, () => "[]")
  const saved = React.useMemo(() => {
    try {
      return JSON.parse(raw) as SavedMix[]
    } catch {
      return []
    }
  }, [raw])
  const current = () => {
    try {
      return JSON.parse(readSaved(store)) as SavedMix[]
    } catch {
      return []
    }
  }
  return {
    saved,
    save: (mix: Mix) => {
      const list = current()
      const n = list.reduce((m, s) => Math.max(m, Number(s.name.replace(/\D/g, "")) || 0), 0) + 1
      writeSaved(store, [...list, { id: `mix-${Date.now()}`, name: `Mix ${n}`, mix, saved: new Date().toISOString() }])
    },
    remove: (id: string) =>
      writeSaved(
        store,
        current().filter((s) => s.id !== id)
      ),
  }
}

// A mix in words, to paste into the chat: each section with its pattern.
function describeMix(world: PageWorld, name: string, mix: Mix) {
  const lines = sectionKeys(world)
    .filter((k) => mix[k])
    .map((k) => {
      const o = mix[k]
      const id = o?.pattern?.[0] ?? o?.cardPattern ?? ""
      const where = o?.cardPattern ? "in the cards" : "behind the section"
      const { section, variant } = world.sections[k]
      return `- ${world.labels[k] ?? k}, ${section} (${variant}): ${getPattern(id)?.name ?? id}, ${where}`
    })
  return [`${name}, ${world.name} page:`, ...(lines.length ? lines : ["- no patterns"])].join("\n")
}

// ---- A page, its preview and its detail -----------------------------------------------------------------------------

function PagePreview({ page, theme, onOpen }: { page: Shown; theme: Theme; onOpen: () => void }) {
  return (
    <div className="group relative min-w-0">
      <FrameView section="" variant="" theme={theme} query={page.query} />
      {/* Only the chip takes clicks, so the pointer reaches the page and its hover moments. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${page.name}, ${theme}, in detail`}
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Maximize2Icon className="size-3.5" strokeWidth={1.5} />
        Open
      </button>
    </div>
  )
}

function PageDetail({
  page,
  theme,
  onTheme,
  onClose,
}: {
  page: Shown
  theme: Theme
  onTheme: (theme: Theme) => void
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[calc(100svh-4rem)] w-[calc(100vw-4rem)] max-w-none flex-col sm:max-w-none">
        <DialogHeader className="flex-row flex-wrap items-end justify-between gap-4 pr-8">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{page.code}</Badge>
              <DialogTitle>{page.name}</DialogTitle>
            </div>
            <DialogDescription>{patternsOf(page.blocks).join(" · ") || "No patterns"}</DialogDescription>
          </div>
          <Choice
            label="Theme"
            value={theme}
            onChange={onTheme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <FrameView key={theme} section="" variant="" theme={theme} query={page.query} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PageCard({
  page,
  themes,
  actions,
  controls,
}: {
  page: Shown
  themes: Themes
  actions?: React.ReactNode
  controls?: React.ReactNode
}) {
  const [open, setOpen] = React.useState<Theme | null>(null)
  const list: Theme[] = themes === "both" ? ["dark", "light"] : [themes]
  const patterns = patternsOf(page.blocks)
  return (
    <article id={page.code} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{page.code}</Badge>
            <h3 className="font-semibold">{page.name}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patterns.length ? (
              patterns.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">No patterns</Badge>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {controls}
      <div className={themes === "both" ? "grid items-start gap-3 xl:grid-cols-2" : "grid"}>
        {list.map((t) => (
          <PagePreview key={t} page={page} theme={t} onOpen={() => setOpen(t)} />
        ))}
      </div>
      {open && <PageDetail page={page} theme={open} onTheme={setOpen} onClose={() => setOpen(null)} />}
    </article>
  )
}

function Category({
  title,
  hint,
  count,
  children,
}: {
  title: string
  hint: string
  count: number
  children: React.ReactNode
}) {
  return (
    <details open className="group/kind flex flex-col">
      <summary className="flex w-fit cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon
          aria-hidden
          strokeWidth={1.5}
          className="mt-1 size-5 shrink-0 -rotate-90 text-muted-foreground transition-transform group-open/kind:rotate-0"
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            {title} <span className="text-base font-normal text-muted-foreground">({count})</span>
          </h2>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      </summary>
      <div className="mt-8 flex flex-col gap-14">{children}</div>
    </details>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        } catch {
          // The clipboard can be blocked; nothing to undo.
        }
      }}
    >
      {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

// Each section of the randomized page that has pattern options, with its pattern, a shuffle that changes only that
// section, and a clear.
function SectionControls({ world, mix, onChange }: { world: PageWorld; mix: Mix; onChange: (mix: Mix) => void }) {
  const warnings = mixWarnings(world, mix)
  const options = optionsFor(world)
  // Only the sections that have pattern options; the others (the bars, figures, and sections no exploration pairs a
  // pattern with yet) stay plain.
  const listed = sectionKeys(world).filter((k) => options[k]?.length)
  if (!listed.length) return null
  return (
    // Each column reads down, in the page's order; the rows follow how many sections are listed.
    <ul
      style={
        {
          "--rows-sm": `repeat(${Math.ceil(listed.length / 2)}, auto)`,
          "--rows-xl": `repeat(${Math.ceil(listed.length / 3)}, auto)`,
        } as React.CSSProperties
      }
      className="grid gap-px overflow-hidden rounded-lg border border-border bg-background sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-(--rows-sm) xl:grid-cols-3 xl:grid-rows-(--rows-xl)"
    >
      {listed.map((k) => {
        const o = mix[k]
        const id = o?.pattern?.[0] ?? o?.cardPattern
        const count = options[k]?.length ?? 0
        const warning = warnings[k]
        const label = world.labels[k] ?? k
        return (
          <li key={k} className="flex min-w-0 items-center gap-3 px-3 py-2 ring-1 ring-border">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm">{label}</span>
              <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                {warning && <TriangleAlertIcon aria-label={warning} className="size-3 shrink-0" strokeWidth={1.5} />}
                <span className="truncate" title={warning}>
                  {id ? `${getPattern(id)?.name ?? id}, ${o?.cardPattern ? "in the cards" : "behind"}` : "None"}
                </span>
              </span>
            </div>
            {id && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove the pattern from ${label}`}
                title="Remove"
                onClick={() => onChange(clearSection(mix, k))}
              >
                <XIcon />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={count === 1 && !!id}
              aria-label={`Randomize ${label}`}
              title={`Randomize ${label} only`}
              onClick={() => onChange(shuffleSection(world, mix, k))}
            >
              <ShuffleIcon />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

// ---- The sidebar: every page, by world --------------------------------------------------------------------------------

const item = (on: boolean) =>
  cn("rounded-md px-2 py-1.5 text-sm hover:bg-muted", on ? "bg-muted font-semibold" : "text-muted-foreground")

export function PagesSidebar({ current }: { current: string }) {
  return (
    <aside className="sticky top-12 hidden h-[calc(100svh-3rem)] w-60 shrink-0 overflow-y-auto border-r p-4 md:block">
      <nav aria-label="Pages Explorations" className="flex flex-col gap-5">
        {worldGroups().map((g) => (
          <div key={g.group} className="flex flex-col gap-1">
            <p className="px-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{g.group}</p>
            {g.worlds.map((w) => (
              <Link
                key={w.id}
                href={`/web/patterns/pages/${w.id}`}
                aria-current={w.id === current ? "page" : undefined}
                className={item(w.id === current)}
              >
                {w.name}
                <span className="ml-1.5 text-xs text-muted-foreground">{w.versions.length}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

// ---- One page ---------------------------------------------------------------------------------------------------------

export function PageExplorationsView({ worldId }: { worldId: string }) {
  const world = getWorld(worldId)
  if (!world) return null
  // Keyed by the page, so moving to another page starts on its own mix.
  return <WorldView key={world.id} world={world} />
}

function WorldView({ world }: { world: PageWorld }) {
  const [themes, setThemes] = React.useState<Themes>("dark")
  const [mix, setMix] = React.useState<Mix>(world.start)
  const [justSaved, setJustSaved] = React.useState(false)
  const { saved, save, remove } = useSaved(storeOf(world))
  const versions = versionsOf(world)

  const random: Shown = {
    code: "RND",
    name: `Randomized ${world.name.toLowerCase()}`,
    query: mixQuery(world, mix),
    blocks: worldPage(world, mix),
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-10 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex max-w-3xl flex-col gap-2">
          <p className="font-mono text-xs text-muted-foreground uppercase">{world.group}</p>
          <h1 className="text-2xl font-semibold">{world.name}</h1>
          <p className="text-sm text-muted-foreground">
            Rebuilt from the section library, with the live page&apos;s copy, and a few patterns placed far apart so the
            page breathes. These are trials, not decisions.
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span>
              {versions.length} {versions.length === 1 ? "version" : "versions"} · {saved.length} saved ·{" "}
              {sectionKeys(world).length} sections
            </span>
            <a
              href={world.source}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline-offset-2 hover:text-foreground hover:underline"
            >
              {world.source.replace(/^https:\/\//, "")}
              <ExternalLinkIcon className="size-3" strokeWidth={1.5} />
            </a>
          </p>
        </div>
        <Choice label="Themes" value={themes} onChange={setThemes} options={THEMES} />
        {world.gaps && world.gaps.length > 0 && (
          <details className="max-w-3xl rounded-lg border border-border px-4 py-3 text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-muted-foreground [&::-webkit-details-marker]:hidden">
              <TriangleAlertIcon className="size-4 shrink-0" strokeWidth={1} />
              Where it differs from the live page ({world.gaps.length})
            </summary>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
              {world.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </details>
        )}
      </header>

      <Category
        title="Randomize"
        hint="Randomize all mixes the whole page: each section takes one of its own options from the Component Explorations, or none, at most four patterns and never two in a row. Each section's shuffle changes only that section; a warning shows when the mix breaks those rules."
        count={1}
      >
        <PageCard
          page={random}
          themes={themes}
          controls={<SectionControls world={world} mix={mix} onChange={setMix} />}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => setMix(randomMix(world))}>
                <ShuffleIcon data-icon="inline-start" />
                Randomize all
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  save(mix)
                  setJustSaved(true)
                  window.setTimeout(() => setJustSaved(false), 1500)
                }}
              >
                {justSaved ? <CheckIcon data-icon="inline-start" /> : <BookmarkPlusIcon data-icon="inline-start" />}
                {justSaved ? "Saved" : "Save"}
              </Button>
            </>
          }
        />
      </Category>

      {saved.length > 0 && (
        <Category
          title="Saved combinations"
          hint="Kept in this browser. Copy one to paste it into the chat and it can become a version."
          count={saved.length}
        >
          {saved.map((s, i) => (
            <PageCard
              key={s.id}
              page={{
                code: `SV-${String(i + 1).padStart(2, "0")}`,
                name: s.name,
                query: mixQuery(world, s.mix),
                blocks: worldPage(world, s.mix),
              }}
              themes={themes}
              actions={
                <>
                  <CopyButton text={describeMix(world, s.name, s.mix)} />
                  <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
                    <Trash2Icon data-icon="inline-start" />
                    Delete
                  </Button>
                </>
              }
            />
          ))}
        </Category>
      )}

      <Category title="Versions" hint={`${world.name}, section by section, from the library.`} count={versions.length}>
        {versions.map((v) => (
          <PageCard
            key={v.id}
            page={{ code: v.code, name: v.name, query: { "page-exploration": v.id }, blocks: v.blocks }}
            themes={themes}
          />
        ))}
      </Category>
    </div>
  )
}
