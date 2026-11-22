import { Bento, type BentoProps } from "../sections/bento"
import { enterprise } from "../content/sections"
import { defineSection } from "./types"

export const bento = defineSection<BentoProps>({
  id: "bento",
  name: "Bento",
  category: "features",
  summary: "Tiles of different sizes in one grid: a checklist tile beside captioned media tiles.",
  file: "bento",
  component: Bento,
  variants: [
    {
      id: "checklist",
      name: "Checklist and tiles",
      description: "A list of capabilities with three proof tiles (home, Enterprise-ready tooling).",
      props: {
        header: { title: enterprise.title, description: enterprise.description, action: enterprise.action },
        list: { items: enterprise.list },
        tiles: enterprise.tiles,
        cardPattern: "grain",
      },
    },
  ],
  docs: {
    use: ["A group of related capabilities where one is a list and the rest are best shown, like enterprise features."],
    rules: [
      "One large tile and three small ones; every tile is a plate.",
      "Media slots hold real screenshots or diagrams; the placeholder is for review only.",
      "Captions are short labels, not sentences.",
    ],
    anatomy: [
      { part: "Heading", note: "With an action on the right." },
      { part: "Checklist tile", note: "Spans two rows." },
      { part: "Media tiles", note: "A media slot and a caption each; the first spans two columns." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "list", type: "{ title?, items }", note: "The checklist." },
      { name: "tiles", type: "string[]", note: "Three captions." },
    ],
  },
  fields: [],
})
