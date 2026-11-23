"use client"

import * as React from "react"
import { Check, Copy, RotateCcw } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"
import { cn } from "@qdrant/design-system/lib/utils"

import {
  contrast,
  families,
  isMapping,
  mappingHex,
  mappingLabel,
  sameMapping,
  semanticCss,
  semanticGroups,
  semanticTokens,
  semanticVar,
  type Mapping,
  type Primitives,
  type SemanticToken,
} from "@/lib/color"

// What you changed in the semantic tokens: saved in this browser, so the assets keep it across reloads.
// Nothing here changes the repo; "Copy changes" gives the list to paste into the chat.
const KEY = "studio-color-semantic"
const listeners = new Set<() => void>()
let memory = "{}"

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? memory
  } catch {
    return memory
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

// Saved changes in an older shape (palette steps) are dropped.
function parse(raw: string): Record<string, Mapping> {
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== "object") return {}
    return Object.fromEntries(Object.entries(value).filter(([, m]) => isMapping(m))) as Record<string, Mapping>
  } catch {
    return {}
  }
}

function save(changes: Record<string, Mapping>) {
  memory = JSON.stringify(changes)
  try {
    localStorage.setItem(KEY, memory)
  } catch {
    // Private windows can refuse storage; the changes then last until the page reloads.
  }
  listeners.forEach((l) => l())
}

function setMapping(token: SemanticToken, mapping: Mapping) {
  const changes = parse(read())
  if (sameMapping(mapping, token.default)) delete changes[token.id]
  else changes[token.id] = mapping
  save(changes)
}

export function SemanticWorkbench({
  primitives,
  children,
}: {
  primitives: Primitives
  children: React.ReactNode
}) {
  const raw = React.useSyncExternalStore(subscribe, read, () => "{}")
  const changes = React.useMemo(() => parse(raw), [raw])
  const [copied, setCopied] = React.useState(false)
  const css = React.useMemo(() => semanticCss(changes), [changes])
  const mappingOf = (token: SemanticToken) => changes[token.id] ?? token.default
  // What a token's text sits on, for its contrast: background/default unless the token says.
  const groundOf = (token: SemanticToken) => {
    const id = token.contrast?.on ?? "background-default"
    const ground = semanticTokens.find((t) => t.id === id)!
    return { name: ground.name, mapping: mappingOf(ground) }
  }
  // Every primitive, by color in the palette's order, for the pickers.
  const ramps = families.map((f) => ({
    label: f.label,
    names: Object.keys(primitives)
      .filter((name) => name.startsWith(`${f.id}-`))
      .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1])),
  }))
  const changed = semanticTokens.filter((t) => changes[t.id])

  async function copyChanges() {
    const text = changed
      .map((t) => {
        const m = mappingOf(t)
        const hex = `${mappingHex(m, "light", primitives)} light, ${mappingHex(m, "dark", primitives)} dark`
        return `${t.name}: ${mappingLabel(m)} (${hex}), was ${mappingLabel(t.default)}`
      })
      .join("\n")
    try {
      await navigator.clipboard.writeText(`Semantic token changes from the studio's Color page:\n${text}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // The clipboard can be blocked; the list is still in the panel.
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <style id="color-semantic" dangerouslySetInnerHTML={{ __html: css }} />

      <aside className="flex flex-col rounded-lg border bg-card lg:sticky lg:top-16 lg:max-h-[calc(100svh-5rem)]">
        <div className="flex flex-col gap-1 border-b p-4">
          <h2 className="text-sm font-semibold">Semantic tokens</h2>
          <p className="text-xs text-muted-foreground">
            Each token points at a primitive in each theme, never at a palette step. Contrast is against what the
            token sits on, light then dark.
          </p>
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto">
          {semanticGroups.map((group) => (
            <section key={group.id} className="flex flex-col border-b px-4 py-3 last:border-b-0">
              <h3 className="pb-1 font-mono text-[11px] text-muted-foreground uppercase">{group.label}</h3>
              {semanticTokens
                .filter((t) => t.group === group.id)
                .map((token) => (
                  <TokenRow
                    key={token.id}
                    token={token}
                    mapping={mappingOf(token)}
                    changed={Boolean(changes[token.id])}
                    ground={groundOf(token)}
                    ramps={ramps}
                    primitives={primitives}
                  />
                ))}
            </section>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t p-3">
          <Button size="sm" variant="outline" disabled={!changed.length} onClick={copyChanges}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : `Copy changes${changed.length ? ` (${changed.length})` : ""}`}
          </Button>
          <Button size="sm" variant="ghost" disabled={!changed.length} onClick={() => save({})}>
            Reset all
          </Button>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  )
}

function TokenRow({
  token,
  mapping,
  changed,
  ground,
  ramps,
  primitives,
}: {
  token: SemanticToken
  mapping: Mapping
  changed: boolean
  ground: { name: string; mapping: Mapping }
  ramps: { label: string; names: string[] }[]
  primitives: Primitives
}) {
  const light = mappingHex(mapping, "light", primitives)
  const dark = mappingHex(mapping, "dark", primitives)
  const target = token.contrast?.target ?? 0
  const ratios = token.contrast
    ? (["light", "dark"] as const).map((mode) =>
        contrast(mappingHex(mapping, mode, primitives), mappingHex(ground.mapping, mode, primitives))
      )
    : null

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs" title={token.use}>
          {token.name}
        </span>
        {changed && (
          <button
            type="button"
            title="Back to the proposal"
            aria-label={`Reset ${token.name}`}
            onClick={() => setMapping(token, token.default)}
            className="grid size-5 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        )}
        <Chip id={token.id} mode="light" hex={light} />
        <Chip id={token.id} mode="dark" hex={dark} />
      </div>

      <div className="flex items-center gap-1.5">
        {(["light", "dark"] as const).map((mode) => (
          <NativeSelect
            key={mode}
            size="sm"
            aria-label={`${token.name} in ${mode}`}
            value={mapping[mode]}
            onChange={(e) => setMapping(token, { ...mapping, [mode]: e.target.value })}
            className="flex-1"
          >
            {ramps.map((r) => (
              <NativeSelectOptGroup key={r.label} label={r.label}>
                {r.names.map((n) => (
                  <NativeSelectOption key={n} value={n}>
                    {mode === "light" ? "Light" : "Dark"}: {n}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
        ))}
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">
        {token.use}.
        {ratios && (
          <>
            {" "}
            On {ground.name}{target ? ` (needs ${target}:1)` : ""}:{" "}
            {ratios.map((r, i) => (
              <span key={i} className={cn("font-mono", r < target && "font-semibold text-destructive")}>
                {i ? " / " : ""}
                {r.toFixed(1)}
              </span>
            ))}
            .
          </>
        )}
      </p>
    </div>
  )
}

// The token's color in one theme, as the CSS resolves it in a scope of that theme.
function Chip({ id, mode, hex }: { id: string; mode: "light" | "dark"; hex: string }) {
  return (
    <span
      data-theme={mode}
      title={`${mode === "light" ? "Light" : "Dark"}: ${hex}`}
      className="size-5 shrink-0 rounded-sm border"
      style={{ background: `var(${semanticVar(id)})` }}
    />
  )
}
