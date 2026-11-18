import { redirect } from "next/navigation"

import { typefaces } from "@/lib/typography"

// The Typography link opens the first tab, Mona Sans Display, straight away.
export default function Typography() {
  redirect(`/typography/${typefaces[0].id}`)
}
