import { FeatureTabs, type FeatureTabsProps } from "../sections/feature-tabs"
import { performance } from "../content/sections"
import { defineSection } from "./types"

export const featureTabs = defineSection<FeatureTabsProps>({
  id: "feature-tabs",
  name: "Feature tabs",
  category: "features",
  summary: "A list of features on the left that switches the media on the right.",
  file: "feature-tabs",
  component: FeatureTabs,
  variants: [
    {
      id: "vertical",
      name: "Vertical list",
      description: "Four features, one visual at a time (home, Performance by Design).",
      props: { header: { title: performance.title }, items: performance.items },
    },
    {
      id: "top",
      name: "Tabs on top",
      description: "The titles as a row of tabs on a tray, the active one's text under them, the media across the page.",
      props: { header: { title: performance.title }, items: performance.items, layout: "top" },
      proposal:
        "When the media matters more than the list, it gets the full width: the four titles become one row of tabs on a tray (the same control as pricing's toggle), with the active one's line under them. From Stripe's and Vercel's product tabs.",
    },
    {
      id: "window",
      name: "App window",
      description: "One app window: the titles as its sidebar, the active one's text under its title, the media as its content.",
      props: { header: { title: performance.title }, items: performance.items, layout: "window" },
      proposal:
        "The section looks like the product it describes: a window with its bar and three dots, a sidebar of the features and the screen beside it, so picking a feature feels like using the console. A developer-tool staple (Supabase's dashboard previews, Railway's canvas), in our window chrome.",
    },
  ],
  docs: {
    use: ["Three to five features that share one visual space, read one at a time."],
    rules: [
      "The active item shows its text and a filled node on the line; the others show their title only.",
      "Keep titles to one line at 1200px.",
    ],
    anatomy: [
      { part: "Heading", note: "Stacked." },
      { part: "List", note: "Titles on a line with a node each; the active one expands." },
      { part: "Media", note: "On a plate in a tray; it changes with the active item." },
    ],
    props: [
      { name: "layout", type: '"vertical" | "top" | "window"', note: "List beside the media, tabs above it, or an app window (the last two proposed)." },
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "items", type: "{ title, text? }[]", note: "The features." },
    ],
  },
  fields: [
    {
      prop: "layout",
      label: "Layout",
      kind: "select",
      options: [
        { value: "vertical", label: "Vertical list" },
        { value: "top", label: "Tabs on top" },
        { value: "window", label: "App window" },
      ],
    },
  ],
})
