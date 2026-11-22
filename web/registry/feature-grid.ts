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
      props: { header: { title: deploy.title, action: deploy.action }, items: deploy.items, columns: 4, appearance: "cards", marker: "icon" },
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
      },
    },
    {
      id: "numbered",
      name: "Numbered cards, 3 columns",
      description: "Three reasons, numbered, on plates (Cloud).",
      props: { header: { kicker: offload.kicker, title: offload.title, description: offload.description }, items: offload.items, columns: 3, appearance: "cards", marker: "number" },
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
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "items", type: "{ title, text?, icon?, link? }[]", note: "The features." },
      { name: "columns", type: "2 | 3 | 4", note: "From md (4 is two columns at md, four from lg)." },
      { name: "appearance, marker", type: '"cards" | "cells", "icon" | "number" | "none"', note: "The look." },
    ],
  },
  fields: [
    { prop: "appearance", label: "Appearance", kind: "select", options: [{ value: "cards", label: "Cards" }, { value: "cells", label: "Cells" }] },
    { prop: "marker", label: "Marker", kind: "select", options: [{ value: "icon", label: "Icon" }, { value: "number", label: "Number" }, { value: "none", label: "None" }] },
  ],
})
