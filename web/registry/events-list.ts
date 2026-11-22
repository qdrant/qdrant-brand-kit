import { EventsList, type EventsListProps } from "../sections/events-list"
import { events } from "../content/listings"
import { defineSection } from "./types"

export const eventsList = defineSection<EventsListProps>({
  id: "events-list",
  name: "Events list",
  category: "listings",
  summary: "Upcoming and past events with a date block in mono, the type, title, place and a link out, as rows or cards.",
  file: "events-list",
  component: EventsList,
  variants: [
    {
      id: "list",
      name: "List",
      description: "The upcoming event and recent past ones as rows reaching the rails (/events/).",
      props: { layout: "list", upcomingTitle: events.upcomingTitle, upcoming: events.upcoming, pastTitle: events.pastTitle, past: events.past },
    },
    {
      id: "cards",
      name: "Cards",
      description: "The same events on plates in three columns, for a shorter list on another page.",
      props: { layout: "cards", upcomingTitle: events.upcomingTitle, upcoming: events.upcoming, pastTitle: events.pastTitle, past: events.past.slice(0, 6) },
    },
  ],
  docs: {
    use: [
      "The events page, or a community page's next events. For one big event, use a Hero.",
      "List for many events; cards for up to six.",
    ],
    rules: [
      "Upcoming first, soonest first; past after, newest first.",
      "The date block is mono: month, day and weekday. The year shows beside the type in rows.",
      "Each event links out to its own page (Luma, YouTube). An event without a page has no link.",
      "Descriptions keep their first sentence or two; the event's page has the rest.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional." },
      { part: "Group title", note: "Upcoming or past, a kicker with the node and the count." },
      { part: "Date block", note: "Month, day, weekday, in mono." },
      { part: "Type, title and line", note: "The type as a mono tag." },
      { part: "Place and time", note: "Where, and when if the site says." },
      { part: "Link out", note: "The whole row or card, with an arrow." },
    ],
    props: [
      { name: "layout", type: '"list" | "cards"', note: "Rows or plates." },
      { name: "upcoming, past", type: "{ date (ISO), type, title, text?, location, time?, href }[]", note: "The events." },
      { name: "upcomingTitle, pastTitle", type: "string", note: "The groups' titles." },
      { name: "header", type: "{ kicker?, title, description? }", note: "Optional." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "list", label: "List" }, { value: "cards", label: "Cards" }] }],
})
