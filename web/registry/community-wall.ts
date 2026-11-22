import { CommunityWall, type CommunityWallProps } from "../sections/community-wall"
import { communityWall as wall } from "../content/company"
import { defineSection } from "./types"

export const communityWall = defineSection<CommunityWallProps>({
  id: "community-wall",
  name: "Community wall",
  category: "community",
  summary: "Short posts from community members on cards in uneven columns, each with an avatar, a name and a handle.",
  file: "community-wall",
  component: CommunityWall,
  variants: [
    {
      id: "masonry",
      name: "Masonry",
      description: "Six members' posts, each cut to its first full sentence, with the Discord button (Community). Initials hold the avatars' place.",
      props: { header: { title: wall.title, action: wall.action }, quotes: wall.quotes, layout: "masonry" },
    },
  ],
  docs: {
    use: [
      "Many short, informal posts from developers, as social proof on a community or product page.",
      "For one customer's quote with a result, use a testimonial section instead.",
    ],
    rules: [
      "Names, handles and quotes as written. A quote longer than a sentence keeps its first full sentence.",
      "Never invent a quote, a member or a handle. Avatars stay initials until the member's own image is supplied.",
      "Six to twelve cards, so the columns fill.",
    ],
    anatomy: [
      { part: "Heading", note: "Title and an action on the right." },
      { part: "Card", note: "The quote in lead text, then the avatar, the name and the handle in mono." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "quotes", type: "{ name, handle, quote }[]", note: "The posts, in the site's order." },
      { name: "layout", type: '"masonry"', note: "Uneven columns, one to three by width." },
    ],
  },
  fields: [],
})
