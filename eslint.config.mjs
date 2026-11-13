// Lint for the code packages only: design-system, web and studio.
// Run from the repo root with `pnpm lint`. Everything else in the repo is ignored.
import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import prettier from "eslint-config-prettier"
import reactHooks from "eslint-plugin-react-hooks"
import { globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/dist/**",
    "**/next-env.d.ts",
    "primitives/**",
    "guidelines/**",
    "brand-assets/**",
    "brand-components/**",
    "review/**",
    // shadcn's example demos, copied as-is by studio/scripts/fetch-examples.mjs
    "studio/examples/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["design-system/**/*.{ts,tsx}", "web/**/*.{ts,tsx}", "studio/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // Stock shadcn code (added with `shadcn add`): React's newest hook rule flags two of its
    // effects. Shown as warnings so the components stay as shadcn ships them.
    files: ["design-system/components/ui/**/*.tsx", "design-system/hooks/**/*.ts"],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  {
    // Node scripts (the lint config itself, studio/scripts).
    files: ["**/*.mjs"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["studio/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  prettier
)
