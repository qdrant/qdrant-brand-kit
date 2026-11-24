"use client"

import dynamic from "next/dynamic"

// The builder reads its pages from localStorage, so it renders in the browser only.
export const PageBuilderClient = dynamic(() => import("./builder").then((m) => m.PageBuilder), { ssr: false })
