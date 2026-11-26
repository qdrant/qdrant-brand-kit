import { cn } from "@qdrant/design-system/lib/utils"

import { Code, languageOf, type CodeLanguage } from "./code"

// A code sample in a window frame: a title bar with the file or language, then the code in mono, in the website's
// syntax colors (lib/code.tsx). The language comes from `language` or the title's file name.
export function CodePanel({ title, code, language, className }: { title?: string; code: string; language?: CodeLanguage; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-card text-left", className)}>
      {title && (
        <figcaption className="flex items-center gap-2 border-b border-(--web-line) px-4 py-2.5 font-mono text-xs text-muted-foreground">
          <span className="flex gap-1.5" aria-hidden>
            <span className="web-window-dot size-2.5 rounded-full" />
            <span className="web-window-dot size-2.5 rounded-full" />
            <span className="web-window-dot size-2.5 rounded-full" />
          </span>
          <span className="ml-2">{title}</span>
        </figcaption>
      )}
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
        <Code code={code} language={language ?? languageOf(title)} />
      </pre>
    </figure>
  )
}

// The search from Qdrant's quickstart (qdrant.tech/documentation/quickstart), for heroes and code sections.
export const quickstartQuery = `from qdrant_client import QdrantClient

client = QdrantClient(url="http://localhost:6333")

search_result = client.query_points(
    collection_name="test_collection",
    query=[0.2, 0.1, 0.9, 0.7],
    with_payload=False,
    limit=3,
).points`
