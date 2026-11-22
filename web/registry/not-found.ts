import { NotFound, type NotFoundProps } from "../sections/not-found"
import { notFoundPage } from "../content/listings"
import { defineSection } from "./types"

export const notFound = defineSection<NotFoundProps>({
  id: "not-found",
  name: "Not found",
  category: "utility",
  summary: "The 404 page: a big 404 in mono, the message, where to look instead, and two ways out, over the starfield.",
  file: "not-found",
  component: NotFound,
  variants: [
    {
      id: "stars",
      name: "Starfield",
      description: "The site's 404 copy and buttons over the starfield (/404).",
      props: { ...notFoundPage, pattern: ["stars"] },
    },
  ],
  docs: {
    use: ["The 404 page, alone between the navbar and the footer. The same layout works for other error pages with their own copy."],
    rules: [
      "The code is mono and large; the message is the page's H1.",
      "Two actions: home as the primary, support as the secondary.",
      "One background pattern, the starfield by default.",
    ],
    anatomy: [
      { part: "Code", note: "404, in mono." },
      { part: "Message", note: "The H1." },
      { part: "Help line", note: "Where to look instead, with links." },
      { part: "Actions", note: "Primary and secondary." },
    ],
    props: [
      { name: "code", type: "string", note: "404 by default." },
      { name: "title", type: "string", note: "The message." },
      { name: "help", type: "(string | { label, href })[]", note: "Text and links in order." },
      { name: "primary, secondary", type: "{ label, href }", note: "The actions." },
    ],
  },
  fields: [
    { prop: "code", label: "Code", kind: "text" },
    { prop: "title", label: "Message", kind: "text" },
  ],
})
