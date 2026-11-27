import { SponsorTiers, type SponsorTiersProps } from "../sections/sponsor-tiers"
import { vectorSpaceDay } from "../content/platform"
import { defineSection } from "./types"

const s = vectorSpaceDay.sponsorship

export const sponsorTiers = defineSection<SponsorTiersProps>({
  id: "sponsor-tiers",
  name: "Sponsor tiers",
  category: "events",
  summary: "An event's sponsors grouped by tier, in cell grids with larger cells for higher tiers.",
  file: "sponsor-tiers",
  component: SponsorTiers,
  variants: [
    {
      id: "tiers",
      name: "Tiers",
      description:
        "Vector Space Day San Francisco's sponsors and community sponsor, names as text until the logos are exported, with how to become one.",
      props: {
        layout: "tiers",
        header: { kicker: s.kicker, title: s.title, description: s.description, action: s.action },
        tiers: s.tiers,
      },
    },
  ],
  docs: {
    use: ["On an event page, after the agenda and speakers."],
    rules: [
      "Tiers and names exactly as the event page lists them, highest tier first.",
      "Logos are never redrawn or recolored; until a file is exported, the name stands in as text.",
      "Higher tiers get larger cells; empty cells complete a row so the grid's lines stay whole.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional: kicker, title, a line and an action." },
      { part: "Tier", note: "A mono label over a hairline cell grid." },
      { part: "Sponsor", note: "A logo, or the name as text, centered in its cell." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "Optional." },
      { name: "tiers", type: "{ name, sponsors: (string | { name, src? })[] }[]", note: "Highest tier first." },
    ],
  },
  fields: [],
})
