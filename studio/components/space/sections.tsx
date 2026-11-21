import type { CSSProperties, ReactNode } from "react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

import { Horizon } from "./horizon"
import { Navigator } from "./navigator"
import { ContourField, DitherHaze } from "./shaders"
import { GlassCard } from "./surfaces"

// A few options put together on real sections: the web layout (Section), the type set and the design
// system's buttons. The heading is the studio's sample sentence (Juan, 2026-11-17); the rest is placeholder.
export const SAMPLE = "High-Performance Vector Search at Scale"

// A full-bleed background behind a Section. The scene fills this wrapper; the Section sits on top.
function Backdrop({
  scene,
  theme,
  children,
}: {
  scene: ReactNode
  theme?: "dark" | "light"
  children: ReactNode
}) {
  return (
    <div data-theme={theme} className="space-scene relative isolate overflow-hidden">
      {scene}
      {children}
    </div>
  )
}

// Lays a canvas scene over the section's background instead of painting its own.
const transparent = { "--sp-bg": "transparent" } as CSSProperties

export function SpaceSections() {
  return (
    <div className="flex flex-col gap-8">
      <Example name="Hero: Dither haze with the Navigator">
        <Backdrop scene={<DitherHaze />}>
          <Section className="bg-transparent" innerClassName="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className={type.kicker}>Kicker</span>
                <h2 className={type.h3}>{SAMPLE}</h2>
                <p className={type.lead}>
                  Placeholder supporting text for the hero, one or two lines. The copy comes from the
                  page&apos;s Figma.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg">Primary</Button>
                <Button size="lg" variant="outline">
                  Secondary
                </Button>
              </div>
            </div>
            <div className="relative h-[420px]" style={transparent}>
              <Navigator />
            </div>
          </Section>
        </Backdrop>
      </Example>

      <Example name="Feature cards: Contour field with Glass layers">
        <Backdrop scene={<ContourField />}>
          <Section className="bg-transparent" innerClassName="flex flex-col gap-12">
            <div className="flex max-w-2xl flex-col gap-4">
              <span className={type.kicker}>Kicker</span>
              <h2 className={type.h3}>{SAMPLE}</h2>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              <GlassCard />
              <GlassCard />
              <GlassCard />
            </div>
          </Section>
        </Backdrop>
      </Example>

      <Example name="Call to action: Horizon">
        <Backdrop scene={<Horizon />}>
          <Section
            className="bg-transparent"
            innerClassName="flex min-h-[420px] flex-col items-center gap-8 text-center"
          >
            <h2 className={`${type.h3} max-w-2xl`}>{SAMPLE}</h2>
            <Button size="lg">Primary</Button>
          </Section>
        </Backdrop>
      </Example>
    </div>
  )
}

function Example({ name, children }: { name: string; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">{name}</h2>
      <div className="overflow-hidden rounded-lg border">{children}</div>
    </article>
  )
}
