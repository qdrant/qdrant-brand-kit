import { CaseStudies, type CaseStudiesProps } from "../sections/case-studies"
import { cloudCustomers, featuredStory } from "../content/conversion"
import { defineSection } from "./types"

export const caseStudies = defineSection<CaseStudiesProps>({
  id: "case-studies",
  name: "Case studies",
  category: "proof",
  summary: "Customer stories with their results: three result cards, or one featured story with a media slot.",
  file: "case-studies",
  component: CaseStudies,
  variants: [
    {
      id: "cards",
      name: "Result cards",
      description: "Three customers, each with the figure they reached, its line and a link (Cloud).",
      props: {
        layout: "cards",
        header: { kicker: cloudCustomers.kicker, title: cloudCustomers.title },
        items: cloudCustomers.items,
      },
    },
    {
      id: "featured",
      name: "Featured story",
      description: "One story at full width: media, summary, quote, figures and a link (Deutsche Telekom, Customers).",
      props: {
        layout: "featured",
        header: { kicker: featuredStory.kicker, title: featuredStory.title, action: featuredStory.action },
        story: featuredStory.story,
      },
    },
  ],
  docs: {
    use: [
      "Result cards on product and solution pages, to show what customers reached. A featured story to open the customers page or a solution page.",
      "For a quote on its own, use Testimonials.",
    ],
    rules: [
      "Only figures and lines the site states, each with its case study link.",
      "The figure is mono and large; never in the accent.",
      "Company names are text until their logo files are exported from the Figma.",
      "The featured story's media is a placeholder until the page supplies the image.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title and an optional action." },
      { part: "Card", note: "Company, figure, what it measures, the line, a link, and a footer with the category." },
      { part: "Featured story", note: "Media on the left; company, summary, quote, figures in cells and a link on the right." },
    ],
    props: [
      { name: "layout", type: '"cards" | "featured"', note: "Cards or one story." },
      { name: "items", type: "{ company, metric, metricLabel?, text, category?, detail?, link }[]", note: "The cards." },
      { name: "story", type: "{ company, summary?, quote?, metrics?, link, mediaLabel? }", note: "The featured story." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "Optional." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "cards", label: "Result cards" }, { value: "featured", label: "Featured story" }] },
  ],
})
