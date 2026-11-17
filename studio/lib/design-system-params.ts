// Stand-in for shadcn's site: a few of the Create page preview cards (examples/preview) ask which shadcn
// style is active, to round their charts. The design system is built on base-mira, so it's always mira.
export function useDesignSystemSearchParams() {
  return [{ style: "mira" }] as const
}
