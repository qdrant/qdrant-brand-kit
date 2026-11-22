import Link from "next/link"

export const metadata = { title: "Pages · Qdrant Studio" }

// Whole pages: the reference pages in web/pages, and a pointer to the builder for new ones.
const pages = [
  {
    href: "/web/pages/resilience",
    name: "Resilience",
    note: "The Resilience page of qdrant.tech, rebuilt from the Figma (Qdrant Web Design) on 2026-11-16. A reference: its sections are page-specific and will be rebuilt from the section library.",
  },
]

export default function Pages() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Whole pages from <code className="font-mono">web/pages</code>. To put a new page together from the
          section library, use the <Link href="/web/builder" className="text-primary underline-offset-4 hover:underline">Builder</Link>.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pages.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="flex h-full flex-col gap-2 rounded-lg border p-5 hover:bg-muted/50">
              <span className="font-semibold">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
