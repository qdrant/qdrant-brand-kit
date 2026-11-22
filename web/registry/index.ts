import { announcementBar } from "./announcement-bar"
import { cta } from "./cta"
import { footer } from "./footer"
import { hero } from "./hero"
import { navbar } from "./navbar"
import { categories, type SectionDefinition } from "./types"

export * from "./types"

// Every section in the library, in the order a page uses them.
export const sections = [announcementBar, navbar, hero, cta, footer] as unknown as SectionDefinition[]

export function getSection(id: string) {
  return sections.find((s) => s.id === id)
}

// The categories that have sections, each with its sections, in the categories' order.
export function sectionsByCategory() {
  return categories
    .map((c) => ({ ...c, sections: sections.filter((s) => s.category === c.id) }))
    .filter((c) => c.sections.length > 0)
}
