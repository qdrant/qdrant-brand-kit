import { readdirSync } from "node:fs"
import path from "node:path"
import Link from "next/link"

import { allComponents, catalog, titleOf } from "@/lib/catalog"
import { examples } from "@/examples"

// Components in design-system/components/ui that the catalog doesn't list yet (added with `shadcn add`).
function unlisted() {
  const dir = path.resolve(process.cwd(), "..", "design-system", "components", "ui")
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""))
    .filter((name) => !allComponents.includes(name))
}

export default function DesignSystem() {
  const missing = unlisted()
  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Design system</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Every component in <code className="font-mono">@qdrant/design-system</code>, with shadcn&apos;s own examples
          for its states. {allComponents.length} components.
        </p>
      </header>
      {missing.length > 0 && (
        <p className="text-destructive text-sm">
          Not in the studio&apos;s catalog yet: {missing.join(", ")}. Add them to studio/lib/catalog.ts.
        </p>
      )}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {catalog.map(({ group, items }) => (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="text-muted-foreground text-xs font-medium uppercase">{group}</h2>
            <ul className="flex flex-col">
              {items.map((name) => (
                <li key={name}>
                  <Link
                    href={`/design-system/${name}`}
                    className="hover:bg-muted flex items-center justify-between rounded-md px-2 py-2 text-sm"
                  >
                    {titleOf(name)}
                    {!examples[name] && <span className="text-muted-foreground text-xs">no example yet</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
