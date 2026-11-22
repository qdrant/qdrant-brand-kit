import { TeamGrid, type TeamGridProps } from "../sections/team-grid"
import { leadership } from "../content/company"
import { defineSection } from "./types"

export const teamGrid = defineSection<TeamGridProps>({
  id: "team-grid",
  name: "Team grid",
  category: "people",
  summary: "A team as cards or compact rows, each person with a photo slot, a name and a role.",
  file: "team-grid",
  component: TeamGrid,
  variants: [
    {
      id: "grid",
      name: "Cards, 4 columns",
      description: "The leadership team on cards with a square photo slot (About). Initials hold the photos' place.",
      props: { header: { title: leadership.title }, people: leadership.people, layout: "grid" },
    },
    {
      id: "compact",
      name: "Compact rows",
      description: "The same team in a hairline grid, a small round photo beside each name, for a longer list.",
      props: { header: { title: leadership.title }, people: leadership.people, layout: "compact" },
    },
  ],
  docs: {
    use: [
      "A company's leadership or a team page. For community members with a bio, use Profile grid.",
      "Cards for up to eight people; compact rows for more, or when the team is a supporting part of the page.",
    ],
    rules: [
      "Only people the site names, with their roles as written. Never invent a person or a role.",
      "Photos stay the initials placeholder until real photos are supplied. Never a stock face.",
      "Roles are in mono, one line.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, with an optional kicker, description and action on the right." },
      { part: "Photo slot", note: "Square on cards, round in rows. Initials until a photo exists." },
      { part: "Name and role", note: "A card title and the role in mono." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "people", type: "{ name, role }[]", note: "The team, in the site's order." },
      { name: "layout", type: '"grid" | "compact"', note: "Cards or rows." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "grid", label: "Cards" }, { value: "compact", label: "Compact rows" }] },
  ],
})
