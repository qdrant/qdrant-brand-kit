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
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "items", type: "{ title, text? }[]", note: "The features." },
    ],
  },
  fields: [],
})
