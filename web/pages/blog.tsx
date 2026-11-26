import { blogPage } from "../content/blog"
import { newsletter } from "../content/conversion"
import { blogHeader } from "../content/listings"
import { footer, menus, navActions } from "../content/site"
import { BlogGrid } from "../sections/blog-grid"
import { Cta } from "../sections/cta"
import { Footer } from "../sections/footer"
import { Navbar } from "../sections/navbar"
import { Newsletter } from "../sections/newsletter"
import { PageHeader } from "../sections/page-header"
import { PartnerCover } from "../visuals/blog"

// The blog of qdrant.tech (/blog/, page 1, read 2026-11-26), built from the section library (design lead, 2026-11-26):
// its posts from content/blog.ts with the Lightspeed concept's thumbnails, the Poliscope case study on the concept's
// partner card, and no pagination (the website has none). One theme for the whole page, the site's, and the
// marketing context, so its accent is amaranth.
export function BlogPage() {
  const posts = blogPage.posts.map((post) =>
    post.href === "/blog/case-study-poliscope/"
      ? { ...post, visual: <PartnerCover logo="poliscope" name="Poliscope" /> }
      : post
  )
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <PageHeader layout="search" {...blogHeader} />
      <BlogGrid
        layout="featured"
        header={{ title: blogPage.heading }}
        featured={blogPage.featured}
        posts={blogPage.next}
        images={false}
      />
      <BlogGrid layout="grid" posts={posts} />
      <Cta
        layout="centered"
        title={blogPage.cta.title}
        primary={blogPage.cta.primary}
      />
      <Newsletter layout="band" {...newsletter} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
