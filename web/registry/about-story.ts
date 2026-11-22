import { AboutStory, type AboutStoryProps } from "../sections/about-story"
import { ourStory } from "../content/company"
import { defineSection } from "./types"

export const aboutStory = defineSection<AboutStoryProps>({
  id: "about-story",
  name: "About story",
  category: "company",
  summary: "A company's story in passages beside photos, a closing line, and its vision and mission.",
  file: "about-story",
  component: AboutStory,
  variants: [
    {
      id: "rows",
      name: "Story rows",
      description: "The About page's story in three passages beside photo slots, then the closing line and the vision and mission. Photos are placeholders.",
      props: {
        header: { title: ourStory.title, description: ourStory.description },
        chapters: ourStory.chapters,
        statement: ourStory.statement,
        vision: ourStory.vision,
        mission: ourStory.mission,
        layout: "rows",
      },
    },
    {
      id: "mission",
      name: "Vision and mission",
      description: "The closing line and the vision and mission side by side, without the story (About).",
      props: {
        header: { title: ourStory.title },
        statement: ourStory.statement,
        vision: ourStory.vision,
        mission: ourStory.mission,
        layout: "mission",
      },
    },
  ],
  docs: {
    use: [
      "The opening of an About page, or a company's vision and mission on its own.",
      "For product features with media, use Feature rows.",
    ],
    rules: [
      "The story's text as the site writes it, in its order. Never invent a date, a founder or a figure.",
      "Photos are the team's own, supplied by the page. Until then the slots stay placeholders.",
      "The vision and mission are two plates of equal size, side by side from md.",
    ],
    anatomy: [
      { part: "Heading", note: "Title on the left, the story's first line on the right." },
      { part: "Chapters", note: "A number, a paragraph or two, and a photo slot, alternating sides." },
      { part: "Statement", note: "A closing line in large text." },
      { part: "Vision and mission", note: "Two plates, each a card title and a lead paragraph." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "chapters", type: "{ text: string[], media? }[]", note: "The passages and their photo slots' labels." },
      { name: "statement", type: "string", note: "The closing line." },
      { name: "vision, mission", type: "{ title, text }", note: "The two statements." },
      { name: "layout", type: '"rows" | "mission"', note: "The full story, or the vision and mission only." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "rows", label: "Story rows" }, { value: "mission", label: "Vision and mission" }] },
    { prop: "statement", label: "Statement", kind: "textarea" },
  ],
})
