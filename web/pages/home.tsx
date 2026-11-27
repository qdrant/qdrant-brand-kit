import { homeBuilders, homeSolutions } from "../content/home"
import { canvaQuote } from "../content/conversion"
import {
  applications,
  builders,
  customers,
  deploy,
  enterprise,
  performance,
  whyQdrant,
} from "../content/sections"
import {
  closingCta,
  footer,
  homeHero,
  menus,
  navActions,
} from "../content/site"
import { CodePanel } from "../lib/code-panel"
import { Bento } from "../sections/bento"
import { Cta } from "../sections/cta"
import { FeatureGrid } from "../sections/feature-grid"
import { FeatureRows } from "../sections/feature-rows"
import { FeatureTabs } from "../sections/feature-tabs"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { LogoCloud } from "../sections/logo-cloud"
import { Navbar } from "../sections/navbar"
import { Stats } from "../sections/stats"
import { Testimonials } from "../sections/testimonials"
import {
  AgentMemoryDiagram,
  AnomalyDiagram,
  BenchmarkDiagram,
  ComplianceBadges,
  FilteringDiagram,
  HeroPlanet,
  HybridDiagram,
  IndexingDiagram,
  InferenceDiagram,
  MetadataFilterCode,
  MonitoringLogos,
  MultivectorDiagram,
  QuantizationDiagram,
  RagDiagram,
  RecommendDiagram,
  RerankDiagram,
  SemanticSearchDiagram,
  SsoLogos,
  StorageDiagram,
} from "../visuals/home"
import { WebUi } from "../visuals/web-ui"

// The home page of qdrant.tech (read 2026-11-26), built from the section library (design lead, 2026-11-26): its copy
// from content/home.ts and the home content the library already had, word for word, and its graphics redrawn as
// diagrams in the Space signatures' style (web/visuals/home.tsx), with no PNG or JPG. One theme for the whole page,
// the site's, and the marketing context, so its accent is amaranth.
export function HomePage() {
  const whyVisuals = [
    <MetadataFilterCode key="filters" />,
    <HybridDiagram key="hybrid" />,
    <MultivectorDiagram key="multivector" />,
    <FilteringDiagram key="filtering" />,
    <RerankDiagram key="rerank" />,
  ]
  const performanceVisuals = [
    <BenchmarkDiagram key="benchmark" />,
    <IndexingDiagram key="indexing" />,
    <StorageDiagram key="storage" />,
    <QuantizationDiagram key="quantization" />,
  ]
  const builderVisuals = [
    <CodePanel
      key="code"
      title={builders.tabs[0]?.file}
      code={builders.tabs[0]?.code ?? ""}
      language="python"
      className="w-[552px] max-w-full rounded-none border-0"
    />,
    <WebUi key="web-ui" />,
    <InferenceDiagram key="inference" />,
  ]
  const solutionVisuals = [
    <RagDiagram key="rag" />,
    <AgentMemoryDiagram key="agents" />,
    <SemanticSearchDiagram key="semantic" />,
    <RecommendDiagram key="recommend" />,
    <AnomalyDiagram key="anomaly" />,
  ]

  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero
        layout="centered"
        {...homeHero}
        visual={<HeroPlanet />}
        visualFrame="none"
      />
      <LogoCloud
        layout="grid"
        logos={customers.home}
        action={customers.action}
      />
      <FeatureRows
        header={{
          kicker: whyQdrant.kicker,
          title: whyQdrant.title,
          description: whyQdrant.description,
          action: whyQdrant.action,
        }}
        rows={whyQdrant.rows.map((row, i) => ({
          ...row,
          visual: whyVisuals[i] ?? undefined,
        }))}
      />
      <Stats
        layout="cards"
        header={{ title: applications.title }}
        items={applications.cards.map((c) => ({
          company: c.company,
          logo: c.logo,
          value: c.value,
          text: c.text,
          href: c.href,
        }))}
      />
      <FeatureGrid
        header={{ title: deploy.title, action: deploy.action }}
        items={deploy.items}
        columns={4}
        appearance="cards"
        marker="icon"
        tones="mixed"
      />
      <Bento
        header={{
          title: enterprise.title,
          description: enterprise.description,
          action: enterprise.action,
        }}
        list={{ items: enterprise.list }}
        tiles={enterprise.tiles.map((title, i) => ({
          title,
          visual: [
            <ComplianceBadges key="compliance" />,
            <MonitoringLogos key="monitoring" />,
            <SsoLogos key="sso" />,
          ][i],
        }))}
      />
      <Testimonials layout="single" quotes={[canvaQuote]} />
      <FeatureTabs
        header={{
          kicker: performance.kicker,
          title: performance.title,
          description: performance.description,
          action: performance.action,
        }}
        items={performance.items.map((item, i) => ({
          ...item,
          visual: performanceVisuals[i] ?? undefined,
        }))}
      />
      <FeatureTabs
        layout="window"
        header={{
          title: homeBuilders.title,
          description: homeBuilders.description,
        }}
        items={homeBuilders.items.map((item, i) => ({
          ...item,
          visual: builderVisuals[i] ?? undefined,
        }))}
      />
      <FeatureTabs
        layout="top"
        header={{
          kicker: homeSolutions.kicker,
          title: homeSolutions.title,
          description: homeSolutions.description,
        }}
        items={homeSolutions.items.map((item, i) => ({
          ...item,
          visual: solutionVisuals[i] ?? undefined,
        }))}
      />
      <Cta layout="centered" {...closingCta} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
