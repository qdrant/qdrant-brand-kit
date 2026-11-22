import { Changelog, type ChangelogProps } from "../sections/changelog"
import { releases } from "../content/listings"
import { defineSection } from "./types"

export const changelog = defineSection<ChangelogProps>({
  id: "changelog",
  name: "Changelog",
  category: "content",
  summary: "Releases down a line, a node each: the version in mono, the date, a title, the changes and links.",
  file: "changelog",
  component: Changelog,
  variants: [
    {
      id: "timeline",
      name: "Timeline",
      description: "The latest Qdrant releases with their first changes from the GitHub notes.",
      props: { layout: "timeline", header: { title: releases.title, action: releases.action }, items: releases.items },
    },
    {
      id: "compact",
      name: "Compact",
      description: "One row per release with its title or first change, for a page that links to the notes.",
      props: { layout: "compact", header: { title: releases.title, action: releases.action }, items: releases.items },
    },
  ],
  docs: {
    use: ["A changelog or release history. For a single release's story, use Article."],
    rules: [
      "Only real versions and dates, newest first.",
      "The newest node is filled in indigo; the rest are hollow.",
      "Changes are grouped as the notes group them (Features, Improvements, Bug Fixes, Security), in their words.",
      "Link each release to its notes, and to its post when there is one.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional, with an action on the right." },
      { part: "Node and line", note: "The timeline, one node per release." },
      { part: "Version and date", note: "Mono, on the left from md." },
      { part: "Title", note: "The release post's title. Optional." },
      { part: "Changes", note: "Grouped bullets; inline code in mono." },
      { part: "Links", note: "Release notes, the post." },
    ],
    props: [
      { name: "layout", type: '"timeline" | "compact"', note: "The line, or one row each." },
      { name: "items", type: "{ version, date (ISO), title?, changes: { kind, text }[], links }[]", note: "The releases." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "Optional." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "timeline", label: "Timeline" }, { value: "compact", label: "Compact" }] }],
})
