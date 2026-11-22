import type * as React from "react"

import { ResiliencePage } from "@qdrant/web/pages/resilience"

import { WebBody } from "@/components/web/web-body"

export const metadata = { title: "Resilience · Qdrant Studio" }

// Sticky parts of the page (the anchor nav) stop under the studio's 48px top bar.
export default function Resilience() {
  return (
    <div style={{ "--web-sticky-top": "3rem" } as React.CSSProperties}>
      <WebBody />
      <ResiliencePage />
    </div>
  )
}
