import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The design system and the web sections are workspace packages written in TypeScript.
  transpilePackages: ["@qdrant/design-system", "@qdrant/web"],
  // Don't let `next dev` write its own block into AGENTS.md: this repo's agent rules are kept by hand.
  agentRules: false,
}

export default nextConfig
