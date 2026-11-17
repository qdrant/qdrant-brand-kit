import { redirect } from "next/navigation"

import { variations } from "@/lib/variations"

export default function Variations() {
  redirect(`/variations/${variations[0].id}`)
}
