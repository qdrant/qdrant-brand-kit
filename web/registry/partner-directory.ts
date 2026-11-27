import { PartnerDirectory, type PartnerDirectoryProps } from "../sections/partner-directory"
import { partnerDirectory as directory } from "../content/company"
import { defineSection } from "./types"

const header = { title: directory.title, description: directory.description, action: directory.action }

export const partnerDirectory = defineSection<PartnerDirectoryProps>({
  id: "partner-directory",
  name: "Partner directory",
  category: "company",
  summary: "Partners by category, each with its name as a text logo, a line and a link where there is one.",
  file: "partner-directory",
  component: PartnerDirectory,
  variants: [
    {
      id: "grouped",
      name: "Grouped by category",
      description: "Cloud, implementation and resell partners, each category in its own row with its line (Partners).",
      props: { header, groups: directory.groups, layout: "grouped" },
    },
    {
      id: "grid",
      name: "One grid, tagged",
      description: "Every partner in one hairline grid, each tagged with its category, for a quick scan.",
      props: { header, groups: directory.groups, layout: "grid" },
    },
  ],
  docs: {
    use: [
      "A directory of partners, resellers or integrations sorted into a few categories. For a strip of logos without text, use Logo cloud.",
    ],
    rules: [
      "Categories and their order as the site has them.",
      "A partner's logo is its name as text until its logo file is exported. Never redraw a logo.",
      "A card links out only where the site does. Its line is the site's first full sentence.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, description and an action on the right." },
      { part: "Category", note: "Grouped: a title and a line beside its cards. Grid: a mono tag on each cell." },
      { part: "Partner", note: "Name as a text logo, a line, and an optional link." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "groups", type: "{ title, text, partners: { name, text, link? }[] }[]", note: "The categories and their partners." },
      { name: "layout", type: '"grouped" | "grid"', note: "Rows by category, or one grid." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "grouped", label: "Grouped" }, { value: "grid", label: "Grid" }] },
  ],
})
