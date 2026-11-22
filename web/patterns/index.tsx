"use client"

import * as React from "react"

import { depthHaze } from "./depth-haze"
import type { PatternDefinition } from "./types"

export * from "./types"

// Every pattern, backgrounds first. Add a new one here. Juan adds them by hand, one at a time (2026-11-22).
export const patterns: PatternDefinition[] = [depthHaze]

export const getPattern = (id: string) => patterns.find((p) => p.id === id)
export const backgroundPatterns = () => patterns.filter((p) => p.kind === "background")
export const surfacePatterns = () => patterns.filter((p) => p.kind === "surface")

// One or more patterns as layers filling their parent. Hidden when data-web-patterns="off".
export function PatternLayers({ ids }: { ids?: string[] | string }) {
  const list = (Array.isArray(ids) ? ids : ids ? [ids] : []).map(getPattern).filter(Boolean) as PatternDefinition[]
  if (!list.length) return null
  return (
    <div aria-hidden className="web-pattern pointer-events-none absolute inset-0 overflow-hidden">
      {list.map((p) => (
        <p.Layer key={p.id} />
      ))}
    </div>
  )
}

// The surface pattern for the cards inside a section, set by Section and read by Plate.
const CardPatternContext = React.createContext<string | undefined>(undefined)

export function CardPatternProvider({ value, children }: { value?: string; children: React.ReactNode }) {
  return <CardPatternContext.Provider value={value}>{children}</CardPatternContext.Provider>
}

export function useCardPattern() {
  return React.useContext(CardPatternContext)
}
