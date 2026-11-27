// ---- Hero space kit: the shared runtime for every concept ------------------------------------------------
// Shaders, the pointer, the render loop (pause control, visibility, reduced motion), layout probes and cleanup.
import * as THREE from "three";

// One kit per mounted background. `hero` is the container the background fills (any positioned element).
// Everything it attaches (listeners, observers, nodes, the renderer) is undone by destroy().
export function createKit(hero, opts = {}) {
  const cleanups = [];
  let alive = true;
  const on = (target, type, fn, o) => {
    if (!target) return;
    target.addEventListener(type, fn, o);
    cleanups.push(() => target.removeEventListener(type, fn, o));
  };
  const track = (observer) => (cleanups.push(() => observer.disconnect()), observer);
  const observe = (fn) => track(new ResizeObserver(() => alive && fn())).observe(hero);
  const append = (node) => (hero.append(node), cleanups.push(() => node.remove()), node);
  const destroy = () => {
    if (!alive) return;
    alive = false;
    while (cleanups.length) {
      try { cleanups.pop()(); } catch (err) { /* keep cleaning */ }
    }
  };
  hero.classList.add("hs-host");
  if (opts.labels === false) hero.classList.add("hs-no-labels");
  cleanups.push(() => hero.classList.remove("hs-host", "hs-static", "hs-no-labels"));
  if (getComputedStyle(hero).position === "static") {
    hero.style.position = "relative";
    cleanups.push(() => (hero.style.position = ""));
  }

  // Boost (0..1): what used to be "hover the primary button". Set it with setBoost(), or name elements in
  // opts.boostOn (a selector, an element, or a list) whose hover and focus set it for you.
  let boostLevel = 0;
  const boostListeners = [];
  function setBoost(v) {
    const was = boostLevel;
    boostLevel = Math.max(0, Math.min(1, +v || 0));
    if (was < 0.5 && boostLevel >= 0.5) boostListeners.forEach((fn) => fn());
  }
  const onBoost = (fn) => boostListeners.push(fn);
  for (const t of [].concat(opts.boostOn || [])) {
    const target = typeof t === "string" ? document.querySelector(t) : t;
    on(target, "pointerenter", () => setBoost(1));
    on(target, "pointerleave", () => setBoost(0));
    on(target, "focus", () => setBoost(1));
    on(target, "blur", () => setBoost(0));
  }
  // Presses inside the background's rectangle (on anything but links, buttons and form fields).
  const onPress = (fn) => on(window, "pointerdown", (e) => {
    if (opts.clicks === false) return;
    const r = hero.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    if (e.target.closest?.("a, button, input, select, textarea, label")) return;
    fn(e);
  });
  // The canvas: the one given, or one created as the hero's first child.
  const canvas = opts.canvas || (() => {
    const c = document.createElement("canvas");
    c.className = "hs-canvas";
    c.setAttribute("aria-hidden", "true");
    hero.prepend(c);
    cleanups.push(() => c.remove());
    return c;
  })();
  const monoFont = opts.monoFont || '"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The light version (2026-11-27): on a light background the scenes draw ink instead of light. Where the dark
  // version adds light (stars, clouds, points, lines), the light one takes it away from the background in the same
  // hue, darker (indigo ink on white), so what glows in the dark is what's darkest in the light.
  const light = (() => {
    const c = new THREE.Color(opts.background || "#0B0F19");
    return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b > 0.35;
  })();
  if (light) {
    hero.classList.add("hs-light");
    cleanups.push(() => hero.classList.remove("hs-light"));
  }
  // The output every shader ends with: hsInk() for what's blended over the background (points, lines), hsSurface()
  // for a full-screen pass that paints the background itself. Both leave the dark version exactly as it was.
  const INK_GLSL = /* glsl */ `
${light ? "#define HS_LIGHT 1" : ""}
    // Ink is the light's hue at this share of its brightness: indigo-400 light becomes a mid-indigo ink.
    const float HS_INK = .55;
    vec3 hsInkOf(vec3 c, out float m) { m = max(max(c.r, c.g), c.b); return c / max(m, 1e-4) * HS_INK; }
    // A point's or a line's color, blended over what's drawn (see blend(): added in dark, taken away in light).
    vec3 hsInk(vec3 c) {
    #ifdef HS_LIGHT
      float m; vec3 ink = hsInkOf(c, m);
      // Never past full ink: the dark version's light goes past white where it saturates; ink would go to black.
      return (1. - ink) * min(m, 1.);
    #else
      return c;
    #endif
    }
    // For a dense cloud of points (Galaxy zoom): the final color itself, kept where it's darker than what's drawn
    // (blend(material, "min")), so thousands of points over each other stop at full ink instead of going black, as
    // in dark they stop at white.
    vec3 hsInkOver(vec3 bg, vec3 c) {
    #ifdef HS_LIGHT
      float m; vec3 ink = hsInkOf(c, m);
      return bg - (1. - ink) * min(m, 1.);
    #else
      return c;
    #endif
    }
    // A full-screen pass's final color: the background with the scene's light (dark) or ink (light), and grain.
    vec3 hsSurface(vec3 bg, vec3 col, float g) {
    #ifdef HS_LIGHT
      float m; vec3 ink = hsInkOf(col, m);
      // Lighter than the points: a wash of ink reads much stronger on white than the same light on near-black.
      return bg - (1. - ink) * m * .6 + g * .03;
    #else
      return bg + col + g * .045;
    #endif
    }
  `;
  // The blending that goes with hsInk(): additive in dark; in light, subtracted from what's drawn.
  // blend(material, "min") goes with hsInkOver(): the darker of the two.
  function blend(material, mode) {
    if (!light) return material;
    material.blending = THREE.CustomBlending;
    material.blendEquation = mode === "min" ? THREE.MinEquation : THREE.ReverseSubtractEquation;
    material.blendSrc = THREE.OneFactor;
    material.blendDst = THREE.OneFactor;
    // Alpha stays as it is: subtracting it too would punch see-through holes in the canvas.
    material.blendEquationAlpha = THREE.AddEquation;
    material.blendSrcAlpha = THREE.ZeroFactor;
    material.blendDstAlpha = THREE.OneFactor;
    return material;
  }
  const fallback = () => hero.classList.add("hs-static");

  async function loadThree() {
    const probe = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
    if (!probe) throw new Error("WebGL unavailable");
    return THREE;
  }

  // Shared GLSL: palette, hashes, 2D simplex noise, fBm, procedural stars, film grain, hue-preserving tone map.
  const GLSL = /* glsl */ `
    ${INK_GLSL}
    const vec3 C_DEEP = vec3(53., 43., 131.) / 255.;
    const vec3 C_MAIN = vec3(96., 71., 255.) / 255.;
    const vec3 C_HOT  = vec3(131., 133., 255.) / 255.;
    vec3 ramp(float x) {
      vec3 c = mix(C_DEEP, C_MAIN, smoothstep(.1, .55, x));
      return mix(c, C_HOT, smoothstep(.6, 1., x));
    }
    float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
    vec3 permute3(vec3 x) { return mod(((x * 34.) + 1.) * x, 289.); }
    float snoise(vec2 v) {
      const vec4 C = vec4(.211324865405187, .366025403784439, -.577350269189626, .024390243902439);
      vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.);
      vec3 p = permute3(permute3(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
      vec3 m = max(.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.); m = m * m; m = m * m;
      vec3 x = 2. * fract(p * C.www) - 1.; vec3 h = abs(x) - .5; vec3 ox = floor(x + .5); vec3 a0 = x - ox;
      m *= 1.79284291400159 - .85373472095314 * (a0 * a0 + h * h);
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130. * dot(m, g);
    }
    float fbm(vec2 p) {
      float a = .5, s = 0.; mat2 r = mat2(.8, .6, -.6, .8);
      for (int i = 0; i < 5; i++) { s += a * snoise(p); p = r * p * 2.02 + vec2(3.1, 1.7); a *= .5; }
      return s;
    }
    // One layer of stars on a jittered grid (p in CSS pixels). Most are faint; a few bright ones carry soft spikes.
    vec3 stars(vec2 p, float cell, float density, float seed, float t, float bright) {
      vec2 g = p / cell; vec2 id = floor(g); vec2 f = fract(g);
      float h = hash12(id + seed);
      if (h > density) return vec3(0.);
      vec2 pos = .3 + .4 * hash22(id + seed * 1.7);
      vec2 d = (f - pos) * cell;
      float m = pow(hash12(id + seed * 3.3), 5.);
      float r2 = dot(d, d);
      float core = exp(-r2 / (.35 + 1.8 * m));
      float halo = exp(-sqrt(r2) / (2. + 5. * m)) * m * .3;
      float spikes = 0.;
      if (m > .62) {
        float L = 4. + 7. * m;
        spikes = (exp(-abs(d.y) * 1.3) * exp(-abs(d.x) / L) + exp(-abs(d.x) * 1.3) * exp(-abs(d.y) / L)) * (m - .62) * 1.6;
      }
      float tw = .82 + .18 * sin(t * (.5 + h * 2.3) + h * 61.);
      float win = smoothstep(.3 * cell, .12 * cell, sqrt(r2)); // fade glow and spikes before the cell's edge
      return mix(C_MAIN, C_HOT, .35 + .65 * m) * (core * (.3 + .7 * m) + (halo + spikes) * win) * tw * bright * 1.7;
    }
    float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(.5, a.y * .75))); }
    float bayer4(vec2 a) { return bayer2(.5 * a) * .25 + bayer2(a); }
    float grain(vec2 frag, float t) { return hash12(frag + fract(t * 7.13) * vec2(91.7, 37.3)) - .5; }
    vec3 tonemap(vec3 c) { float m = max(max(c.r, c.g), c.b); return c * (1. - exp(-m * 1.35)) / max(m, 1e-4); }
  `;

  // Pointer: smoothed, in CSS pixels relative to the hero. When nobody is pointing, it follows `wander(t)`.
  // The pointer, in CSS px relative to the background. Tracked on the window, so it works when the background sits
  // behind other content. Outside the background (or with interactive: false) it follows `wander(t)`, unless
  // idleMotion is false, in which case it rests where it started.
  function pointer(wander) {
    const s = { x: 0, y: 0, tx: 0, ty: 0, active: false, energy: 0 };
    const set = (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (opts.interactive === false || x < 0 || y < 0 || x > r.width || y > r.height) { s.active = false; return; }
      s.tx = x;
      s.ty = y;
      s.active = true;
    };
    on(window, "pointermove", set, { passive: true });
    on(window, "pointerdown", set, { passive: true });
    on(document.documentElement, "pointerleave", () => (s.active = false));
    let primed = false;
    s.update = (t, dt) => {
      if (!s.active && (opts.idleMotion !== false || !primed)) { const w = wander(opts.idleMotion === false ? 0 : t); s.tx = w[0]; s.ty = w[1]; }
      if (!primed) { s.x = s.tx; s.y = s.ty; primed = true; }
      const k = 1 - Math.exp(-dt * (s.active ? 7 : 2.5));
      const px = s.x, py = s.y;
      s.x += (s.tx - s.x) * k;
      s.y += (s.ty - s.y) * k;
      const v = Math.hypot(s.x - px, s.y - py) / Math.max(dt, 1e-3);
      s.energy += (Math.min(1, v / 900) - s.energy) * (1 - Math.exp(-dt * 4));
    };
    return s;
  }

  // Hover state of the primary CTA, eased 0..1.
  // The boost level, eased (0..1).
  function ctaHover() {
    const s = { v: 0 };
    s.update = (dt) => (s.v += (boostLevel - s.v) * (1 - Math.exp(-dt * 3)));
    return s;
  }

  // Render loop with the discreet pause control, visibility handling and reduced motion (one still frame).
  function run(render, { start = 10 } = {}) {
    let t = start, wantsPlay = !reduceMotion, inView = true, raf = 0, last = 0;
    const running = () => wantsPlay && inView && !document.hidden;
    const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"/></svg>';
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bg-pause";
    append(button);
    if (opts.pauseButton !== true) button.hidden = true;
    cleanups.push(() => cancelAnimationFrame(raf));
    function loop(now) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      t += dt;
      render(t, dt);
      raf = requestAnimationFrame(loop);
    }
    function sync() {
      if (running() && !raf) { last = 0; raf = requestAnimationFrame(loop); }
      else if (!running() && raf) { cancelAnimationFrame(raf); raf = 0; }
      button.setAttribute("aria-label", wantsPlay ? "Pause background animation" : "Play background animation");
      button.innerHTML = wantsPlay ? ICON_PAUSE : ICON_PLAY;
    }
    on(button, "click", () => { wantsPlay = !wantsPlay; sync(); });
    track(new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); })).observe(hero);
    on(document, "visibilitychange", sync);
    render(t, 1 / 60);
    sync();
    return { redraw: () => render(t, 0) };
  }

  // Where the stats row ends, in CSS pixels from the top of the hero (the copy's lower edge).
  function statsBottom() {
    return hero.clientHeight;
  }

  // The copy's ellipse (center x, center y, radius x, radius y), in CSS pixels from the hero's top left.
  // The quiet zone (center x, center y, radius x, radius y in CSS px): the effect dims inside it and the lenses fade
  // over it, so text placed there stays readable. opts.quietZone is in fractions of the background's size.
  function copyEllipse() {
    const q = opts.quietZone;
    if (!q) return [-1e5, -1e5, 1, 1];
    const W = hero.clientWidth, H = hero.clientHeight;
    return [W * (q.x ?? 0.5), H * (q.y ?? 0.4), W * (q.rx ?? 0.3), H * (q.ry ?? 0.2)];
  }

  // A renderer on the hero's canvas, or null (then the caller falls back).
  function renderer(THREE, { maxDpr = 1.5, antialias = false } = {}) {
    try {
      // The browser's default GPU, not "high-performance" (performance, 2026-11-27): that one wakes a laptop's second,
      // power-hungry GPU for a background.
      const r = new THREE.WebGLRenderer({ canvas, antialias });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      cleanups.push(() => { r.dispose(); r.forceContextLoss?.(); });
      return r;
    } catch (err) {
      return null;
    }
  }

  // Uniforms every full-screen pass shares, and a resize that fills them.
  function baseUniforms(THREE, background) {
    const c = new THREE.Color(background);
    return {
      u_res: { value: new THREE.Vector2() },
      u_dpr: { value: 1 },
      u_time: { value: 0 },
      u_copy: { value: new THREE.Vector4() },
      u_bg: { value: new THREE.Vector3(c.r, c.g, c.b) },
    };
  }
  function resize(THREE, r, uniforms) {
    const W = hero.clientWidth, H = hero.clientHeight;
    r.setSize(W, H, false);
    const v = new THREE.Vector2();
    r.getDrawingBufferSize(v);
    uniforms.u_res.value.copy(v);
    uniforms.u_dpr.value = v.x / W;
    uniforms.u_copy.value.set(...copyEllipse());
    return { W, H };
  }
  function quad(THREE, uniforms, fragmentShader) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ uniforms, fragmentShader, vertexShader: "void main() { gl_Position = vec4(position.xy, 0., 1.); }", depthTest: false, depthWrite: false })
    );
    mesh.frustumCulled = false;
    return mesh;
  }
  // Start of a full-screen fragment shader: shared uniforms and GLSL, cssPos(), and finish() for the last step
  // (calm behind the copy by calmAmt, vignette, tone map, grain, background).
  const FS_HEAD = /* glsl */ `
    precision highp float;
    uniform vec2 u_res; uniform float u_dpr; uniform float u_time; uniform vec4 u_copy; uniform vec3 u_bg;
    ${GLSL}
    vec2 cssPos() { return vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr; }
    vec2 cssRes() { return u_res / u_dpr; }
    float copyCalm(vec2 p, float amt) { return mix(1. - amt, 1., smoothstep(.45, 1.2, length((p - u_copy.xy) / u_copy.zw))); }
    vec4 finish(vec3 col, vec2 p, float calmAmt) {
      col *= copyCalm(p, calmAmt);
      vec2 vq = p / cssRes() - .5;
      col *= 1. - .65 * dot(vq, vq);
      return vec4(hsSurface(u_bg, tonemap(col), grain(gl_FragCoord.xy, u_time)), 1.);
    }
  `;

  return {
    hero, canvas, reduceMotion, light, INK_GLSL, blend, fallback, loadThree, GLSL, FS_HEAD, pointer, ctaHover, run, statsBottom, copyEllipse,
    renderer, baseUniforms, resize, quad, on, observe, append, monoFont, destroy, setBoost, onBoost, onPress,
    get alive() { return alive; },
  };
}

// ---- Settings that change with the container's width ---------------------------------------------------------
const isObject = (v) => v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Element);
function merge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) out[k] = isObject(v) && isObject(a[k]) ? merge(a[k], v) : v;
  return out;
}
// Wraps a concept's mountOnce(container, options) so that `breakpoints` apply: each entry with minWidth / maxWidth
// (container px) overrides the settings while it matches; the concept restarts when the matching set changes.
export function responsive(mountOnce, defaults) {
  return function mount(container, userOptions = {}) {
    const { breakpoints: userBps = [], ...user } = userOptions;
    const { breakpoints: baseBps = [], ...base } = defaults;
    const bps = [...baseBps, ...userBps];
    const resolve = () => {
      const w = container.clientWidth;
      let o = merge(base, user), key = "";
      bps.forEach((bp, i) => {
        if ((bp.maxWidth == null || w <= bp.maxWidth) && (bp.minWidth == null || w >= bp.minWidth)) {
          const { minWidth, maxWidth, ...rest } = bp;
          o = merge(o, rest);
          key += i + ",";
        }
      });
      return [o, key];
    };
    let current = null, key = null, boost = 0;
    const start = () => {
      const [o, k] = resolve();
      key = k;
      current = mountOnce(container, o);
      current.setBoost(boost);
    };
    start();
    const ro = new ResizeObserver(() => {
      if (resolve()[1] !== key) { current.destroy(); start(); }
    });
    ro.observe(container);
    return {
      destroy() { ro.disconnect(); current.destroy(); },
      setBoost(v) { boost = v; current.setBoost(v); },
      get ready() { return current.ready; },
    };
  };
}
