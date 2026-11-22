import { redirect } from "next/navigation"


// The Docs tab opens on the website's guidelines.
export default function Docs() {
  redirect("/web/docs/guidelines")
}
