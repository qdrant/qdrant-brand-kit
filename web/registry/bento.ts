import { Bento, type BentoProps } from "../sections/bento"
import { composableSearch, enterprise } from "../content/sections"
import { defineSection } from "./types"

export const bento = defineSection<BentoProps>({
  id: "bento",
  name: "Bento",
  category: "features",
  summary: "Tiles of different sizes in one grid: a checklist tile beside captioned media tiles, or 4 to 6 cards arranged by count.",
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
      },
    },
    {
      id: "cards-4",
      name: "Four cards",
      description: "Wide and narrow, then narrow and wide; the wide cards hold media (Cloud capabilities).",
      props: { layout: "cards", header: { kicker: composableSearch.kicker, title: composableSearch.title, description: composableSearch.description }, cards: composableSearch.items.slice(0, 4) },
    },
    {
      id: "cards-5",
      name: "Five cards",
      description: "Two halves with media, then three thirds (Cloud capabilities).",
      props: { layout: "cards", header: { kicker: composableSearch.kicker, title: composableSearch.title, description: composableSearch.description }, cards: composableSearch.items.slice(0, 5) },
    },
    {
      id: "cards-6",
      name: "Six cards",
      description: "A wide card and a tall one with media, two small cards, then two halves (Cloud capabilities).",
      props: { layout: "cards", header: { kicker: composableSearch.kicker, title: composableSearch.title, description: composableSearch.description }, cards: composableSearch.items.slice(0, 6) },
    },
  ],
  docs: {
    use: [
      "A group of related capabilities where one is a list and the rest are best shown, like enterprise features.",
      "Cards: 4 to 6 capabilities of different weight, when a plain grid would make them all look equal.",
    ],
    rules: [
      "Checklist: one large tile and three small ones. Cards: 4, 5 or 6, arranged by count; for more, use the feature grid. Every tile is a plate.",
      "In the cards layout, the large cards hold media above their text, and the first cards are the large ones: put the most important first.",
      "A card's icon sits beside its title, centered on it.",
      "Media slots hold real screenshots or diagrams; the placeholder is for review only.",
      "Captions are short labels, not sentences.",
    ],
    anatomy: [
      { part: "Heading", note: "With an action on the right." },
      { part: "Checklist tile", note: "Spans two rows." },
      { part: "Media tiles", note: "A media slot and a caption each; the first spans two columns." },
      { part: "Cards", note: "Cards layout: an icon tile beside the title, a line of text, and media on the large ones." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "layout", type: '"checklist" | "cards"', note: "A checklist beside media tiles, or cards arranged by count." },
      { name: "list", type: "{ title?, items }", note: "Checklist: the checklist." },
      { name: "tiles", type: "string[]", note: "Checklist: three captions." },
      { name: "cards", type: "{ title, text?, icon?, tone? }[]", note: "Cards: 4 to 6." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "checklist", label: "Checklist" }, { value: "cards", label: "Cards" }] }],
})
