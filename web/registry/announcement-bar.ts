import { AnnouncementBar, type AnnouncementBarProps } from "../sections/announcement-bar"
import { announcement } from "../content/site"
import { defineSection } from "./types"

export const announcementBar = defineSection<AnnouncementBarProps>({
  id: "announcement-bar",
  name: "Announcement bar",
  category: "navigation",
  summary: "One line above the navbar for the news of the moment, like a release.",
  file: "announcement-bar",
  component: AnnouncementBar,
  variants: [
    {
      id: "release",
      name: "Release",
      description: "A mono version tag, the news and a link. The whole bar is the link.",
      props: announcement,
    },
    {
      id: "plain",
      name: "Plain",
      description: "The news and a link, without a tag.",
      props: { text: announcement.text, link: announcement.link },
    },
  ],
  docs: {
    use: [
      "One announcement at a time, above the navbar on every page while it's news: a release, an event, a launch.",
      "Not for cookie notices, errors or anything the reader must act on.",
    ],
    rules: [
      "One line on desktop. If it wraps at 1200px, shorten the text.",
      "The link names where it goes (Read the release notes), never Click here.",
      "It sits on the raised surface, one step from the page, with a hairline below.",
    ],
    anatomy: [
      { part: "Tag", note: "Optional. Mono, in an outline badge: a version number or a one-word label." },
      { part: "Text", note: "The news, in the text color." },
      { part: "Link", note: "In primary/text with an arrow that nudges on hover." },
    ],
    props: [
      { name: "tag", type: "string", note: "Short mono label before the text." },
      { name: "text", type: "string", note: "The news. Required." },
      { name: "link", type: "{ label, href }", note: "Makes the whole bar a link." },
    ],
  },
  fields: [
    { prop: "tag", label: "Tag", kind: "text" },
    { prop: "text", label: "Text", kind: "text" },
  ],
})
