import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@qdrant/design-system/components/ui/avatar"

import { authorGithub } from "../content/authors"

// A post's authors with their avatars (design lead, 2026-11-26): each one's GitHub picture, overlapping like a group,
// then the names as the content gives them. The pictures come from GitHub (content/authors.ts), the one image the
// website loads from another site; an author without an account there shows their initials.
export function Authors({ authors, size = "sm" }: { authors: string; size?: "sm" | "default" }) {
  const names = authors.split(/\s*(?:,|&)\s*/).filter(Boolean)
  const px = size === "sm" ? 24 : 32
  return (
    <span className="inline-flex items-center gap-2">
      <AvatarGroup className="-space-x-1.5">
        {names.map((name) => {
          const login = authorGithub[name]
          return (
            <Avatar key={name} size={size}>
              {login && (
                <AvatarImage
                  src={`https://avatars.githubusercontent.com/${login}?s=${px * 3}`}
                  alt=""
                  width={px}
                  height={px}
                  loading="lazy"
                />
              )}
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )
        })}
      </AvatarGroup>
      <span className="text-foreground">{authors}</span>
    </span>
  )
}
