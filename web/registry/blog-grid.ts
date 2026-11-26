import { BlogGrid, type BlogGridProps } from "../sections/blog-grid"
import { blogFeatured, blogPosts } from "../content/listings"
import { defineSection } from "./types"

export const blogGrid = defineSection<BlogGridProps>({
  id: "blog-grid",
  name: "Blog grid",
  category: "listings",
  summary: "Blog posts as cards: an image slot, a tag, the title, a line, and who wrote it when. One large post first, or a plain grid.",
  file: "blog-grid",
  component: BlogGrid,
  variants: [
    {
      id: "featured",
      name: "Featured",
      description: "The newest post large, the next three beside it (the top of /blog/). Image slots are placeholders until the posts' images.",
      props: { layout: "featured", header: { title: blogFeatured.title }, featured: blogFeatured.featured, posts: blogFeatured.posts },
    },
    {
      id: "grid",
      name: "Grid",
      description: "Posts in three columns, with their excerpts (/blog/). The blog shows no categories, so the tag slot is empty.",
      props: { layout: "grid", posts: blogPosts },
    },
  ],
  docs: {
    use: [
      "The blog's index, or the latest posts on another page. For guides and courses, use Resource cards.",
      "Featured at the top of the blog; grid for the rest, or for related posts under an article.",
    ],
    rules: [
      "Each card is one link to the post; the title carries it.",
      "The tag is the post's category, in mono capitals. Leave it out when the posts have none.",
      "Dates and authors as the post gives them. Never invent an excerpt: leave it out.",
      "Images are the posts' own. Until they exist, the slot shows a placeholder, never a stock photo.",
    ],
    anatomy: [
      { part: "Heading", note: "Optional, with an action on the right." },
      { part: "Featured post", note: "A large card: image, title, excerpt, authors and date." },
      { part: "Post cards", note: "Image, tag, title, excerpt, authors and date. Beside the featured post they're rows." },
    ],
    props: [
      { name: "layout", type: '"featured" | "grid"', note: "One large post and rows, or three columns." },
      { name: "featured", type: "Post", note: "The large post, in the featured layout." },
      { name: "posts", type: "{ title, href, excerpt?, tag?, authors, date, image?, visual? }[]", note: "The posts. image is the post's JPG thumbnail (web/assets/blog), visual a component drawn in its place (a partner card)." },
      { name: "titleAs, search", type: "\"h1\" | \"h2\", { placeholder, action? }", note: "For a page that opens on its posts: the heading as the H1 at a section's size, and a search field beside it." },
      { name: "pagination", type: "{ current, total, base }", note: "Pages after the posts, linked as base and base/page/N/." },
      { name: "images", type: "boolean", note: "Show a placeholder where a post has no thumbnail. On by default; a post's own image or visual always shows." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "Optional." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "featured", label: "Featured" }, { value: "grid", label: "Grid" }] },
    { prop: "images", label: "Images", kind: "boolean" },
  ],
})
