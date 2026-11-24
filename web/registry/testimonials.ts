import { Testimonials, type TestimonialsProps } from "../sections/testimonials"
import { canvaQuote, communityQuotes, telekomResult } from "../content/conversion"
import { defineSection } from "./types"

export const testimonials = defineSection<TestimonialsProps>({
  id: "testimonials",
  name: "Testimonials",
  category: "proof",
  summary: "Real quotes from customers and the community: one large quote, a wall of cards, or a quote beside a result.",
  file: "testimonials",
  component: Testimonials,
  variants: [
    {
      id: "single",
      name: "Single quote",
      description: "One large quote, centered, with the company as a text logo (Canva, home).",
      props: { layout: "single", quotes: [canvaQuote] },
    },
    {
      id: "wall",
      name: "Quote wall",
      description: "Community quotes as cards in three columns, each with a name and a handle (Community).",
      props: {
        layout: "wall",
        header: { title: communityQuotes.title, action: communityQuotes.action },
        quotes: communityQuotes.quotes,
      },
    },
    {
      id: "metric",
      name: "Quote and result",
      description: "A customer's quote beside the result it led to, in a hairline grid (Deutsche Telekom).",
      props: { layout: "metric", quotes: [telekomResult.quote], metric: telekomResult.metric },
    },
  ],
  docs: {
    use: [
      "Single for one strong quote between feature sections. Wall for many short community quotes. Quote and result when a customer's words come with a figure.",
      "For figures without a quote, use Stats or Case studies.",
    ],
    rules: [
      "Only real quotes, with the person, role and company as the site shows them. Never write or polish a quote.",
      "Cut a long quote to its first full sentence, never a reworded one.",
      "No photos until the site has them: an initials avatar stands in. A company without a logo file is set as text.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional; with an action on the right." },
      { part: "Quote", note: "Large in the display face (single, result) or body text on plates (wall)." },
      { part: "Author", note: "Initials avatar, name, and the role or handle in mono." },
      { part: "Result", note: "Quote and result only: the figure in mono, its label, its line and a link." },
    ],
    props: [
      { name: "layout", type: '"single" | "wall" | "metric"', note: "The arrangement." },
      { name: "quotes", type: "{ quote, name?, role?, company?, handle? }[]", note: "Single and result use the first." },
      { name: "metric", type: "{ value, label, text?, link? }", note: "The result beside the quote." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "Optional." },
    ],
  },
  fields: [
    {
      prop: "layout",
      label: "Layout",
      kind: "select",
      options: [
        { value: "single", label: "Single quote" },
        { value: "wall", label: "Quote wall" },
        { value: "metric", label: "Quote and result" },
      ],
    },
  ],
})
