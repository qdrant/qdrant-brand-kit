import { hybridFaq } from "../content/conversion"
import {
  hybridCta,
  hybridFeatures,
  hybridFit,
  hybridHero,
  hybridSetup,
} from "../content/hybrid-cloud"
import { hybridSteps } from "../content/sections"
import { footer, menus, navActions } from "../content/site"
import { Cta } from "../sections/cta"
import { Faq } from "../sections/faq"
import { FeatureGrid } from "../sections/feature-grid"
import { FeatureRows } from "../sections/feature-rows"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { Navbar } from "../sections/navbar"
import { Steps } from "../sections/steps"
import {
  HybridAgenticDiagram,
  HybridConsoleCard,
  HybridHero,
} from "../visuals/hybrid-cloud"

// The Qdrant Hybrid Cloud page of qdrant.tech (/hybrid-cloud/, read 2026-11-26), built from the section library like
// the home page (design lead, 2026-11-26): its copy from content/hybrid-cloud.ts and the Hybrid Cloud content the
// library already had, word for word, and its images redrawn (web/visuals/hybrid-cloud.tsx). The large card is a
// wide card with its console beside the text, the three small ones under it.
export function HybridCloudPage() {
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero
        layout="centered"
        {...hybridHero}
        visual={<HybridHero />}
        visualFrame="none"
      />
      <FeatureGrid
        header={{
          kicker: hybridFeatures.kicker,
          title: hybridFeatures.title,
          description: hybridFeatures.description,
        }}
        items={[
          {
            ...hybridFeatures.large,
            wide: true,
            visual: <HybridConsoleCard />,
          },
          ...hybridFeatures.small,
        ]}
        columns={3}
        appearance="cards"
        marker="icon"
        tones="mixed"
      />
      <Steps
        layout="cells"
        header={{
          kicker: hybridSteps.kicker,
          title: hybridSteps.title,
          description: hybridSetup.description,
          action: hybridSetup.secondary,
        }}
        steps={hybridSteps.steps}
      />
      <FeatureRows
        rows={[{ ...hybridFit, visual: <HybridAgenticDiagram /> }]}
      />
      <Faq
        layout="split"
        header={{ title: hybridFaq.title }}
        items={hybridFaq.items}
      />
      <Cta layout="centered" {...hybridCta} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
