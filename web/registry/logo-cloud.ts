import { LogoCloud, type LogoCloudProps } from "../sections/logo-cloud"
import { customers } from "../content/sections"
import { customerLogos } from "../content/customer-logos"
import { defineSection } from "./types"

const logos = customers.names.map((name, i) => ({ name, logo: customers.logos[i] }))
const wall = customers.wall.map((id) => ({ name: customerLogos.find((l) => l.id === id)?.name ?? id, logo: id }))

export const logoCloud = defineSection<LogoCloudProps>({
  id: "logo-cloud",
  name: "Logo cloud",
  category: "logos",
  summary: "Customer or partner logos, as a quiet row or a hairline cell grid.",
  file: "logo-cloud",
  component: LogoCloud,
  variants: [
    { id: "row", name: "Row", description: "One row of logos under the hero or before a case study.", props: { layout: "row", logos } },
    {
      id: "grid",
      name: "Cell grid",
      description: "Logos in a hairline grid that reaches the rails, with a link to all customers.",
      props: { layout: "grid", logos, action: customers.action },
    },
    {
      id: "wall",
      name: "Wall",
      description: "Eighteen logos, six across in a hairline grid, each in its colors on hover.",
      props: { layout: "wall", logos: wall, action: customers.action },
      proposal:
        "A denser wall for a customers page or a long home page: one neutral row after another reads calm, and hovering a logo brings back its colors, so the wall rewards a closer look. From the logo walls on GitHub's and Hashnode's developer pages, in our hairline grid.",
    },
    {
      id: "marquee",
      name: "Marquee",
      description: "One row that drifts slowly sideways, faded at the ends, still on hover.",
      props: { layout: "marquee", logos: wall },
      proposal:
        "More logos in the space of one row, without a carousel's controls: the row drifts at 60s a lap, stops under the pointer and for reduced motion, and fades into the rails at both ends. Common on developer-tool home pages (Cursor, Railway).",
    },
  ],
  docs: {
    use: ["Right after the hero, as proof before any claim. The grid for a customers or partners block with more logos."],
    rules: [
      "Logos come from the customer logo library (content/customer-logos.ts), shown in one muted color; never redraw one.",
      "A company without a logo in the library stands in as its name, set as text. Replace it before a page ships.",
      "Eight logos at most in a row; the grid takes multiples of four.",
    ],
    anatomy: [
      { part: "Label", note: "Optional, mono capitals, quiet." },
      { part: "Action", note: "Optional link to all customers, on the right." },
      { part: "Logos", note: "A row, or cells in a hairline grid." },
    ],
    props: [
      { name: "layout", type: '"row" | "grid" | "wall" | "marquee"', note: "Row, cell grid, wall or marquee (the last two proposed)." },
      { name: "logos", type: "{ name, logo?, src?, href? }[]", note: "Company names, with their id in the customer logo library. In the grid, its columns follow the number of cells (with the action), so the last row is full from lg: 10 in rows of 5, 18 in rows of 6, 14 in rows of 7." },
      { name: "label, action", type: "string, { label, href }", note: "Optional." },
    ],
  },
  fields: [
    { prop: "label", label: "Label", kind: "text" },
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "row", label: "Row" }, { value: "grid", label: "Cell grid" }, { value: "wall", label: "Wall" }, { value: "marquee", label: "Marquee" }] },
  ],
})
