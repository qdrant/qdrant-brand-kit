import { AnchorNav, type AnchorNavProps } from "../sections/anchor-nav"
import { cloudCapabilityTabs } from "../content/platform"
import { defineSection } from "./types"

export const anchorNav = defineSection<AnchorNavProps>({
  id: "anchor-nav",
  name: "Anchor nav",
  category: "navigation",
  summary: "A sticky in-page nav for long pages: anchor tabs on one line, the active one marked in indigo.",
  file: "anchor-nav",
  component: AnchorNav,
  variants: [
    {
      id: "tabs",
      name: "Tabs",
      description: "The Cloud page's five capability groups as anchor tabs, with the group's label on the left from lg.",
      props: { layout: "tabs", label: cloudCapabilityTabs.label, items: cloudCapabilityTabs.items, sticky: true },
    },
  ],
  docs: {
    use: ["Long pages with four to seven parts a reader jumps between: product pages, capabilities, pricing details."],
    rules: [
      "Each tab points to a part of the same page by its id. Labels are the parts' own names.",
      "The active tab is marked with an indigo line under it, never a fill. It follows the scroll when the parts are on the page.",
      "It sticks under the navbar's height on a page with a sticky navbar; set the offset on the page.",
      "On phones the tabs scroll sideways and the label hides.",
    ],
    anatomy: [
      { part: "Label", note: "Optional, in mono, from lg." },
      { part: "Tabs", note: "In-page links on one line, the active one with an indigo line." },
      { part: "Bottom line", note: "A hairline under the bar." },
    ],
    props: [
      { name: "items", type: "{ label, href }[]", note: "The tabs; hrefs are #ids on the page." },
      { name: "label", type: "string", note: "A quiet label before the tabs." },
      { name: "sticky", type: "boolean", note: "Stick to the top while the page scrolls. On by default." },
    ],
  },
  fields: [{ prop: "sticky", label: "Sticky", kind: "boolean" }],
})
