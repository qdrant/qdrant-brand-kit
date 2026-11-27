"use client"

import * as React from "react"

// Marks <body> as part of the website (data-web, and data-context="marketing" for the amaranth accent) while a whole
// page is open in the studio, as a page's root is on the real site. Menus and dialogs open on <body>, so they take
// the website's surfaces, lines and accent too.
export function WebBody() {
  React.useEffect(() => {
    document.body.setAttribute("data-web", "")
    document.body.setAttribute("data-context", "marketing")
    return () => {
      document.body.removeAttribute("data-web")
      document.body.removeAttribute("data-context")
    }
  }, [])
  return null
}
