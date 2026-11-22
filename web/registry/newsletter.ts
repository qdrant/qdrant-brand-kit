import { Newsletter, type NewsletterProps } from "../sections/newsletter"
import { newsletter as content } from "../content/conversion"
import { defineSection } from "./types"

export const newsletter = defineSection<NewsletterProps>({
  id: "newsletter",
  name: "Newsletter",
  category: "forms",
  summary: "One email field and a Subscribe button, with a title and a line, as a band on hairlines or on a plate.",
  file: "newsletter",
  component: Newsletter,
  variants: [
    {
      id: "band",
      name: "Band",
      description: "The title and line on the left, the field on the right, between hairlines (the footer's copy).",
      props: { layout: "band", ...content },
    },
    {
      id: "card",
      name: "Card",
      description: "The same on a plate, centered, for the end of a blog post or a resource page.",
      props: { layout: "card", ...content, pattern: ["stars"], cardPattern: "tint" },
    },
  ],
  docs: {
    use: ["Band between sections or above the footer. Card at the end of an article. The footer has its own sign-up."],
    rules: [
      "One email field and one button; never ask for more here.",
      "The field's label is for screen readers; the placeholder shows the hint.",
      "The form isn't wired: a page connects it.",
    ],
    anatomy: [
      { part: "Text", note: "Title and one line." },
      { part: "Form", note: "Email field and the Subscribe button; they stack on phones." },
    ],
    props: [
      { name: "layout", type: '"band" | "card"', note: "On hairlines or on a plate." },
      { name: "title, description", type: "string", note: "The text." },
      { name: "placeholder, submit", type: "string", note: "The field's hint and the button." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "band", label: "Band" }, { value: "card", label: "Card" }] },
    { prop: "title", label: "Title", kind: "text" },
    { prop: "description", label: "Description", kind: "textarea" },
  ],
})
