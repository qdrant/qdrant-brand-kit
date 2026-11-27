import type * as React from "react"

import { ServerlessPage } from "@qdrant/web/pages/serverless"

import { WebBody } from "@/components/web/web-body"

export const metadata = { title: "Serverless · Qdrant Studio" }

// Sticky parts of the page stop under the studio's 48px top bar.
export default function Page() {
  return (
    <div style={{ "--web-sticky-top": "3rem" } as React.CSSProperties}>
      <WebBody />
      <ServerlessPage />
    </div>
  )
}
