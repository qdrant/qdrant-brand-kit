"use client"

import dynamic from "next/dynamic"

// The canvas follows the studio's theme, which is only known in the browser, so it renders there.
export const WebCanvasClient = dynamic(() => import("./canvas").then((m) => m.WebCanvas), { ssr: false })
