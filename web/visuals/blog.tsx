import type * as React from "react"

import { CustomerLogo } from "../lib/customer-logo"
import { IdTrackerTiers } from "./diagrams/id-tracker-tiers"
import { NestedFilter } from "./diagrams/nested-filter"
import { Turbo8Recall } from "./diagrams/turbo8-recall"
import { TurboquantDatatypes } from "./diagrams/turboquant-datatypes"

// The blog's visuals (design lead, 2026-11-26).

// A partner post's cover, from the Lightspeed concept's partner card (Figma: Qdrant Brand Design, the blog page in
// "Concept 2 · Lightspeed", the Qdrant + NVIDIA card): a deep indigo field with a fine scatter of dots, and the two
// logos in white side by side. Drawn in HTML and CSS, so it stays sharp and needs no image; here for Poliscope.
export function PartnerCover({ logo, name }: { logo: string; name: string }) {
  return (
    <div className="relative grid size-full place-items-center overflow-hidden bg-[linear-gradient(160deg,var(--qd-color-indigo-950),var(--qd-color-indigo-800))]">
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle,color-mix(in_oklab,var(--qd-color-indigo-300)_55%,transparent)_1px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_75%)] bg-size-[18px_18px]"
      />
      <span className="relative flex items-center gap-4 text-white">
        <img
          src="/repo/brand-assets/logo/qdrant-logo-dark.svg"
          alt="Qdrant"
          width={135}
          height={36}
          className="h-6 w-auto"
        />
        <span aria-hidden className="text-lg font-light text-white/70">
          +
        </span>
        <CustomerLogo
          id={logo}
          version="mono"
          className="h-6 w-auto text-white"
        />
        <span className="sr-only">{name}</span>
      </span>
    </div>
  )
}

// The 1.20 post's figures, by the id the content gives them, redrawn as diagrams that follow the theme.
export const postFigures: Record<string, React.ReactNode> = {
  "nested-filter": <NestedFilter />,
  "turboquant-datatypes": <TurboquantDatatypes />,
  "turbo8-recall": <Turbo8Recall />,
  "id-tracker-tiers": <IdTrackerTiers />,
}
