import { readdirSync } from "node:fs"
import path from "node:path"

// The web sections from @qdrant/web (web/sections). Each section added there gets shown here.
function sections() {
  const dir = path.resolve(process.cwd(), "..", "web", "sections")
  return readdirSync(dir).filter((f) => f.endsWith(".tsx"))
}

export default function Web() {
  const files = sections()
  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Web</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Sections of the marketing web pages, built from the design system. Check each one at 1440px and on a phone
          width, in dark and in light.
        </p>
      </header>
      {files.length === 0 ? (
        <div className="text-muted-foreground flex max-w-2xl flex-col gap-2 rounded-xl border border-dashed p-8 text-sm">
          <p className="text-foreground font-semibold">No sections yet</p>
          <p>
            Add one as <code className="font-mono">web/sections/&lt;name&gt;.tsx</code> (see{" "}
            <code className="font-mono">web/AGENTS.md</code>), then show it on this page.
          </p>
        </div>
      ) : (
        <ul className="list-disc pl-6 text-sm">
          {files.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
