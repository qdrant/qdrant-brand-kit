// The Patterns tab's Pages Explorations (2026-11-26): whole pages rebuilt from the section library (web/registry,
// real qdrant.tech copy), with a few patterns placed where they help, to see how they work together on a page.
//
// Pages are organized as worlds (2026-11-26): one per qdrant.tech page, each in its own file in page-worlds/, grouped
// in the sidebar (Home; Product, with Cloud). A world is its sections in the page's order, keyed by a short name,
// and its versions, each a mix of patterns on those sections with a code to point at. Codes are per world (PX for
// the home, CL for Cloud), so adding a page never renumbers another. To add a page: write page-worlds/<id>.ts(x)
// and list it in `worlds` below.
//
// Patterns are kept few and far apart, so the page breathes: never two in a row, none behind figures (stats), and
// the call to action's own rule ("No glows or patterns for now", design lead, 2026-11-21) is flagged where it's broken.

import { getSection } from "@qdrant/web/registry"

import type { Block } from "./blocks"
import { explorationGroups } from "./pattern-explorations"
import { cloud } from "./page-worlds/cloud"
import { home } from "./page-worlds/home"

export type PageBlock = Omit<Block, "uid">

// A pattern on one section: a background behind it, or a surface in its cards, and the room it needs under the
// section's content, if any (pad, in px, as in the Component Explorations; 2026-11-27).
export type MixOption = { pattern?: string[]; cardPattern?: string; pad?: number }
// Patterns per section, by the world's section keys.
export type Mix = Partial<Record<string, MixOption>>

export type PageVersion = { id: string; name: string; idea: string; mix: Mix }

export type PageWorld = {
  // The address (/web/patterns/pages/<id>) and the key of its saved mixes.
  id: string
  // The sidebar's group ("Home", "Product") and the page's name in it.
  group: string
  name: string
  // The codes' prefix: PX-01, CL-01.
  prefix: string
  // The live page it replicates.
  source: string
  // Its sections in the page's order.
  sections: Record<string, PageBlock>
  // Each section's name on its style menu.
  labels: Record<string, string>
  // Sections that never take a pattern (figures, the navbar).
  noPattern?: string[]
  versions: PageVersion[]
  // The page the style menus start from.
  start: Mix
  // Where the live page has something the library can't show, said once so it isn't mistaken for a choice.
  gaps?: string[]
  // The localStorage key for its saved mixes, when it isn't the default.
  store?: string
}

export const worlds: PageWorld[] = [home, cloud]

export const getWorld = (id: string) => worlds.find((w) => w.id === id)

// The sidebar's groups, in the order their first world appears.
export const worldGroups = () =>
  [...new Set(worlds.map((w) => w.group))].map((group) => ({ group, worlds: worlds.filter((w) => w.group === group) }))

export const sectionKeys = (world: PageWorld) => Object.keys(world.sections)

// The sections that render, in order: the frame maps its root's children to these.
export const renderedKeys = (world: PageWorld) =>
  sectionKeys(world).filter((k) => getSection(world.sections[k].section))

// A world's page with a mix of patterns.
export const worldPage = (world: PageWorld, mix: Mix = {}): PageBlock[] =>
  sectionKeys(world).map((k) => ({ ...world.sections[k], ...mix[k] }) as PageBlock)

export type ShownVersion = PageVersion & { code: string; blocks: PageBlock[] }

export const versionsOf = (world: PageWorld): ShownVersion[] =>
  world.versions.map((v, i) => ({
    ...v,
    code: `${world.prefix}-${String(i + 1).padStart(2, "0")}`,
    blocks: worldPage(world, v.mix),
  }))

// A version by its id, in any world, for the frame.
export const getPageExploration = (id: string) => worlds.flatMap(versionsOf).find((p) => p.id === id)

// ---- Styles (2026-11-26, as menus since 2026-11-27) ----------------------------------------------------------------
// Each section's styles: none, or one of the Component Explorations pairings on that same section and variant (a
// background pattern or a card pattern). A pairing that needs room under the section's content (a pad: the horizons,
// the dunes, the hero lab's backgrounds) brings it along, and the frame adds it to that section (2026-11-27); the
// footer's bands, which need room inside the footer, are left out. The page's view floats a menu of them over each
// section.

const OPTIONS = new WeakMap<PageWorld, Record<string, MixOption[]>>()

export function optionsFor(world: PageWorld): Record<string, MixOption[]> {
  const cached = OPTIONS.get(world)
  if (cached) return cached
  const pairings = explorationGroups.flatMap((g) => g.items)
  const out = Object.fromEntries(
    sectionKeys(world).map((k) => {
      const { section, variant } = world.sections[k]
      const seen = new Set<string>()
      const options = world.noPattern?.includes(k)
        ? []
        : pairings
            .filter((e) => e.section === section && e.variant === variant && !e.room && !e.bandBottom)
            .map((e): MixOption => ({
              ...(e.slot === "background" ? { pattern: [e.pattern] } : { cardPattern: e.pattern }),
              ...(e.pad ? { pad: e.pad } : {}),
            }))
            // One per pattern: the menu tells options apart by their pattern.
            .filter((o) => {
              const key = `${o.cardPattern ? "cards" : "bg"}:${idOf(o)}`
              if (seen.has(key)) return false
              seen.add(key)
              return true
            })
      return [k, options]
    })
  )
  OPTIONS.set(world, out)
  return out
}

export const idOf = (o?: MixOption) => o?.pattern?.[0] ?? o?.cardPattern ?? ""

// What breaks the page's rules in a mix, by section: a pattern next to another one, or a fifth one and over.
export function mixWarnings(world: PageWorld, mix: Mix): Record<string, string> {
  const keys = sectionKeys(world)
  const out: Record<string, string> = {}
  let count = 0
  keys.forEach((k, i) => {
    if (!mix[k]) return
    count += 1
    const prev = keys[i - 1]
    const next = keys[i + 1]
    if ((prev && mix[prev]) || (next && mix[next])) out[k] = "Next to another pattern"
    else if (count > 4) out[k] = "More than four patterns"
  })
  return out
}

// A mix as a short query string for the frame, and back.
export const encodeMix = (mix: Mix) => JSON.stringify(mix)
export function decodeMix(raw: string | null): Mix {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Mix
  } catch {
    return {}
  }
}
