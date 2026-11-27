"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  EraserIcon,
  ExternalLinkIcon,
  Maximize2Icon,
  PencilIcon,
  RotateCcwIcon,
  StarIcon,
  Trash2Icon,
  TriangleAlertIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@qdrant/design-system/components/ui/dropdown-menu"
import { cn } from "@qdrant/design-system/lib/utils"
import { getPattern } from "@qdrant/web/patterns"

import { StarButton } from "./favorites"
import { FrameView, frameSrc, useFrameHeight, useFrameKey } from "./frame-view"
import {
  encodeMix,
  getWorld,
  idOf,
  mixWarnings,
  optionsFor,
  sectionKeys,
  versionsOf,
  worldGroups,
  worldPage,
  type Mix,
  type MixOption,
  type PageBlock,
  type PageWorld,
} from "./page-explorations"
import { Choice } from "./patterns-view"

// The Patterns tab's Pages Explorations (2026-11-26): whole pages from the section library with a few patterns. A
// sidebar lists the pages by world (Home; Product, with Cloud), each at its own address; a page has its Favorites,
// the page being built and its versions, in groups that open and close. Each card shows the patterns it uses as
// badges, no description, so the discussion stays on the visual; Open shows it large.
//
// Build (2026-11-27, in place of Randomize): a menu floats over each section of the page, with its styles: none, or
// one of the backgrounds and surfaces the Component Explorations paired with that section. Picking one changes only
// that section, in place. Save adds the whole page to Favorites, and a star on a version adds that version; both
// are kept in this browser, per page, and Edit brings a favorite back to the page being built.

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

// from: the version a favorite was starred from, so its star can take it out again.
type SavedMix = { id: string; name: string; mix: Mix; saved: string; from?: string }

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
    save: (mix: Mix, named?: { name: string; from: string }) => {
      const list = current()
      const n = list.filter((s) => !s.from).length + 1
      writeSaved(store, [
        ...list,
        {
          id: `mix-${Date.now()}`,
          name: named?.name ?? `Page ${n}`,
          mix,
          saved: new Date().toISOString(),
          ...(named ? { from: named.from } : {}),
        },
      ])
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

// ---- The style menus ------------------------------------------------------------------------------------------------

// What the page being built passes to its card: its page, its mix and how to change it.
type Editor = { world: PageWorld; mix: Mix; onChange: (mix: Mix) => void }

const valueOf = (o?: MixOption) => (o ? `${o.cardPattern ? "cards" : "bg"}:${idOf(o)}` : "none")
const styleName = (o?: MixOption) => (o ? (getPattern(idOf(o))?.name ?? idOf(o)) : "No pattern")

// One section's menu: no pattern, or one of its backgrounds or card surfaces from the Component Explorations.
function StyleMenu({ editor, k, warning }: { editor: Editor; k: string; warning?: string }) {
  const { world, mix, onChange } = editor
  const options = optionsFor(world)[k] ?? []
  const label = world.labels[k] ?? k
  const current = mix[k]
  const backgrounds = options.filter((o) => !o.cardPattern)
  const surfaces = options.filter((o) => o.cardPattern)
  const pick = (value: string) => {
    const next = { ...mix }
    const o = options.find((x) => valueOf(x) === value)
    if (o) next[k] = o
    else delete next[k]
    onChange(next)
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${styleName(current)}. Change its style`}
        title={warning}
        className="flex max-w-72 items-center gap-1.5 rounded-md border border-border bg-popover/90 px-2 py-1 text-xs text-popover-foreground shadow-sm backdrop-blur outline-none hover:bg-popover focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-popover"
      >
        {warning && (
          <TriangleAlertIcon aria-hidden className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        )}
        <span className="shrink-0 font-medium">{label}</span>
        <span className="truncate text-muted-foreground">{styleName(current)}</span>
        <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuRadioGroup value={valueOf(current)} onValueChange={(v) => pick(String(v))}>
          <DropdownMenuRadioItem value="none">No pattern</DropdownMenuRadioItem>
          {backgrounds.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Behind the section</DropdownMenuLabel>
                {backgrounds.map((o) => (
                  <DropdownMenuRadioItem key={valueOf(o)} value={valueOf(o)}>
                    {styleName(o)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}
          {surfaces.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>In the cards</DropdownMenuLabel>
                {surfaces.map((o) => (
                  <DropdownMenuRadioItem key={valueOf(o)} value={valueOf(o)}>
                    {styleName(o)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type Spot = { key: string; top: number; height: number }

// The page being built, in a frame with a style menu floating at the top right of each section that has styles. The
// frame loads once; each new mix goes to it by postMessage, so the page changes in place (frame.tsx), and it reports
// where its sections sit, so the menus follow them.
function PageFrame({ theme, query, editor }: { theme: Theme; query: Record<string, string>; editor: Editor }) {
  const width = 1440
  const key = useFrameKey()
  const height = useFrameHeight(key)
  const box = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = React.useState(1)
  const [spots, setSpots] = React.useState<Spot[]>([])
  const [src] = React.useState(() => frameSrc("", "", theme, key, query))
  const mixText = encodeMix(editor.mix)

  const post = React.useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: "qd-page-mix", key, mix: mixText }, "*")
  }, [key, mixText])
  React.useEffect(post, [post])

  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "qd-frame-sections" && e.data.key === key) setSpots(e.data.sections as Spot[])
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [key])

  React.useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const options = optionsFor(editor.world)
  const warnings = mixWarnings(editor.world, editor.mix)
  return (
    <div ref={box} className="w-full min-w-0">
      <div
        className="relative overflow-clip rounded-lg border border-border"
        style={{ height: height * scale, width: width * scale, maxWidth: "100%" }}
      >
        <iframe
          ref={frame}
          title={`${editor.world.name}, being built, ${theme}`}
          src={src}
          onLoad={post}
          scrolling="no"
          className="origin-top-left border-0"
          style={{ width, height, transform: `scale(${scale})` }}
        />
        {/* Only the menus take clicks, so the pointer still reaches the page and its hover moments. The box clips
            rather than hides its overflow, so focusing a menu never scrolls the page inside it. */}
        <div className="pointer-events-none absolute inset-0">
          {spots
            .filter((s) => options[s.key]?.length)
            .map((s) => (
              <div key={s.key} className="pointer-events-auto absolute right-3" style={{ top: s.top * scale + 10 }}>
                <StyleMenu editor={editor} k={s.key} warning={warnings[s.key]} />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ---- A page, its preview and its detail -----------------------------------------------------------------------------

function PagePreview({
  page,
  theme,
  editor,
  onOpen,
}: {
  page: Shown
  theme: Theme
  editor?: Editor
  onOpen: () => void
}) {
  return (
    <div className="group relative min-w-0">
      {editor ? (
        <PageFrame theme={theme} query={page.query} editor={editor} />
      ) : (
        <FrameView section="" variant="" theme={theme} query={page.query} />
      )}
      {/* Only the chip takes clicks, so the pointer reaches the page and its hover moments. On the page being built
          it sits at the bottom, clear of the style menus. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${page.name}, ${theme}, in detail`}
        className={cn(
          "absolute right-3 flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
          editor ? "bottom-3" : "top-3"
        )}
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
  editor,
  onTheme,
  onClose,
}: {
  page: Shown
  theme: Theme
  editor?: Editor
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
          {editor ? (
            <PageFrame key={theme} theme={theme} query={page.query} editor={editor} />
          ) : (
            <FrameView key={theme} section="" variant="" theme={theme} query={page.query} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PageCard({
  page,
  themes,
  star,
  actions,
  status,
  editor,
}: {
  page: Shown
  themes: Themes
  star?: React.ReactNode
  actions?: React.ReactNode
  status?: React.ReactNode
  editor?: Editor
}) {
  const [open, setOpen] = React.useState<Theme | null>(null)
  const list: Theme[] = themes === "both" ? ["dark", "light"] : [themes]
  const patterns = patternsOf(page.blocks)
  return (
    <article id={page.code} className="flex min-w-0 scroll-mt-16 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {star}
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
          {status}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className={themes === "both" ? "grid items-start gap-3 xl:grid-cols-2" : "grid"}>
        {list.map((t) => (
          <PagePreview key={t} page={page} theme={t} editor={editor} onOpen={() => setOpen(t)} />
        ))}
      </div>
      {open && <PageDetail page={page} theme={open} editor={editor} onTheme={setOpen} onClose={() => setOpen(null)} />}
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
  const builder = React.useRef<HTMLDivElement>(null)

  const warnings = Object.keys(mixWarnings(world, mix)).length
  const styled = sectionKeys(world).filter((k) => mix[k]).length
  const page: Shown = {
    code: "NEW",
    name: `Your ${world.name.toLowerCase()}`,
    query: mixQuery(world, mix),
    blocks: worldPage(world, mix),
  }
  const editor: Editor = { world, mix, onChange: setMix }

  // Brings a page into the one being built, and scrolls to it.
  const edit = (next: Mix) => {
    setMix(next)
    builder.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  const starredFrom = (id: string) => saved.find((s) => s.from === id)

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
              {versions.length} {versions.length === 1 ? "version" : "versions"} · {saved.length}{" "}
              {saved.length === 1 ? "favorite" : "favorites"} · {sectionKeys(world).length} sections
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

      {saved.length > 0 && (
        <Category
          title="Favorites"
          hint="The pages you saved or starred, kept in this browser. Edit brings one back to the page being built; Copy gives it in words, to paste into the chat so it can become a version."
          count={saved.length}
        >
          {saved.map((s, i) => (
            <PageCard
              key={s.id}
              page={{
                code: `FV-${String(i + 1).padStart(2, "0")}`,
                name: s.name,
                query: mixQuery(world, s.mix),
                blocks: worldPage(world, s.mix),
              }}
              themes={themes}
              star={<StarButton on label={s.name} onToggle={() => remove(s.id)} />}
              actions={
                <>
                  <Button variant="outline" size="sm" onClick={() => edit(s.mix)}>
                    <PencilIcon data-icon="inline-start" />
                    Edit
                  </Button>
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

      <div ref={builder} className="scroll-mt-16">
        <Category
          title="Build a page"
          hint="Each section has a menu at its top right with its styles: no pattern, or one of the backgrounds and surfaces explored for it in the Component Explorations. Picking one changes only that section. Save adds the whole page to Favorites."
          count={1}
        >
          <PageCard
            page={page}
            themes={themes}
            editor={editor}
            status={
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {styled} of {sectionKeys(world).length} sections styled
                {warnings > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <TriangleAlertIcon aria-hidden className="size-3" strokeWidth={1.5} />
                    {warnings} {warnings === 1 ? "breaks" : "break"} the page&apos;s rules (four patterns at most, never
                    two in a row)
                  </>
                )}
              </p>
            }
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => setMix({})}>
                  <EraserIcon data-icon="inline-start" />
                  Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMix(world.start)}>
                  <RotateCcwIcon data-icon="inline-start" />
                  Reset
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
                  {justSaved ? <CheckIcon data-icon="inline-start" /> : <StarIcon data-icon="inline-start" />}
                  {justSaved ? "Saved to favorites" : "Save to favorites"}
                </Button>
              </>
            }
          />
        </Category>
      </div>

      <Category
        title="Versions"
        hint={`${world.name}, section by section, from the library. Star one to add it to Favorites; Edit starts the page being built from it.`}
        count={versions.length}
      >
        {versions.map((v) => {
          const fav = starredFrom(v.id)
          return (
            <PageCard
              key={v.id}
              page={{ code: v.code, name: v.name, query: { "page-exploration": v.id }, blocks: v.blocks }}
              themes={themes}
              star={
                <StarButton
                  on={!!fav}
                  label={`${v.code} ${v.name}`}
                  onToggle={() => (fav ? remove(fav.id) : save(v.mix, { name: `${v.code} ${v.name}`, from: v.id }))}
                />
              }
              actions={
                <Button variant="outline" size="sm" onClick={() => edit(v.mix)}>
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </Button>
              }
            />
          )
        })}
      </Category>
    </div>
  )
}
