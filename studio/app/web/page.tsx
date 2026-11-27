import { redirect } from "next/navigation"

// The Web link opens the canvas, every section at once.
export default function Web() {
  redirect("/web/canvas")
}
