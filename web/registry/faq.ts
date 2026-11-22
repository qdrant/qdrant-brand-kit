import { Faq, type FaqProps } from "../sections/faq"
import { cloudFaq, hybridFaq, pricingFaq } from "../content/conversion"
import { defineSection } from "./types"

export const faq = defineSection<FaqProps>({
  id: "faq",
  name: "FAQ",
  category: "faq",
  summary: "Questions and answers in an accordion: one centered column, beside the heading, or in tabs by category.",
  file: "faq",
  component: Faq,
  variants: [
    {
      id: "narrow",
      name: "Narrow",
      description: "A centered 800px column of questions (Pricing).",
      props: { layout: "narrow", header: { title: pricingFaq.title }, items: pricingFaq.items },
    },
    {
      id: "split",
      name: "Split",
      description: "The heading and an action on the left, the questions on the right (Hybrid Cloud).",
      props: { layout: "split", header: { title: hybridFaq.title, action: hybridFaq.action }, items: hybridFaq.items },
    },
    {
      id: "categories",
      name: "Categories",
      description: "Tabs per category over the questions, for a long list (Cloud).",
      props: { layout: "categories", header: { title: cloudFaq.title }, categories: cloudFaq.categories },
    },
  ],
  docs: {
    use: [
      "Near the end of a page, before the closing call to action. Narrow for up to eight questions, split when the heading carries an action, categories for more than ten.",
    ],
    rules: [
      "The site's questions and answers, word for word.",
      "Questions sit on hairlines, without a box; the open one stays in the page's color, never a fill.",
      "The active category is marked in indigo; inactive ones are muted.",
      "Tabs scroll sideways on phones instead of wrapping into a wall.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, optional line and action." },
      { part: "Tabs", note: "Categories only: one per category, the active one underlined in indigo." },
      { part: "Question", note: "A trigger with a chevron; the answer in body text." },
    ],
    props: [
      { name: "layout", type: '"narrow" | "split" | "categories"', note: "The arrangement." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "items", type: "{ question, answer }[]", note: "Narrow and split." },
      { name: "categories", type: "{ label, items }[]", note: "Categories." },
    ],
  },
  fields: [
    {
      prop: "layout",
      label: "Layout",
      kind: "select",
      options: [
        { value: "narrow", label: "Narrow" },
        { value: "split", label: "Split" },
        { value: "categories", label: "Categories" },
      ],
    },
  ],
})
