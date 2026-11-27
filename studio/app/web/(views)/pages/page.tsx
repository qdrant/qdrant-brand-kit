import { redirect } from "next/navigation"

import { webPages } from "@/lib/web-pages"

// Pages opens on the first page in the row (design lead, 2026-11-26).
export default function Pages() {
  redirect(webPages[0].href)
}
