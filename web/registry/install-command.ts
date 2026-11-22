import { InstallCommand, type InstallCommandProps } from "../sections/install-command"
import { installCommand as content } from "../content/platform"
import { defineSection } from "./types"

export const installCommand = defineSection<InstallCommandProps>({
  id: "install-command",
  name: "Install command",
  category: "developers",
  summary: "A terminal-style call to action: the commands to run Qdrant, each one copyable, with links to the docs.",
  file: "install-command",
  component: InstallCommand,
  variants: [
    {
      id: "terminal",
      name: "Terminal",
      description: "The quickstart's Docker commands in a terminal window under a centered heading, with what Qdrant serves once it runs.",
      props: { layout: "terminal", header: content.header, lines: content.lines, output: content.output, links: content.links },
    },
    {
      id: "inline",
      name: "Inline",
      description: "The heading and links on the left, each command on its own plate on the right, for the end of a docs-heavy page.",
      props: { layout: "inline", header: content.header, lines: content.lines, links: content.links },
    },
  ],
  docs: {
    use: ["Where a developer should be able to start right away: the home page, product pages, the end of a tutorial."],
    rules: [
      "Commands are copied exactly as the docs give them, line breaks included. Never shorten or rewrite one.",
      "Each command has its own copy button; the docs' line before it is its comment.",
      "One main action (the quickstart); the docs are the second.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title and a line; the actions under it in Terminal." },
      { part: "Commands", note: "A comment, a prompt sign in indigo, the command in mono and a copy button." },
      { part: "Output", note: "Optional: what the docs say runs once it's up (Terminal only)." },
      { part: "Links", note: "Buttons in Terminal, text links in Inline." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "lines", type: "{ comment?, command }[]", note: "The commands, in order." },
      { name: "output", type: "{ title?, items: { label, value }[] }", note: "What the docs show once it runs." },
      { name: "links", type: "{ label, href }[]", note: "The first is the main action." },
      { name: "layout", type: '"terminal" | "inline"', note: "Centered terminal or heading beside the commands." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "terminal", label: "Terminal" }, { value: "inline", label: "Inline" }] }],
})
