"use client"

import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qdrant/design-system/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@qdrant/design-system/components/ui/field"
import { Input } from "@qdrant/design-system/components/ui/input"

// A dialog over the Overview's cards, to judge the dialog prototypes (glass backdrop, light from above,
// weightless motion) against a busy page. The content is shadcn's own dialog demo.
export function SampleDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Open a dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done. Your profile will be updated
            immediately.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="sample-dialog-name">Name</FieldLabel>
            <Input id="sample-dialog-name" defaultValue="Pedro Duarte" />
          </Field>
          <Field>
            <FieldLabel htmlFor="sample-dialog-username">Username</FieldLabel>
            <Input id="sample-dialog-username" defaultValue="@peduarte" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save changes</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
