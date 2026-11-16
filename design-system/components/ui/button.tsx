import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-(--qd-ui-button-radius) border border-transparent bg-clip-padding text-(length:--qd-ui-button-font-size) leading-relaxed font-(--qd-ui-button-font-weight) tracking-(--qd-ui-button-tracking) [text-transform:var(--qd-ui-button-case)] whitespace-nowrap transition-[background-color,border-color,color,box-shadow,scale] duration-(--qd-ui-button-duration) ease-(--qd-ui-button-ease) outline-none select-none focus-visible:border-ring focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color) focus-visible:ring-offset-(length:--qd-ui-button-focus-offset) focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-(--qd-ui-button-press) motion-safe:active:not-aria-[haspopup]:scale-(--qd-ui-button-press-scale) disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // The Qdrant look comes from styles/components/button.css, shared with brand-components/button.
        // Primary and secondary are raised surfaces (styles/components/button-web.css).
        default: "qd-ui-button border-0 bg-primary text-primary-foreground shadow-(--qd-ui-button-raised)",
        outline:
          "border-(--qd-ui-button-outline-border) bg-transparent hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "border-0 bg-secondary text-secondary-foreground shadow-(--qd-ui-button-raised) hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-(--qd-ui-button-height) gap-(--qd-ui-button-gap) px-(--qd-ui-button-padding-x) has-data-[icon=inline-end]:pr-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*0.5)] has-data-[icon=inline-start]:pl-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*0.5)]",
        xs: "h-[calc(var(--qd-ui-button-height)-var(--spacing)*2)] gap-[calc(var(--qd-ui-button-gap)-var(--spacing))] rounded-sm px-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*2)] text-xs/relaxed has-data-[icon=inline-end]:pr-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*2.5)] has-data-[icon=inline-start]:pl-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*2.5)] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[calc(var(--qd-ui-button-height)-var(--spacing))] gap-[calc(var(--qd-ui-button-gap)-var(--spacing))] px-[calc(var(--qd-ui-button-padding-x)-var(--spacing))] text-xs/relaxed has-data-[icon=inline-end]:pr-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*1.5)] has-data-[icon=inline-start]:pl-[calc(var(--qd-ui-button-padding-x)-var(--spacing)*1.5)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[calc(var(--qd-ui-button-height)+var(--spacing))] gap-(--qd-ui-button-gap) px-[calc(var(--qd-ui-button-padding-x)+var(--spacing)*0.5)] has-data-[icon=inline-end]:pr-(--qd-ui-button-padding-x) has-data-[icon=inline-start]:pl-(--qd-ui-button-padding-x) [&_svg:not([class*='size-'])]:size-4",
        icon: "size-(--qd-ui-button-height)",
        "icon-xs": "size-[calc(var(--qd-ui-button-height)-var(--spacing)*2)] rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-[calc(var(--qd-ui-button-height)-var(--spacing))] [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-[calc(var(--qd-ui-button-height)+var(--spacing))] [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
