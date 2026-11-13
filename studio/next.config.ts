import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The design system and the web sections are workspace packages written in TypeScript.
  transpilePackages: ["@qdrant/design-system", "@qdrant/web"],
  // Don't let `next dev` write its own block into AGENTS.md: this repo's agent rules are kept by hand.
  agentRules: false,
  // Some shadcn example demos show remote avatars and photos. The studio never ships, so skip optimizing.
  images: { unoptimized: true },
  turbopack: {
    // The /repo route reads brand files by path, so Turbopack warns that a deployment would include the
    // whole project. The studio is never deployed: silence that one warning for that one file.
    ignoreIssue: [{ path: "**/app/repo/**", title: /Dynamic filesystem access/ }],
  },
}

export default nextConfig
