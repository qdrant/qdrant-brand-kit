import { notFound } from "next/navigation"

import { VariationsCanvas } from "@/components/variations-canvas"
import { variations } from "@/lib/variations"

export const metadata = { title: "Variations · Qdrant Studio" }

export default async function VariationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { id } = await params
  const { view } = await searchParams
  if (!variations.some((v) => v.id === id)) notFound()
  return <VariationsCanvas id={id} view={view === "app" ? "app" : "components"} />
}
