import type * as React from "react"

import { BlogPostPage } from "@qdrant/web/pages/blog-post"

import { WebBody } from "@/components/web/web-body"

export const metadata = { title: "Blog post · Qdrant Studio" }

// Sticky parts of the page stop under the studio's 48px top bar.
export default function Page() {
  return (
    <div style={{ "--web-sticky-top": "3rem" } as React.CSSProperties}>
      <WebBody />
      <BlogPostPage />
    </div>
  )
}
