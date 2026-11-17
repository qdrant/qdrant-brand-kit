import { readFile } from "node:fs/promises"
import path from "node:path"

// Serves the repo's brand files to the studio, read-only, at /repo/... (the same paths review/render.py
// uses), so pages can show the real logo, patterns, Qbot and the web sections' images without copying them.
// Only brand-assets/, primitives/ and web/assets/ are reachable. The studio runs from studio/, so the repo is
// one folder up.
const REPO = path.resolve(process.cwd(), "..")
const ALLOWED = ["brand-assets", "primitives", "web/assets"]
const TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
}

const notFound = () => new Response("Not found", { status: 404 })

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = path.resolve(REPO, ...(await params).path)
  // Nothing outside the allowed folders, even with ../ in the URL.
  if (!ALLOWED.some((folder) => file.startsWith(path.join(REPO, folder) + path.sep))) return notFound()
  try {
    const body = await readFile(file)
    return new Response(body, {
      headers: { "content-type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream" },
    })
  } catch {
    return notFound()
  }
}
