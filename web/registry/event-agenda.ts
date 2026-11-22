import { EventAgenda, type EventAgendaProps } from "../sections/event-agenda"
import { vectorSpaceDay as e } from "../content/platform"
import { defineSection } from "./types"

export const eventAgenda = defineSection<EventAgendaProps>({
  id: "event-agenda",
  name: "Event agenda",
  category: "events",
  summary: "An event's facts (venue, date, hours), then its tracks as tiles or its sessions as a schedule.",
  file: "event-agenda",
  component: EventAgenda,
  variants: [
    {
      id: "tracks",
      name: "Tracks",
      description: "Vector Space Day San Francisco: the hero's facts, then the agenda's four tracks as numbered tiles.",
      props: {
        layout: "tracks",
        header: { kicker: e.agenda.kicker, title: e.agenda.title, description: e.agenda.description },
        facts: e.facts,
        action: e.action,
        tracks: e.agenda.tracks,
        pattern: ["stars"],
      },
    },
    {
      id: "schedule",
      name: "Schedule",
      description:
        "The event's talks as rows: company, title and speakers. The page gives no session times or tracks, so the time column stays out until they're added.",
      props: {
        layout: "schedule",
        header: { kicker: e.speakers.kicker, title: e.speakers.title, description: e.speakers.description },
        facts: e.facts,
        action: e.action,
        sessions: e.speakers.sessions,
      },
    },
  ],
  docs: {
    use: ["On an event page, under its hero: the tracks for an overview, the schedule once the sessions are set."],
    rules: [
      "Facts, tracks, times, talks and speakers only as the event page gives them. Never fill a time or a track for the layout.",
      "A session gets a time column only when sessions have times, and a track tag only when the page says which.",
      "Speakers by name and role as listed; no photos here (use a people section for them).",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title, a line and an action on the right." },
      { part: "Facts", note: "Venue, date and hours in a cell row, each with an icon tile." },
      { part: "Tracks", note: "Numbered tiles with an icon and a title." },
      { part: "Schedule", note: "Rows: time (when given), company, title, speakers and track (when given)." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "facts", type: "{ icon, text }[]", note: "The event's hero facts." },
      { name: "tracks", type: "{ title, text?, icon? }[]", note: "For tracks." },
      { name: "sessions", type: "{ company, speakers, title, time?, track? }[]", note: "For schedule." },
      { name: "layout", type: '"tracks" | "schedule"', note: "Tiles or rows." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "tracks", label: "Tracks" }, { value: "schedule", label: "Schedule" }] }],
})
