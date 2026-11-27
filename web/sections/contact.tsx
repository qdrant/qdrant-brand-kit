"use client"

import * as React from "react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Checkbox } from "@qdrant/design-system/components/ui/checkbox"
import { Field, FieldLabel } from "@qdrant/design-system/components/ui/field"
import { Input } from "@qdrant/design-system/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"
import { Textarea } from "@qdrant/design-system/components/ui/textarea"
import { cn } from "@qdrant/design-system/lib/utils"

import type { FormField, FormSpec } from "../content/conversion"
import type { Link } from "../content/site"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import { IconTile, toneAt } from "../lib/tone"
import { heading, type } from "../lib/type"

function FieldControl({ field, id }: { field: FormField; id: string }) {
  if (field.type === "textarea") {
    return <Textarea id={id} name={field.name} required={field.required} placeholder={field.placeholder} className="min-h-28" />
  }
  if (field.type === "select") {
    return (
      <NativeSelect id={id} name={field.name} required={field.required} defaultValue="" className="w-full">
        <NativeSelectOption value="" disabled>
          Please Select
        </NativeSelectOption>
        {field.options?.map((o) => (
          <NativeSelectOption key={o} value={o}>
            {o}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    )
  }
  return <Input id={id} name={field.name} type={field.type} required={field.required} placeholder={field.placeholder} />
}

// A site form on a plate (2026-11-21): its title, its fields with the site's labels, fine print and the submit
// button. Not wired: it goes nowhere until a page connects it. Shared by the contact and sign-up sections.
export function SiteForm({ form, className }: { form: FormSpec; className?: string }) {
  const baseId = React.useId()
  return (
    <Plate as="form" className={cn("flex flex-col gap-6 rounded-xl p-6 md:p-8", className)} action="#" onSubmit={(e) => e.preventDefault()}>
      {form.title && <h3 className={heading.card}>{form.title}</h3>}
      <div className="grid gap-5 sm:grid-cols-2">
        {form.fields.map((field) => {
          const fieldId = `${baseId}-${field.name}`
          if (field.type === "checkbox") {
            return (
              <Field key={field.name} orientation="horizontal" className="sm:col-span-2">
                <Checkbox id={fieldId} name={field.name} />
                <FieldLabel htmlFor={fieldId} className={cn(type.small, "font-normal")}>
                  {field.label}
                </FieldLabel>
              </Field>
            )
          }
          return (
            <Field key={field.name} className={cn(!field.half && "sm:col-span-2")}>
              <FieldLabel htmlFor={fieldId}>
                {field.label}
                {field.required && (
                  <span aria-hidden className="text-muted-foreground">
                    *
                  </span>
                )}
              </FieldLabel>
              <FieldControl field={field} id={fieldId} />
            </Field>
          )
        })}
      </div>
      {form.note && <p className={type.xsmall}>{form.note}</p>}
      <Button type="submit" size="lg" className="self-start">
        {form.submit}
      </Button>
    </Plate>
  )
}

export type ContactOption = { icon?: string; title: string; text?: string; link: Link }

export type ContactProps = SectionProps & {
  title: string
  // The intro, with the response time.
  description?: string
  // Other ways to reach the team, as cards under the intro.
  options?: ContactOption[]
  form: FormSpec
}

// The contact page (2026-11-21): the intro and the other ways to reach Qdrant on the left, the form on the right.
export function Contact({ title, description, options = [], form, theme, surface, pattern, cardPattern, id, className }: ContactProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)">
      <div className="flex flex-col gap-10">
        <SectionHeader as="h1" title={title} description={description} />
        {options.length > 0 && (
          <ul className="flex flex-col gap-3">
            {options.map((o, i) => (
              <Plate as="li" simple key={o.title} className="flex items-start gap-4 rounded-xl p-5">
                <IconTile name={o.icon} tone={toneAt(i)} />
                <div className="flex flex-col gap-1">
                  <h2 className={heading.card}>{o.title}</h2>
                  <p className={type.small}>
                    {o.text}{" "}
                    <a href={o.link.href} className="web-link font-medium underline underline-offset-4">
                      {o.link.label}
                    </a>
                  </p>
                </div>
              </Plate>
            ))}
          </ul>
        )}
      </div>
      <SiteForm form={form} />
    </Section>
  )
}
