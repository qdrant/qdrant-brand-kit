import { cn } from "@qdrant/design-system/lib/utils"

// The layout wrappers shadcn's example demos import (shadcn keeps its own on its website).
// Same props, on the Qdrant spacing scale.
function ExampleWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="example-wrapper"
      className={cn("grid w-full min-w-0 items-start gap-8 md:grid-cols-2", className)}
      {...props}
    />
  )
}

function Example({
  title,
  children,
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string
  containerClassName?: string
}) {
  return (
    <div
      data-slot="example"
      className={cn("flex w-full min-w-0 flex-col gap-2 self-stretch", containerClassName)}
      {...props}
    >
      {title && <div className="text-muted-foreground px-1 text-xs font-medium">{title}</div>}
      <div
        data-slot="example-content"
        className={cn(
          "bg-card text-foreground flex min-w-0 flex-1 flex-col items-start gap-6 rounded-xl border p-8 *:[div:not([class*='w-'])]:w-full",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Example, ExampleWrapper }
