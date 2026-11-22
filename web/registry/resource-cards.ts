import { ResourceCards, type ResourceCardsProps } from "../sections/resource-cards"
import { courses, recentArticles } from "../content/listings"
import { defineSection } from "./types"

export const resourceCards = defineSection<ResourceCardsProps>({
  id: "resource-cards",
  name: "Resource cards",
  category: "listings",
  summary: "Guides, articles and courses: a type tag, the title, a line and its facts, in a grid or a list.",
  file: "resource-cards",
  component: ResourceCards,
  variants: [
    {
      id: "grid",
      name: "Grid",
      description: "Recent articles with their topics, authors and dates (/articles/).",
      props: {
        layout: "grid",
        header: { title: recentArticles.title, description: recentArticles.description, action: recentArticles.action },
        items: recentArticles.items,
      },
    },
    {
      id: "list",
      name: "List",
      description: "Courses, one per row, with the time they take and what they include (/course/).",
      props: { layout: "list", header: { kicker: courses.kicker, title: courses.title, description: courses.description }, items: courses.items },
    },
  ],
  docs: {
    use: [
      "Learning material: articles, guides, courses, videos. For blog posts, use Blog grid.",
      "Grid for a hub's sections; list when the facts (time, format) help people choose.",
    ],
    rules: [
      "The tag says what it is (Article, Course) and its topic, in mono capitals.",
      "Each kind has its own icon and color, the same everywhere: Article indigo, Course teal, Guide blue, Video purple.",
      "Facts are the site's: authors and date, or time and what's included. Never estimate a reading time.",
      "The whole card is one link.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional, with an action on the right." },
      { part: "Icon", note: "The kind's icon on a tile." },
      { part: "Tag", note: "Type / topic, mono." },
      { part: "Title and line", note: "A card title and up to three lines." },
      { part: "Facts", note: "Labeled in mono when they have a label." },
    ],
    props: [
      { name: "layout", type: '"grid" | "list"', note: "Three columns, or rows." },
      { name: "items", type: "{ type, topic?, title, text?, meta: { label?, value }[], href }[]", note: "The resources." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "Optional." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "grid", label: "Grid" }, { value: "list", label: "List" }] }],
})
