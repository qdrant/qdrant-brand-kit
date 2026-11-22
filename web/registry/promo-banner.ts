import { PromoBanner, type PromoBannerProps } from "../sections/promo-banner"
import { agentsWebinar, ragGuide } from "../content/platform"
import { defineSection } from "./types"

export const promoBanner = defineSection<PromoBannerProps>({
  id: "promo-banner",
  name: "Promo banner",
  category: "cta",
  summary: "A promo for a webinar, guide or report on a plate: a kicker, a title, a line and one action.",
  file: "promo-banner",
  component: PromoBanner,
  variants: [
    {
      id: "split",
      name: "Split with media",
      description: "The AI Agents page's on-demand webinar, with a slot for its cover on the right.",
      props: { layout: "split", promo: agentsWebinar, media: "right", mediaLabel: "Webinar cover", tone: "purple", cardPattern: "dots" },
    },
    {
      id: "slim",
      name: "Slim",
      description: "The RAG page's evaluation guide on one line inside a plate, between two sections.",
      props: { layout: "slim", promo: ragGuide, tone: "blue" },
    },
  ],
  docs: {
    use: ["Inside a page, to point to one piece of content: a webinar, a guide, a report. For the page's closing call to action, use CTA."],
    rules: [
      "One promo, one action. The kicker says what it is (webinar, guide, report).",
      "Split's media slot holds the content's cover; until it exists, the placeholder holds its place. Never ship it.",
      "Slim is one line on desktop: the title, the line when it fits, and a text link.",
    ],
    anatomy: [
      { part: "Kicker", note: "An icon tile and what it is, in mono." },
      { part: "Title and line", note: "The content's title and one line." },
      { part: "Action", note: "A button in Split, a text link in Slim." },
      { part: "Media", note: "Split only, on either side." },
    ],
    props: [
      { name: "promo", type: "{ kicker, icon?, title, text?, action }", note: "The content." },
      { name: "layout", type: '"split" | "slim"', note: "With media, or one line." },
      { name: "media, mediaLabel", type: '"right" | "left", string', note: "Split: the media's side and its placeholder label." },
      { name: "tone", type: "tone", note: "The kicker icon's color family." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "split", label: "Split" }, { value: "slim", label: "Slim" }] },
    { prop: "media", label: "Media side", kind: "select", options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }] },
  ],
})
