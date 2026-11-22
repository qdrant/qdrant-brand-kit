import { guidelines } from "@qdrant/web/guidelines"

import { DocsSidebar } from "@/components/web/docs-sidebar"

export const metadata = { title: "Guidelines · Web · Qdrant Studio" }

// The website's guidelines (Juan, 2026-11-22): every rule for building the site from the library, for the team and
// for agents, here and in the Hugo build. Its text comes from web/guidelines.ts; add a rule there when it's decided.
export default function Guidelines() {
  return (
    <div className="flex min-h-0 flex-1">
      <DocsSidebar current="guidelines" />

      <div className="flex min-w-0 flex-1 gap-12 p-8">
        <div className="flex max-w-3xl min-w-0 flex-1 flex-col gap-12">
          <header className="flex flex-col gap-3">
            <p className="font-mono text-xs text-muted-foreground uppercase">Website</p>
            <h1 className="text-3xl font-semibold">Guidelines</h1>
            <p className="text-muted-foreground">
              The rules for building qdrant.tech from this library, for the team and for agents, here and in the Hugo
              build. Each section&apos;s page adds its own rules. They come from{" "}
              <code className="font-mono text-sm">web/guidelines.ts</code>; when a rule is decided, it&apos;s added
              there with who decided it and when.
            </p>
          </header>

          {guidelines.map((g) => (
            <section key={g.id} id={g.id} className="flex scroll-mt-20 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">{g.title}</h2>
                <p className="text-sm text-muted-foreground">{g.intro}</p>
              </div>
              <ol className="divide-y rounded-lg border">
                {g.rules.map((r) => (
                  <li key={r.title} className="flex flex-col gap-1.5 px-5 py-4">
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">{r.text}</p>
                    {(r.decided || r.source) && (
                      <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                        {r.decided && <span>Decided: {r.decided}</span>}
                        {r.source && <span>Values: {r.source}</span>}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <nav aria-label="On this page" className="sticky top-20 hidden h-fit w-44 shrink-0 flex-col gap-1 xl:flex">
          <p className="mb-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">On this page</p>
          {guidelines.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="text-sm text-muted-foreground hover:text-foreground">
              {g.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
