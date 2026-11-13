import Link from "next/link"
import { notFound } from "next/navigation"

import { examples } from "@/examples"
import { allComponents, titleOf } from "@/lib/catalog"

export function generateStaticParams() {
  return allComponents.map((name) => ({ name }))
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!allComponents.includes(name)) notFound()
  const load = examples[name]
  const Example = load ? (await load()).default : null

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <Link href="/design-system" className="text-muted-foreground text-xs hover:underline">
          Design system
        </Link>
        <h1 className="text-2xl font-semibold">{titleOf(name)}</h1>
        <p className="text-muted-foreground text-sm">
          <code className="font-mono">@qdrant/design-system/components/ui/{name}</code> ·{" "}
          <a
            href={`https://ui.shadcn.com/docs/components/base/${name}`}
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            shadcn docs
          </a>
        </p>
      </header>
      {Example ? (
        <Example />
      ) : (
        <p className="text-muted-foreground text-sm">
          No example yet. shadcn&apos;s example for this one needs code from its own website (the AI components), or
          shadcn has none (direction).
        </p>
      )}
    </div>
  )
}
