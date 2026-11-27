// Light and dark card (.qd-book) fitting (visual designer, 2026-11-25). Run after fonts and images load:
//   import { fitBook } from "guidelines/layout/book.js"; await fitBook(canvasEl);
// 1. Widen the card so speakers stay on one line (never past the side margins).
// 2. Never shorter than the 4:5 card (5:4 on wide): extra height goes equally into the four gaps.
// 3. Center card and button together inside the margins (the safe area on story).
const SHARE = { square: 0.55, portrait: 0.65, story: 0.75, wide: 0.3286 };
export async function fitBook(cv) {
  document.documentElement.dataset.qdLayout = "pending";
  try { await layout(cv); } finally { document.documentElement.dataset.qdLayout = "done"; }
}
async function layout(cv) {
  await document.fonts.ready;
  await Promise.all([...cv.querySelectorAll("img")].map((i) => i.decode().catch(() => {})));
  const card = cv.querySelector(".qd-book__card"), cta = cv.querySelector(".qd-book__cta");
  if (!card) return;
  const st = getComputedStyle(cv), num = (n) => parseFloat(st.getPropertyValue(n));
  const { width: W, height: H } = cv.getBoundingClientRect();
  const u = Math.min(W / num("--qd-canvas-ref-w"), H / num("--qd-canvas-ref-h"));
  const bw = num("--qd-canvas-ref-w") * (SHARE[cv.dataset.shape] ?? 0.55);
  const people = card.querySelector(".qd-book__people");
  if (people) {
    const kids = [...people.children], row = getComputedStyle(people).flexDirection === "row";
    const gap = parseFloat(getComputedStyle(people).columnGap) || 0;
    const ws = kids.map((k) => k.getBoundingClientRect().width);
    const need = row ? ws.reduce((a, b) => a + b, 0) + gap * (kids.length - 1) : Math.max(...ws);
    const pad = parseFloat(getComputedStyle(card).paddingLeft) * 2;
    const maxW = W - 2 * num("--qd-canvas-margin-x") * u;
    if (need > card.clientWidth - pad + 0.5) card.style.width = Math.min(maxW, need + pad) + "px";
  }
  const minH = bw * 979.2 / 794.4 * u;
  let ch = card.getBoundingClientRect().height;
  if (ch < minH) { card.style.setProperty("--qd-book-g", (bw * 0.0604 * u + (minH - ch) / 4) + "px"); ch = card.getBoundingClientRect().height; }
  const mt = num("--qd-canvas-margin-top") * u, mb = num("--qd-canvas-margin-bottom") * u;
  const btnGap = bw * 0.0544 * u, bh = cta ? cta.getBoundingClientRect().height : 0;
  const top = Math.max(mt, mt + (H - mt - mb - (ch + (cta ? btnGap + bh : 0))) / 2);
  card.style.top = top + "px";
  if (cta) cta.style.top = (top + ch + btnGap) + "px";
}
