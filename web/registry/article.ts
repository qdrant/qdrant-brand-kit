import { Article, type ArticleProps } from "../sections/article"
import { articleToc, releasePost } from "../content/listings"
import { defineSection } from "./types"

export const article = defineSection<ArticleProps>({
  id: "article",
  name: "Article",
  category: "content",
  summary: "A blog post: title and byline, a hero image slot, prose with a sticky contents list, and share links.",
  file: "article",
  component: Article,
  variants: [
    {
      id: "post",
      name: "Post",
      description:
        "The opening of the Qdrant 1.20 post, verbatim. The pull quote is a labeled placeholder (the post has none), and the hero and chart are placeholder frames.",
      props: {
        title: releasePost.title,
        authors: releasePost.authors,
        date: releasePost.date,
        toc: articleToc,
        tocTitle: releasePost.tocTitle,
        blocks: releasePost.blocks,
        share: releasePost.share,
      },
    },
  ],
  docs: {
    use: ["A blog post, an article or a release post. For legal text, use Legal; for docs, the docs site."],
    rules: [
      "Prose stays in a reading column (about 72 characters); the contents sit beside it from lg and stay in view.",
      "The contents list the post's H2s and H3s; the one in view is marked in indigo.",
      "Code in a plate with its language; inline code in mono. Never a screenshot of code.",
      "A quote only when the post quotes someone, with who said it.",
      "Figures carry the post's own caption.",
    ],
    anatomy: [
      { part: "Title and byline", note: "The H1, authors and date in mono." },
      { part: "Hero image", note: "A wide slot, a placeholder until the post's image." },
      { part: "Prose", note: "H2, H3, paragraphs, lists, code, quote, figure." },
      { part: "On this page", note: "Sticky from lg, hidden below." },
      { part: "Share", note: "Links after the prose and under the contents." },
    ],
    props: [
      { name: "title, authors, date", type: "string", note: "The post's heading and byline." },
      { name: "blocks", type: "ProseBlock[]", note: "h2, h3 (with ids), p, list, code, quote, figure. Text marks `code` and **bold**." },
      { name: "toc", type: "{ id, label, level? }[]", note: "The contents; from the headings when left out." },
      { name: "share", type: "{ label, href }[]", note: "Share links." },
      { name: "heroImage", type: "boolean", note: "Show the hero slot. On by default." },
    ],
  },
  fields: [
    { prop: "title", label: "Title", kind: "text" },
    { prop: "heroImage", label: "Hero image", kind: "boolean" },
  ],
})
