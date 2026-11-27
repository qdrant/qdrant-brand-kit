import { Backers, type BackersProps } from "../sections/backers"
import { investors } from "../content/company"
import { defineSection } from "./types"

export const backers = defineSection<BackersProps>({
  id: "backers",
  name: "Backers",
  category: "company",
  summary: "Investor logos in a hairline cell grid, with links to the funding stories under it.",
  file: "backers",
  component: Backers,
  variants: [
    {
      id: "grid",
      name: "Logo grid",
      description: "Six investors, their names standing in for the logos, and the Series B, Series A and seed stories (About). The names come from the site's logo file names (its alt text is only \"Logo\"): confirm them before shipping.",
      props: {
        header: { title: investors.title },
        investors: investors.names.map((name) => ({ name })),
        links: investors.links,
        layout: "grid",
      },
    },
  ],
  docs: {
    use: ["An About or press page's investors. For customer or partner logos, use Logo cloud."],
    rules: [
      "Logos as their makers drew them, never redrawn or recolored. Until a file is exported, the name stands in as text.",
      "Funding figures only as the site states them, with a link to the story.",
      "Three columns from md, two on phones. Empty cells fill the last row.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, with an optional kicker and description." },
      { part: "Logo grid", note: "Cells that reach the rails, one investor each." },
      { part: "Funding line", note: "Text links to each round's story." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "investors", type: "{ name, src? }[]", note: "The investors; src is a logo file in web/assets/logos." },
      { name: "links", type: "{ label, href }[]", note: "The funding stories." },
    ],
  },
  fields: [],
})
