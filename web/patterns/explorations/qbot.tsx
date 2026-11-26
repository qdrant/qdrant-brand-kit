"use client"

import * as React from "react"

import { definePattern, type PatternNote } from "../types"

// Qbot peek (2026-11-26, exploring): an easter egg for a hero. The first time the pointer reaches the hero's main
// call to action (or the button gets keyboard focus), Qbot's head rises from just behind the top edge of the heading
// and settles over it, blinks once, floats on a slow breath, and after 4 seconds sinks back out of sight. Once per
// visit, so it's found rather than shown. The rise is the website's weightless motion (DESIGN.md: an expo ease-out,
// never a bounce), the head is clipped by the heading's top edge so it never covers a letter, and with reduced
// motion it only fades in and out.
//
// The head is the vector Qbot front head the team shared (qbot-front-head.svg, 2026-11-26, replacing the tilted
// qbot-head.svg the same day), drawn as it is; its ids are scoped so two heads never clash, and its six eye groups
// sit in one group so they blink together. It isn't in brand-assets/mascot yet.

const ASSET: PatternNote = {
  rule: "Qbot is reused, never redrawn",
  source: "design-system/AGENTS.md and brand-assets/mascot",
  text: "The head is a vector drawing the team shared (qbot-front-head.svg), not one of the mascot's approved 3D or 2D renders in brand-assets/mascot. It needs Vanesa's yes before it goes beyond an exploration.",
}
const CROP: PatternNote = {
  rule: "Never cut Qbot at the face",
  source: "AGENTS.md, Never, and guidelines section 6 (Crops)",
  text: "At rest the whole head shows. Only while it rises and sinks does the heading's top edge hide part of it, for a moment.",
}
const PLACE: PatternNote = {
  rule: "Qbot never comes before the heading",
  source: "guidelines/README.md, section 6 (for creatives)",
  text: 'It peeks over the heading, above it, never over a letter. For web UI only "not over text" applies (design-system/AGENTS.md); the creatives\' order rule is raised anyway.',
}

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="35 0 930 750" width="100%" height="100%" aria-hidden="true"><defs>\n<linearGradient id="qbp-shell" x1="0" y1="0" x2="0.8" y2="1"><stop stop-color="#fff"/><stop offset=".55" stop-color="#efedef"/><stop offset="1" stop-color="#bcbabe"/></linearGradient>\n<linearGradient id="qbp-rim" x2="0" y2="1"><stop stop-color="#fdfdfd"/><stop offset=".48" stop-color="#aaa8ab"/><stop offset=".8" stop-color="#f9f8f9"/><stop offset="1" stop-color="#d4d2d4"/></linearGradient>\n<linearGradient id="qbp-red" x2="0" y2="1"><stop stop-color="#ed2850"/><stop offset=".85" stop-color="#dc244c"/><stop offset="1" stop-color="#a90e30"/></linearGradient>\n<linearGradient id="qbp-glass" x2="0" y2="1"><stop stop-color="#080808"/><stop offset=".7" stop-color="#000"/><stop offset="1" stop-color="#171717"/></linearGradient>\n<linearGradient id="qbp-shine" x2=".8" y2="1"><stop stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient>\n<filter id="qbp-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs>\n<g id="qbp-ear-pods" fill="url(#qbp-shell)"><path d="M128 347 C61 337 44 371 45 454 L47 511 Q49 593 132 593Z"/><path d="M872 347 C939 337 956 371 955 454 L953 511 Q951 593 868 593Z"/></g>\n<path id="qbp-helmet" fill="url(#qbp-shell)" d="M500 17 C259 17 124 167 110 375 C98 515 122 616 181 677 Q181 730 247 739 Q500 751 753 739 Q819 730 819 677 C878 616 902 515 890 375 C876 167 741 17 500 17Z"/>\n<path id="qbp-stripe" fill="url(#qbp-red)" d="M400 26 Q405 11 500 11 Q595 11 611 26 L618 134 Q500 118 391 134Z"/>\n<path fill="url(#qbp-rim)" d="M500 125 C245 125 122 238 119 435 C114 599 163 678 280 693 Q500 712 720 693 C837 678 886 599 881 435 C878 238 755 125 500 125Z"/>\n<path fill="#161616" d="M500 175 C278 175 149 263 148 442 C145 595 191 651 294 667 Q500 682 706 667 C809 651 855 595 852 442 C851 263 722 175 500 175Z"/>\n<path fill="url(#qbp-glass)" d="M500 193 C287 193 164 278 164 442 C160 584 204 641 300 655 Q500 670 700 655 C796 641 840 584 836 442 C836 278 713 193 500 193Z"/>\n<path fill="url(#qbp-shine)" d="M369 221 Q220 249 211 412 Q209 456 220 493 L329 481 Q316 339 403 242Z"/><path fill="url(#qbp-shine)" d="M653 233 Q792 268 829 383 L832 458 L753 458 Q752 315 653 233Z"/>\n<path fill="#fff" opacity=".075" d="M174 536 Q249 490 363 511 Q500 532 638 510 Q758 489 826 535 Q804 630 700 650 Q500 667 300 650 Q196 630 174 536Z"/>\n<path fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="4" d="M184 685 Q500 720 816 685"/>\n<g class="web-qbot-eyes"><g fill="#ff1233" filter="url(#qbp-glow)"><circle cx="321" cy="377" r="7"/><circle cx="332" cy="377" r="7"/><circle cx="343" cy="377" r="7"/><circle cx="354" cy="377" r="7"/><circle cx="365" cy="377" r="7"/><circle cx="299" cy="388" r="7"/><circle cx="310" cy="388" r="7"/><circle cx="321" cy="388" r="7"/><circle cx="332" cy="388" r="7"/><circle cx="343" cy="388" r="7"/><circle cx="354" cy="388" r="7"/><circle cx="365" cy="388" r="7"/><circle cx="376" cy="388" r="7"/><circle cx="387" cy="388" r="7"/><circle cx="288" cy="399" r="7"/><circle cx="299" cy="399" r="7"/><circle cx="310" cy="399" r="7"/><circle cx="321" cy="399" r="7"/><circle cx="332" cy="399" r="7"/><circle cx="343" cy="399" r="7"/><circle cx="354" cy="399" r="7"/><circle cx="365" cy="399" r="7"/><circle cx="376" cy="399" r="7"/><circle cx="387" cy="399" r="7"/><circle cx="398" cy="399" r="7"/><circle cx="277" cy="410" r="7"/><circle cx="288" cy="410" r="7"/><circle cx="299" cy="410" r="7"/><circle cx="310" cy="410" r="7"/><circle cx="376" cy="410" r="7"/><circle cx="387" cy="410" r="7"/><circle cx="398" cy="410" r="7"/><circle cx="409" cy="410" r="7"/><circle cx="277" cy="421" r="7"/><circle cx="288" cy="421" r="7"/><circle cx="299" cy="421" r="7"/><circle cx="387" cy="421" r="7"/><circle cx="398" cy="421" r="7"/><circle cx="409" cy="421" r="7"/><circle cx="277" cy="432" r="7"/><circle cx="288" cy="432" r="7"/><circle cx="398" cy="432" r="7"/><circle cx="409" cy="432" r="7"/><circle cx="266" cy="443" r="7"/><circle cx="277" cy="443" r="7"/><circle cx="288" cy="443" r="7"/><circle cx="398" cy="443" r="7"/><circle cx="409" cy="443" r="7"/><circle cx="420" cy="443" r="7"/><circle cx="266" cy="454" r="7"/><circle cx="277" cy="454" r="7"/><circle cx="288" cy="454" r="7"/><circle cx="398" cy="454" r="7"/><circle cx="409" cy="454" r="7"/><circle cx="420" cy="454" r="7"/><circle cx="266" cy="465" r="7"/><circle cx="277" cy="465" r="7"/><circle cx="288" cy="465" r="7"/><circle cx="398" cy="465" r="7"/><circle cx="409" cy="465" r="7"/><circle cx="420" cy="465" r="7"/></g><g fill="#ff334d"><circle cx="321" cy="377" r="5"/><circle cx="332" cy="377" r="5"/><circle cx="343" cy="377" r="5"/><circle cx="354" cy="377" r="5"/><circle cx="365" cy="377" r="5"/><circle cx="299" cy="388" r="5"/><circle cx="310" cy="388" r="5"/><circle cx="321" cy="388" r="5"/><circle cx="332" cy="388" r="5"/><circle cx="343" cy="388" r="5"/><circle cx="354" cy="388" r="5"/><circle cx="365" cy="388" r="5"/><circle cx="376" cy="388" r="5"/><circle cx="387" cy="388" r="5"/><circle cx="288" cy="399" r="5"/><circle cx="299" cy="399" r="5"/><circle cx="310" cy="399" r="5"/><circle cx="321" cy="399" r="5"/><circle cx="332" cy="399" r="5"/><circle cx="343" cy="399" r="5"/><circle cx="354" cy="399" r="5"/><circle cx="365" cy="399" r="5"/><circle cx="376" cy="399" r="5"/><circle cx="387" cy="399" r="5"/><circle cx="398" cy="399" r="5"/><circle cx="277" cy="410" r="5"/><circle cx="288" cy="410" r="5"/><circle cx="299" cy="410" r="5"/><circle cx="310" cy="410" r="5"/><circle cx="376" cy="410" r="5"/><circle cx="387" cy="410" r="5"/><circle cx="398" cy="410" r="5"/><circle cx="409" cy="410" r="5"/><circle cx="277" cy="421" r="5"/><circle cx="288" cy="421" r="5"/><circle cx="299" cy="421" r="5"/><circle cx="387" cy="421" r="5"/><circle cx="398" cy="421" r="5"/><circle cx="409" cy="421" r="5"/><circle cx="277" cy="432" r="5"/><circle cx="288" cy="432" r="5"/><circle cx="398" cy="432" r="5"/><circle cx="409" cy="432" r="5"/><circle cx="266" cy="443" r="5"/><circle cx="277" cy="443" r="5"/><circle cx="288" cy="443" r="5"/><circle cx="398" cy="443" r="5"/><circle cx="409" cy="443" r="5"/><circle cx="420" cy="443" r="5"/><circle cx="266" cy="454" r="5"/><circle cx="277" cy="454" r="5"/><circle cx="288" cy="454" r="5"/><circle cx="398" cy="454" r="5"/><circle cx="409" cy="454" r="5"/><circle cx="420" cy="454" r="5"/><circle cx="266" cy="465" r="5"/><circle cx="277" cy="465" r="5"/><circle cx="288" cy="465" r="5"/><circle cx="398" cy="465" r="5"/><circle cx="409" cy="465" r="5"/><circle cx="420" cy="465" r="5"/></g><g fill="#fff1f1"><circle cx="321" cy="377" r="3.3"/><circle cx="332" cy="377" r="3.3"/><circle cx="343" cy="377" r="3.3"/><circle cx="354" cy="377" r="3.3"/><circle cx="365" cy="377" r="3.3"/><circle cx="299" cy="388" r="3.3"/><circle cx="310" cy="388" r="3.3"/><circle cx="321" cy="388" r="3.3"/><circle cx="332" cy="388" r="3.3"/><circle cx="343" cy="388" r="3.3"/><circle cx="354" cy="388" r="3.3"/><circle cx="365" cy="388" r="3.3"/><circle cx="376" cy="388" r="3.3"/><circle cx="387" cy="388" r="3.3"/><circle cx="288" cy="399" r="3.3"/><circle cx="299" cy="399" r="3.3"/><circle cx="310" cy="399" r="3.3"/><circle cx="321" cy="399" r="3.3"/><circle cx="332" cy="399" r="3.3"/><circle cx="343" cy="399" r="3.3"/><circle cx="354" cy="399" r="3.3"/><circle cx="365" cy="399" r="3.3"/><circle cx="376" cy="399" r="3.3"/><circle cx="387" cy="399" r="3.3"/><circle cx="398" cy="399" r="3.3"/><circle cx="277" cy="410" r="3.3"/><circle cx="288" cy="410" r="3.3"/><circle cx="299" cy="410" r="3.3"/><circle cx="310" cy="410" r="3.3"/><circle cx="376" cy="410" r="3.3"/><circle cx="387" cy="410" r="3.3"/><circle cx="398" cy="410" r="3.3"/><circle cx="409" cy="410" r="3.3"/><circle cx="277" cy="421" r="3.3"/><circle cx="288" cy="421" r="3.3"/><circle cx="299" cy="421" r="3.3"/><circle cx="387" cy="421" r="3.3"/><circle cx="398" cy="421" r="3.3"/><circle cx="409" cy="421" r="3.3"/><circle cx="277" cy="432" r="3.3"/><circle cx="288" cy="432" r="3.3"/><circle cx="398" cy="432" r="3.3"/><circle cx="409" cy="432" r="3.3"/><circle cx="266" cy="443" r="3.3"/><circle cx="277" cy="443" r="3.3"/><circle cx="288" cy="443" r="3.3"/><circle cx="398" cy="443" r="3.3"/><circle cx="409" cy="443" r="3.3"/><circle cx="420" cy="443" r="3.3"/><circle cx="266" cy="454" r="3.3"/><circle cx="277" cy="454" r="3.3"/><circle cx="288" cy="454" r="3.3"/><circle cx="398" cy="454" r="3.3"/><circle cx="409" cy="454" r="3.3"/><circle cx="420" cy="454" r="3.3"/><circle cx="266" cy="465" r="3.3"/><circle cx="277" cy="465" r="3.3"/><circle cx="288" cy="465" r="3.3"/><circle cx="398" cy="465" r="3.3"/><circle cx="409" cy="465" r="3.3"/><circle cx="420" cy="465" r="3.3"/></g><g fill="#ff1233" filter="url(#qbp-glow)"><circle cx="635" cy="377" r="7"/><circle cx="646" cy="377" r="7"/><circle cx="657" cy="377" r="7"/><circle cx="668" cy="377" r="7"/><circle cx="679" cy="377" r="7"/><circle cx="613" cy="388" r="7"/><circle cx="624" cy="388" r="7"/><circle cx="635" cy="388" r="7"/><circle cx="646" cy="388" r="7"/><circle cx="657" cy="388" r="7"/><circle cx="668" cy="388" r="7"/><circle cx="679" cy="388" r="7"/><circle cx="690" cy="388" r="7"/><circle cx="701" cy="388" r="7"/><circle cx="602" cy="399" r="7"/><circle cx="613" cy="399" r="7"/><circle cx="624" cy="399" r="7"/><circle cx="635" cy="399" r="7"/><circle cx="646" cy="399" r="7"/><circle cx="657" cy="399" r="7"/><circle cx="668" cy="399" r="7"/><circle cx="679" cy="399" r="7"/><circle cx="690" cy="399" r="7"/><circle cx="701" cy="399" r="7"/><circle cx="712" cy="399" r="7"/><circle cx="591" cy="410" r="7"/><circle cx="602" cy="410" r="7"/><circle cx="613" cy="410" r="7"/><circle cx="624" cy="410" r="7"/><circle cx="690" cy="410" r="7"/><circle cx="701" cy="410" r="7"/><circle cx="712" cy="410" r="7"/><circle cx="723" cy="410" r="7"/><circle cx="591" cy="421" r="7"/><circle cx="602" cy="421" r="7"/><circle cx="613" cy="421" r="7"/><circle cx="701" cy="421" r="7"/><circle cx="712" cy="421" r="7"/><circle cx="723" cy="421" r="7"/><circle cx="591" cy="432" r="7"/><circle cx="602" cy="432" r="7"/><circle cx="712" cy="432" r="7"/><circle cx="723" cy="432" r="7"/><circle cx="580" cy="443" r="7"/><circle cx="591" cy="443" r="7"/><circle cx="602" cy="443" r="7"/><circle cx="712" cy="443" r="7"/><circle cx="723" cy="443" r="7"/><circle cx="734" cy="443" r="7"/><circle cx="580" cy="454" r="7"/><circle cx="591" cy="454" r="7"/><circle cx="602" cy="454" r="7"/><circle cx="712" cy="454" r="7"/><circle cx="723" cy="454" r="7"/><circle cx="734" cy="454" r="7"/><circle cx="580" cy="465" r="7"/><circle cx="591" cy="465" r="7"/><circle cx="602" cy="465" r="7"/><circle cx="712" cy="465" r="7"/><circle cx="723" cy="465" r="7"/><circle cx="734" cy="465" r="7"/></g><g fill="#ff334d"><circle cx="635" cy="377" r="5"/><circle cx="646" cy="377" r="5"/><circle cx="657" cy="377" r="5"/><circle cx="668" cy="377" r="5"/><circle cx="679" cy="377" r="5"/><circle cx="613" cy="388" r="5"/><circle cx="624" cy="388" r="5"/><circle cx="635" cy="388" r="5"/><circle cx="646" cy="388" r="5"/><circle cx="657" cy="388" r="5"/><circle cx="668" cy="388" r="5"/><circle cx="679" cy="388" r="5"/><circle cx="690" cy="388" r="5"/><circle cx="701" cy="388" r="5"/><circle cx="602" cy="399" r="5"/><circle cx="613" cy="399" r="5"/><circle cx="624" cy="399" r="5"/><circle cx="635" cy="399" r="5"/><circle cx="646" cy="399" r="5"/><circle cx="657" cy="399" r="5"/><circle cx="668" cy="399" r="5"/><circle cx="679" cy="399" r="5"/><circle cx="690" cy="399" r="5"/><circle cx="701" cy="399" r="5"/><circle cx="712" cy="399" r="5"/><circle cx="591" cy="410" r="5"/><circle cx="602" cy="410" r="5"/><circle cx="613" cy="410" r="5"/><circle cx="624" cy="410" r="5"/><circle cx="690" cy="410" r="5"/><circle cx="701" cy="410" r="5"/><circle cx="712" cy="410" r="5"/><circle cx="723" cy="410" r="5"/><circle cx="591" cy="421" r="5"/><circle cx="602" cy="421" r="5"/><circle cx="613" cy="421" r="5"/><circle cx="701" cy="421" r="5"/><circle cx="712" cy="421" r="5"/><circle cx="723" cy="421" r="5"/><circle cx="591" cy="432" r="5"/><circle cx="602" cy="432" r="5"/><circle cx="712" cy="432" r="5"/><circle cx="723" cy="432" r="5"/><circle cx="580" cy="443" r="5"/><circle cx="591" cy="443" r="5"/><circle cx="602" cy="443" r="5"/><circle cx="712" cy="443" r="5"/><circle cx="723" cy="443" r="5"/><circle cx="734" cy="443" r="5"/><circle cx="580" cy="454" r="5"/><circle cx="591" cy="454" r="5"/><circle cx="602" cy="454" r="5"/><circle cx="712" cy="454" r="5"/><circle cx="723" cy="454" r="5"/><circle cx="734" cy="454" r="5"/><circle cx="580" cy="465" r="5"/><circle cx="591" cy="465" r="5"/><circle cx="602" cy="465" r="5"/><circle cx="712" cy="465" r="5"/><circle cx="723" cy="465" r="5"/><circle cx="734" cy="465" r="5"/></g><g fill="#fff1f1"><circle cx="635" cy="377" r="3.3"/><circle cx="646" cy="377" r="3.3"/><circle cx="657" cy="377" r="3.3"/><circle cx="668" cy="377" r="3.3"/><circle cx="679" cy="377" r="3.3"/><circle cx="613" cy="388" r="3.3"/><circle cx="624" cy="388" r="3.3"/><circle cx="635" cy="388" r="3.3"/><circle cx="646" cy="388" r="3.3"/><circle cx="657" cy="388" r="3.3"/><circle cx="668" cy="388" r="3.3"/><circle cx="679" cy="388" r="3.3"/><circle cx="690" cy="388" r="3.3"/><circle cx="701" cy="388" r="3.3"/><circle cx="602" cy="399" r="3.3"/><circle cx="613" cy="399" r="3.3"/><circle cx="624" cy="399" r="3.3"/><circle cx="635" cy="399" r="3.3"/><circle cx="646" cy="399" r="3.3"/><circle cx="657" cy="399" r="3.3"/><circle cx="668" cy="399" r="3.3"/><circle cx="679" cy="399" r="3.3"/><circle cx="690" cy="399" r="3.3"/><circle cx="701" cy="399" r="3.3"/><circle cx="712" cy="399" r="3.3"/><circle cx="591" cy="410" r="3.3"/><circle cx="602" cy="410" r="3.3"/><circle cx="613" cy="410" r="3.3"/><circle cx="624" cy="410" r="3.3"/><circle cx="690" cy="410" r="3.3"/><circle cx="701" cy="410" r="3.3"/><circle cx="712" cy="410" r="3.3"/><circle cx="723" cy="410" r="3.3"/><circle cx="591" cy="421" r="3.3"/><circle cx="602" cy="421" r="3.3"/><circle cx="613" cy="421" r="3.3"/><circle cx="701" cy="421" r="3.3"/><circle cx="712" cy="421" r="3.3"/><circle cx="723" cy="421" r="3.3"/><circle cx="591" cy="432" r="3.3"/><circle cx="602" cy="432" r="3.3"/><circle cx="712" cy="432" r="3.3"/><circle cx="723" cy="432" r="3.3"/><circle cx="580" cy="443" r="3.3"/><circle cx="591" cy="443" r="3.3"/><circle cx="602" cy="443" r="3.3"/><circle cx="712" cy="443" r="3.3"/><circle cx="723" cy="443" r="3.3"/><circle cx="734" cy="443" r="3.3"/><circle cx="580" cy="454" r="3.3"/><circle cx="591" cy="454" r="3.3"/><circle cx="602" cy="454" r="3.3"/><circle cx="712" cy="454" r="3.3"/><circle cx="723" cy="454" r="3.3"/><circle cx="734" cy="454" r="3.3"/><circle cx="580" cy="465" r="3.3"/><circle cx="591" cy="465" r="3.3"/><circle cx="602" cy="465" r="3.3"/><circle cx="712" cy="465" r="3.3"/><circle cx="723" cy="465" r="3.3"/><circle cx="734" cy="465" r="3.3"/></g></g></svg>'

// What the head shows at rest: all of it, sitting on the heading's top edge (2026-11-26: 0.66, then 0.8 and 0.88,
// then the whole head).
const PEEK = 1
// The head's height for its width (the front head's drawing is 930 by 750).
const ASPECT = 750 / 930

function QbotPeek() {
  const host = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState<{ x: number; y: number; w: number } | null>(null)
  // hidden, then shown when the pointer first comes in, then gone 4 seconds after it settles (2026-11-26).
  const [phase, setPhase] = React.useState<"hidden" | "shown" | "gone">("hidden")
  // The same phase for the listeners, so the moment plays once whichever way it's triggered.
  const phaseRef = React.useRef<"hidden" | "shown">("hidden")

  React.useEffect(() => {
    const layer = host.current
    const scope = layer?.closest(".web-pattern")?.parentElement
    const title = scope?.querySelector("h1, h2")
    if (!layer || !scope || !title) return
    // The heading's first line: Qbot sits over its middle, its size set by the line's height.
    const measure = () => {
      const base = layer.getBoundingClientRect()
      const range = document.createRange()
      range.selectNodeContents(title)
      const line = range.getClientRects()[0] ?? title.getBoundingClientRect()
      // About 30% smaller than the first version (2026-11-26).
      const w = Math.min(98, Math.max(56, line.height * 1.3))
      setBox({ x: (line.left + line.right) / 2 - base.left, y: line.top - base.top + line.height * 0.08, w })
    }
    const frame = requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(scope)
    void document.fonts?.ready.then(measure)
    let leave = 0
    // The trigger is the section's main call to action, its first button ("Start Free in Qdrant Cloud" in the home
    // hero), on hover or keyboard focus (2026-11-26; it was the whole section until then).
    const cta = scope.querySelector<HTMLElement>('[data-slot="button"]') ?? scope
    const enter = () => {
      if (phaseRef.current !== "hidden") return
      phaseRef.current = "shown"
      setPhase("shown")
      // The rise takes 0.9s; it then stays 4s and sinks back behind the heading, for good.
      leave = window.setTimeout(() => setPhase("gone"), 900 + 4000)
    }
    cta.addEventListener("pointerenter", enter)
    cta.addEventListener("focusin", enter)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      cta.removeEventListener("pointerenter", enter)
      cta.removeEventListener("focusin", enter)
      window.clearTimeout(leave)
    }
  }, [])

  const h = box ? box.w * ASPECT : 0
  return (
    <div ref={host} className="absolute inset-0">
      {box && (
        // The window: as wide as the head, its bottom edge on the heading's top, so the head rises from behind it.
        <div
          className="absolute overflow-hidden"
          style={{ left: box.x - box.w / 2, top: box.y - h * PEEK, width: box.w, height: h * PEEK }}
        >
          <div
            className={`web-qbot-peek ${phase === "shown" ? "is-shown" : phase === "gone" ? "is-gone" : ""}`}
            style={{ width: box.w, height: h, ["--qbot-hidden" as string]: `${h * PEEK + 4}px` }}
          >
            <div className="web-qbot-float size-full" dangerouslySetInnerHTML={{ __html: SVG }} />
          </div>
        </div>
      )}
    </div>
  )
}

export const qbotPeek = definePattern({
  id: "qbot-peek",
  name: "Qbot peek",
  kind: "background",
  description:
    "An easter egg for a hero: the first time you hover the main button, Qbot's head rises from behind the heading.",
  status: "exploring",
  notes: [ASSET, CROP, PLACE],
  Layer: QbotPeek,
})
