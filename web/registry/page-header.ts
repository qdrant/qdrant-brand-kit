import { PageHeader, type PageHeaderProps } from "../sections/page-header"
import { blogHeader, customersHeader, integrationsHeader } from "../content/listings"
import { defineSection } from "./types"

export const pageHeader = defineSection<PageHeaderProps>({
  id: "page-header",
  name: "Page header",
  category: "hero",
  summary: "The opener of an index or inner page: breadcrumbs, a kicker, the H1, a line, and a search field or actions.",
  file: "page-header",
  component: PageHeader,
  variants: [
    {
      id: "simple",
      name: "Simple",
      description: "Left-aligned, with a kicker and one action (Customers). The site shows no breadcrumbs here; they use its menu names.",
      props: { layout: "simple", ...customersHeader },
    },
    {
      id: "simple-actions",
      name: "Simple, two actions",
      description: "Left-aligned, with a line and two actions, over the coordinate grid (Integrations).",
      props: { layout: "simple", ...integrationsHeader, pattern: ["grid"] },
    },
    {
      id: "search",
      name: "Search",
      description: "Centered, with a search field, over the starfield (Blog).",
      props: { layout: "search", ...blogHeader, pattern: ["stars"] },
    },
  ],
  docs: {
    use: [
      "The first section of a blog, a directory, a docs hub or an inner page. For a landing page's opener, with media and proof, use Hero.",
      "Search when the page is an index people search; simple for everything else.",
    ],
    rules: [
      "One H1 per page, and it's this one.",
      "Breadcrumbs only below the top level, ending with the current page, which isn't a link.",
      "One primary action at most. A search field replaces the actions; don't use both.",
      "It's compact (80px of padding) so the page's content starts high.",
    ],
    anatomy: [
      { part: "Breadcrumbs", note: "Home / section / page, separated by slashes. Optional." },
      { part: "Kicker", note: "Mono capitals with the node. Optional." },
      { part: "Title", note: "The page's H1." },
      { part: "Description", note: "A line or two. Optional." },
      { part: "Search or actions", note: "A search field (search layout), or up to two buttons." },
    ],
    props: [
      { name: "layout", type: '"simple" | "search"', note: "Left-aligned, or centered with search." },
      { name: "breadcrumbs", type: "{ label, href? }[]", note: "The last item is the current page." },
      { name: "kicker, title, description", type: "string", note: "The heading block." },
      { name: "search", type: "{ placeholder, action? }", note: "The field sends ?q= to action." },
      { name: "primary, secondary", type: "{ label, href }", note: "The actions." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "simple", label: "Simple" }, { value: "search", label: "Search" }] },
    { prop: "kicker", label: "Kicker", kind: "text" },
    { prop: "title", label: "Title", kind: "text" },
    { prop: "description", label: "Description", kind: "textarea" },
  ],
})
