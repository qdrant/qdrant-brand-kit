import { FilterableIndex, type FilterableIndexProps } from "../sections/filterable-index"
import { customerDirectory } from "../content/listings"
import { defineSection } from "./types"

export const filterableIndex = defineSection<FilterableIndexProps>({
  id: "filterable-index",
  name: "Filterable index",
  category: "listings",
  summary: "A directory's body: checkbox filters on the left, search, a count, a grid or list toggle, and every card on one page.",
  file: "filterable-index",
  component: FilterableIndex,
  variants: [
    {
      id: "grid",
      name: "Grid",
      description:
        "Every customer story with the site's filters (/customers/). The count's label and the empty state are placeholders; the site has no copy for them.",
      props: {
        layout: "grid",
        filterTitle: customerDirectory.filterTitle,
        groups: customerDirectory.groups,
        searchPlaceholder: customerDirectory.searchPlaceholder,
        clearLabel: customerDirectory.clearLabel,
        countLabel: "results",
        emptyText: "No results",
        items: customerDirectory.items,
      },
    },
  ],
  docs: {
    use: [
      "A directory people narrow down: customer stories, partners, templates. Put a Page header above it.",
      "For a handful of items, use a grid section instead; for one set of categories, Integrations directory.",
    ],
    rules: [
      "Filters are the directory's own facets, each option with its count.",
      "Options in one group widen the results; groups narrow them. Filtering runs in the browser.",
      "No pagination: every result shows on one page.",
      "The count follows the filters; an empty result offers to clear them.",
      "Logos stand in as the company's name until their files are exported.",
      "On phones the filter groups scroll sideways above the results.",
    ],
    anatomy: [
      { part: "Filters", note: "A title, a clear button, and groups of checkboxes with counts. Sticky from lg." },
      { part: "Toolbar", note: "Search, the count in mono, and the grid or list toggle." },
      { part: "Cards", note: "Name, title, the first facet in mono and a meta line." },
    ],
    props: [
      { name: "groups", type: "{ id, label, options }[]", note: "The filter groups." },
      { name: "items", type: "{ name, title, meta?, href, facets: Record<group id, string[]> }[]", note: "The entries." },
      { name: "filterTitle, searchPlaceholder, clearLabel", type: "string", note: "The controls' copy." },
      { name: "countLabel, emptyText", type: "string", note: "After the count, and when nothing matches." },
    ],
  },
  fields: [
    { prop: "filterTitle", label: "Filter title", kind: "text" },
    { prop: "searchPlaceholder", label: "Search text", kind: "text" },
  ],
})
