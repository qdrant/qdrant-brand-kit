import { notFound } from "next/navigation"

import { PageExplorationsView, PagesSidebar } from "@/components/web/page-explorations-view"
import { getWorld, worlds } from "@/components/web/page-explorations"

export function generateStaticParams() {
  return worlds.map((w) => ({ world: w.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ world: string }> }) {
  const { world } = await params
  return { title: `${getWorld(world)?.name ?? "Pages"} · Pages Explorations · Patterns · Web · Qdrant Studio` }
}

// One page of the Pages Explorations (2026-11-26): the sidebar of every page by world, and this page's Randomize,
// saved combinations and versions.
export default async function PageExplorationsWorld({ params }: { params: Promise<{ world: string }> }) {
  const { world } = await params
  if (!getWorld(world)) notFound()
  return (
    <div className="flex min-h-0 flex-1">
      <PagesSidebar current={world} />
      <PageExplorationsView worldId={world} />
    </div>
  )
}
