import { announcementBar } from "./announcement-bar"
import { bento } from "./bento"
import { codeShowcase } from "./code-showcase"
import { cta } from "./cta"
import { featureGrid } from "./feature-grid"
import { featureRows } from "./feature-rows"
import { featureTabs } from "./feature-tabs"
import { footer } from "./footer"
import { hero } from "./hero"
import { logoCloud } from "./logo-cloud"
import { navbar } from "./navbar"
import { stats } from "./stats"
import { steps } from "./steps"
import { categories, type SectionDefinition } from "./types"

export * from "./types"

// Every section in the library, in the order a page uses them.
export const sections = [
  announcementBar,
  navbar,
  hero,
  logoCloud,
  featureGrid,
  featureRows,
  bento,
  featureTabs,
  steps,
  stats,
  codeShowcase,
  cta,
  footer,
] as unknown as SectionDefinition[]

export function getSection(id: string) {
  return sections.find((s) => s.id === id)
}

// The categories that have sections, each with its sections, in the categories' order.
export function sectionsByCategory() {
  return categories
    .map((c) => ({ ...c, sections: sections.filter((s) => s.category === c.id) }))
    .filter((c) => c.sections.length > 0)
}
