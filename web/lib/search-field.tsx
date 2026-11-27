import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@qdrant/design-system/components/ui/input-group"
import { cn } from "@qdrant/design-system/lib/utils"

// A search field for an index page (the blog): a form that sends its query as ?q= to `action` (2026-11-21, shared
// since 2026-11-26).
export function SearchField({
  placeholder,
  action,
  className,
}: {
  placeholder: string
  action?: string
  className?: string
}) {
  return (
    <form
      role="search"
      action={action}
      className={cn("w-full max-w-xl", className)}
    >
      <InputGroup className="h-12 bg-card">
        <InputGroupAddon>
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          name="q"
          type="search"
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </InputGroup>
    </form>
  )
}
