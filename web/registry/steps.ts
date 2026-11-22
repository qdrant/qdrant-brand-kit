import { Steps, type StepsProps } from "../sections/steps"
import { hybridSteps } from "../content/sections"
import { defineSection } from "./types"

const header = { kicker: hybridSteps.kicker, title: hybridSteps.title, description: hybridSteps.description }

export const steps = defineSection<StepsProps>({
  id: "steps",
  name: "Steps",
  category: "features",
  summary: "Steps in order, joined by a line with a node at each.",
  file: "steps",
  component: Steps,
  variants: [
    { id: "row", name: "Row", description: "Three or four short steps side by side (Hybrid Cloud).", props: { header, steps: hybridSteps.steps, layout: "row" } },
    { id: "list", name: "List", description: "Steps down a line beside the heading, for longer steps.", props: { header, steps: hybridSteps.steps, layout: "list" } },
  ],
  docs: {
    use: ["How to get started or how something works, in three or four steps."],
    rules: [
      "Each step has a mono label (Step 01); a title only when the steps need one.",
      "The line and nodes are the page's lines (web.css), not decoration of their own.",
    ],
    anatomy: [
      { part: "Heading", note: "Above the row, or beside the list (sticky from lg)." },
      { part: "Step", note: "A node on the line, the label, an optional title and the text." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "steps", type: "{ label?, title?, text }[]", note: "The steps." },
      { name: "layout", type: '"row" | "list"', note: "Side by side or down a line." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "row", label: "Row" }, { value: "list", label: "List" }] }],
})
