import {
  additionalResources,
  engineCloudBand,
  engineFeatures,
  engineHero,
  engineUseCases,
  getStartedFree,
} from "../content/engine"
import { footer, menus, navActions } from "../content/site"
import { Cta } from "../sections/cta"
import { FeatureGrid } from "../sections/feature-grid"
import { FeatureRows } from "../sections/feature-rows"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { Navbar } from "../sections/navbar"
import {
  EngineHero,
  FullyManagedDiagram,
  RunAnywhereDiagram,
} from "../visuals/engine"
import { BenchmarkDiagram } from "../visuals/home"

// The Qdrant Vector Search Engine page of qdrant.tech (/qdrant-vector-database/, read 2026-11-26), built from the
// section library like the home page (design lead, 2026-11-26): its copy from content/engine.ts, word for word, and
// its illustrations redrawn as diagrams (web/visuals/engine.tsx; the benchmark row reuses the home page's).
export function EnginePage() {
  const rowVisuals = [
    <BenchmarkDiagram key="performance" />,
    <FullyManagedDiagram key="managed" />,
    <RunAnywhereDiagram key="anywhere" />,
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
        {...engineHero}
        visual={<EngineHero />}
        visualFrame="none"
      />
      <FeatureRows
        rows={engineUseCases.map((row, i) => ({
          ...row,
          visual: rowVisuals[i],
        }))}
      />
      <FeatureGrid
        header={{
          title: engineFeatures.title,
          description: engineFeatures.description,
        }}
        items={engineFeatures.items}
        appearance="index"
        marker="icon"
        tones="mixed"
      />
      <Cta layout="band" {...engineCloudBand} />
      <FeatureGrid
        header={{ title: additionalResources.title }}
        items={additionalResources.items}
        columns={4}
        appearance="cards"
        marker="icon"
        tones="mixed"
      />
      <Cta layout="centered" {...getStartedFree} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
