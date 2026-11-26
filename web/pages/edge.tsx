import {
  edgeCta,
  edgeDemos,
  edgeFaq,
  edgeHardware,
  edgeHero,
  edgeOnDevice,
  edgeSteps,
  edgeSync,
  edgeWhy,
} from "../content/edge"
import { footer, menus, navActions } from "../content/site"
import { CodePanel } from "../lib/code-panel"
import { CodeTabs } from "../lib/code-tabs"
import { Cta } from "../sections/cta"
import { Faq } from "../sections/faq"
import { FeatureGrid } from "../sections/feature-grid"
import { FeatureRows } from "../sections/feature-rows"
import { FeatureTabs } from "../sections/feature-tabs"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { Navbar } from "../sections/navbar"
import { Steps } from "../sections/steps"
import {
  EdgeAnalyzeCard,
  EdgeBackupCard,
  EdgeFacetDiagram,
  EdgeIndexCard,
  EdgeSyncCard,
  MissionControlCover,
  SentinelCover,
  SmartGlassesCover,
  VisualSearchCover,
} from "../visuals/edge"

// The Qdrant Edge page of qdrant.tech (/edge/, read 2026-11-26), built from the section library like the home page
// (design lead, 2026-11-26): its copy from content/edge.ts, word for word, its code as the site has it, and the demos'
// footage and the cards' images redrawn (web/visuals/edge.tsx).
export function EdgePage() {
  const covers = [
    <MissionControlCover key="mc" />,
    <SmartGlassesCover key="sg" />,
    <SentinelCover key="se" />,
    <VisualSearchCover key="vs" />,
  ]
  const syncVisuals = [
    <EdgeIndexCard key="index" />,
    <EdgeBackupCard key="backup" />,
    <EdgeAnalyzeCard key="analyze" />,
    <EdgeSyncCard key="sync" />,
  ]
  const onDeviceVisuals = [
    <CodePanel
      key="fastembed"
      title="python"
      code={edgeOnDevice.code[0] ?? ""}
      language="python"
      className="w-[552px] max-w-full rounded-none border-0"
    />,
    <CodePanel
      key="bm25"
      title="python"
      code={edgeOnDevice.code[1] ?? ""}
      language="python"
      className="w-[552px] max-w-full rounded-none border-0"
    />,
    <EdgeFacetDiagram key="facets" />,
  ]
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero
        layout="split"
        kicker={edgeHero.kicker}
        title={edgeHero.title}
        description={edgeHero.description}
        primary={edgeHero.primary}
        secondary={edgeHero.secondary}
        note={edgeHero.note}
        visual={
          <CodePanel
            title="python"
            code={edgeHero.code}
            language="python"
            className="w-[552px] max-w-full rounded-none border-0"
          />
        }
      />
      <FeatureGrid
        header={{
          kicker: edgeDemos.kicker,
          title: edgeDemos.title,
          description: edgeDemos.description,
        }}
        items={edgeDemos.items.map((item, i) => ({
          ...item,
          cover: <div className="aspect-video">{covers[i]}</div>,
        }))}
        columns={2}
        appearance="cards"
        marker="none"
      />
      <FeatureGrid
        header={{ title: edgeWhy.title, action: edgeWhy.action }}
        items={edgeWhy.items}
        columns={3}
        appearance="cells"
        marker="icon"
        tones="mixed"
      />
      <FeatureGrid
        header={{
          kicker: edgeSync.kicker,
          title: edgeSync.title,
          description: edgeSync.description,
        }}
        items={edgeSync.items.map((item, i) => ({
          ...item,
          cover: syncVisuals[i],
        }))}
        columns={4}
        appearance="cards"
        marker="none"
      />
      <Steps
        layout="cells"
        header={{
          kicker: edgeSteps.kicker,
          title: edgeSteps.title,
          description: edgeSteps.description,
          action: edgeSteps.action,
        }}
        steps={edgeSteps.steps}
      />
      <FeatureTabs
        header={{
          kicker: edgeOnDevice.kicker,
          title: edgeOnDevice.title,
          description: edgeOnDevice.description,
        }}
        items={edgeOnDevice.items.map((item, i) => ({
          ...item,
          visual: onDeviceVisuals[i],
        }))}
      />
      <FeatureRows
        rows={[
          {
            tag: edgeHardware.kicker,
            title: edgeHardware.title,
            points: edgeHardware.items.map((item) => ({
              label: item.title,
              text: item.text ?? "",
            })),
            link: edgeHardware.action,
            visual: (
              <CodeTabs
                className="w-[552px] max-w-full"
                tabs={edgeHardware.tabs.map((t) => ({
                  label: t.label,
                  code: t.code,
                  language: t.label === "Python" ? "python" : "text",
                }))}
              />
            ),
          },
        ]}
      />
      <Faq
        layout="split"
        header={{ title: edgeFaq.title }}
        items={edgeFaq.items}
      />
      <Cta layout="centered" {...edgeCta} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
