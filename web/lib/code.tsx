import * as React from "react"

// Syntax colors for code on the website (design lead, 2026-11-24): the roles of VS Code's default themes (Dark+
// and Light+), the most used editor, in Qdrant's palette. Each role is a class (web-tok-*) whose color is set by
// theme in styles/web.css: the 300 step on dark, the 700 step on light, all at 5:1 or more on a code panel.
//   keyword   purple   from, import, def, const, await, return
//   function  blue     a call or a definition's name; a shell command (VS Code's yellow: the palette has none)
//   type      teal     a class or type, like QdrantClient
//   string    orange   text in quotes
//   number    green
//   constant  indigo   True, False, None, null, true, false, undefined
//   property  cyan     a parameter, a property, a JSON key, a shell flag or variable
//   comment   the muted text color
// Everything else (names, operators, brackets) keeps the text color. Never amaranth or red: amaranth is the accent
// and red means an error.
//
// A small tokenizer for the languages on the site: Python, TypeScript and JavaScript, JSON, shell and HTTP (a
// request line, then JSON). It reads code, it doesn't parse it, so it colors what's on the page well and is
// approximate on anything unusual.

export type CodeLanguage = "python" | "typescript" | "json" | "shell" | "http" | "text"

type Role = "keyword" | "function" | "type" | "string" | "number" | "constant" | "property" | "comment"
type Token = { role: Role | null; text: string }

const keywords: Record<"python" | "typescript", Set<string>> = {
  python: new Set(
    "from import as def class return if elif else for in while with await async lambda yield try except finally raise pass break continue not and or is global nonlocal del assert".split(
      " "
    )
  ),
  typescript: new Set(
    "import from export default const let var function return await async new if else for of in while do switch case break continue class extends implements interface type enum as try catch finally throw typeof instanceof void delete yield".split(
      " "
    )
  ),
}
const constants: Record<"python" | "typescript", Set<string>> = {
  python: new Set(["True", "False", "None", "self"]),
  typescript: new Set(["true", "false", "null", "undefined", "this"]),
}

const isPascal = (word: string) => /^[A-Z][a-z0-9]+[A-Za-z0-9]*$/.test(word)

// The first character after `from` that isn't a space or a tab.
function nextChar(src: string, from: number) {
  const m = /[^ \t]/.exec(src.slice(from))
  return m ? m[0] : ""
}
function nextTwo(src: string, from: number) {
  const rest = src.slice(from).replace(/^[ \t]+/, "")
  return rest.slice(0, 2)
}
// The last token that isn't whitespace.
function prevToken(tokens: Token[]) {
  for (let i = tokens.length - 1; i >= 0; i--) if (tokens[i]!.text.trim()) return tokens[i]!
  return undefined
}

function push(tokens: Token[], role: Role | null, text: string) {
  const last = tokens[tokens.length - 1]
  if (last && last.role === role) last.text += text
  else tokens.push({ role, text })
}

function tokenizeCode(src: string, lang: "python" | "typescript"): Token[] {
  const tokens: Token[] = []
  const comment = lang === "python" ? /#[^\n]*/y : /\/\/[^\n]*|\/\*[\s\S]*?\*\//y
  const string =
    lang === "python"
      ? /[rbfuRBFU]{0,2}("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y
      : /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y
  const number = /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/y
  const word = /[A-Za-z_$][\w$]*/y
  let i = 0
  const match = (re: RegExp) => {
    re.lastIndex = i
    return re.exec(src)
  }
  while (i < src.length) {
    let m: RegExpExecArray | null = null
    let role: Role | null = null
    for (const [re, r] of [
      [comment, "comment"],
      [string, "string"],
      [number, "number"],
    ] as const) {
      if ((m = match(re))) {
        role = r
        break
      }
    }
    if (m) {
      push(tokens, role, m[0])
      i += m[0].length
      continue
    }
    if ((m = match(word))) {
      const w = m[0]
      const after = nextChar(src, i + w.length)
      const prev = prevToken(tokens)
      role = null
      if (keywords[lang].has(w)) role = "keyword"
      else if (constants[lang].has(w)) role = "constant"
      else if (prev?.text.trim().endsWith("def") || prev?.text.trim().endsWith("function")) role = "function"
      else if (isPascal(w)) role = "type"
      else if (after === "(") role = "function"
      else if (lang === "python" && after === "=" && nextTwo(src, i + w.length) !== "==" && prev && /[(,]$/.test(prev.text.trim())) role = "property"
      else if (lang === "typescript" && after === ":" && prev && /[{,]$/.test(prev.text.trim())) role = "property"
      else if (prev?.text.endsWith(".")) role = "property"
      push(tokens, role, w)
      i += w.length
      continue
    }
    push(tokens, null, src[i]!)
    i++
  }
  return tokens
}

function tokenizeJson(src: string): Token[] {
  const tokens: Token[] = []
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b/g
  let last = 0
  for (const m of src.matchAll(re)) {
    if (m.index! > last) push(tokens, null, src.slice(last, m.index))
    if (m[1]) {
      push(tokens, m[2] ? "property" : "string", m[1])
      if (m[2]) push(tokens, null, m[2])
    } else if (m[3]) push(tokens, "number", m[3])
    else if (m[4]) push(tokens, "constant", m[4])
    last = m.index! + m[0].length
  }
  if (last < src.length) push(tokens, null, src.slice(last))
  return tokens
}

function tokenizeShell(src: string): Token[] {
  const tokens: Token[] = []
  // A command starts a line (unless the line before ends with a backslash) or follows &&, ||, | or ;.
  let expectCommand = true
  let i = 0
  const re = {
    comment: /#[^\n]*/y,
    string: /"(?:\\.|[^"\\])*"|'[^']*'/y,
    variable: /\$\([^)]*\)|\$\{[^}]*\}|\$\w+/y,
    flag: /--?[A-Za-z][\w-]*/y,
    number: /\b\d+(?:\.\d+)?\b/y,
    separator: /&&|\|\||[|;]/y,
    word: /[^\s"'$|;&]+/y,
  }
  while (i < src.length) {
    const ch = src[i]!
    if (ch === "\n") {
      const before = src.slice(0, i).replace(/[ \t]+$/, "")
      expectCommand = !before.endsWith("\\")
      push(tokens, null, ch)
      i++
      continue
    }
    if (ch === " " || ch === "\t" || ch === "\\") {
      push(tokens, null, ch)
      i++
      continue
    }
    const match = (r: RegExp) => {
      r.lastIndex = i
      return r.exec(src)
    }
    const afterSpace = tokens.length === 0 || /\s$/.test(tokens[tokens.length - 1]!.text)
    let m: RegExpExecArray | null
    if (afterSpace && (m = match(re.comment))) push(tokens, "comment", m[0])
    else if ((m = match(re.separator))) {
      push(tokens, null, m[0])
      expectCommand = true
    } else if ((m = match(re.string))) push(tokens, "string", m[0])
    else if ((m = match(re.variable))) push(tokens, "property", m[0])
    else if (!expectCommand && (m = match(re.flag))) push(tokens, "property", m[0])
    else if ((m = match(re.word))) {
      const w = m[0]
      if (expectCommand) {
        push(tokens, "function", w)
        expectCommand = false
      } else if (/^\d+(?:[.:]\d+)*$/.test(w)) push(tokens, "number", w)
      else push(tokens, null, w)
    } else push(tokens, null, ch)
    i += m ? m[0].length : 1
  }
  return tokens
}

function tokenizeHttp(src: string): Token[] {
  const nl = src.indexOf("\n")
  const first = nl === -1 ? src : src.slice(0, nl)
  const rest = nl === -1 ? "" : src.slice(nl)
  const tokens: Token[] = []
  const m = /^([A-Z]+)(\s+)(\S+)(.*)$/.exec(first)
  if (m) {
    push(tokens, "keyword", m[1]!)
    push(tokens, null, m[2]!)
    push(tokens, "string", m[3]!)
    push(tokens, null, m[4]!)
  } else push(tokens, null, first)
  return [...tokens, ...tokenizeJson(rest)]
}

export function tokenize(code: string, language: CodeLanguage): Token[] {
  switch (language) {
    case "python":
      return tokenizeCode(code, "python")
    case "typescript":
      return tokenizeCode(code, "typescript")
    case "json":
      return tokenizeJson(code)
    case "shell":
      return tokenizeShell(code)
    case "http":
      return tokenizeHttp(code)
    default:
      return [{ role: null, text: code }]
  }
}

// The language from a file name, a tab's label or a block's title: search.py, "TypeScript", "http", "bash".
export function languageOf(hint?: string): CodeLanguage {
  const h = (hint ?? "").toLowerCase().trim()
  if (/\.py$|^python$|^py$/.test(h)) return "python"
  if (/\.(ts|tsx|js|jsx|mjs)$|^(typescript|javascript|ts|js|node)$/.test(h)) return "typescript"
  if (/\.json$|^json$|^response$/.test(h)) return "json"
  if (/\.(sh|bash)$|^(shell|bash|sh|terminal|cli|console)$/.test(h)) return "shell"
  if (/^http$|^rest$/.test(h)) return "http"
  return "text"
}

// Code in its syntax colors, for inside a <pre> or inline. Plain text when the language is unknown.
export function Code({ code, language, className }: { code: string; language: CodeLanguage; className?: string }) {
  const tokens = React.useMemo(() => tokenize(code, language), [code, language])
  return (
    <code className={className}>
      {tokens.map((t, i) =>
        t.role ? (
          <span key={i} className={`web-tok-${t.role}`}>
            {t.text}
          </span>
        ) : (
          <React.Fragment key={i}>{t.text}</React.Fragment>
        )
      )}
    </code>
  )
}
