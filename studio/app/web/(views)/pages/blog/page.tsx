import type * as React from "react"

import { BlogPage } from "@qdrant/web/pages/blog"

import { WebBody } from "@/components/web/web-body"

export const metadata = { title: "Blog · Qdrant Studio" }

// Sticky parts of the page stop under the studio's 48px top bar.
export default function Page() {
  return (
    <div style={{ "--web-sticky-top": "3rem" } as React.CSSProperties}>
      <WebBody />
      <BlogPage />
    </div>
  )
}
