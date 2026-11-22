import Link from "next/link"

import { cn } from "@qdrant/design-system/lib/utils"
import { guidelines } from "@qdrant/web/guidelines"
import { sectionsByCategory } from "@qdrant/web/registry"

const item = (on: boolean) =>
  cn("rounded-md px-2 py-1.5 text-sm hover:bg-muted", on ? "bg-muted font-semibold" : "text-muted-foreground")

// The Docs tab's sidebar: the website's guidelines first, then every section by category. `current` is a section id,
// or "guidelines".
export function DocsSidebar({ current }: { current: string }) {
  return (
    <aside className="sticky top-12 hidden h-[calc(100svh-3rem)] w-60 shrink-0 overflow-y-auto border-r p-4 md:block">
      <nav aria-label="Docs" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="px-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Website</p>
          <Link
            href="/web/docs/guidelines"
            aria-current={current === "guidelines" ? "page" : undefined}
            className={item(current === "guidelines")}
          >
            Guidelines
            <span className="ml-1.5 text-xs text-muted-foreground">
              {guidelines.reduce((n, g) => n + g.rules.length, 0)}
            </span>
          </Link>
        </div>
        {sectionsByCategory().map((c) => (
          <div key={c.id} className="flex flex-col gap-1">
            <p className="px-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{c.label}</p>
            {c.sections.map((s) => (
              <Link
                key={s.id}
                href={`/web/docs/${s.id}`}
                aria-current={s.id === current ? "page" : undefined}
                className={item(s.id === current)}
              >
                {s.name}
                <span className="ml-1.5 text-xs text-muted-foreground">{s.variants.length}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
