import { notFound } from "next/navigation"

import { categories, getSection, sections } from "@qdrant/web/registry"

import { DocsSidebar } from "@/components/web/docs-sidebar"
import { VariantsView } from "@/components/web/variants-view"

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `${getSection(id)?.name ?? "Docs"} · Web · Qdrant Studio` }
}

const componentName = (file: string) =>
  file
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")

// One section of the library (Juan, 2026-11-21): what it's for, its rules, parts and props, and every variant in
// dark and light. The same page serves the team and agents; its text comes from the web registry.
export default async function SectionDocs({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const def = getSection(id)
  if (!def) notFound()
  const category = categories.find((c) => c.id === def.category)
  const name = componentName(def.file)

  return (
    <div className="flex min-h-0 flex-1">
      <DocsSidebar current={id} />

      <div className="flex min-w-0 flex-1 flex-col gap-10 p-8">
        <header className="flex max-w-3xl flex-col gap-3">
          <p className="font-mono text-xs text-muted-foreground uppercase">{category?.label}</p>
          <h1 className="text-3xl font-semibold">{def.name}</h1>
          <p className="text-muted-foreground">{def.summary}</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
            {`import { ${name} } from "@qdrant/web/sections/${def.file}"\n\n<${name} variant props… theme="dark" surface="default" />`}
          </pre>
        </header>

        <div className="grid max-w-5xl gap-8 lg:grid-cols-2">
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">When to use it</h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              {def.docs.use.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Rules</h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              {def.docs.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid max-w-5xl gap-8 lg:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Anatomy</h2>
            <dl className="divide-y rounded-lg border text-sm">
              {def.docs.anatomy.map((a, i) => (
                <div key={a.part} className="grid grid-cols-[auto_1fr] gap-3 px-4 py-2.5">
                  <dt className="font-medium">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{i + 1}</span>
                    {a.part}
                  </dt>
                  <dd className="text-muted-foreground">{a.note}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Props</h2>
            <dl className="divide-y rounded-lg border text-sm">
              {def.docs.props.map((p) => (
                <div key={p.name} className="flex flex-col gap-0.5 px-4 py-2.5">
                  <dt className="flex flex-wrap items-baseline gap-2">
                    <code className="font-mono text-xs font-semibold">{p.name}</code>
                    <code className="font-mono text-[11px] text-muted-foreground">{p.type}</code>
                  </dt>
                  <dd className="text-muted-foreground">{p.note}</dd>
                </div>
              ))}
              <div className="flex flex-col gap-0.5 px-4 py-2.5">
                <dt className="flex flex-wrap items-baseline gap-2">
                  <code className="font-mono text-xs font-semibold">theme, surface</code>
                  <code className="font-mono text-[11px] text-muted-foreground">
                    &quot;dark&quot; | &quot;light&quot;, &quot;default&quot; | &quot;raised&quot;
                  </code>
                </dt>
                <dd className="text-muted-foreground">
                  Every section has them: the theme (the page&apos;s when left out) and the background surface.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <VariantsView
          section={def.id}
          variants={def.variants.map((v) => ({ id: v.id, name: v.name, description: v.description }))}
        />
      </div>
    </div>
  )
}
