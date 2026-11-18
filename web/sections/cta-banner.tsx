import type * as React from "react"

import {
  Button,
  buttonVariants,
} from "@qdrant/design-system/components/ui/button"
import { Card } from "@qdrant/design-system/components/ui/card"

import { cn } from "@qdrant/design-system/lib/utils"
import { ASSETS } from "@qdrant/web/lib/assets"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

// The space behind the banner (Figma: the card's star texture, and the globe 16132:51189), in CSS only:
// palette variables, step 500 on dark, behind the content. Masks only read alpha, so their color doesn't show.
const tint = (color: string, amount: number) =>
  `color-mix(in oklab, var(${color}) ${amount}%, transparent)`

// Stars: tiny dots on two tiles of different sizes, so the field doesn't read as a grid.
const starLayers: [x: number, y: number, alpha: number, tile: string][] = [
  [23, 31, 55, "180px 140px"],
  [97, 88, 35, "180px 140px"],
  [151, 17, 45, "180px 140px"],
  [61, 151, 30, "260px 210px"],
  [189, 63, 50, "260px 210px"],
  [231, 187, 35, "260px 210px"],
]
const stars: React.CSSProperties = {
  backgroundImage: starLayers
    .map(
      ([x, y, alpha]) =>
        `radial-gradient(circle at ${x}px ${y}px, ${tint("--qd-color-neutral-0", alpha)} 0.75px, transparent 1.25px)`
    )
    .join(", "),
  backgroundSize: starLayers.map(([, , , tile]) => tile).join(", "),
}

// The globe's atmosphere: a soft light where its rim meets the card's right edge.
const atmosphere: React.CSSProperties = {
  backgroundImage: `radial-gradient(ellipse 55% 75% at 100% 45%, ${tint("--qd-color-blue-500", 22)}, ${tint("--qd-color-indigo-500", 8)} 55%, transparent 100%)`,
}

// The globe: an ellipse centered on the card's right edge, its top 132px down (as in the Figma, at a 1110px
// card). A lit rim, a light just inside it, and a glow above it.
const globe: React.CSSProperties = {
  width: 1328,
  height: 962,
  left: "calc(100% - 664px)",
  top: 132,
  backgroundColor: "var(--qd-color-neutral-950)",
  boxShadow: [
    `0 -1px 0 0 ${tint("--qd-color-blue-500", 90)}`,
    `0 -6px 16px -2px ${tint("--qd-color-blue-500", 55)}`,
    `0 -24px 64px 0 ${tint("--qd-color-indigo-500", 35)}`,
    `inset 0 12px 28px -14px ${tint("--qd-color-blue-500", 70)}`,
  ].join(", "),
}

// Its grid: latitude rings around a pole near the top, and meridians fanning out from it, fading toward the
// left and the bottom like the Figma's dark overlay.
const grid: React.CSSProperties = {
  backgroundImage: [
    `repeating-radial-gradient(ellipse 120px 60px at 45% 4%, transparent 0 58px, ${tint("--qd-color-blue-500", 35)} 58px 60px)`,
    `repeating-conic-gradient(from 0deg at 45% 4%, ${tint("--qd-color-blue-500", 30)} 0deg 0.35deg, transparent 0.35deg 12deg)`,
  ].join(", "),
  maskImage:
    "radial-gradient(ellipse 60% 55% at 62% 8%, black 30%, transparent 100%)",
}

function SpaceBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={stars} />
      <div className="absolute inset-0 hidden lg:block" style={atmosphere} />
      <div
        className="absolute hidden overflow-hidden rounded-[50%] lg:block"
        style={globe}
      >
        <div className="absolute inset-0" style={grid} />
      </div>
    </div>
  )
}

// "CTA" (Figma 19619:75529): a dark banner card on the light background, 80px above and below. The text takes
// the first of two columns; the rocket illustration sits in its Figma slot on the right (below the text on a
// phone), over the globe.
export function CtaBanner() {
  return (
    <Section theme="light" className="lg:py-(--qd-layout-section-padding-min)">
      <Card
        data-theme="dark"
        className="relative gap-8 px-6 py-10 lg:px-16 lg:py-12"
      >
        <SpaceBackdrop />
        <div className="relative grid lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col gap-4">
              <h2 className={type.h4}>Build on Qdrant Cloud</h2>
              <p className="text-(length:--qd-font-size-20) leading-(--qd-line-height-150) text-muted-foreground">
                Replication, failover, and scheduled backups on every replicated
                cluster.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">Start Free</Button>
              {/* A link with the outline button's look, so it keeps link semantics. */}
              <a
                href="https://qdrant.tech/contact-us/"
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                Talk to Engineering
              </a>
            </div>
          </div>
        </div>
        {/* The rocket (Figma 16132:51259) at its Figma spot, 536px in and 7px down, cut by the card's bottom edge
            as in the Figma's export. On a phone it sits below the text. Decorative, so no alt text. */}
        <img
          src={`${ASSETS}/illustrations/rocket.png`}
          alt=""
          width={504}
          height={312}
          className="relative mx-auto w-full max-w-[504px] lg:absolute lg:top-2 lg:right-1/16 lg:w-9/20 lg:max-w-none"
        />
      </Card>
    </Section>
  )
}
