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
// the call to action's own rule ("No glows or patterns for now", Juan, 2026-11-21) is flagged where it's broken.

import type { Block } from "./blocks"
import { explorationGroups } from "./pattern-explorations"
import { cloud } from "./page-worlds/cloud"
import { home } from "./page-worlds/home"

export type PageBlock = Omit<Block, "uid">

// A pattern on one section: a background behind it, or a surface in its cards.
export type MixOption = { pattern?: string[]; cardPattern?: string }
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
  // Each section's name in the Randomize panel.
  labels: Record<string, string>
  // Sections that never take a pattern (figures, the navbar).
  noPattern?: string[]
  versions: PageVersion[]
  // The Randomize panel's first mix.
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

// ---- Randomize (2026-11-26) -------------------------------------------------------------------------------------------
// Each section's pattern options, from the Component Explorations pairings on that same section and variant (a
// background pattern or a card pattern). Pairings that need room the page doesn't give them (the footer's bands, the
// horizons' padding) are left out.

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
            .filter((e) => e.section === section && e.variant === variant && !e.room && !e.pad && !e.bandBottom)
            .map((e): MixOption => (e.slot === "background" ? { pattern: [e.pattern] } : { cardPattern: e.pattern }))
            .filter((o) => {
              const key = JSON.stringify(o)
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

const idOf = (o?: MixOption) => o?.pattern?.[0] ?? o?.cardPattern ?? ""

// A random mix that keeps the page breathing: at most four patterns, never two sections in a row, each pattern once,
// and each section either plain or one of its own options.
export function randomMix(world: PageWorld, rand: () => number = Math.random): Mix {
  const options = optionsFor(world)
  const mix: Mix = {}
  let count = 0
  let previous = false
  const used = new Set<string>()
  for (const k of sectionKeys(world)) {
    const own = options[k] ?? []
    if (previous || count >= 4 || !own.length || rand() < 0.45) {
      previous = false
      continue
    }
    // Each pattern once per page, so a mix reads as a combination rather than a repeat.
    const fresh = own.filter((o) => !used.has(idOf(o)))
    const pick = fresh[Math.floor(rand() * fresh.length)]
    if (!pick) {
      previous = false
      continue
    }
    mix[k] = pick
    used.add(idOf(pick))
    count += 1
    previous = true
  }
  return mix
}

// One section at a time: another of its own options, one the page doesn't use yet when there is one. The page's
// rules (at most four, never two in a row) are shown, not enforced, so a single section can still be tried anywhere.
export function shuffleSection(world: PageWorld, mix: Mix, key: string, rand: () => number = Math.random): Mix {
  const current = idOf(mix[key])
  const others = new Set(
    Object.keys(mix)
      .filter((k) => k !== key)
      .map((k) => idOf(mix[k]))
  )
  const options = (optionsFor(world)[key] ?? []).filter((o) => idOf(o) !== current)
  const fresh = options.filter((o) => !others.has(idOf(o)))
  const pool = fresh.length ? fresh : options
  const pick = pool[Math.floor(rand() * pool.length)]
  return pick ? { ...mix, [key]: pick } : mix
}

export function clearSection(mix: Mix, key: string): Mix {
  const next = { ...mix }
  delete next[key]
  return next
}

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
