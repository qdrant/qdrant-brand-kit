import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2 py-2 text-left text-xs/relaxed has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        // The status variants (design-system/styles/components/alert.css): the soft fill with a border in the
        // state's color, and the icon, title and description in that color (at 7:1 or more in both themes).
        destructive:
          "border-(--qd-ui-alert-error-border) bg-(--qd-ui-alert-error-bg) text-(--qd-ui-alert-error-fg) *:data-[slot=alert-description]:text-current",
        success:
          "border-(--qd-ui-alert-success-border) bg-(--qd-ui-alert-success-bg) text-(--qd-ui-alert-success-fg) *:data-[slot=alert-description]:text-current",
        warning:
          "border-(--qd-ui-alert-warning-border) bg-(--qd-ui-alert-warning-bg) text-(--qd-ui-alert-warning-fg) *:data-[slot=alert-description]:text-current",
        info: "border-(--qd-ui-alert-info-border) bg-(--qd-ui-alert-info-bg) text-(--qd-ui-alert-info-fg) *:data-[slot=alert-description]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-xs/relaxed text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-1.5 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
