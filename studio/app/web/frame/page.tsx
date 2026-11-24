import { Suspense } from "react"

import { WebFrame } from "@/components/web/frame"

export const metadata = { title: "Frame · Qdrant Studio" }

// Renders website sections alone, without the studio's menu, for the Web page's canvas, docs and builder, which
// show it in iframes so each frame has its own width (desktop or phone) and theme.
export default function Frame() {
  return (
    <Suspense>
      <WebFrame />
    </Suspense>
  )
}
