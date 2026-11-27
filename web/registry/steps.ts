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
    {
      id: "cells",
      name: "Cells",
      description: "Each step a cell in a hairline grid, led by a large mono number.",
      props: { header, steps: hybridSteps.steps, layout: "cells" },
      proposal:
        "The step's number does the work of the line: a large, quiet mono figure at the top of each cell, so the order reads at a glance from across the page. From the numbered feature grids on Vercel's and Linear's pages, in our cells.",
    },
    {
      id: "pipeline",
      name: "Pipeline",
      description: "Each step on a plate, the plates joined by a line through a node.",
      props: { header, steps: hybridSteps.steps, layout: "pipeline" },
      proposal:
        "Steps as the stages of a pipeline, the way a CI run or a deploy is drawn in developer tools: each a plate with its position (1/3), joined by the page's own line and node, the first node lit. Combines Railway's build-and-deploy cards with our rails.",
    },
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
      { name: "layout", type: '"row" | "list" | "cells" | "pipeline"', note: "Side by side, down a line, cells or pipeline (the last two proposed)." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "row", label: "Row" }, { value: "list", label: "List" }, { value: "cells", label: "Cells" }, { value: "pipeline", label: "Pipeline" }] }],
})
