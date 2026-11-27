import { releasePostFull } from "../content/blog"
import { footer, menus, navActions } from "../content/site"
import { Article } from "../sections/article"
import { Footer } from "../sections/footer"
import { Navbar } from "../sections/navbar"
import { postFigures } from "../visuals/blog"

// A blog post of qdrant.tech (/blog/qdrant-1.20.x/, read 2026-11-26), built from the section library (design lead,
// 2026-11-26): the whole post from content/blog.ts, its hero the Lightspeed thumbnail it has on the blog, and its
// figures redrawn as diagrams (web/visuals/blog.tsx). One theme for the whole page, the site's.
export function BlogPostPage() {
  const blocks = releasePostFull.blocks.map((block) =>
    block.type === "figure" && block.id && postFigures[block.id]
      ? { ...block, visual: postFigures[block.id] }
      : block
  )
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Article
        title={releasePostFull.title}
        authors={releasePostFull.authors}
        date={releasePostFull.date}
        hero={releasePostFull.hero}
        tocTitle={releasePostFull.tocTitle}
        blocks={blocks}
        share={releasePostFull.share}
      />
      <Footer variant="full" {...footer} />
    </main>
  )
}
