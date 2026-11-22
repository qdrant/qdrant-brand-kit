import { LogoCloud, type LogoCloudProps } from "../sections/logo-cloud"
import { customers } from "../content/sections"
import { defineSection } from "./types"

const logos = customers.names.map((name) => ({ name }))

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
  ],
  docs: {
    use: ["Right after the hero, as proof before any claim. The grid for a customers or partners block with more logos."],
    rules: [
      "Logos come from web/assets/logos, exported from the Figma as they are; never redraw or recolor one.",
      "Until a logo's file exists, its company name stands in as text. Replace it before a page ships.",
      "Eight logos at most in a row; the grid takes multiples of four.",
    ],
    anatomy: [
      { part: "Label", note: "Optional, mono capitals, quiet." },
      { part: "Action", note: "Optional link to all customers, on the right." },
      { part: "Logos", note: "A row, or cells in a hairline grid." },
    ],
    props: [
      { name: "layout", type: '"row" | "grid"', note: "Row or cell grid." },
      { name: "logos", type: "{ name, src? }[]", note: "Company names, with the logo file when it exists." },
      { name: "label, action", type: "string, { label, href }", note: "Optional." },
    ],
  },
  fields: [
    { prop: "label", label: "Label", kind: "text" },
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "row", label: "Row" }, { value: "grid", label: "Cell grid" }] },
  ],
})
