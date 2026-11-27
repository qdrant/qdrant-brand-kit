import type { Link } from "../content/site"

// The heading block most sections open with, passed straight to SectionHeader.
export type HeaderProps = {
  kicker?: string
  title: string
  description?: string
  action?: Link
}
