import { CodeShowcase, type CodeShowcaseProps } from "../sections/code-showcase"
import { builders } from "../content/sections"
import { defineSection } from "./types"

const header = { title: builders.title, description: builders.description, action: builders.action }

export const codeShowcase = defineSection<CodeShowcaseProps>({
  id: "code-showcase",
  name: "Code showcase",
  category: "developers",
  summary: "The same call in several languages, beside what it returns.",
  file: "code-showcase",
  component: CodeShowcase,
  variants: [
    {
      id: "split",
      name: "Code and response",
      description: "Language tabs over the code, the response beside it (Qdrant's quickstart search).",
      props: { header, tabs: builders.tabs, result: builders.result, layout: "split", pattern: ["grid"] },
    },
    {
      id: "aside",
      name: "Heading beside code",
      description: "The heading on the left and the code on the right, without the response.",
      props: { header, tabs: builders.tabs, layout: "aside" },
    },
  ],
  docs: {
    use: ["Wherever a developer should see the API: product pages, the home page, solution pages."],
    rules: [
      "Code is real and runs: take it from Qdrant's docs, never write a sample for the layout.",
      "The response shows what the call returns, from the same docs.",
      "Language tabs in the docs' order; the file name on the right.",
    ],
    anatomy: [
      { part: "Heading", note: "With an action on the right, or beside the code." },
      { part: "Code", note: "Tabs per language over the code, on a plate." },
      { part: "Response", note: "Optional, on a plate beside the code, with a caption." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "tabs", type: "{ label, file?, code }[]", note: "One tab per language." },
      { name: "result", type: "{ label?, code }", note: "What the call returns." },
      { name: "layout", type: '"split" | "aside"', note: "Where the heading goes." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "split", label: "Code and response" }, { value: "aside", label: "Heading beside code" }] }],
})
