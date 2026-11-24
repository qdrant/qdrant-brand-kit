import { resilienceCapabilities, resilienceCaseStudy, resilienceConfiguration, resilienceCta, resilienceDeployment, resilienceFaq, resilienceHero, resilienceHowItWorks } from "../content/resilience"
import { footer, menus, navActions } from "../content/site"
import { ASSETS } from "../lib/assets"
import { AnchorNav } from "../sections/anchor-nav"
import { CaseStudies } from "../sections/case-studies"
import { ComparisonTable } from "../sections/comparison-table"
import { Cta } from "../sections/cta"
import { Faq } from "../sections/faq"
import { FeatureGrid } from "../sections/feature-grid"
import { FeatureRows } from "../sections/feature-rows"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { Navbar } from "../sections/navbar"
import { ClusterDiagram } from "../visuals/cluster-diagram"
import { ConsoleBackupSchedule, ConsoleClusterOverview, ConsoleCreateCluster } from "../visuals/console"
import { ConsoleClusterSetup } from "../visuals/console-setup"
import { ZoneGlobe } from "../visuals/zone-globe"

// The Resilience page of qdrant.tech (Figma: Qdrant Web Design, "Resilience-Subpage", node 19452:25124), built
// from the section library (Juan, 2026-11-22): its copy from content/resilience.ts, its Console screens and
// cluster diagrams from web/visuals. One theme for the whole page, the site's (dark or light), and the marketing
// context, so its accent is amaranth.
export function ResiliencePage() {
  const { rows, cards } = resilienceCapabilities
  const consoles = [<ConsoleCreateCluster key="create" />, <ConsoleClusterOverview key="overview" />, <ConsoleBackupSchedule key="backup" />]

  return (
    <main data-web data-context="marketing" className="bg-background text-foreground">
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero layout="split" {...resilienceHero} visual={<ConsoleClusterSetup />} />
      <FeatureGrid
        header={resilienceHowItWorks.header}
        items={resilienceHowItWorks.items}
        columns={3}
        appearance="cells"
        tones="blue"
      />
      <FeatureGrid
        header={resilienceConfiguration.header}
        items={[
          ...resilienceConfiguration.items.map(({ diagram, ...item }) => ({
            ...item,
            visual: <ClusterDiagram diagram={diagram} />,
          })),
          { ...resilienceConfiguration.multiAz, visual: <ZoneGlobe />, visualFrame: "none" },
        ]}
        columns={3}
        marker="none"
      />
      <AnchorNav label="Capabilities" items={resilienceCapabilities.tabs} sticky />
      <FeatureRows
        cardPattern="depth-haze"
        header={resilienceCapabilities.header}
        rows={rows.map((row, i) => ({ ...row, visual: consoles[i] }))}
      />
      <FeatureGrid items={cards} columns={2} />
      <ComparisonTable
        layout="matrix"
        header={resilienceDeployment.header}
        columns={resilienceDeployment.columns}
        groups={resilienceDeployment.groups}
      />
      <CaseStudies
        layout="featured"
        header={resilienceCaseStudy.header}
        story={{
          ...resilienceCaseStudy.story,
          visual: (
            <img src={`${ASSETS}/logos/sapu-bioscience.svg`} alt="Sapu Bioscience" width={164} height={40} className="h-10 w-auto" />
          ),
        }}
      />
      <Faq layout="split" header={resilienceFaq.header} items={resilienceFaq.items} />
      <Cta layout="panel" {...resilienceCta} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
