import { redirect } from "next/navigation"

import { sections } from "@qdrant/web/registry"

// The Docs tab opens the first section.
export default function Docs() {
  redirect(`/web/docs/${sections[0].id}`)
}
