import { redirect } from "next/navigation"

import { spaceTabs } from "@/lib/space"

// The Space link opens the first tab, Backgrounds, straight away.
export default function Space() {
  redirect(`/space/${spaceTabs[0].id}`)
}
