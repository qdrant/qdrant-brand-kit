import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Post } from "../content/listings"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type BlogGridProps = SectionProps & {
  // featured: one large post and the next ones beside it. grid: posts in three columns.
  layout?: "featured" | "grid"
  header?: HeaderProps
  // The large post, in the featured layout.
  featured?: Post
  posts: Post[]
  // Show the image slot on each card.
  images?: boolean
}

// Text with `code` and **bold** marked, as the content files keep it. Shared with the article and legal sections.
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
            {part.slice(1, -1)}
          </code>
        ) : part.startsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  )
}

function Meta({ post }: { post: Post }) {
  return (
    <p className={cn(type.xsmall, "mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2")}>
      <span className="text-foreground">{post.authors}</span>
      <span aria-hidden className="size-1 rounded-full bg-(--web-line-strong)" />
      <time className="font-mono">{post.date}</time>
    </p>
  )
}

function PostCard({ post, images, size = "md", className }: { post: Post; images: boolean; size?: "md" | "lg" | "row"; className?: string }) {
  const row = size === "row"
  return (
    <Plate as="article" className={cn("group flex rounded-xl", row ? "flex-row gap-4 p-4" : "flex-col", className)}>
      {images && (
        <div className={cn("shrink-0", row ? "w-28 sm:w-40" : "p-1.5 pb-0")}>
          <MediaFrame
            label={row ? "Image" : "Post image"}
            className={cn(row ? "aspect-[4/3] rounded-lg" : "rounded-[calc(var(--radius-xl)-4px)]", size === "lg" && "aspect-[16/9]")}
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col gap-2", !row && (size === "lg" ? "p-6 lg:p-8" : "p-6"), row && "min-w-0")}>
        {post.tag && <p className={cn(type.xsmall, "font-mono uppercase")}>{post.tag}</p>}
        <h3 className={cn(size === "lg" ? `${type.h6} md:text-(length:--qd-type-h5-size) md:leading-(--qd-type-h5-line-height)` : heading.card, row && "text-(length:--qd-font-size-16) leading-snug")}>
          {/* The whole card is the link: the title's link stretches over it. */}
          <a href={post.href} className="web-link-quiet outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
            {post.title}
          </a>
        </h3>
        {post.excerpt && !row && (
          <p className={cn(size === "lg" ? type.body : type.small, "line-clamp-3")}>
            <Inline text={post.excerpt} />
          </p>
        )}
        <Meta post={post} />
      </div>
    </Plate>
  )
}

// Blog posts (2026-11-21): cards with an image slot, an optional tag in mono, the title, a line and who wrote it
// when. Featured puts the newest post large beside the next ones, for the top of the blog; grid lists the rest.
export function BlogGrid({
  layout = "grid",
  header,
  featured,
  posts,
  images = true,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: BlogGridProps) {
  const action = header?.action ? (
    <LinkButton href={header.action.href} variant="secondary">
      {header.action.label}
    </LinkButton>
  ) : undefined

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      id={id}
      className={className}
      innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)"
    >
      {header && (
        <SectionHeader
          layout={action ? "action" : "stacked"}
          kicker={header.kicker}
          title={header.title}
          description={header.description}
          actions={action}
        />
      )}
      {layout === "featured" && featured ? (
        <div className="grid gap-(--qd-layout-column-gap) lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <PostCard post={featured} images={images} size="lg" />
          <ul className="flex flex-col gap-(--qd-layout-column-gap)">
            {posts.map((post) => (
              <li key={post.href} className="flex flex-1">
                <PostCard post={post} images={images} size="row" className="flex-1" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="grid gap-(--qd-layout-column-gap) md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.href} className="flex">
              <PostCard post={post} images={images} className="flex-1" />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
