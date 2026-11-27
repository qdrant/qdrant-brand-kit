"use client"

import * as React from "react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Input } from "@qdrant/design-system/components/ui/input"
import { cn } from "@qdrant/design-system/lib/utils"

import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"

export type NewsletterProps = SectionProps & {
  // band: the heading on the left, the field on the right, between hairlines. card: the same on a plate.
  layout?: "band" | "card"
  title: string
  description?: string
  placeholder?: string
  submit?: string
}

function EmailForm({ placeholder, submit, className }: { placeholder: string; submit: string; className?: string }) {
  const fieldId = React.useId()
  return (
    <form action="#" onSubmit={(e) => e.preventDefault()} className={cn("flex w-full max-w-md flex-col gap-2 sm:flex-row", className)}>
      <label htmlFor={fieldId} className="sr-only">
        Email
      </label>
      <Input id={fieldId} type="email" name="email" required placeholder={placeholder} autoComplete="email" />
      <Button type="submit">{submit}</Button>
    </form>
  )
}

// A newsletter sign-up (2026-11-21): one email field and one button, with the footer's title and line. Not wired:
// a page connects it.
export function Newsletter({ layout = "band", title, description, placeholder = "Enter your email", submit = "Subscribe", theme, surface, pattern, cardPattern, id, className }: NewsletterProps) {
  const text = (
    <div className="flex flex-col gap-2">
      <h2 className={cn(heading.card, layout === "card" && "md:text-(length:--qd-type-h6-size) md:leading-(--qd-type-h6-line-height)")}>{title}</h2>
      {description && <p className={cn(type.body, "max-w-xl text-pretty")}>{description}</p>}
    </div>
  )

  if (layout === "card") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className}>
        <Plate as="div" className="mx-auto flex max-w-4xl flex-col gap-8 rounded-xl p-6 md:p-10 lg:flex-row lg:items-end lg:justify-between">
          {text}
          <EmailForm placeholder={placeholder} submit={submit} className="lg:max-w-sm" />
        </Plate>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className}>
      <div className="web-grid grid-cols-1 lg:grid-cols-2">
        <div className="px-6 py-10">{text}</div>
        <div className="flex items-center px-6 py-10 lg:justify-end">
          <EmailForm placeholder={placeholder} submit={submit} />
        </div>
      </div>
    </Section>
  )
}
