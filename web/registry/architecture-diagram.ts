import { ArchitectureDiagram, type ArchitectureDiagramProps } from "../sections/architecture-diagram"
import { hybridArchitecture as a } from "../content/platform"
import { defineSection } from "./types"

export const architectureDiagram = defineSection<ArchitectureDiagramProps>({
  id: "architecture-diagram",
  name: "Architecture diagram",
  category: "enterprise",
  summary: "A deployment drawn with the website's lines and plates: the control plane, the data plane and how they connect.",
  file: "architecture-diagram",
  component: ArchitectureDiagram,
  variants: [
    {
      id: "hybrid",
      name: "Hybrid Cloud",
      description:
        "Qdrant Cloud's control plane beside the customer's Kubernetes data plane, with the parts and connections the Hybrid Cloud page names.",
      props: {
        layout: "hybrid",
        header: a.header,
        control: a.control,
        data: a.data,
        rows: a.rows,
        legend: a.legend,
        dataNote: a.dataNote,
        footnote: a.footnote,
      },
    },
  ],
  docs: {
    use: ["On deployment pages (Hybrid Cloud, Private Cloud) and security pages, where buyers ask what runs where."],
    rules: [
      "Only parts and relations the product page or docs state. Never add a box or an arrow for the picture.",
      "Each connection carries a number, and the legend gives its sentence from the page, word for word.",
      "Lines are hairlines with nodes; arrowheads in indigo show which way a connection goes. No fills behind text.",
      "On phones the planes stack, with the connections between them.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title, a line and an action on the right." },
      { part: "Planes", note: "Two plates, each with a mono label and a title; the data plane can carry a note." },
      { part: "Parts", note: "Tiles on the plates, a node where a connection leaves." },
      { part: "Connections", note: "Hairlines between the planes, a number on each, an arrowhead at the end it goes to." },
      { part: "Legend", note: "The numbered notes under a rule." },
    ],
    props: [
      { name: "control, data", type: "{ title, label? }", note: "The two planes." },
      { name: "rows", type: "{ control?, data?[], links?: { note, to }[] }[]", note: "Parts side by side, and the links between them." },
      { name: "legend", type: "{ note, text }[]", note: "The numbered notes." },
      { name: "dataNote, footnote", type: "string", note: "A note on the data plane as a whole, and a line under it." },
    ],
  },
  fields: [],
})
