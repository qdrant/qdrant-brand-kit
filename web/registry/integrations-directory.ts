import { IntegrationsDirectory, type IntegrationsDirectoryProps } from "../sections/integrations-directory"
import { integrationDirectory } from "../content/listings"
import { defineSection } from "./types"

export const integrationsDirectory = defineSection<IntegrationsDirectoryProps>({
  id: "integrations-directory",
  name: "Integrations directory",
  category: "listings",
  summary: "Integrations by category: tabs with counts, a search field, and cards with the name, a line and the category.",
  file: "integrations-directory",
  component: IntegrationsDirectory,
  variants: [
    {
      id: "tabs",
      name: "Tabs and search",
      description: "All 81 integrations in the site's five categories (/integrations/). Names stand in for logos.",
      props: {
        allLabel: integrationDirectory.allLabel,
        categories: integrationDirectory.categories,
        searchPlaceholder: integrationDirectory.searchPlaceholder,
        emptyText: integrationDirectory.emptyText,
        items: integrationDirectory.items,
      },
    },
  ],
  docs: {
    use: [
      "A catalog with one set of categories: integrations, SDKs, connectors. Put a Page header above it.",
      "For several facets at once, use Filterable index.",
    ],
    rules: [
      "Tabs are the categories, each with its count, which follows the search.",
      "All groups the cards by category under their names; a tab or a search shows one grid, with the category on each card.",
      "The active tab is underlined in indigo. An empty search says so in the site's words.",
      "Logos stand in as the name until their files are exported. Never redraw a logo.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional." },
      { part: "Tabs", note: "All, then each category, with counts in mono." },
      { part: "Search", note: "Filters by name, line and category as you type." },
      { part: "Cards", note: "Name, category tag (outside the grouped view) and up to three lines." },
      { part: "Empty state", note: "When nothing matches." },
    ],
    props: [
      { name: "categories", type: "string[]", note: "The tabs, in order." },
      { name: "items", type: "{ name, category, text?, href }[]", note: "The integrations." },
      { name: "allLabel, searchPlaceholder, emptyText", type: "string", note: "The controls' copy." },
      { name: "header", type: "{ kicker?, title, description? }", note: "Optional." },
    ],
  },
  fields: [
    { prop: "searchPlaceholder", label: "Search text", kind: "text" },
    { prop: "emptyText", label: "Empty state", kind: "text" },
  ],
})
