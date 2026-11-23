import type { ReactNode } from "react"
import { ArrowRight, CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@qdrant/design-system/components/ui/alert"

import {
  contrast,
  groupGuides,
  mappingHex,
  mappingLabel,
  semanticCss,
  semanticTokens,
  type GroupId,
  type Mapping,
  type Primitives,
  type SemanticToken,
} from "@/lib/color"

import { PaperElevation, SurfaceStack } from "./background"

const modes = ["light", "dark"] as const
type Mode = (typeof modes)[number]

export type Roles = Record<string, Mapping>

// One group of Figma's Color collection (lib/color.ts): how to use it, its tokens in light and dark, and the
// tokens at work in both themes. The examples draw only from the --sem-* variables, which this tab writes from
// the tokens' Figma values.
export function GroupTab({ group, primitives, roles }: { group: GroupId; primitives: Primitives; roles: Roles }) {
  const guide = groupGuides[group]
  const tokens = semanticTokens.filter((t) => t.group === group)
  const Example = examples[group]

  return (
    <div className="flex flex-col gap-10">
      <style id="color-semantic" dangerouslySetInnerHTML={{ __html: semanticCss({}) }} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {guide.cards.map((c) => (
          <div key={c.title} className="flex flex-col gap-1 rounded-lg border p-4">
            <span className="font-mono text-sm font-semibold">{c.title}</span>
            <span className="text-sm text-muted-foreground">{c.note}</span>
          </div>
        ))}
      </section>

      <section className="flex max-w-3xl flex-col gap-2 text-sm text-muted-foreground">
        {guide.notes.map((n) => (
          <p key={n.lead}>
            <span className="font-semibold text-foreground">{n.lead}</span> {n.text}
          </p>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Tokens</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b bg-muted/40 font-mono text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-normal">Token</th>
                <th className="px-4 py-2 font-normal">Use it for</th>
                <th className="px-4 py-2 font-normal">Light</th>
                <th className="px-4 py-2 font-normal">Dark</th>
                <th className="px-4 py-2 font-normal">Repo today</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 align-top">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs">{t.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{t.cssVar}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{t.use}</td>
                  {modes.map((mode) => (
                    <td key={mode} className="px-4 py-3 align-top">
                      <Value token={t} mode={mode} primitives={primitives} />
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                    <Repo token={t} roles={roles} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {Example && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">In use</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {modes.map((mode) => (
              <figure key={mode} className="flex flex-col gap-2">
                <figcaption className="font-mono text-xs text-muted-foreground uppercase">{mode}</figcaption>
                <div
                  data-theme={mode}
                  className="flex min-h-[220px] flex-col gap-4 rounded-lg border bg-(--sem-background-default) p-6 text-(--sem-text-primary)"
                >
                  <Example />
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}

      {group === "background" && <PaperElevation />}
    </div>
  )
}

// A token's value in one theme: its swatch, the primitive it points at and its hex, and the contrast it needs.
function Value({ token, mode, primitives }: { token: SemanticToken; mode: Mode; primitives: Primitives }) {
  const primitive = token.default[mode]
  const hex = mappingHex(token.default, mode, primitives)
  let ratio: { value: number; target: number; on: string } | null = null
  if (token.contrast) {
    const ground = semanticTokens.find((t) => t.id === (token.contrast?.on ?? "background-default"))
    if (ground)
      ratio = {
        value: contrast(hex, mappingHex(ground.default, mode, primitives)),
        target: token.contrast.target,
        on: ground.name,
      }
  }
  return (
    <span className="flex items-start gap-3">
      <span className="size-8 shrink-0 rounded-sm border" style={{ background: `var(--qd-color-${primitive})` }} />
      <span className="flex flex-col">
        <span className="font-mono text-xs">{primitive}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{hex}</span>
        {ratio && (
          <span
            className={
              ratio.target && ratio.value < ratio.target
                ? "font-mono text-[11px] text-destructive"
                : "font-mono text-[11px] text-muted-foreground"
            }
            title={`On ${ratio.on}${ratio.target ? `, needs ${ratio.target}:1` : ""}`}
          >
            {ratio.value.toFixed(1)}:1 on {ratio.on}
          </span>
        )}
      </span>
    </span>
  )
}

// What primitives/colors has for the token today: the role its CSS variable names.
function Repo({ token, roles }: { token: SemanticToken; roles: Roles }) {
  const repo = roles[token.cssVar.replace("--qd-color-", "")]
  if (!repo) return <>Not in the repo yet.</>
  if (repo.light === token.default.light && repo.dark === token.default.dark) return <>Same.</>
  return <span className="font-mono">{mappingLabel(repo)}</span>
}

// ---- Each group at work, drawn only from the --sem-* variables ----

const caption = "font-mono text-[11px] text-(--sem-text-secondary)"

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={caption}>{label}</span>
      {children}
    </div>
  )
}

function TextExample() {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-(--sem-border-subtle) bg-(--sem-background-raised) p-5">
      <Labeled label="text/primary">
        <span className="text-xl font-semibold text-(--sem-text-primary)">Card title</span>
      </Labeled>
      <Labeled label="text/secondary">
        <span className="text-sm text-(--sem-text-secondary)">Supporting text, labels and captions.</span>
      </Labeled>
      <Labeled label="text/disabled">
        <span className="rounded-md border border-(--sem-border-strong) px-3 py-2 text-sm text-(--sem-text-disabled)">
          Placeholder
        </span>
      </Labeled>
      <Labeled label="text/on-accent">
        <span className="w-fit rounded-md bg-(--sem-primary-primary) px-3.5 py-2 text-sm font-medium text-(--sem-text-on-accent)">
          Button label
        </span>
      </Labeled>
    </div>
  )
}

function PrimaryExample() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Labeled label="primary/primary">
        <span className="w-fit rounded-md bg-(--sem-primary-primary) px-3.5 py-2 text-sm font-medium text-(--sem-text-on-accent)">
          Primary
        </span>
      </Labeled>
      <Labeled label="primary/hover">
        <span className="w-fit rounded-md bg-(--sem-primary-hover) px-3.5 py-2 text-sm font-medium text-(--sem-text-on-accent)">
          Primary, hover
        </span>
      </Labeled>
      <Labeled label="primary/subtle with primary/text">
        <span className="w-fit rounded-full bg-(--sem-primary-subtle) px-3 py-1 text-xs font-medium text-(--sem-primary-text)">
          Kicker
        </span>
      </Labeled>
      <Labeled label="primary/text">
        <span className="flex items-center gap-1.5 text-sm font-medium text-(--sem-primary-text) underline underline-offset-4">
          A link <ArrowRight className="size-4" />
        </span>
      </Labeled>
    </div>
  )
}

function SecondaryExample() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Labeled label="secondary/secondary">
        <span className="w-fit rounded-md bg-(--sem-secondary-secondary) px-3.5 py-2 text-sm font-medium text-(--sem-text-on-accent)">
          Product action
        </span>
      </Labeled>
      <Labeled label="secondary/subtle with secondary/text">
        <span className="w-fit rounded-full bg-(--sem-secondary-subtle) px-3 py-1 text-xs font-medium text-(--sem-secondary-text)">
          Tag
        </span>
      </Labeled>
      <Labeled label="secondary/text">
        <span className="flex items-center gap-1.5 text-sm font-medium text-(--sem-secondary-text) underline underline-offset-4">
          A link <ArrowRight className="size-4" />
        </span>
      </Labeled>
    </div>
  )
}

const states = [
  { id: "success", label: "Success", Icon: CircleCheck },
  { id: "error", label: "Error", Icon: CircleX },
  { id: "warning", label: "Warning", Icon: TriangleAlert },
  { id: "info", label: "Info", Icon: Info },
] as const

// Placeholder messages that say what each state is for, so the alerts read as examples, not product copy.
const alertText: Record<(typeof states)[number]["id"], string> = {
  success: "Something went as planned.",
  error: "Something failed and needs a fix.",
  warning: "Something needs attention before it becomes a problem.",
  info: "Something worth knowing, with nothing to fix.",
}

function StatusExample() {
  return (
    <div className="flex flex-col gap-5">
      <Labeled label="Badges: status/<state>/text on status/<state>/subtle">
        <div className="flex flex-wrap gap-2">
          {states.map(({ id, label, Icon }) => (
            <span
              key={id}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: `var(--sem-status-${id}-subtle)`, color: `var(--sem-status-${id})` }}
            >
              <Icon className="size-3.5" /> {label}
            </span>
          ))}
        </div>
      </Labeled>
      <Labeled label="Alert, from the design system: the softest fill, a border and all its text in the state's color">
        <div className="flex flex-col gap-2">
          {states.map(({ id, label, Icon }) => (
            <Alert key={id} variant={id === "error" ? "destructive" : id}>
              <Icon />
              <AlertTitle>{label}</AlertTitle>
              <AlertDescription>{alertText[id]}</AlertDescription>
            </Alert>
          ))}
        </div>
      </Labeled>
    </div>
  )
}

function BorderExample() {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-(--sem-border-subtle) bg-(--sem-background-raised) p-5">
      <span className={caption}>border/subtle: the card&apos;s outline</span>
      <Labeled label="border/default: table lines">
        <div className="flex flex-col text-sm">
          {["Row one", "Row two", "Row three"].map((r) => (
            <span key={r} className="border-b border-(--sem-border-default) py-1.5 last:border-b-0">
              {r}
            </span>
          ))}
        </div>
      </Labeled>
      <Labeled label="border/strong: a field">
        <span className="rounded-md border border-(--sem-border-strong) px-3 py-2 text-sm text-(--sem-text-disabled)">
          Placeholder
        </span>
      </Labeled>
    </div>
  )
}

const bars = [72, 54, 88, 40, 63, 30, 47, 58]

function DatavizExample() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-40 items-end gap-3 border-b border-(--sem-border-default) px-1">
        {bars.map((h, i) => (
          <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `var(--sem-dataviz-${i + 1})` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {bars.map((_, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs text-(--sem-text-secondary)">
            <span className="size-2.5 rounded-[2px]" style={{ background: `var(--sem-dataviz-${i + 1})` }} />
            Series {i + 1}
          </span>
        ))}
      </div>
    </div>
  )
}

// A stand-in for a photo, the same in both themes, with a static/black scrim and static/white text and logo.
function StaticExample() {
  return (
    <div
      className="relative flex h-56 flex-col justify-end overflow-hidden rounded-md"
      style={{
        background:
          "radial-gradient(circle at 70% 25%, var(--qd-color-cyan-500), transparent 45%), linear-gradient(160deg, var(--qd-color-indigo-700), var(--qd-color-blue-950))",
      }}
    >
      <span className="absolute top-3 left-3 font-mono text-[11px] text-(--sem-static-white)">An image</span>
      <div
        className="flex flex-col gap-2 p-4"
        style={{ background: "linear-gradient(to top, color-mix(in oklab, var(--sem-static-black) 70%, transparent), transparent)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/repo/brand-assets/logo/qdrant-logo-dark.svg" alt="Qdrant" className="h-5 w-fit" />
        <span className="text-sm text-(--sem-static-white)">static/white on a static/black scrim</span>
      </div>
    </div>
  )
}

const examples: Partial<Record<GroupId, () => ReactNode>> = {
  text: TextExample,
  primary: PrimaryExample,
  secondary: SecondaryExample,
  status: StatusExample,
  background: SurfaceStack,
  border: BorderExample,
  dataviz: DatavizExample,
  static: StaticExample,
}
