import { FeatureRows, type FeatureRowsProps } from "../sections/feature-rows"
import { whyQdrant } from "../content/sections"
import { defineSection } from "./types"

export const featureRows = defineSection<FeatureRowsProps>({
  id: "feature-rows",
  name: "Feature rows",
  category: "features",
  summary: "One feature per row, text beside media, alternating sides.",
  file: "feature-rows",
  component: FeatureRows,
  variants: [
    {
      id: "alternating",
      name: "Alternating",
      description: "Features that each need a visual to explain them (home).",
      props: { header: { kicker: whyQdrant.kicker, title: whyQdrant.title, description: whyQdrant.description }, rows: whyQdrant.rows },
    },
    {
      id: "media-left",
      name: "Alternating, media first",
      description: "The same, starting with the media on the left.",
      props: { header: { kicker: whyQdrant.kicker, title: whyQdrant.title, description: whyQdrant.description }, rows: whyQdrant.rows, start: "media-left" },
    },
  ],
  docs: {
    use: ["Two to five features that each need a visual: a diagram, a screenshot, a short demo."],
    rules: [
      "Rows alternate sides; never two media on the same side in a row.",
      "Each row has a number, a card title, one or two lines and a link.",
      "Media sit on a plate in a tray. A placeholder is for review only.",
    ],
    anatomy: [
      { part: "Heading", note: "Split: title on the left, description on the right." },
      { part: "Row", note: "Number, title, text and link beside the media." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "rows", type: "{ title, text?, icon?, tone?, link?, id?, tag?, points?, visual? }[]", note: "The features. A row starts with its icon on a tile (or its number), and shows its visual (web/visuals) or a placeholder." },
      { name: "start", type: '"media-right" | "media-left"', note: "The first row's media side." },
    ],
  },
  fields: [{ prop: "start", label: "First media", kind: "select", options: [{ value: "media-right", label: "Right" }, { value: "media-left", label: "Left" }] }],
})
