import { FeatureGrid, type FeatureGridProps } from "../sections/feature-grid"
import { composableSearch, deploy, offload } from "../content/sections"
import { defineSection } from "./types"

export const featureGrid = defineSection<FeatureGridProps>({
  id: "feature-grid",
  name: "Feature grid",
  category: "features",
  summary: "Features in a grid of cards or cells, each with an icon or a number, a title, a line and a link.",
  file: "feature-grid",
  component: FeatureGrid,
  variants: [
    {
      id: "cards",
      name: "Icon cards, 4 columns",
      description: "Deployment options on plates, each with an icon and a link (home).",
      props: { header: { title: deploy.title, action: deploy.action }, items: deploy.items, columns: 4, appearance: "cards", marker: "icon", tones: "mixed" },
    },
    {
      id: "cells",
      name: "Icon cells, 4 columns",
      description: "Eight capabilities in a hairline grid, for a dense list (Cloud).",
      props: {
        header: { kicker: composableSearch.kicker, title: composableSearch.title, description: composableSearch.description },
        items: composableSearch.items,
        columns: 4,
        appearance: "cells",
        marker: "icon",
        tones: "mixed",
      },
    },
    {
      id: "numbered",
      name: "Numbered cards, 3 columns",
      description: "Three reasons, numbered, on plates (Cloud).",
      props: { header: { kicker: offload.kicker, title: offload.title, description: offload.description }, items: offload.items, columns: 3, appearance: "cards", marker: "number" },
    },
    {
      id: "index",
      name: "Index",
      description: "The heading held on the left, the capabilities as rows of a hairline list on the right (Cloud).",
      props: {
        header: { kicker: composableSearch.kicker, title: composableSearch.title, description: composableSearch.description },
        items: composableSearch.items,
        appearance: "index",
        marker: "icon",
        tones: "mixed",
      },
      proposal:
        "A long list of capabilities reads faster as an index than as a wall of cells: one row each, the title and its line side by side, while the heading stays in view beside them. From Figma's feature list and Mistral's capability rows, on the page's hairlines.",
    },
  ],
  docs: {
    use: ["Three to eight features of equal weight. For one feature with a visual, use Feature rows; for mixed sizes, Bento."],
    rules: [
      "Cards when each feature links somewhere; cells for a dense list without links.",
      "Icons are Lucide, one per feature, on a small plate. Numbers only when the order means something.",
      "Titles are card titles (20px, the heading weight); text is one or two lines.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title, description, and an action on the right." },
      { part: "Marker", note: "Icon, number or none." },
      { part: "Title and text", note: "A card title and a line or two." },
      { part: "Link", note: "Optional, with a chevron." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block. Left out when the grid continues the section before it." },
      { name: "items", type: "{ title, text?, icon?, tone?, link?, id?, tag?, points?, visual?, visualFrame?, visualPlacement?, wide?, href?, links?, cover? }[]", note: "The features: href makes the title the link (a card the site links by its title, with no link text), links puts several links in a row, and cover is a drawing on top of a card, edge to edge in a hairline frame (a demo's cover). a tag above the title, points (lines with an optional bold label and icon), a visual from web/visuals, an id to jump to, and wide to take the whole row. A wide card shows its visual beside the text, or with visualPlacement \"center\" in the middle, the title above and the points around it, two on each side with their icons." },
      { name: "columns", type: "2 | 3 | 4", note: "From md (4 is two columns at md, four from lg)." },
      { name: "appearance, marker", type: '"cards" | "cells" | "index", "icon" | "number" | "none"', note: "The look (index proposed)." },
    ],
  },
  fields: [
    { prop: "appearance", label: "Appearance", kind: "select", options: [{ value: "cards", label: "Cards" }, { value: "cells", label: "Cells" }, { value: "index", label: "Index" }] },
    { prop: "marker", label: "Marker", kind: "select", options: [{ value: "icon", label: "Icon" }, { value: "number", label: "Number" }, { value: "none", label: "None" }] },
    {
      prop: "tones",
      label: "Icon colors",
      kind: "select",
      options: [
        { value: "mixed", label: "Mixed" },
        { value: "indigo", label: "Indigo" },
        { value: "teal", label: "Teal" },
        { value: "blue", label: "Blue" },
        { value: "purple", label: "Purple" },
        { value: "cyan", label: "Cyan" },
        { value: "green", label: "Green" },
        { value: "orange", label: "Orange" },
      ],
    },
  ],
})
