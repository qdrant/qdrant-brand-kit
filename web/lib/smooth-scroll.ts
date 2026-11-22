// In-page links scroll to their part with an ease instead of jumping (Juan, 2026-11-22): a slow start and a slow
// stop (ease-in-out quart), between 600 and 1100 ms by distance. Reduced motion jumps straight there. The reader's
// own scroll (wheel, touch, keys) stops the animation.

const ease = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2)

// The element that scrolls the target: its nearest scrolling ancestor, or the page.
function scroller(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if ((overflowY === "auto" || overflowY === "scroll") && p.scrollHeight > p.clientHeight) return p
  }
  return null
}

let cancel: (() => void) | null = null

// Scroll so the target sits `offset` px under the top of its scroller (below a sticky nav). Resolves when done.
export function smoothScrollTo(target: HTMLElement, offset = 0): Promise<void> {
  cancel?.()
  const box = scroller(target)
  const top = () => (box ? box.scrollTop : window.scrollY)
  const set = (y: number) => (box ? (box.scrollTop = y) : window.scrollTo(0, y))
  const boxTop = box ? box.getBoundingClientRect().top : 0
  const max = box ? box.scrollHeight - box.clientHeight : document.documentElement.scrollHeight - window.innerHeight
  const from = top()
  const to = Math.max(0, Math.min(max, from + target.getBoundingClientRect().top - boxTop - offset))
  const distance = to - from

  if (Math.abs(distance) < 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    set(to)
    return Promise.resolve()
  }

  const duration = Math.min(1100, Math.max(600, 400 + Math.abs(distance) * 0.25))
  return new Promise((resolve) => {
    let frame = 0
    const events = ["wheel", "touchstart", "keydown"] as const
    const stop = () => {
      cancelAnimationFrame(frame)
      events.forEach((e) => window.removeEventListener(e, stop))
      cancel = null
      resolve()
    }
    events.forEach((e) => window.addEventListener(e, stop, { passive: true }))
    cancel = stop
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      set(from + distance * ease(t))
      if (t < 1) frame = requestAnimationFrame(step)
      else stop()
    }
    frame = requestAnimationFrame(step)
  })
}
