import { CommunityChannels, type CommunityChannelsProps } from "../sections/community-channels"
import { communityChannels as channels, communityPrograms as programs } from "../content/company"
import { defineSection } from "./types"

export const communityChannels = defineSection<CommunityChannelsProps>({
  id: "community-channels",
  name: "Community channels",
  category: "community",
  summary: "The ways to join a community, as cards or a list, each with an icon tile, a title, a line and a link.",
  file: "community-channels",
  component: CommunityChannels,
  variants: [
    {
      id: "cards",
      name: "Program cards",
      description: "The community page's heading and Discord button over its six programs (Community).",
      props: {
        header: { title: programs.title, description: programs.description, action: programs.action },
        items: programs.items,
        layout: "cards",
        tones: "mixed",
      },
    },
    {
      id: "list",
      name: "Channel list",
      description: "GitHub, Discord and X as rows with their social marks, the link on the right (Stars).",
      props: { header: { title: channels.title, action: channels.action }, items: channels.items, layout: "list", tones: "indigo" },
    },
  ],
  docs: {
    use: [
      "A community page's programs, or the channels where people meet. Three to six items.",
      "For product features, use Feature grid.",
    ],
    rules: [
      "One primary action in the heading, usually the main channel. Each item links with a text link, never a second button.",
      "Social channels show their mark from web/assets/social on the tile; other items a Lucide icon. Never amaranth on a tile.",
      "An item without a link on the site has none here.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, description, and the primary action on the right." },
      { part: "Tile", note: "A Lucide icon or a social mark on a tinted tile." },
      { part: "Title and line", note: "A card title and one line." },
      { part: "Link", note: "Optional, with a chevron." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block; the action is the primary button." },
      { name: "items", type: "{ title, text, icon?, mark?, link? }[]", note: "mark: github, discord, x, linkedin or youtube." },
      { name: "layout", type: '"cards" | "list"', note: "Cards in three columns, or rows." },
      { name: "tones", type: "Tone | \"mixed\"", note: "The tiles' color family." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "cards", label: "Cards" }, { value: "list", label: "List" }] },
    {
      prop: "tones",
      label: "Icon colors",
      kind: "select",
      options: [
        { value: "mixed", label: "Mixed" },
        { value: "indigo", label: "Indigo" },
        { value: "teal", label: "Teal" },
        { value: "blue", label: "Blue" },
        { value: "purple", label: "Purple" },
        { value: "cyan", label: "Cyan" },
        { value: "green", label: "Green" },
        { value: "orange", label: "Orange" },
      ],
    },
  ],
})
