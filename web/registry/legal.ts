import { Legal, type LegalProps } from "../sections/legal"
import { privacyPolicy } from "../content/listings"
import { defineSection } from "./types"

export const legal = defineSection<LegalProps>({
  id: "legal",
  name: "Legal",
  category: "content",
  summary: "Long legal text: the title, numbered sections in a reading column, and a sticky contents list beside them.",
  file: "legal",
  component: Legal,
  variants: [
    {
      id: "policy",
      name: "Policy",
      description: "The privacy policy from its start through 1.5 and the start of section 2, verbatim (/legal/privacy-policy/).",
      props: { title: privacyPolicy.title, contentsTitle: privacyPolicy.contentsTitle, blocks: privacyPolicy.blocks },
    },
  ],
  docs: {
    use: ["Privacy policy, terms, impressum, a DPA: text people read to the letter. For a post, use Article."],
    rules: [
      "Legal text is never shortened or reworded here; a page gives it whole.",
      "Headings keep their numbers. The contents list them, the one in view in indigo.",
      "No images, no actions. Links appear as written.",
    ],
    anatomy: [
      { part: "Title", note: "The H1, and the date it took effect when there is one." },
      { part: "Contents", note: "Sticky beside the text from lg, above it on smaller screens." },
      { part: "Sections", note: "Numbered H2 and H3, paragraphs and lists." },
    ],
    props: [
      { name: "title", type: "string", note: "The H1." },
      { name: "updated", type: "string", note: "A line under the title. Optional." },
      { name: "blocks", type: "ProseBlock[]", note: "The text." },
      { name: "contentsDepth", type: "2 | 3", note: "Sections only, or subsections too." },
    ],
  },
  fields: [
    {
      prop: "contentsDepth",
      label: "Contents",
      kind: "select",
      options: [
        { value: "3", label: "Sections and subsections" },
        { value: "2", label: "Sections" },
      ],
    },
  ],
})
