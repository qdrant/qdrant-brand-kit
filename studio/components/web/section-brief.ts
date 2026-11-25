import { getSection } from "@qdrant/web/registry"

// A section's props as JSON: a component or element (a visual passed to a slot) becomes a note, since it can't be
// written out.
function propsJson(props: unknown) {
  return JSON.stringify(
    props,
    (_key, value) => {
      if (typeof value === "function")
        return `[component ${value.displayName ?? value.name ?? ""}]`.trim()
      if (value && typeof value === "object" && "$$typeof" in value)
        return "[element]"
      return value
    },
    2
  )
}

// One section variant, written out for an agent to design or build it (design lead, 2026-11-25): what it is, where
// its code and rules live, its preview and docs, how to render it, and its exact props.
export function sectionBrief({
  section,
  variant,
  theme,
  query = {},
  origin,
}: {
  section: string
  variant: string
  theme: "dark" | "light"
  query?: Record<string, string>
  origin: string
}) {
  const def = getSection(section)
  const v = def?.variants.find((x) => x.id === variant)
  if (!def || !v) return ""
  const component = def.file
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")
  const preview = new URLSearchParams({ section, variant, theme, ...query })
  return `# Qdrant website section: ${def.name}, ${v.name} (${theme})

${def.summary}
${v.description}${v.proposal ? `\n\nProposal, not a decision yet: ${v.proposal}` : ""}

- Section: \`${section}\`, variant \`${variant}\`, theme \`${theme}\`
- Code: web/sections/${def.file}.tsx
- Registry (variants, docs, rules): web/registry/${def.file}.ts
- Website rules: web/guidelines.ts; how to build: web/AGENTS.md
- Preview: ${origin}/web/frame?${preview}
- Docs: ${origin}/web/docs/${section}

## Render it

\`\`\`tsx
import { ${component} } from "@qdrant/web/sections/${def.file}"
import { getSection } from "@qdrant/web/registry"

const props = getSection("${section}")!.variants.find((v) => v.id === "${variant}")!.props

<${component} {...props} theme="${theme}" />
\`\`\`

## Props

\`\`\`json
${propsJson(v.props)}
\`\`\`
`
}
