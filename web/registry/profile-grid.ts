import { ProfileGrid, type ProfileGridProps } from "../sections/profile-grid"
import { stars } from "../content/company"
import { defineSection } from "./types"

export const profileGrid = defineSection<ProfileGridProps>({
  id: "profile-grid",
  name: "Profile grid",
  category: "people",
  summary: "Community profiles on cards: a round photo slot, a name, a role, a short bio and a badge.",
  file: "profile-grid",
  component: ProfileGrid,
  variants: [
    {
      id: "grid",
      name: "Profiles, 3 columns",
      description: "The first twelve Qdrant Stars, the distinguished ones badged, with the handbook link (Stars). Initials hold the photos' place.",
      props: {
        header: { title: stars.title, action: stars.action },
        profiles: stars.profiles,
        badge: stars.badge,
        columns: 3,
        layout: "grid",
        cardPattern: "grain",
      },
    },
  ],
  docs: {
    use: [
      "Community members, ambassadors or speakers, each with a bio. For a company's team with roles only, use Team grid.",
    ],
    rules: [
      "Only people the site names, with roles and bios as written. A bio longer than a sentence or two keeps its first full sentence.",
      "The badge only where the site gives one, in its words.",
      "Photos stay the initials placeholder until real photos are supplied.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, with a text link on the right." },
      { part: "Photo slot", note: "Round, with the initials until a photo exists." },
      { part: "Badge", note: "Optional, with a small indigo mark." },
      { part: "Name, role and bio", note: "A card title, the role in mono and a short bio." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block. The action is a text link." },
      { name: "profiles", type: "{ name, role, bio, distinguished? }[]", note: "The profiles, in the site's order." },
      { name: "badge", type: "string", note: "The words on a distinguished profile's badge." },
      { name: "columns", type: "3 | 4", note: "From lg; two at md, one on phones." },
    ],
  },
  fields: [
    { prop: "columns", label: "Columns", kind: "select", options: [{ value: "3", label: "3" }, { value: "4", label: "4" }] },
    { prop: "badge", label: "Badge", kind: "text" },
  ],
})
