import { WithWithout, type WithWithoutProps } from "../sections/with-without"
import { serverlessFit } from "../content/platform"
import { defineSection } from "./types"

export const withWithout = defineSection<WithWithoutProps>({
  id: "with-without",
  name: "When to use it",
  category: "features",
  summary: "Two columns: when to use a product, with checks, and when not to, with x marks.",
  file: "with-without",
  component: WithWithout,
  variants: [
    {
      id: "columns",
      name: "Columns",
      description: "Serverless: when to use it and when not to, with the waitlist's note and action under both.",
      props: {
        layout: "columns",
        header: serverlessFit.header,
        use: serverlessFit.use,
        avoid: serverlessFit.avoid,
        note: serverlessFit.note,
        action: serverlessFit.action,
      },
    },
    {
      id: "diff",
      name: "Diff",
      description: "Both lists in one code window, read as a diff: the cases for it added, the cases against it removed.",
      props: {
        layout: "diff",
        header: serverlessFit.header,
        use: serverlessFit.use,
        avoid: serverlessFit.avoid,
        note: serverlessFit.note,
        action: serverlessFit.action,
      },
      proposal:
        "Developers read fit the way they read a pull request: a diff with + and - lines, each list's title as a hunk header, teal and orange kept as the line colors. One window instead of two plates, so the two sides read as one decision. Our own take on the code-review view, not from a site.",
    },
  ],
  docs: {
    use: ["On a product page, so readers can tell quickly whether it fits them and where to go if it doesn't."],
    rules: [
      "Both lists come from the product page, word for word. Never write a reason for the layout.",
      "Checks sit in teal tiles, x marks in orange tiles. Never red, which stays for errors.",
      "Three items a side reads best; keep the two sides close in length.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title and a line." },
      { part: "Columns", note: "Two plates, each with a title, an optional line and its items." },
      { part: "Item", note: "A check or x tile, a title and a line." },
      { part: "Note and action", note: "Optional, under both columns." },
    ],
    props: [
      { name: "layout", type: '"columns" | "diff"', note: "Two plates, or one code window read as a diff (proposed)." },
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "use, avoid", type: "{ title, description?, items: { title, text }[] }", note: "The two columns." },
      { name: "note, action", type: "string, { label, href }", note: "Optional, under the columns." },
    ],
  },
  fields: [],
})
