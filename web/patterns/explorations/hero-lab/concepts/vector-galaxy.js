// Vector planet — three.js points and lines on a flat stage, nothing in 3D.
//
// A planet made of vectors: hexagonal points spread evenly over a sphere, lit from the upper left, smaller and
// darker toward the night side, with a faint atmosphere. A tilted ring of particles orbits it, faster near the
// planet as a real ring would, with a gap in it; the planet hides the ring behind it, casts its shadow across the
// ring, and the ring casts a band of shadow on the planet. The planet turns slowly toward the cursor.
// The cursor is a query: its five nearest vectors light up, lines draw out to them, and a tag names the nearest
// record and its distance. With nobody pointing, the query rides along the ring. A click sends a search wave
// across every point; hovering the primary button sends one from the planet.
//
// Config (window.BG_CONFIG): { background: "#0B0F19", k: 5, milkyWay: 0 }
//   milkyWay: 0 for plain stars; 0..1 sets a Milky Way band behind the planet at that strength.
//
// Usage: const scene = mount(heroElement, options); ... scene.destroy();
import { createKit, responsive } from "../kit.js";
import { createVectorKit } from "../vector-kit.js";
import { MilkyWayGLSL } from "../milkyway-glsl.js";

export const defaults = {"background": "#0B0F19", "k": 5, "milkyWay": 0.25, "interactive": true, "clicks": true, "idleMotion": true, "boostOn": null, "labels": true, "pauseButton": false, "quietZone": null, "planet": {"x": 0.5, "y": 0.68, "size": 0.17}, "breakpoints": [{"maxWidth": 699, "planet": {"y": 0.76, "size": 0.1}}]};

function mountOnce(hero, options) {
  const SpaceKit = createKit(hero, options);
  const VectorKit = createVectorKit(SpaceKit);
  const ready = (async () => {
    const CFG = Object.assign({ background: "#0B0F19", k: 5, milkyWay: 0 }, options);
    const { hero } = SpaceKit;
    let THREE;
    try {
      THREE = await SpaceKit.loadThree();
      if (!SpaceKit.alive) return;
    } catch (err) {
      console.warn("Vector planet: static fallback.", err);
      return SpaceKit.fallback();
    }
    const renderer = SpaceKit.renderer(THREE, { maxDpr: 2, antialias: true });
    if (!renderer) return SpaceKit.fallback();

    const RED = new THREE.Color("#DC244C"), HOT = new THREE.Color("#8385FF"), MAIN = new THREE.Color("#6047FF");
    const NS = 1100, NR = 3400;
    const RING_IN = 1.45, RING_OUT = 2.3, GAP_IN = 1.82, GAP_OUT = 1.9;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);

    // ---- Shared uniforms ----------------------------------------------------------------------------------------
    const U = SpaceKit.baseUniforms(THREE, CFG.background);
    Object.assign(U, {
      u_center: { value: new THREE.Vector2() },
      u_R: { value: 150 },
      u_max: { value: 10 },
      u_yaw: { value: 0 },
      u_tilt: { value: 0.32 },
      u_mouse: { value: new THREE.Vector2(-999, -999) },
      u_wave: { value: new THREE.Vector3(0, 0, -99) },
      u_milky: { value: CFG.milkyWay },
      u_par: { value: new THREE.Vector2() },
      u_mwA: { value: null },
      u_mwB: { value: null },
      u_mwT: { value: new THREE.Vector3() },
    });

    // ---- The Milky Way's slow field, cached (performance, 2026-11-27) ----------------------------------------------
    // Its band, clouds and dust take eight fBm calls a pixel but barely move, so they're drawn at half the CSS
    // resolution into one of two textures every MW_EVERY seconds, one step ahead, and each frame blends the two.
    // The stars and the star powder stay sharp and live (milkyWayLight, in the background's shader).
    const MW_EVERY = 0.5, MW_SCALE = 0.5;
    // Freed with the renderer's context when the kit is destroyed.
    const mwTargets = [0, 1].map(() => new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false }));
    const mwU = { u_css: { value: new THREE.Vector2(1, 1) }, u_cres: { value: new THREE.Vector2(1, 1) }, u_ct: { value: 0 } };
    const mwField = SpaceKit.quad(THREE, mwU, /* glsl */ `
      precision highp float;
      uniform vec2 u_css; uniform vec2 u_cres; uniform float u_ct;
      ${SpaceKit.GLSL}
      ${MilkyWayGLSL}
      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_cres.y - gl_FragCoord.y) / u_cres * u_css;
        gl_FragColor = milkyWayField(milkyWaySpace(p, u_css, u_ct, vec2(0.)), u_css, u_ct);
      }`);
    const mwScene = new THREE.Scene();
    mwScene.add(mwField);
    const mwCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let mwTimes = null; // [time of A, time of B], null to draw both again
    function mwDraw(target, t) {
      mwU.u_ct.value = t;
      renderer.setRenderTarget(target);
      renderer.render(mwScene, mwCam);
      renderer.setRenderTarget(null);
    }
    function mwFields(t) {
      if (CFG.milkyWay <= 0) return;
      if (!mwTimes || t < mwTimes[0] || t > mwTimes[1] + MW_EVERY) {
        mwTimes = [t, t + MW_EVERY];
        mwDraw(mwTargets[0], mwTimes[0]);
        mwDraw(mwTargets[1], mwTimes[1]);
      } else if (t >= mwTimes[1]) {
        mwTargets.reverse();
        mwTimes = [mwTimes[1], mwTimes[1] + MW_EVERY];
        mwDraw(mwTargets[1], mwTimes[1]);
      }
      U.u_mwA.value = mwTargets[0].texture;
      U.u_mwB.value = mwTargets[1].texture;
      U.u_mwT.value.set(mwTimes[0], mwTimes[1], Math.min(1, Math.max(0, (t - mwTimes[0]) / MW_EVERY)));
    }

    // ---- Background: stars, a faint atmosphere, the planet's dark disc ----------------------------------------
    const bg = SpaceKit.quad(THREE, U, /* glsl */ `
      ${SpaceKit.FS_HEAD}
      ${VectorKit.GLSL}
      ${MilkyWayGLSL}
      uniform vec2 u_center; uniform float u_R; uniform float u_milky; uniform vec2 u_par;
      uniform sampler2D u_mwA; uniform sampler2D u_mwB; uniform vec3 u_mwT;
      // The Milky Way's slow field, drawn at times u_mwT.x and u_mwT.y (see mwFields below), read where it holds sp.
      vec4 mwRead(sampler2D tex, vec2 sp, float tc) {
        vec2 s = milkyWayScreen(sp, cssRes(), tc) / cssRes();
        return texture2D(tex, vec2(s.x, 1. - s.y));
      }
      void main() {
        vec2 p = cssPos();
        vec3 col;
        // An if, not a ?: (performance, 2026-11-27): GPUs often work out both sides of a ?:, so the Milky Way cost
        // its full price even at milkyWay: 0.
        if (u_milky > 0.) {
          vec2 sp = milkyWaySpace(p, cssRes(), u_time, u_par);
          vec4 f = mix(mwRead(u_mwA, sp, u_mwT.x), mwRead(u_mwB, sp, u_mwT.y), u_mwT.z);
          col = milkyWayLight(f, sp, u_time, u_milky);
        } else {
          col = stars(p, 7., .1, 2., u_time, .35) + stars(p, 80., .14, 9., u_time, .8);
        }
        vec2 d = (p - u_center) / u_R;
        float r = length(d);
        vec2 l = normalize(vec2(LIGHT.x, -LIGHT.y));
        float side = .5 + .5 * dot(r > 0. ? d / r : vec2(0.), l);
        col += mix(C_DEEP, C_MAIN, side) * exp(-max(r - 1., 0.) * 9.) * (.08 + .3 * side) * step(1., r);
        col += C_DEEP * exp(-r * 1.4) * .25;
        vec4 o = finish(col, p, .4);
        float body = smoothstep(1.02, .98, r);               // the planet's body hides what is behind it
      #ifdef HS_LIGHT
        o.rgb = mix(o.rgb, u_bg * .965, body);                // a disc a shade under the background, in light
      #else
        o.rgb *= mix(1., .55, body);
      #endif
        gl_FragColor = o;
      }`);
    bg.renderOrder = 0;
    scene.add(bg);

    // ---- The planet's points --------------------------------------------------------------------------------------
    const sphereMat = new THREE.ShaderMaterial({
      uniforms: Object.assign({ u_dpr: U.u_dpr }, U),
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aDir; attribute float aHi;
        uniform float u_time; uniform float u_dpr; uniform float u_yaw; uniform float u_tilt; uniform float u_R; uniform float u_max;
        uniform vec2 u_center; uniform vec2 u_mouse; uniform vec3 u_wave;
        varying float vA; varying vec3 vCol; varying float vSize;
        ${SpaceKit.GLSL}
        ${VectorKit.GLSL}
        void main() {
          vec3 v = orient(aDir, u_yaw, u_tilt);
          vec2 s = u_center + vec2(v.x, -v.y) * u_R;
          vec3 L = normalize(LIGHT);
          float lit = smoothstep(-.3, .95, dot(v, L));
          // The ring's shadow: follow the light from this point to the ring's plane.
          vec3 n = orient(vec3(0., 1., 0.), 0., u_tilt);
          float tt = -dot(v, n) / dot(L, n);
          if (tt > 0.) {
            float rr = length(v + tt * L);
            lit *= 1. - .6 * step(${RING_IN.toFixed(2)}, rr) * step(rr, ${RING_OUT.toFixed(2)}) * (1. - step(${GAP_IN.toFixed(2)}, rr) * step(rr, ${GAP_OUT.toFixed(2)}));
          }
          float front = smoothstep(-.02, .22, v.z);
          float hover = exp(-dot(s - u_mouse, s - u_mouse) / 2500.);
          float age = u_time - u_wave.z, wave = 0.;
          if (age > 0. && age < 2.2) wave = exp(-pow((length(s - u_wave.xy) - age * 480.) / 36., 2.)) * (1. - age / 2.2);
          float size = mix(.16, 1., pow(lit, .85)) * u_max * mix(.5, 1., front) * (1. + .3 * hover + .55 * wave + .5 * aHi);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(s, 0., 1.);
          gl_PointSize = max(size, 1.2) * u_dpr;
          vSize = size;
          float rim = pow(1. - max(v.z, 0.), 2.5) * smoothstep(.1, .7, lit);
          vec3 col = mix(C_DEEP * .8, mix(C_MAIN, C_HOT, smoothstep(.5, 1., lit)), smoothstep(.04, .45, lit));
          vCol = col + C_HOT * (rim * .3 + wave * .9 + aHi * .7 + hover * .3);
          vA = front * (.12 + .88 * lit) + wave * .4 + aHi * .4;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying float vA; varying vec3 vCol; varying float vSize;
        ${SpaceKit.INK_GLSL}
        ${VectorKit.GLSL}
        void main() {
          vec2 c = (gl_PointCoord - .5) * 2.;
          float aa = 2.4 / max(vSize, 1.);
          float hex = smoothstep(.9, .9 - aa, hexDist(c));
          float dot = smoothstep(1., .4, length(c));
          float m = mix(dot, hex, smoothstep(2.5, 4.5, vSize));   // tiny points stay round
          gl_FragColor = vec4(hsInk(vCol * vA * m), 1.);
        }`,
    });
    SpaceKit.blend(sphereMat);
    const dirs = VectorKit.fibonacci(NS);
    const hiS = new Float32Array(NS);
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NS * 3), 3));
    sGeo.setAttribute("aDir", new THREE.BufferAttribute(dirs, 3));
    sGeo.setAttribute("aHi", new THREE.BufferAttribute(hiS, 1).setUsage(THREE.DynamicDrawUsage));
    const sphere = new THREE.Points(sGeo, sphereMat);
    sphere.frustumCulled = false;
    sphere.renderOrder = 2;
    scene.add(sphere);

    // ---- The ring's particles -------------------------------------------------------------------------------------
    let seed = 3;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const ring = new Float32Array(NR * 4);
    for (let i = 0; i < NR; i++) {
      let r;
      do {
        r = RING_IN + rand() * (RING_OUT - RING_IN);
      } while ((r > GAP_IN && r < GAP_OUT) || rand() > 0.55 + 0.45 * Math.sin(r * 23) ** 2); // bands and the gap
      ring.set([r, rand() * Math.PI * 2, (rand() - 0.5) * 0.03, Math.pow(rand(), 2.5)], i * 4);
    }
    const hiR = new Float32Array(NR);
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NR * 3), 3));
    rGeo.setAttribute("aRing", new THREE.BufferAttribute(ring, 4));
    rGeo.setAttribute("aHi", new THREE.BufferAttribute(hiR, 1).setUsage(THREE.DynamicDrawUsage));
    const ringPts = new THREE.Points(rGeo, new THREE.ShaderMaterial({
      uniforms: sphereMat.uniforms,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec4 aRing; attribute float aHi;
        uniform float u_time; uniform float u_dpr; uniform float u_tilt; uniform float u_R;
        uniform vec2 u_center; uniform vec2 u_mouse; uniform vec3 u_wave;
        varying float vA; varying vec3 vCol;
        ${SpaceKit.GLSL}
        ${VectorKit.GLSL}
        void main() {
          float r = aRing.x;
          float a = aRing.y + u_time * .2 / pow(r, 1.5);        // inner particles orbit faster
          vec3 v = orient(vec3(r * cos(a), aRing.z, r * sin(a)), 0., u_tilt);
          vec2 s = u_center + vec2(v.x, -v.y) * u_R;
          float hidden = step(v.z, 0.) * step(length(v.xy), 1.);
          vec3 L = normalize(LIGHT);
          float pl = dot(v, L);
          float shade = (pl < 0. && length(v - pl * L) < 1.) ? .1 : 1.;
          float hover = exp(-dot(s - u_mouse, s - u_mouse) / 2500.);
          float age = u_time - u_wave.z, wave = 0.;
          if (age > 0. && age < 2.2) wave = exp(-pow((length(s - u_wave.xy) - age * 480.) / 36., 2.)) * (1. - age / 2.2);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(s, 0., 1.);
          gl_PointSize = (1.3 + 1.6 * aRing.w + wave * 1.5 + aHi * 3.) * u_dpr;
          vA = (1. - hidden) * (shade * (.22 + .6 * aRing.w) * (1. + hover * .8) + wave * .8 + aHi);
          vCol = mix(C_MAIN, C_HOT, .35 + .65 * aRing.w);
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying float vA; varying vec3 vCol;
        ${SpaceKit.INK_GLSL}
        void main() { gl_FragColor = vec4(hsInk(vCol * vA * smoothstep(1., .3, length(gl_PointCoord - .5) * 2.)), 1.); }`,
    }));
    SpaceKit.blend(ringPts.material);
    ringPts.frustumCulled = false;
    ringPts.renderOrder = 1;
    scene.add(ringPts);

    const over = VectorKit.overlay(THREE, scene);
    const lab = VectorKit.labels();

    // ---- JS mirror of the shaders, for the search --------------------------------------------------------------
    const N = NS + NR;
    const xs = new Float32Array(N), ys = new Float32Array(N), ok = new Uint8Array(N);
    function project(t, yaw, tilt, c, R) {
      for (let i = 0; i < NS; i++) {
        const v = VectorKit.orient(dirs[3 * i], dirs[3 * i + 1], dirs[3 * i + 2], yaw, tilt);
        xs[i] = c.x + v[0] * R; ys[i] = c.y - v[1] * R; ok[i] = v[2] > 0.08 ? 1 : 0;
      }
      for (let j = 0; j < NR; j++) {
        const r = ring[4 * j], a = ring[4 * j + 1] + (t * 0.2) / Math.pow(r, 1.5);
        const v = VectorKit.orient(r * Math.cos(a), ring[4 * j + 2], r * Math.sin(a), 0, tilt);
        const i = NS + j;
        xs[i] = c.x + v[0] * R; ys[i] = c.y - v[1] * R;
        ok[i] = v[2] < 0 && Math.hypot(v[0], v[1]) < 1 ? 0 : 1;
      }
    }

    // ---- Layout -------------------------------------------------------------------------------------------------
    let W = 1, H = 1, st = null;
    function layout() {
      ({ W, H } = SpaceKit.resize(THREE, renderer, U));
      camera.right = W; camera.bottom = H; camera.updateProjectionMatrix();
      // Position: planet.x / planet.y place its centre, planet.size is its radius as a share of the height; the ring
      // always fits the width.
      const P = CFG.planet;
      const R = Math.max(40, Math.min(H * P.size, (W * 0.92) / (2 * RING_OUT)));
      U.u_R.value = R;
      U.u_center.value.set(W * P.x, H * P.y);
      st = { x: W * P.x, y: H * P.y, top: H * P.y - R * 1.7, bottom: H * P.y + R * 1.7 };
      U.u_max.value = R * Math.sqrt((4 * Math.PI) / NS) * 0.8;
      // The Milky Way's cached field follows the size.
      const cw = Math.max(1, Math.ceil(W * MW_SCALE)), ch = Math.max(1, Math.ceil(H * MW_SCALE));
      mwTargets.forEach((target) => target.setSize(cw, ch));
      mwU.u_css.value.set(W, H);
      mwU.u_cres.value.set(cw, ch);
      mwTimes = null;
    }

    // ---- Interaction ----------------------------------------------------------------------------------------------
    const pointer = SpaceKit.pointer(() => [-1, -1]);
    const cta = SpaceKit.ctaHover();
    let now = 0;
    const wave = (x, y) => U.u_wave.value.set(x, y, now);
    // Only around the planet (2026-11-27): the cursor is the query, leans the planet and sends a wave only inside an
    // ellipse around the planet and its ring (the ring is 2.3 radii wide and, tilted, about 0.75 radii tall). Anywhere
    // else in the hero it does nothing, so no line ever reaches across the hero to the planet.
    const NEAR_X = 2.6, NEAR_Y = 1.5;
    const nearPlanet = (x, y) => {
      const c = U.u_center.value, R = U.u_R.value;
      return ((x - c.x) / (R * NEAR_X)) ** 2 + ((y - c.y) / (R * NEAR_Y)) ** 2 < 1;
    };
    SpaceKit.onPress((e) => {
      if (e.target.closest("a, button")) return;
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (nearPlanet(x, y)) wave(x, y);
    });
    SpaceKit.onBoost(() => wave(U.u_center.value.x, U.u_center.value.y));

    const look = { yaw: 0, tilt: 0.32 };
    const shown = new Map(); // neighbour index -> time it joined the result set
    let tagOpacity = 0;
    const query = { x: 0, y: 0, ready: false }; // eased, so it glides between the cursor and the ring
    // The record tag (2026-11-27): it follows the nearest record only while the cursor is around the planet. Otherwise
    // it rests in one spot to the right of the planet, without its leader line, and never drifts on its own.
    const tag = { x: 0, y: 0, lead: 0, ready: false };
    lab.chip.hidden = true; // no "KNN 5 · 4,500 POINTS" badge (2026-11-27)

    function render(t, dt) {
      now = t;
      pointer.update(t, dt);
      cta.update(dt);
      const c = U.u_center.value, R = U.u_R.value;

      // The planet turns slowly, and leans toward the pointer while it's around the planet.
      const near = pointer.active && nearPlanet(pointer.x, pointer.y);
      const px = near ? (pointer.x - c.x) / W : 0, py = near ? (pointer.y - c.y) / H : 0;
      const k = 1 - Math.exp(-dt * 2);
      look.yaw += (t * 0.06 + px * 0.9 - look.yaw) * k;
      look.tilt += (0.32 + py * 0.25 - look.tilt) * k;
      U.u_time.value = t;
      U.u_yaw.value = look.yaw;
      U.u_tilt.value = look.tilt;

      // The query: the pointer while it's around the planet, or a point riding the front of the ring.
      let gx, gy;
      if (near) {
        gx = pointer.x; gy = pointer.y;
      } else {
        const a = Math.PI / 2 + 0.75 * Math.sin(t * 0.16), r = 2.02;
        const v = VectorKit.orient(r * Math.cos(a), 0, r * Math.sin(a), 0, look.tilt);
        gx = c.x + v[0] * R; gy = c.y - v[1] * R;
      }
      const qk = query.ready ? 1 - Math.exp(-dt * 7) : 1;
      query.x += (gx - query.x) * qk;
      query.y += (gy - query.y) * qk;
      query.ready = true;
      const qx = query.x, qy = query.y;
      U.u_mouse.value.set(qx, qy);
      U.u_par.value.set(-(pointer.x / W - 0.5) * 2, -(pointer.y / H - 0.5) * 2);

      project(t, look.yaw, look.tilt, c, R);
      // Neighbours within reach only (0.9 radii): no long lines, even while the query glides.
      const reach = (R * 0.9) ** 2;
      const res = VectorKit.knn(CFG.k, N, xs, ys, ok, qx, qy).filter(([d2]) => d2 < reach);
      const ids = new Set(res.map((r) => r[1]));
      for (const i of [...shown.keys()]) if (!ids.has(i)) shown.delete(i);
      for (const i of ids) if (!shown.has(i)) shown.set(i, t);

      // Highlights ease in and out.
      const e = 1 - Math.exp(-dt * 10);
      for (let i = 0; i < NS; i++) hiS[i] += ((ids.has(i) ? 1 : 0) - hiS[i]) * e;
      for (let j = 0; j < NR; j++) hiR[j] += ((ids.has(NS + j) ? 1 : 0) - hiR[j]) * e;
      sGeo.attributes.aHi.needsUpdate = true;
      rGeo.attributes.aHi.needsUpdate = true;

      // Overlay: lines draw out to each neighbour, rings settle around them, the query's crosshair.
      over.begin();
      res.forEach(([d2, i], rank) => {
        const p = Math.min(1, (t - shown.get(i)) / 0.28);
        const ease = 1 - (1 - p) ** 3;
        const x = qx + (xs[i] - qx) * ease, y = qy + (ys[i] - qy) * ease;
        over.line(qx, qy, x, y, rank === 0 ? HOT : MAIN, 0.75 - rank * 0.1);
        over.ring(xs[i], ys[i], 4 + 6 * (1 - ease) + (rank === 0 ? 1.5 : 0), HOT, (0.8 - rank * 0.1) * ease, 18);
      });
      over.cross(qx, qy, RED, 0.95);
      // The nearest record's tag: beside it, joined by an elbowed leader line, while the cursor is around the planet;
      // at rest to the right of the planet otherwise.
      if (res.length) {
        const [d2, i] = res[0];
        const restX = c.x + R * 1.15 + 24, restY = c.y + R * 0.45; // right of the planet, over the ring
        const goX = near ? xs[i] + 58 : restX, goY = near ? ys[i] + 40 : restY;
        const tk = tag.ready ? 1 - Math.exp(-dt * 6) : 1;
        tag.x += (goX - tag.x) * tk;
        tag.y += (goY - tag.y) * tk;
        tag.lead += ((near ? 1 : 0) - tag.lead) * tk;
        tag.ready = true;
        tagOpacity += (1 - tagOpacity) * e;
        const la = 0.6 * tagOpacity * tag.lead;
        over.line(xs[i] + 4, ys[i] + 4, tag.x - 20, tag.y, MAIN, la);
        over.line(tag.x - 20, tag.y, tag.x - 6, tag.y, MAIN, la);
        const dist = 0.018 + (Math.sqrt(d2) / R) * 0.35; // shown like a cosine distance: small, never zero
        lab.setTag(`<b>#${VectorKit.recordId(i)}</b><span>D ${dist.toFixed(3)}</span>`, tag.x, tag.y - 6, tagOpacity);
      } else {
        tagOpacity += (0 - tagOpacity) * e;
        lab.setTag("", tag.x, tag.y - 6, tagOpacity);
      }
      over.end();

      mwFields(t);
      renderer.render(scene, camera);
    }

    layout();
    const loop = SpaceKit.run(render, { start: 6 });
    SpaceKit.observe(() => { layout(); loop.redraw(); });
    document.fonts?.ready.then(() => { if (!SpaceKit.alive) return; layout(); loop.redraw(); });
})();
  return { destroy: SpaceKit.destroy, setBoost: SpaceKit.setBoost, ready };
}

/** mount(container, options) -> { destroy(), setBoost(0..1), ready }. See README for every option. */
export const mount = responsive(mountOnce, defaults);
