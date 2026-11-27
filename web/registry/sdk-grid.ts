import { SdkGrid, type SdkGridProps } from "../sections/sdk-grid"
import { sdks } from "../content/platform"
import { defineSection } from "./types"

export const sdkGrid = defineSection<SdkGridProps>({
  id: "sdk-grid",
  name: "SDK grid",
  category: "developers",
  summary: "Qdrant's official client libraries, each with its install line to copy and links to its repository.",
  file: "sdk-grid",
  component: SdkGrid,
  variants: [
    {
      id: "grid",
      name: "Grid",
      description: "All six libraries in a hairline cell grid, each with its install line and links (Interfaces docs).",
      props: { layout: "grid", header: sdks.header, items: sdks.items },
    },
    {
      id: "tabs",
      name: "Tabs",
      description: "One tab per language over its install line, for a narrower spot on a page.",
      props: { layout: "tabs", header: sdks.header, items: sdks.items },
    },
  ],
  docs: {
    use: ["On developer pages and the docs' landing, to show which languages have an official client and how to install it."],
    rules: [
      "Install lines exactly as the docs give them. A library the docs give no line for shows its registry link instead.",
      "Languages in the docs' order. Names stand as text until the languages' logos are exported.",
      "Links go to the repository, docs and releases the docs list, and nowhere else.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title, a line and an action on the right." },
      { part: "Name", note: "The language on a small text tile (Grid) or a tab (Tabs)." },
      { part: "Install line", note: "Mono, with a copy button." },
      { part: "Links", note: "Repository, docs and latest release." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "items", type: "{ name, install?, repo, docs?, release, registry? }[]", note: "The libraries." },
      { name: "layout", type: '"grid" | "tabs"', note: "Cells or tabs." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "grid", label: "Grid" }, { value: "tabs", label: "Tabs" }] }],
})
