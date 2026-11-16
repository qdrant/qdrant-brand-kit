import type * as React from "react"

import { Card } from "@qdrant/design-system/components/ui/card"
import { cn } from "@qdrant/design-system/lib/utils"

import { ArrowLink } from "@qdrant/web/lib/arrow-link"
import { ASSETS } from "@qdrant/web/lib/assets"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

// The card's texture (Figma "Hexagonal-Pattern", 20251:36136): its tile is a square grid of dots about 10px
// apart, faded in at the bottom-left and top-right corners by two blurred circles. No brand pattern matches it
// (the Generative-Hexagon patterns are outlined hexagons on full-bleed dark or red backdrops), so it's redrawn
// here in CSS, in the text color at low strength. The masks only read alpha, so their color doesn't show.
const dotTexture: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1.5px)",
  backgroundSize: "10px 10px",
  maskImage:
    "radial-gradient(circle at -16% 122%, black 80px, transparent 240px), radial-gradient(circle at 103% -32%, black 85px, transparent 250px)",
}

// "Case-Study" (Figma 19619:75509): a customer story beside a card with the customer's logo. A light section
// on the dark page: 120px above and 80px below at 1440, the text and the card on two equal columns.
export function ResilienceCaseStudy() {
  return (
    <Section theme="light" className="lg:pb-(--qd-layout-section-padding-min)">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <div className="flex flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <p className={type.kicker}>RESILIENCE IN PRODUCTION</p>
            <h2 className={type.h3}>How Teams Maintain Uptime at Scale</h2>
          </div>
          <p className={cn(type.body, "lg:w-7/8")}>
            Sapu migrated from self-hosted to Qdrant Cloud Premium, indexing 28
            million PubMed abstracts in a single collection.
          </p>
          <ArrowLink
            href="https://qdrant.tech/blog/case-study-sapu/"
            target="_blank"
            rel="noreferrer"
          >
            Read the Case Study
          </ArrowLink>
        </div>

        <Card className="relative aspect-3/2 items-center justify-center py-0">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={dotTexture}
          />
          <img
            src={`${ASSETS}/logos/sapu-bioscience.svg`}
            alt="Sapu Bioscience"
            width={164}
            height={40}
            className="relative h-10 w-auto"
          />
        </Card>
      </div>
    </Section>
  )
}
