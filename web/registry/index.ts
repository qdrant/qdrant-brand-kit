import { caseStudies } from "./case-studies"
import { comparisonTable } from "./comparison-table"
import { contact } from "./contact"
import { faq } from "./faq"
import { newsletter } from "./newsletter"
import { pricingCalculator } from "./pricing-calculator"
import { pricingTiers } from "./pricing-tiers"
import { signupForm } from "./signup-form"
import { testimonials } from "./testimonials"
import { anchorNav } from "./anchor-nav"
import { architectureDiagram } from "./architecture-diagram"
import { benchmarkChart } from "./benchmark-chart"
import { eventAgenda } from "./event-agenda"
import { installCommand } from "./install-command"
import { promoBanner } from "./promo-banner"
import { sdkGrid } from "./sdk-grid"
import { securityCompliance } from "./security-compliance"
import { sponsorTiers } from "./sponsor-tiers"
import { withWithout } from "./with-without"
import { article } from "./article"
import { blogGrid } from "./blog-grid"
import { changelog } from "./changelog"
import { eventsList } from "./events-list"
import { filterableIndex } from "./filterable-index"
import { integrationsDirectory } from "./integrations-directory"
import { legal } from "./legal"
import { notFound } from "./not-found"
import { pageHeader } from "./page-header"
import { resourceCards } from "./resource-cards"
import { aboutStory } from "./about-story"
import { backers } from "./backers"
import { communityChannels } from "./community-channels"
import { communityWall } from "./community-wall"
import { partnerDirectory } from "./partner-directory"
import { profileGrid } from "./profile-grid"
import { teamGrid } from "./team-grid"
import { values } from "./values"
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
  anchorNav,
  hero,
  pageHeader,
  logoCloud,
  featureGrid,
  featureRows,
  bento,
  featureTabs,
  steps,
  stats,
  testimonials,
  caseStudies,
  codeShowcase,
  installCommand,
  sdkGrid,
  benchmarkChart,
  architectureDiagram,
  securityCompliance,
  withWithout,
  promoBanner,
  pricingTiers,
  pricingCalculator,
  comparisonTable,
  faq,
  cta,
  newsletter,
  contact,
  signupForm,
  blogGrid,
  resourceCards,
  filterableIndex,
  integrationsDirectory,
  eventsList,
  article,
  legal,
  changelog,
  teamGrid,
  profileGrid,
  partnerDirectory,
  aboutStory,
  values,
  backers,
  communityChannels,
  communityWall,
  eventAgenda,
  sponsorTiers,
  notFound,
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
