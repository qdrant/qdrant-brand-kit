import { redirect } from "next/navigation"

// The Web link opens the page straight away (Juan, 2026-11-16): the Resilience page, the only one so far.
// With more pages, add a way to switch between them on the page, like Variations.
export default function Web() {
  redirect("/web/resilience")
}
