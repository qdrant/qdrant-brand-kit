"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Copy, Monitor, Plus, Smartphone, Tablet, Trash2 } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Input } from "@qdrant/design-system/components/ui/input"
import { Label } from "@qdrant/design-system/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"
import { Switch } from "@qdrant/design-system/components/ui/switch"
import { Textarea } from "@qdrant/design-system/components/ui/textarea"
import { cn } from "@qdrant/design-system/lib/utils"
import { getSection, sectionsByCategory, type EditableField } from "@qdrant/web/registry"
import { backgroundPatterns, surfacePatterns } from "@qdrant/web/patterns"

import { styleSwitches, uid, variantOf, type Block, type WebPage } from "./blocks"
import { useFrameHeight, useFrameKey } from "./frame-view"

const STORE = "qd-web-builder"

type Store = { pages: WebPage[]; current: string }

// A first page to start from: the home page's chrome, hero and closing call to action.
function starterPage(): WebPage {
  return {
    id: uid(),
    name: "Home",
    theme: "dark",
    blocks: [
      { uid: uid(), section: "announcement-bar", variant: "release" },
      { uid: uid(), section: "navbar", variant: "featured" },
      { uid: uid(), section: "hero", variant: "home" },
      { uid: uid(), section: "cta", variant: "centered" },
      { uid: uid(), section: "footer", variant: "full" },
    ],
  }
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORE)
    if (raw) {
      const s = JSON.parse(raw) as Store
      if (s.pages?.length) return s
    }
  } catch {
    // No saved pages, or unreadable ones: start again.
  }
  const page = starterPage()
  return { pages: [page], current: page.id }
}

const viewports = [
  { id: "desktop", label: "Desktop", width: 1440, Icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, Icon: Tablet },
  { id: "phone", label: "Phone", width: 390, Icon: Smartphone },
] as const

const pascal = (file: string) =>
  file
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")

// The page as a React component that imports the sections and their registry variants.
function toTsx(page: WebPage) {
  const files = [...new Set(page.blocks.map((b) => getSection(b.section)?.file).filter(Boolean))] as string[]
  const imports = files.map((f) => `import { ${pascal(f)} } from "@qdrant/web/sections/${f}"`).join("\n")
  const body = page.blocks
    .map((b) => {
      const def = getSection(b.section)
      if (!def) return ""
      const attrs = [
        `{...variant("${b.section}", "${b.variant}")}`,
        ...Object.entries(b.overrides ?? {}).map(([k, v]) => `${k}={${JSON.stringify(v)}}`),
        b.theme ? `theme="${b.theme}"` : "",
        b.surface ? `surface="${b.surface}"` : "",
        b.pattern ? `pattern={${JSON.stringify(b.pattern)}}` : "",
        b.cardPattern !== undefined ? `cardPattern=${b.cardPattern ? `"${b.cardPattern}"` : "{undefined}"}` : "",
      ].filter(Boolean)
      return `      <${pascal(def.file)} ${attrs.join(" ")} />`
    })
    .join("\n")
  const name = pascal(page.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "page")
  return `${imports}
import { getSection } from "@qdrant/web/registry"

// Built in the studio's page builder. Each section starts from a registry variant (real qdrant.tech copy).
const variant = (section: string, id: string) =>
  getSection(section)!.variants.find((v) => v.id === id)!.props as never

export function ${name}Page() {
  return (
    <main data-web data-context="marketing" data-theme="${page.theme}" className="bg-background text-foreground">
${body}
    </main>
  )
}
`
}

// The page builder (Juan, 2026-11-21): put a page together from the section library. Layers and the library on
// the left, the page in the middle at a real width, the selected section's settings on the right. Pages are kept
// in this browser (localStorage); Copy TSX gives a page component for web/pages, Copy JSON the page as data.
export function PageBuilder() {
  // Only rendered in the browser (app/web/(views)/builder loads it without server rendering), so the saved pages
  // can be read on the first render.
  const [store, setStore] = React.useState<Store | null>(load)
  const [selected, setSelected] = React.useState<string | null>(null)
  const [viewport, setViewport] = React.useState<(typeof viewports)[number]["id"]>("desktop")
  const [copied, setCopied] = React.useState<string | null>(null)
  const frame = React.useRef<HTMLIFrameElement>(null)
  const stage = React.useRef<HTMLDivElement>(null)
  const [stageWidth, setStageWidth] = React.useState(1000)
  const key = useFrameKey()
  const height = useFrameHeight(key, 900)

  React.useEffect(() => {
    if (store) localStorage.setItem(STORE, JSON.stringify(store))
  }, [store])

  const page = store?.pages.find((p) => p.id === store.current) ?? store?.pages[0]

  // Send the page and the selection to the frame whenever they change, and when it says it's ready.
  const send = React.useCallback(() => {
    const w = frame.current?.contentWindow
    if (!w || !page) return
    w.postMessage({ type: "qd-page", page }, "*")
    w.postMessage({ type: "qd-select", uid: selected }, "*")
  }, [page, selected])
  React.useEffect(send, [send])
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.key && e.data.key !== key) return
      if (e.data?.type === "qd-frame-ready") send()
      if (e.data?.type === "qd-select") setSelected(e.data.uid)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [key, send])

  React.useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(() => setStageWidth(el.clientWidth - 48))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!store || !page) return null

  const updatePage = (fn: (p: WebPage) => WebPage) =>
    setStore((s) => (s ? { ...s, pages: s.pages.map((p) => (p.id === page.id ? fn(p) : p)) } : s))
  const updateBlock = (id: string, fn: (b: Block) => Block) =>
    updatePage((p) => ({ ...p, blocks: p.blocks.map((b) => (b.uid === id ? fn(b) : b)) }))
  const move = (id: string, dir: -1 | 1) =>
    updatePage((p) => {
      const i = p.blocks.findIndex((b) => b.uid === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= p.blocks.length) return p
      const blocks = [...p.blocks]
      ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
      return { ...p, blocks }
    })
  const add = (section: string, variant: string) => {
    const block: Block = { uid: uid(), section, variant }
    updatePage((p) => {
      const i = p.blocks.findIndex((b) => b.uid === selected)
      const blocks = [...p.blocks]
      blocks.splice(i < 0 ? blocks.length : i + 1, 0, block)
      return { ...p, blocks }
    })
    setSelected(block.uid)
  }
  const copy = (label: string, text: string) =>
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    })

  const block = page.blocks.find((b) => b.uid === selected)
  const def = block ? getSection(block.section) : undefined
  const width = viewports.find((v) => v.id === viewport)!.width
  const scale = Math.min(1, stageWidth / width)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <NativeSelect
          aria-label="Page"
          value={page.id}
          onChange={(e) => setStore({ ...store, current: e.target.value })}
          className="w-44"
        >
          {store.pages.map((p) => (
            <NativeSelectOption key={p.id} value={p.id}>
              {p.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Input
          aria-label="Page name"
          value={page.name}
          onChange={(e) => updatePage((p) => ({ ...p, name: e.target.value }))}
          className="w-44"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const p = { ...starterPage(), name: `Page ${store.pages.length + 1}`, blocks: [] }
            setStore({ pages: [...store.pages, p], current: p.id })
            setSelected(null)
          }}
        >
          <Plus /> New page
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={store.pages.length < 2}
          onClick={() => {
            const pages = store.pages.filter((p) => p.id !== page.id)
            setStore({ pages, current: pages[0].id })
          }}
        >
          Delete page
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <NativeSelect
          aria-label="Page theme"
          value={page.theme}
          onChange={(e) => updatePage((p) => ({ ...p, theme: e.target.value as WebPage["theme"] }))}
          className="w-32"
        >
          <NativeSelectOption value="dark">Dark page</NativeSelectOption>
          <NativeSelectOption value="light">Light page</NativeSelectOption>
        </NativeSelect>
        {styleSwitches.map((sw) => {
          const on = page.style?.[sw.key] ?? sw.on
          return (
            <Button
              key={sw.key}
              variant={on ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={on}
              title={sw.title}
              className={cn("proposal" in sw && "border border-dashed border-border")}
              onClick={() => updatePage((p) => ({ ...p, style: { ...p.style, [sw.key]: !on } }))}
            >
              {sw.label}
            </Button>
          )
        })}
        <div className="flex rounded-lg border p-0.5">
          {viewports.map((v) => (
            <Button
              key={v.id}
              variant={viewport === v.id ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={`${v.label}, ${v.width}px`}
              title={`${v.label}, ${v.width}px`}
              onClick={() => setViewport(v.id)}
            >
              <v.Icon />
            </Button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copy("tsx", toTsx(page))}>
            <Copy /> {copied === "tsx" ? "Copied" : "Copy TSX"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy("json", JSON.stringify(page, null, 2))}>
            <Copy /> {copied === "json" ? "Copied" : "Copy JSON"}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r">
          <div className="flex flex-col gap-1 border-b p-3">
            <p className="px-1 pb-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Layers</p>
            {page.blocks.length === 0 && <p className="px-1 text-xs text-muted-foreground">No sections yet.</p>}
            {page.blocks.map((b) => {
              const d = getSection(b.section)
              return (
                <button
                  key={b.uid}
                  type="button"
                  onClick={() => setSelected(b.uid)}
                  className={cn(
                    "flex flex-col items-start rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    selected === b.uid && "bg-muted font-semibold"
                  )}
                >
                  {d?.name ?? b.section}
                  <span className="text-xs font-normal text-muted-foreground">{d ? variantOf(d, b.variant).name : ""}</span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-4 p-3">
            <p className="px-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Add a section</p>
            {sectionsByCategory().map((c) => (
              <div key={c.id} className="flex flex-col gap-1">
                <p className="px-1 text-xs font-medium text-muted-foreground">{c.label}</p>
                {c.sections.map((s) =>
                  s.variants.map((v) => (
                    <button
                      key={`${s.id}-${v.id}`}
                      type="button"
                      onClick={() => add(s.id, v.id)}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <span>
                        {s.name}
                        <span className="block text-xs text-muted-foreground">{v.name}</span>
                      </span>
                      <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>
        </aside>

        <div ref={stage} className="min-w-0 flex-1 overflow-auto bg-muted/30 p-6">
          <div
            className="mx-auto overflow-hidden rounded-lg shadow-[0_0_0_1px_var(--border)]"
            style={{ width: width * scale, height: height * scale }}
          >
            <iframe
              ref={frame}
              title="Page preview"
              scrolling="no"
              src={`/web/frame?page=builder&key=${key}`}
              className="origin-top-left border-0"
              style={{ width, height, transform: `scale(${scale})` }}
              onLoad={send}
            />
          </div>
        </div>

        <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-l p-4">
          {block && def ? (
            <>
              <div className="flex flex-col gap-0.5">
                <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Section</p>
                <p className="font-semibold">{def.name}</p>
                <a href={`/web/docs/${def.id}`} className="text-xs text-primary underline-offset-4 hover:underline">
                  Docs
                </a>
              </div>
              <Field label="Variant">
                <NativeSelect
                  className="w-full"
                  value={block.variant}
                  onChange={(e) => updateBlock(block.uid, (b) => ({ ...b, variant: e.target.value, overrides: {} }))}
                >
                  {def.variants.map((v) => (
                    <NativeSelectOption key={v.id} value={v.id}>
                      {v.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Theme">
                <NativeSelect
                  className="w-full"
                  value={block.theme ?? ""}
                  onChange={(e) =>
                    updateBlock(block.uid, (b) => ({ ...b, theme: (e.target.value || undefined) as Block["theme"] }))
                  }
                >
                  <NativeSelectOption value="">The page&apos;s</NativeSelectOption>
                  <NativeSelectOption value="dark">Dark</NativeSelectOption>
                  <NativeSelectOption value="light">Light</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label="Surface">
                <NativeSelect
                  className="w-full"
                  value={block.surface ?? "default"}
                  onChange={(e) =>
                    updateBlock(block.uid, (b) => ({
                      ...b,
                      surface: e.target.value === "default" ? undefined : (e.target.value as Block["surface"]),
                    }))
                  }
                >
                  <NativeSelectOption value="default">Default (background/default)</NativeSelectOption>
                  <NativeSelectOption value="raised">Raised (background/raised)</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label="Background patterns">
                <div className="flex flex-col gap-1.5 rounded-lg border p-2">
                  {backgroundPatterns().length === 0 && (
                    <p className="text-xs text-muted-foreground">None yet. Add one in web/patterns.</p>
                  )}
                  {backgroundPatterns().map((pt) => {
                    const current =
                      block.pattern ?? ((variantOf(def, block.variant).props as { pattern?: string[] }).pattern ?? [])
                    const on = current.includes(pt.id)
                    return (
                      <label key={pt.id} className="flex items-center gap-2 text-xs" title={pt.description}>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            updateBlock(block.uid, (b) => ({
                              ...b,
                              pattern: on ? current.filter((x) => x !== pt.id) : [...current, pt.id],
                            }))
                          }
                        />
                        {pt.name}
                      </label>
                    )
                  })}
                </div>
              </Field>
              <Field label="Card pattern">
                <NativeSelect
                  className="w-full"
                  value={
                    block.cardPattern ??
                    ((variantOf(def, block.variant).props as { cardPattern?: string }).cardPattern ?? "")
                  }
                  onChange={(e) => updateBlock(block.uid, (b) => ({ ...b, cardPattern: e.target.value }))}
                >
                  <NativeSelectOption value="">None</NativeSelectOption>
                  {surfacePatterns().map((pt) => (
                    <NativeSelectOption key={pt.id} value={pt.id}>
                      {pt.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              {def.fields.map((f) => (
                <EditField
                  key={f.prop}
                  field={f}
                  value={
                    block.overrides?.[f.prop] ??
                    (variantOf(def, block.variant).props as Record<string, unknown>)[f.prop]
                  }
                  onChange={(v) =>
                    updateBlock(block.uid, (b) => ({ ...b, overrides: { ...b.overrides, [f.prop]: v } }))
                  }
                />
              ))}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" size="icon-sm" aria-label="Move up" onClick={() => move(block.uid, -1)}>
                  <ArrowUp />
                </Button>
                <Button variant="outline" size="icon-sm" aria-label="Move down" onClick={() => move(block.uid, 1)}>
                  <ArrowDown />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copyBlock = { ...block, uid: uid() }
                    updatePage((p) => {
                      const i = p.blocks.findIndex((b) => b.uid === block.uid)
                      const blocks = [...p.blocks]
                      blocks.splice(i + 1, 0, copyBlock)
                      return { ...p, blocks }
                    })
                    setSelected(copyBlock.uid)
                  }}
                >
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    updatePage((p) => ({ ...p, blocks: p.blocks.filter((b) => b.uid !== block.uid) }))
                    setSelected(null)
                  }}
                >
                  <Trash2 /> Remove
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a section in the page or in Layers to change its variant, theme, surface and text. Add sections
              from the library; a new one goes after the selected section.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function EditField({ field, value, onChange }: { field: EditableField; value: unknown; onChange: (v: unknown) => void }) {
  if (field.kind === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
        <Switch checked={Boolean(value)} onCheckedChange={(v: boolean) => onChange(v)} />
      </div>
    )
  }
  if (field.kind === "select") {
    return (
      <Field label={field.label}>
        <NativeSelect className="w-full" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <NativeSelectOption key={o.value} value={o.value}>
              {o.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    )
  }
  return (
    <Field label={field.label}>
      {field.kind === "textarea" ? (
        <Textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  )
}
