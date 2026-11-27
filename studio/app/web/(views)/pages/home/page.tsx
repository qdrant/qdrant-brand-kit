import type * as React from "react"

import { HomePage } from "@qdrant/web/pages/home"

import { WebBody } from "@/components/web/web-body"

export const metadata = { title: "Home · Qdrant Studio" }

// Sticky parts of the page stop under the studio's 48px top bar.
export default function Home() {
  return (
    <div style={{ "--web-sticky-top": "3rem" } as React.CSSProperties}>
      <WebBody />
      <HomePage />
    </div>
  )
}
