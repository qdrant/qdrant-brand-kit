// Galaxy zoom — three.js points on a flat stage, nothing in 3D.
//
// The spiral galaxy of data points from "Quantized Galaxy", with a different lens. The cursor is a magnifier:
// a small patch of the galaxy is enlarged about 3.5 times inside a small circle, and the points just outside are
// squeezed into a thin band around it, like the curve of real glass, so nothing jumps. Under the glass, some of the
// points show what they are: numbers, the values of the vectors, which change now and then. A readout beside the
// lens gives the zoom and the lens's position in the galaxy. Hovering the primary button zooms in further.
//
// Config (window.BG_CONFIG): { background: "#0B0F19", zoom: 3.5, lens: 36 (radius, CSS px), numbers: 0.16 }
//
// Usage: const scene = mount(heroElement, options); ... scene.destroy();
import { createKit, responsive } from "../kit.js";

export const defaults = {"background": "#0B0F19", "zoom": 3.5, "lens": 42, "numbers": 0.32, "interactive": true, "clicks": true, "idleMotion": true, "boostOn": null, "labels": true, "pauseButton": false, "quietZone": null, "galaxy": {"x": 0.5, "y": 0.8, "size": 0.55}, "breakpoints": [{"maxWidth": 699, "galaxy": {"y": 0.93, "size": 1.05}, "lens": 36}]};

function mountOnce(hero, options) {
  const SpaceKit = createKit(hero, options);
  const ready = (async () => {
    const CFG = Object.assign({ background: "#0B0F19", zoom: 3.5, lens: 36, numbers: 0.16 }, options);
    const { hero } = SpaceKit;
    let THREE;
    try {
      THREE = await SpaceKit.loadThree();
      if (!SpaceKit.alive) return;
    } catch (err) {
      console.warn("Galaxy zoom: static fallback.", err);
      return SpaceKit.fallback();
    }
    const renderer = SpaceKit.renderer(THREE, { maxDpr: 2 });
    if (!renderer) return SpaceKit.fallback();

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);

    // ---- Background: the core's glow, the lens's glass and rim, grain ----------------------------------------
    const U = SpaceKit.baseUniforms(THREE, CFG.background);
    Object.assign(U, {
      u_mouse: { value: new THREE.Vector2(-999, -999) },
      u_lensR: { value: CFG.lens },
      u_zoom: { value: CFG.zoom },
      u_lens: { value: 0 },
      u_center: { value: new THREE.Vector2() },
      u_scale: { value: 600 },
    });
    const bg = SpaceKit.quad(THREE, U, /* glsl */ `
      ${SpaceKit.FS_HEAD}
      uniform vec2 u_mouse; uniform float u_lensR; uniform float u_lens; uniform vec2 u_center; uniform float u_scale;
      void main() {
        vec2 p = cssPos();
        float t = u_time;
        vec2 g = (p - u_center) / u_scale;
        g = mat2(cos(.16), -sin(.16), sin(.16), cos(.16)) * g;
        float e = length(vec2(g.x, g.y / .36));
        vec3 col = C_DEEP * (exp(-e * 3.) * .5 + exp(-e * 1.1) * .12) + C_MAIN * exp(-e * 9.) * .25;
        col += stars(p, 7., .08, 5., t, .3);
        // The glass: darker inside, so the numbers read; a fine rim and a faint outer halo.
        float d = length(p - u_mouse);
        float R = u_lensR;
        col *= mix(1., .35, smoothstep(R + 1., R - 1., d) * u_lens);
        col += C_HOT * exp(-pow((d - R) / .9, 2.)) * .55 * u_lens;
        col += C_MAIN * exp(-pow((d - R * 1.6) / 1., 2.)) * .12 * u_lens;
        // Four ticks on the rim, like a loupe's reticle.
        vec2 dd = p - u_mouse;
        float tick = (exp(-dd.x * dd.x / .5) + exp(-dd.y * dd.y / .5)) * step(R + 3., d) * step(d, R + 9.);
        col += C_HOT * tick * .5 * u_lens;
        gl_FragColor = finish(col, p, .5);
      }`);
    bg.renderOrder = 0;
    scene.add(bg);

    // ---- Numbers: an atlas of 64 short values in Geist Mono ------------------------------------------------
    const COLS = 8, ROWS = 8, CW = 128, CH = 32;
    function atlas() {
      const c = document.createElement("canvas");
      c.width = COLS * CW;
      c.height = ROWS * CH;
      const g = c.getContext("2d");
      g.fillStyle = "#fff";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `500 22px ${SpaceKit.monoFont}`;
      let seed = 41;
      const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let i = 0; i < COLS * ROWS; i++) {
        const v = (rand() - 0.42) * (rand() < 0.15 ? 2.4 : 1.2);
        const text = (v < 0 ? "−" : "") + Math.abs(v).toFixed(rand() < 0.5 ? 3 : 2);
        g.fillText(text, (i % COLS) * CW + CW / 2, Math.floor(i / COLS) * CH + CH / 2 + 1);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.flipY = false;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.anisotropy = 4;
      return tex;
    }
    const PU = {
      u_time: U.u_time, u_dpr: { value: 1 }, u_mouse: U.u_mouse, u_lensR: U.u_lensR, u_zoom: U.u_zoom, u_lens: U.u_lens,
      u_center: U.u_center, u_scale: U.u_scale, u_copy: U.u_copy, u_bg: U.u_bg, u_numbers: { value: CFG.numbers }, u_atlas: { value: null },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: PU,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec4 aData;   // radius, angle, seed, arm
        attribute float aMag;
        uniform float u_time; uniform float u_dpr; uniform vec2 u_mouse; uniform float u_lensR; uniform float u_zoom;
        uniform float u_lens; uniform vec2 u_center; uniform float u_scale; uniform vec4 u_copy; uniform float u_numbers;
        varying float vA; varying float vMag; varying float vNum; varying float vGlyph; varying float vIn;
        void main() {
          float r = aData.x;
          float ang = aData.y + u_time * (.03 / (.12 + r));
          vec2 pos = vec2(cos(ang), sin(ang) * .36) * r * u_scale;
          float c = cos(-.16), s = sin(-.16);
          pos = vec2(c * pos.x - s * pos.y, s * pos.x + c * pos.y) + u_center;

          // The magnifier. Inside R / Z: enlarged Z times. From R / Z to R2: squeezed into the band from R to R2.
          float Z = mix(1., u_zoom, u_lens);
          float R = u_lensR, R2 = u_lensR * 1.6;
          vec2 d = pos - u_mouse;
          float L = length(d);
          float inner = R / Z;
          float inside = step(L, inner) * step(.02, u_lens);
          if (L < inner) pos = u_mouse + d * Z;
          else if (L < R2) pos = u_mouse + d / max(L, 1e-3) * (R + (L - inner) * (R2 - R) / (R2 - inner));

          // Under the glass, a share of the points become numbers.
          // Fewer in the dense core, and none close to the rim, so the numbers stay legible and inside the glass.
          float share = u_numbers * (.2 + .8 * smoothstep(.06, .4, r));
          float num = inside * step(aData.z, share) * step(L * Z, R - 11.);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0., 1.);
          float calm = mix(.3, 1., smoothstep(.45, 1.2, length((pos - u_copy.xy) / u_copy.zw)));
          calm = mix(calm, 1., inside);
          float tw = .85 + .15 * sin(u_time * (.7 + aData.z) + aData.z * 50.);
          float base = (.16 + .84 * aMag) * tw * (.55 + .7 * smoothstep(1.1, .05, r));
          vA = mix(base, mix(.5 + .5 * aMag, .95, num), inside) * calm;
          vMag = aMag;
          vNum = num;
          vIn = inside;
          // Each number changes now and then, out of step with the others.
          vGlyph = mod(floor(aData.z * 977. + floor(u_time * .4 + aData.z * 13.)), 64.);
          float dotSize = (1.5 + aMag * 2.8) * mix(1., 1.6, inside);
          gl_PointSize = mix(dotSize, 46., num) * u_dpr;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform sampler2D u_atlas; uniform vec3 u_bg;
        varying float vA; varying float vMag; varying float vNum; varying float vGlyph; varying float vIn;
        ${SpaceKit.INK_GLSL}
        const vec3 C_DEEP = vec3(53., 43., 131.) / 255.;
        const vec3 C_MAIN = vec3(96., 71., 255.) / 255.;
        const vec3 C_HOT = vec3(131., 133., 255.) / 255.;
        void main() {
          vec2 uv = gl_PointCoord;
          if (vNum > .5) {
            // The sprite is square; the number's cell is 4:1, centred vertically.
            float ty = (uv.y - .5) * 4. + .5;
            if (ty < 0. || ty > 1.) discard;
            float col = mod(vGlyph, 8.), row = floor(vGlyph / 8.);
            float a = texture2D(u_atlas, vec2((col + uv.x) / 8., (row + ty) / 8.)).a;
            gl_FragColor = vec4(hsInkOver(u_bg, mix(C_MAIN, C_HOT, .6 + .4 * vMag) * a * vA * 1.3), 1.);
            return;
          }
          float m = smoothstep(.5, .12, length(uv - .5));
          vec3 c = mix(mix(C_DEEP, C_MAIN, .45 + .55 * vMag), C_HOT, clamp(vMag * .35 + vIn * .3, 0., 1.));
          gl_FragColor = vec4(hsInkOver(u_bg, c * m * vA * mix(1., .55, vIn)), 1.);
        }`,
    });

    SpaceKit.blend(material, "min");
    let points = null;
    function build(W, H) {
      let seed = 11;
      const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
      const N = W * H > 700000 ? 52000 : 22000;
      const data = new Float32Array(N * 4), mags = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const u = rand();
        let r, a, arm = 0;
        if (u < 0.12) { r = Math.abs(gauss()) * 0.1; a = rand() * Math.PI * 2; }
        else if (u < 0.9) {
          arm = Math.floor(rand() * 3);
          r = 0.07 + Math.pow(rand(), 0.85) * 0.98;
          a = (arm * Math.PI * 2) / 3 + r * 5.2 + gauss() * (0.16 + 0.14 * (1 - r));
          r += gauss() * 0.02;
        } else { r = rand() * 1.15; a = rand() * Math.PI * 2; }
        data.set([Math.max(0, r), a, rand(), arm], i * 4);
        mags[i] = Math.pow(rand(), 4) * (u < 0.12 ? 1.4 : 1);
      }
      if (points) { scene.remove(points); points.geometry.dispose(); }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      g.setAttribute("aData", new THREE.BufferAttribute(data, 4));
      g.setAttribute("aMag", new THREE.BufferAttribute(mags, 1));
      points = new THREE.Points(g, material);
      points.frustumCulled = false;
      points.renderOrder = 1;
      scene.add(points);
    }

    // The readout beside the lens.
    const readout = document.createElement("div");
    readout.className = "gz-readout";
    let readoutHtml = "";
    readout.setAttribute("aria-hidden", "true");
    SpaceKit.append(readout);

    let W = 1, H = 1, built = "";
    function layout() {
      ({ W, H } = SpaceKit.resize(THREE, renderer, U));
      PU.u_dpr.value = U.u_dpr.value;
      camera.right = W; camera.bottom = H; camera.updateProjectionMatrix();
      // Position: galaxy.x / galaxy.y place the core, galaxy.size is the disc's radius as a share of the width.
      U.u_center.value.set(W * CFG.galaxy.x, H * CFG.galaxy.y);
      U.u_scale.value = Math.min(W * CFG.galaxy.size, H * 1.05);
      U.u_lensR.value = CFG.lens;
      const key = W * H > 700000 ? "large" : "small";
      if (key !== built) { build(W, H); built = key; }
    }

    const pointer = SpaceKit.pointer((t) => [W * (CFG.galaxy.x + 0.3 * Math.sin(t * 0.08)), H * (CFG.galaxy.y + 0.06 * Math.sin(t * 0.13))]);
    const cta = SpaceKit.ctaHover();
    function render(t, dt) {
      pointer.update(t, dt);
      cta.update(dt);
      U.u_time.value = t;
      U.u_mouse.value.set(pointer.x, pointer.y);
      // The lens stays clear of the copy: it fades while the pointer is over the headline.
      const cp = U.u_copy.value;
      const overCopy = Math.hypot((pointer.x - cp.x) / cp.z, (pointer.y - cp.y) / cp.w) < 0.9;
      U.u_lens.value += ((overCopy ? 0 : 1) - U.u_lens.value) * (1 - Math.exp(-dt * 6));
      U.u_zoom.value = CFG.zoom + 2 * cta.v;
      // Readout: zoom and the lens's position in galaxy coordinates.
      const c = U.u_center.value, sc = U.u_scale.value;
      const dx = (pointer.x - c.x) / sc, dy = (pointer.y - c.y) / sc;
      const gx = Math.cos(0.16) * dx - Math.sin(0.16) * dy, gy = (Math.sin(0.16) * dx + Math.cos(0.16) * dy) / 0.36;
      const sign = (v) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(3);
      const html = `<b>×${U.u_zoom.value.toFixed(1)}</b><span>X ${sign(gx)}</span><span>Y ${sign(-gy)}</span>`;
      if (html !== readoutHtml) readout.innerHTML = readoutHtml = html; // only when it changes (performance, 2026-11-27)
      const R = U.u_lensR.value;
      readout.style.transform = `translate(${pointer.x + R * 1.6 + 8}px, ${pointer.y + R * 0.6}px)`;
      readout.style.opacity = U.u_lens.value.toFixed(2);
      renderer.render(scene, camera);
    }

    // The atlas waits for Geist Mono, so the numbers are drawn in it.
    try { await Promise.race([document.fonts.load(`500 22px ${SpaceKit.monoFont}`), new Promise((r) => setTimeout(r, 2500))]); } catch {}
    if (!SpaceKit.alive) return;
    PU.u_atlas.value = atlas();
    layout();
    const loop = SpaceKit.run(render, { start: 40 });
    SpaceKit.observe(() => { layout(); loop.redraw(); });
    document.fonts?.ready.then(() => { if (!SpaceKit.alive) return; layout(); loop.redraw(); });
})();
  return { destroy: SpaceKit.destroy, setBoost: SpaceKit.setBoost, ready };
}

/** mount(container, options) -> { destroy(), setBoost(0..1), ready }. See README for every option. */
export const mount = responsive(mountOnce, defaults);
