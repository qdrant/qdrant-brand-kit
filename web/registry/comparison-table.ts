import { ComparisonTable, type ComparisonTableProps } from "../sections/comparison-table"
import { securityMatrix, supportPlans, versusChroma } from "../content/conversion"
import { defineSection } from "./types"

export const comparisonTable = defineSection<ComparisonTableProps>({
  id: "comparison-table",
  name: "Comparison table",
  category: "comparison",
  summary: "A real table of plans, options or deployment models: checks, dashes or the site's words in hairline rows.",
  file: "comparison-table",
  component: ComparisonTable,
  variants: [
    {
      id: "plans",
      name: "Plans",
      description: "Support plans with grouped rows of checks and dashes; the header row sticks on desktop (Pricing, Support & Reliability).",
      props: {
        layout: "plans",
        header: { kicker: supportPlans.kicker, title: supportPlans.title, action: supportPlans.action },
        columns: supportPlans.columns,
        groups: supportPlans.groups,
      },
    },
    {
      id: "versus",
      name: "Versus",
      description: "Qdrant beside another option, its column marked, text in every cell (Migrate from Chroma).",
      props: {
        layout: "versus",
        header: { title: versusChroma.title, description: versusChroma.description },
        rowHeader: versusChroma.rowHeader,
        columns: versusChroma.columns,
        groups: versusChroma.groups,
      },
    },
    {
      id: "matrix",
      name: "Matrix",
      description: "Security by deployment model, each column with an icon (Security).",
      props: {
        layout: "matrix",
        header: { title: securityMatrix.title, action: securityMatrix.action },
        columns: securityMatrix.columns,
        groups: securityMatrix.groups,
      },
    },
  ],
  docs: {
    use: [
      "Plans to compare what each plan includes. Versus to set Qdrant beside one alternative. Matrix for capabilities across deployment options.",
      "For three or four tiers with prices, use Pricing tiers first; the table goes under it.",
    ],
    rules: [
      "A real table with row and column headers, so it reads aloud correctly.",
      "Checks are small indigo marks, dashes are quiet; each has a screen-reader label.",
      "Cell text is the site's own words, never shortened into a check.",
      "On phones the table scrolls sideways inside its own box; the page never scrolls sideways.",
      "One column at most is highlighted (Qdrant's, in Versus): a tray fill and an indigo mark on top.",
    ],
    anatomy: [
      { part: "Heading", note: "With an action on the right." },
      { part: "Header row", note: "Plans or options; icons in Matrix. Sticks to the top on desktop in Plans." },
      { part: "Group", note: "A mono label over its rows (Plans)." },
      { part: "Row", note: "The label, then a check, a dash or text per column." },
      { part: "Actions", note: "Optional: a button under each column." },
    ],
    props: [
      { name: "layout", type: '"plans" | "versus" | "matrix"', note: "The kind of comparison." },
      { name: "columns", type: "{ label, icon?, highlight? }[]", note: "The plans or options." },
      { name: "groups", type: "{ title?, rows: { label, values }[] }[]", note: "Values: true, false, text, or { text, link }." },
      { name: "rowHeader", type: "string", note: "The label over the first column." },
      { name: "actions", type: "({ label, href } | null)[]", note: "A button per column." },
    ],
  },
  fields: [
    {
      prop: "layout",
      label: "Layout",
      kind: "select",
      options: [
        { value: "plans", label: "Plans" },
        { value: "versus", label: "Versus" },
        { value: "matrix", label: "Matrix" },
      ],
    },
  ],
})
