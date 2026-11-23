import { redirect } from "next/navigation"

import { colorTabs } from "@/lib/color"

// The Color link opens the first tab, Palette, straight away.
export default function Color() {
  redirect(`/color/${colorTabs[0].id}`)
}
