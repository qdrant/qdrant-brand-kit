import { Values, type ValuesProps } from "../sections/values"
import { starsBenefits, startupBenefits } from "../content/company"
import { defineSection } from "./types"

export const values = defineSection<ValuesProps>({
  id: "values",
  name: "Values",
  category: "company",
  summary: "Three to six principles, reasons or benefits, numbered in cells or on cards with icon tiles.",
  file: "values",
  component: Values,
  variants: [
    {
      id: "numbered",
      name: "Numbered cells",
      description: "The startup program's three benefits, numbered in a cell grid, with Apply Now (Startups).",
      props: { header: { title: startupBenefits.title, action: startupBenefits.action }, items: startupBenefits.items, layout: "numbered" },
    },
    {
      id: "icons",
      name: "Icon cards",
      description: "The Stars program's four benefits on cards with icon tiles (Stars).",
      props: {
        header: { kicker: starsBenefits.kicker, title: starsBenefits.title, action: starsBenefits.action },
        items: starsBenefits.items,
        layout: "icons",
        tones: "mixed",
      },
    },
  ],
  docs: {
    use: [
      "A program's benefits, a company's principles or the reasons to join, three to six of equal weight.",
      "For product features with links, use Feature grid.",
    ],
    rules: [
      "Titles and lines as the site writes them. Never invent a principle or a perk.",
      "Numbers when the items read as a list; icons when each has a clear subject. Icons are Lucide, never amaranth.",
      "Four items sit in four columns from lg; three or six in three; others in two.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title, description and an action on the right." },
      { part: "Marker", note: "A node and a number in mono, or an icon tile." },
      { part: "Title and line", note: "A card title and a line or two." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "items", type: "{ title, text, icon? }[]", note: "Three to six items." },
      { name: "layout", type: '"numbered" | "icons"', note: "Cells with numbers, or cards with icons." },
      { name: "tones", type: 'Tone | "mixed"', note: "The icon tiles' color family." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "numbered", label: "Numbered" }, { value: "icons", label: "Icons" }] },
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
