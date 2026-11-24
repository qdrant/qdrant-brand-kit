import { PricingTiers, type PricingTiersProps } from "../sections/pricing-tiers"
import { pricingTiers as content } from "../content/conversion"
import { defineSection } from "./types"

const onPremise = content.groups.filter((g) => g.label === "On-Premise")

export const pricingTiers = defineSection<PricingTiersProps>({
  id: "pricing-tiers",
  name: "Pricing tiers",
  category: "pricing",
  summary: "The plans side by side in a hairline grid, with a toggle between groups, or wide cards for enterprise options.",
  file: "pricing-tiers",
  component: PricingTiers,
  variants: [
    {
      id: "grid",
      name: "Tier grid",
      description: "Free, Standard and Premium split by hairlines, with the Managed / On-Premise toggle (Pricing).",
      props: {
        layout: "grid",
        header: { title: content.title, description: content.description, action: content.action, secondaryAction: content.secondaryAction },
        groups: content.groups,
        calculator: content.calculator,
      },
    },
    {
      id: "enterprise",
      name: "Enterprise cards",
      description: "Hybrid and Private Cloud as wide cards with what they're best for and their benefits (Pricing, On-Premise).",
      props: { layout: "enterprise", groups: onPremise, calculator: content.calculator },
    },
    {
      id: "rows",
      name: "Price list",
      description: "Each tier one row of a hairline table: name, price, what's included, action.",
      props: {
        layout: "rows",
        header: { title: content.title, description: content.description },
        groups: content.groups,
        calculator: content.calculator,
      },
      proposal:
        "Prices line up in one column and every tier's action sits on the same edge, so the page reads like a price list, the way infrastructure is usually priced (fal's GPU table, Browserbase's plan rows). The highlighted tier is marked by an indigo edge on its left instead of its top.",
    },
  ],
  docs: {
    use: [
      "The tier grid at the top of the pricing page. Enterprise cards for options sold through sales, under the grid or on an enterprise page.",
    ],
    rules: [
      "Price lines exactly as the site writes them. Never a number for the layout.",
      "Tiers are split by hairlines, not floating cards. One tier is highlighted: an indigo mark on its top edge and the primary button; the rest have secondary buttons.",
      "Feature checks are small indigo marks; no other icons.",
      "The toggle shows only with two or more groups.",
    ],
    anatomy: [
      { part: "Heading", note: "Centered, with the main action and a second one." },
      { part: "Toggle", note: "One tab per group, the active one on a plate." },
      { part: "Tier", note: "Name, price line, who it's for, the button, then the features." },
      { part: "Calculator line", note: "A question and a link to the calculator." },
    ],
    props: [
      { name: "layout", type: '"grid" | "enterprise" | "rows"', note: "Hairline grid, wide cards, or rows (proposed)." },
      { name: "groups", type: "{ label, tiers: { name, price?, description?, features?, featureGroups?, note?, cta, highlight? }[] }[]", note: "One group per tab." },
      { name: "header", type: "{ kicker?, title, description?, action?, secondaryAction? }", note: "Optional." },
      { name: "calculator", type: "{ text, prefix?, link }", note: "The line under the tiers." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "grid", label: "Tier grid" }, { value: "enterprise", label: "Enterprise cards" }, { value: "rows", label: "Price list" }] }],
})
