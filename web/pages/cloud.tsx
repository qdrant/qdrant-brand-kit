import {
  cloudCapabilities,
  cloudCta,
  cloudLogos,
  cloudOffload,
  cloudPageHero,
  cloudPricing,
  cloudStack,
  cloudStart,
} from "../content/cloud"
import { cloudCustomers, cloudFaq } from "../content/conversion"
import { cloudCapabilityTabs } from "../content/platform"
import { footer, menus, navActions } from "../content/site"
import { CodePanel } from "../lib/code-panel"
import { CodeTabs } from "../lib/code-tabs"
import { AnchorNav } from "../sections/anchor-nav"
import { CaseStudies } from "../sections/case-studies"
import { Cta } from "../sections/cta"
import { Faq } from "../sections/faq"
import { FeatureGrid } from "../sections/feature-grid"
import { FeatureRows } from "../sections/feature-rows"
import { FeatureTabs } from "../sections/feature-tabs"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { LogoCloud } from "../sections/logo-cloud"
import { Navbar } from "../sections/navbar"
import type { Tone } from "../lib/tone"
import { CloudHero, InfrastructureDiagram } from "../visuals/cloud"
import { WebUi } from "../visuals/web-ui"

// The Qdrant Managed Cloud page of qdrant.tech (/cloud/, read 2026-11-26), built from the section library like the
// home page (design lead, 2026-11-26): its copy from content/cloud.ts and the Cloud content the library already
// had, word for word, its screenshots rebuilt in HTML and its illustrations redrawn (web/visuals/cloud.tsx). The
// capability tabs are the site's: anchor tabs over the five groups, each a section of its own.
export function CloudPage() {
  const [sdk, , terraform] = cloudStack.tabs
  const stackVisuals = [
    <CodeTabs
      key="sdk"
      className="w-[552px] max-w-full"
      tabs={(sdk?.code ?? []).map((c) => ({
        label: c.label,
        code: c.code,
        language: c.language as "python" | "shell",
      }))}
    />,
    // The tab's copy is about inspecting collections and running queries, the Web UI (the site shows metrics there).
    <WebUi key="console" />,
    <CodePanel
      key="terraform"
      title={terraform?.code?.[0]?.label}
      code={terraform?.code?.[0]?.code ?? ""}
      language="text"
      className="w-[552px] max-w-full rounded-none border-0"
    />,
  ]
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero layout="centered" {...cloudPageHero} visual={<CloudHero />} />
      <LogoCloud
        layout="grid"
        label={cloudLogos.label}
        logos={cloudLogos.logos}
      />
      <FeatureRows
        rows={[{ ...cloudOffload, visual: <InfrastructureDiagram /> }]}
      />
      <CaseStudies
        layout="cards"
        header={{ kicker: cloudCustomers.kicker, title: cloudCustomers.title }}
        items={cloudCustomers.items}
      />
      {/* The anchor bar carries the hub's title; each group is its own section under it. Wrapped, so the bar stays
          only while the groups are on screen. */}
      <div>
        <AnchorNav
          layout="tabs"
          label={cloudCapabilities.title}
          items={cloudCapabilityTabs.items}
          sticky
        />
        {cloudCapabilities.groups.map((group) => (
          <FeatureGrid
            key={group.id}
            id={group.id}
            header={{
              title: group.title,
              description: group.description,
            }}
            items={group.items}
            appearance="index"
            marker="icon"
            tones={group.tone as Tone}
          />
        ))}
      </div>
      <FeatureTabs
        layout="window"
        header={{ kicker: cloudStack.kicker, title: cloudStack.title }}
        items={cloudStack.tabs.map((tab, i) => ({
          title: tab.title,
          text: `${tab.heading} ${tab.text}`,
          visual: stackVisuals[i],
        }))}
      />
      <FeatureGrid
        items={cloudStack.links}
        columns={4}
        appearance="cells"
        marker="icon"
        tones="mixed"
      />
      <Cta layout="band" {...cloudPricing} />
      <FeatureGrid
        header={{ kicker: cloudStart.kicker, title: cloudStart.title }}
        items={cloudStart.items}
        columns={3}
        appearance="cards"
        marker="icon"
        tones="mixed"
      />
      <Faq
        layout="categories"
        header={{ title: cloudFaq.title }}
        categories={cloudFaq.categories}
      />
      <Cta layout="centered" {...cloudCta} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
