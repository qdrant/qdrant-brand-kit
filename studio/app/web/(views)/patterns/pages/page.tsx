import { redirect } from "next/navigation"

// Pages Explorations opens on the first page in the sidebar, the home (2026-11-26).
export default function PageExplorations() {
  redirect("/web/patterns/pages/home")
}
