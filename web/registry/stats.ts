import { Stats, type StatsProps } from "../sections/stats"
import { aboutStats, applications } from "../content/sections"
import { defineSection } from "./types"

export const stats = defineSection<StatsProps>({
  id: "stats",
  name: "Stats",
  category: "stats",
  summary: "Real figures that prove a claim: numbers in mono, in a cell grid or as customer result cards.",
  file: "stats",
  component: Stats,
  variants: [
    { id: "cells", name: "Cells", description: "The company's figures in a hairline grid (About).", props: { layout: "cells", items: aboutStats } },
    {
      id: "results",
      name: "Customer results",
      description: "Each customer's result on a plate: company, figure and the line it comes from (home).",
      props: {
        layout: "cards",
        header: { title: applications.title },
        items: applications.cards.map((c) => ({ company: c.company, value: c.value, text: c.text })),
        cardPattern: "dots",
      },
    },
  ],
  docs: {
    use: ["Cells for the company's own figures; results cards for what customers achieved."],
    rules: [
      "Only real figures, each with its source. Never a round number for the layout.",
      "Figures are mono, so they read as data, and never in the accent.",
      "Four cells or cards in a row on desktop, two on phones.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional." },
      { part: "Figure", note: "Mono, large in cells, medium on cards." },
      { part: "Label or line", note: "What the figure counts, or the sentence it comes from." },
    ],
    props: [
      { name: "layout", type: '"cells" | "cards"', note: "Hairline grid or plates." },
      { name: "items", type: "{ value, label?, company?, text?, href? }[]", note: "The figures." },
      { name: "header", type: "{ kicker?, title, description? }", note: "Optional." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "cells", label: "Cells" }, { value: "cards", label: "Cards" }] }],
})
