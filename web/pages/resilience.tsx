import { SiteHeader } from "@qdrant/web/sections/site-header"
import { ResilienceHero } from "@qdrant/web/sections/resilience-hero"
import { ResilienceHowItWorks } from "@qdrant/web/sections/resilience-how-it-works"
import { ResilienceClusterConfiguration } from "@qdrant/web/sections/resilience-cluster-configuration"
import { ResilienceCapabilities } from "@qdrant/web/sections/resilience-capabilities"
import { ResilienceDeploymentModels } from "@qdrant/web/sections/resilience-deployment-models"
import { ResilienceCaseStudy } from "@qdrant/web/sections/resilience-case-study"
import { ResilienceFaq } from "@qdrant/web/sections/resilience-faq"
import { CtaBanner } from "@qdrant/web/sections/cta-banner"
import { SiteFooter } from "@qdrant/web/sections/site-footer"

// The Resilience page of qdrant.tech (Figma: Qdrant Web Design, "Resilience-Subpage", node 19452:25124),
// rebuilt from the design system to see it on a real marketing page. Layout and copy from the Figma.
export function ResiliencePage() {
  return (
    <main className="bg-background text-foreground">
      <SiteHeader />
      <ResilienceHero />
      <ResilienceHowItWorks />
      <ResilienceClusterConfiguration />
      <ResilienceCapabilities />
      <ResilienceDeploymentModels />
      {/* The light run of the page in one light block, so no seam of the dark page shows between its sections. */}
      <div data-theme="light" className="bg-background">
        <ResilienceCaseStudy />
        <ResilienceFaq />
        <CtaBanner />
      </div>
      <SiteFooter />
    </main>
  )
}
