// Deep field — three.js, one full-screen shader, nothing in 3D.
//
// The space itself: a domain-warped nebula band crossing the hero with dust lanes, three parallax layers of stars
// with a realistic spread of brightness (the brightest carry soft spikes), and film grain over everything.
// The cursor is a mass: space bends around it like a gravitational lens, with a faint Einstein ring. A click sends
// a gravitational wave across the field. Hovering the primary button deepens the lens. When nobody is pointing,
// the lens drifts slowly on its own. The shader also calms the area behind the copy.
//
// Config (window.BG_CONFIG): { background: "#0B0F19", numbers: false }
//   numbers: a layer of data stars bent by the same lens; near the cursor each shows its value, and a readout
//   counts the vectors in view.
//
// Usage: const scene = mount(heroElement, options); ... scene.destroy();
import { createKit, responsive } from "../kit.js";

export const defaults = {"background": "#0B0F19", "numbers": true, "interactive": true, "clicks": true, "idleMotion": true, "boostOn": null, "labels": true, "pauseButton": false, "quietZone": null, "nebula": {"y": 0.6, "angle": -30}, "lensRadius": null, "revealRadius": null, "breakpoints": []};

function mountOnce(hero, options) {
  const SpaceKit = createKit(hero, options);
  const ready = (async () => {
    const CFG = Object.assign({ background: "#0B0F19", numbers: false }, options);
    const { hero, canvas } = SpaceKit;
    let THREE;
    try {
      THREE = await SpaceKit.loadThree();
      if (!SpaceKit.alive) return;
    } catch (err) {
      console.warn("Deep field: static fallback.", err);
      return SpaceKit.fallback();
    }

    let renderer;
    try {
      renderer = SpaceKit.renderer(THREE, { maxDpr: 1.5 });
      if (!renderer) throw new Error("WebGL renderer unavailable");
    } catch (err) {
      return SpaceKit.fallback();
    }
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(DPR);
    const bg = new THREE.Color(CFG.background);

    const uniforms = {
      u_res: { value: new THREE.Vector2() },
      u_dpr: { value: DPR },
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2() },
      u_par: { value: new THREE.Vector2() },
      u_lens: { value: 0.6 },
      u_lensR: { value: 80 },
      u_waves: { value: [0, 1, 2, 3].map(() => new THREE.Vector3(0, 0, -99)) },
      u_copy: { value: new THREE.Vector4() },
      u_bg: { value: new THREE.Vector3(bg.r, bg.g, bg.b) },
      u_nebula: { value: new THREE.Vector3(CFG.nebula.y, Math.cos((CFG.nebula.angle * Math.PI) / 180), Math.sin((CFG.nebula.angle * Math.PI) / 180)) },
      u_nebA: { value: null },
      u_nebB: { value: null },
      u_nebT: { value: 0 },
    };

    // ---- The nebula's field, cached (performance, 2026-11-27) --------------------------------------------------
    // Five fBm calls a pixel for a band that drifts a few pixels a second: drawn at half the CSS resolution into one
    // of two textures every NEB_EVERY seconds, one step ahead, and each frame blends the two and reads them where
    // the lens and the waves bend space. The stars, the ring and the grain stay sharp and live.
    const NEB_EVERY = 0.5, NEB_SCALE = 0.5;
    // Freed with the renderer's context when the kit is destroyed.
    const nebTargets = [0, 1].map(() => new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false }));
    const nebU = {
      u_css: { value: new THREE.Vector2(1, 1) }, u_cres: { value: new THREE.Vector2(1, 1) }, u_ct: { value: 0 },
      u_nebula: uniforms.u_nebula,
    };
    const nebField = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: nebU,
        vertexShader: "void main() { gl_Position = vec4(position.xy, 0., 1.); }",
        depthTest: false,
        depthWrite: false,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform vec2 u_css; uniform vec2 u_cres; uniform float u_ct; uniform vec3 u_nebula;
          ${SpaceKit.GLSL}
          void main() {
            vec2 res = u_css;
            vec2 p = vec2(gl_FragCoord.x, u_cres.y - gl_FragCoord.y) / u_cres * u_css;
            float t = u_ct;
            // The nebula: a band from lower left to upper right, warped, with dust lanes cut through it.
            vec2 q = p / res.y;
            vec2 axis = u_nebula.yz;                       // nebula.angle
            vec2 origin = vec2(.5 * res.x / res.y, u_nebula.x); // nebula.y
            float across = dot(q - origin, vec2(-axis.y, axis.x));
            float along = dot(q - origin, axis);
            vec2 warp = vec2(fbm(q * 1.5 + vec2(t * .007, 0.)), fbm(q * 1.5 + vec2(5.2, 1.3) - t * .005));
            float width = .19 + .07 * fbm(vec2(along * 1.4, 3.7));
            float band = exp(-pow((across + .12 * warp.x) / width, 2.));
            float n = fbm(q * 2.2 + warp * 1.5) * .5 + .5;
            float dust = fbm(q * 5.5 + warp * 2.4 + 11.) * .5 + .5;
            float neb = band * smoothstep(.32, .95, n) * (1. - .8 * smoothstep(.45, .78, dust));
            vec3 col = ramp(neb * 1.15) * neb * .75;
            col += C_DEEP * (band * .22 + exp(-pow(across / .6, 2.)) * .06);
            gl_FragColor = vec4(col, band);
          }`,
      })
    );
    nebField.frustumCulled = false;
    const nebScene = new THREE.Scene();
    nebScene.add(nebField);
    const nebCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let nebTimes = null; // [time of A, time of B], null to draw both again
    function nebDraw(target, t) {
      nebU.u_ct.value = t;
      renderer.setRenderTarget(target);
      renderer.render(nebScene, nebCam);
      renderer.setRenderTarget(null);
    }
    function nebulaFields(t) {
      if (!nebTimes || t < nebTimes[0] || t > nebTimes[1] + NEB_EVERY) {
        nebTimes = [t, t + NEB_EVERY];
        nebDraw(nebTargets[0], nebTimes[0]);
        nebDraw(nebTargets[1], nebTimes[1]);
      } else if (t >= nebTimes[1]) {
        nebTargets.reverse();
        nebTimes = [nebTimes[1], nebTimes[1] + NEB_EVERY];
        nebDraw(nebTargets[1], nebTimes[1]);
      }
      uniforms.u_nebA.value = nebTargets[0].texture;
      uniforms.u_nebB.value = nebTargets[1].texture;
      uniforms.u_nebT.value = Math.min(1, Math.max(0, (t - nebTimes[0]) / NEB_EVERY));
    }

    const fragmentShader = /* glsl */ `
      precision highp float;
      uniform vec2 u_res; uniform float u_dpr; uniform float u_time; uniform vec2 u_mouse; uniform vec2 u_par;
      uniform float u_lens; uniform float u_lensR; uniform vec3 u_waves[4]; uniform vec4 u_copy; uniform vec3 u_bg; uniform vec3 u_nebula;
      uniform sampler2D u_nebA; uniform sampler2D u_nebB; uniform float u_nebT;
      ${SpaceKit.GLSL}
      void main() {
        vec2 res = u_res / u_dpr;
        vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr;   // CSS pixels, y down
        float t = u_time;

        // The lens: a softened point-mass deflection around the pointer.
        vec2 d = p - u_mouse;
        float r2 = dot(d, d);
        float E = u_lensR * u_lens;
        vec2 src = p - d * (E * E) / (r2 + E * E * .35 + 1.);

        // Gravitational waves from clicks: a travelling ripple in the sampling position.
        float waveLight = 0.;
        for (int i = 0; i < 4; i++) {
          vec3 w = u_waves[i];
          float age = t - w.z;
          if (age > 0. && age < 3.5) {
            vec2 dw = p - w.xy;
            float rr = length(dw) + 1e-3;
            float front = age * 360.;
            float fade = 1. - age / 3.5;
            float k = exp(-pow((rr - front) / 50., 2.)) * fade;
            src += dw / rr * k * 20. * sin((rr - front) * .09);
            waveLight += k * fade;
          }
        }

        // The nebula, read from its cached field (see nebulaFields below) where the lens and the waves bend it.
        vec2 uv = vec2(src.x / res.x, 1. - src.y / res.y);
        vec4 f = mix(texture2D(u_nebA, uv), texture2D(u_nebB, uv), u_nebT);
        vec3 col = f.rgb;
        float band = f.a;

        // Stars, three layers, each with its own parallax.
        col += stars(src + u_par * 3., 7., .14, 1., t, .45);
        col += stars(src + u_par * 8., 22., .2, 7., t, .75) * (.5 + .7 * band);
        col += stars(src + u_par * 16., 90., .26, 13., t, 1.1);

        // The Einstein ring and the light carried by waves.
        float r = sqrt(r2);
        col += C_HOT * exp(-pow((r - E * .8) / (E * .09 + 1.5), 2.)) * u_lens * .16;
        col += C_MAIN * waveLight * .07;

        // Calm behind the copy, and a soft vignette.
        float cq = length((p - u_copy.xy) / u_copy.zw);
        col *= mix(.42, 1., smoothstep(.45, 1.2, cq));
        vec2 vq = p / res - .5;
        col *= 1. - .7 * dot(vq, vq);

        gl_FragColor = vec4(hsSurface(u_bg, tonemap(col), grain(gl_FragCoord.xy, t)), 1.);
      }`;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ uniforms, vertexShader: "void main() { gl_Position = vec4(position.xy, 0., 1.); }", fragmentShader, depthTest: false, depthWrite: false })
    );
    quad.frustumCulled = false;
    scene.add(quad);

    let W = 1, H = 1;
    const buf = new THREE.Vector2();
    function layout() {
      W = hero.clientWidth;
      H = hero.clientHeight;
      renderer.setSize(W, H, false);
      renderer.getDrawingBufferSize(buf);
      uniforms.u_res.value.copy(buf);
      uniforms.u_dpr.value = buf.x / W;
      uniforms.u_lensR.value = CFG.lensRadius || Math.max(60, Math.min(W, H) * 0.11);
      uniforms.u_copy.value.set(...SpaceKit.copyEllipse());
      // The nebula's cached field follows the size.
      const cw = Math.max(1, Math.ceil(W * NEB_SCALE)), ch = Math.max(1, Math.ceil(H * NEB_SCALE));
      nebTargets.forEach((target) => target.setSize(cw, ch));
      nebU.u_css.value.set(W, H);
      nebU.u_cres.value.set(cw, ch);
      nebTimes = null;
    }

    // Idle drift: a slow loop across the lower half of the hero.
    const pointer = SpaceKit.pointer((t) => [W * (0.5 + 0.3 * Math.sin(t * 0.09)), H * (0.72 + 0.1 * Math.sin(t * 0.13 + 1))]);
    const cta = SpaceKit.ctaHover();

    let now = 0, waveIndex = 0;
    SpaceKit.onPress((e) => {
      if (e.target.closest("a, button")) return;
      const r = hero.getBoundingClientRect();
      uniforms.u_waves.value[waveIndex++ % 4].set(e.clientX - r.left, e.clientY - r.top, now);
    });

    function render(t, dt) {
      now = t;
      pointer.update(t, dt);
      cta.update(dt);
      uniforms.u_time.value = t;
      uniforms.u_mouse.value.set(pointer.x, pointer.y);
      uniforms.u_par.value.set(-(pointer.x / W - 0.5) * 2, -(pointer.y / H - 0.5) * 2);
      uniforms.u_lens.value = 0.55 + 0.5 * cta.v + 0.3 * pointer.energy;
      nebulaFields(t);
      renderer.render(scene, camera);
      if (data) data.render(t, dt);
    }

    // ---- Data stars: points bent by the same lens, revealing their values near the cursor ---------------------
    let data = null;
    if (CFG.numbers) {
      try { await Promise.race([document.fonts.load(`500 22px ${SpaceKit.monoFont}`), new Promise((r) => setTimeout(r, 2500))]); } catch {}
      if (!SpaceKit.alive) return;
      data = dataStars();
    }
    function dataStars() {
      // A 64-value atlas in Geist Mono.
      const COLS = 8, CW = 128, CH = 32;
      const ac = document.createElement("canvas");
      ac.width = COLS * CW; ac.height = COLS * CH;
      const g = ac.getContext("2d");
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `500 22px ${SpaceKit.monoFont}`;
      let seed = 41;
      const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let i = 0; i < 64; i++) {
        const v = (rand() - 0.42) * (rand() < 0.15 ? 2.4 : 1.2);
        g.fillText((v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(rand() < 0.5 ? 3 : 2), (i % COLS) * CW + CW / 2, Math.floor(i / COLS) * CH + CH / 2 + 1);
      }
      const atlas = new THREE.CanvasTexture(ac);
      atlas.flipY = false;
      atlas.minFilter = THREE.LinearMipmapLinearFilter;

      const DU = {
        u_time: uniforms.u_time, u_mouse: uniforms.u_mouse, u_par: uniforms.u_par, u_copy: uniforms.u_copy,
        u_dpr: { value: 1 }, u_E: { value: 60 }, u_R: { value: 150 }, u_reveal: { value: 0 }, u_atlas: { value: atlas }, u_label: { value: 0 },
      };
      const vertexShader = /* glsl */ `
        attribute vec4 aData; // base x, base y (CSS px), seed, magnitude
        uniform float u_time; uniform vec2 u_mouse; uniform vec2 u_par; uniform vec4 u_copy; uniform float u_dpr;
        uniform float u_E; uniform float u_R; uniform float u_reveal; uniform float u_label;
        varying float vA; varying float vGlyph; varying float vMag;
        void main() {
          vec2 s = aData.xy + u_par * 8.;
          // Invert the background's lens (src = p - d E^2 / (r^2 + k)) to find where this star appears.
          vec2 d = s - u_mouse;
          float ds = length(d), E = u_E, k = .35 * E * E + 1.;
          float r = max(ds, E);
          for (int i = 0; i < 6; i++) {
            float q = r * r + k;
            float f = r - E * E * r / q - ds;
            float fp = 1. - E * E * (k - r * r) / (q * q);
            r -= f / fp;
          }
          vec2 pos = u_mouse + (ds > 1e-3 ? d / ds : vec2(1., 0.)) * r;
          float cq = length((pos - u_copy.xy) / u_copy.zw);
          float reveal = smoothstep(u_R, u_R * .55, length(pos - u_mouse)) * u_reveal * smoothstep(.85, 1.15, cq);
          if (u_label > .5) reveal *= smoothstep(E * .45, E * .9, ds); // strongly lensed stars stay dots: their images crowd the ring
          float calm = mix(.4, 1., smoothstep(.45, 1.2, cq));
          vMag = aData.w;
          vGlyph = mod(floor(aData.z * 977. + floor(u_time * .35 + aData.z * 13.)), 64.);
          if (u_label > .5) {
            pos += vec2(30., 0.);
            gl_PointSize = 56. * u_dpr;
            vA = reveal;
          } else {
            gl_PointSize = (3. + 3. * aData.w + 4. * reveal) * u_dpr;
            vA = (.35 + .5 * aData.w) * calm + reveal * .8;
          }
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0., 1.);
        }`;
      const fragmentShader = /* glsl */ `
        precision highp float;
        uniform sampler2D u_atlas; uniform float u_label;
        varying float vA; varying float vGlyph; varying float vMag;
        ${SpaceKit.INK_GLSL}
        const vec3 C_MAIN = vec3(96., 71., 255.) / 255.;
        const vec3 C_HOT = vec3(131., 133., 255.) / 255.;
        void main() {
          vec2 uv = gl_PointCoord;
          if (u_label > .5) {
            float ty = (uv.y - .5) * 4. + .5;
            if (ty < 0. || ty > 1. || vA < .005) discard;
            float col = mod(vGlyph, 8.), row = floor(vGlyph / 8.);
            float a = texture2D(u_atlas, vec2((col + uv.x) / 8., (row + ty) / 8.)).a;
            gl_FragColor = vec4(hsInk(C_HOT * a * vA * 1.2), 1.);
            return;
          }
          float d = length(uv - .5) * 2.;
          float m = exp(-d * d * 9.) + exp(-d * 3.5) * .25;
          gl_FragColor = vec4(hsInk(mix(C_MAIN, C_HOT, .5 + .5 * vMag) * m * vA), 1.);
        }`;
      const mat = (label) => SpaceKit.blend(new THREE.ShaderMaterial({
        uniforms: Object.assign({}, DU, { u_label: { value: label } }),
        vertexShader, fragmentShader, transparent: true, depthTest: false, blending: THREE.AdditiveBlending,
      }));
      const dscene = new THREE.Scene();
      const dcam = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
      const geo = new THREE.BufferGeometry();
      let base = null;
      const dots = new THREE.Points(geo, mat(0)), labels = new THREE.Points(geo, mat(1));
      for (const o of [dots, labels]) { o.frustumCulled = false; dscene.add(o); }
      labels.renderOrder = 1;

      function build() {
        seed = 77;
        // A jittered grid: evenly spread, so the labels rarely collide.
        const cw = 64, ch = 52, cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), n = cols * rows;
        base = new Float32Array(n * 4);
        for (let i = 0; i < n; i++) {
          const x = ((i % cols) + 0.15 + rand() * 0.5) * cw, y = (Math.floor(i / cols) + 0.15 + rand() * 0.7) * ch;
          base.set([x, y, rand(), Math.pow(rand(), 3)], i * 4);
        }
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
        geo.setAttribute("aData", new THREE.BufferAttribute(base, 4));
        dcam.right = W; dcam.bottom = H; dcam.updateProjectionMatrix();
      }
      const readout = document.createElement("div");
      readout.className = "df-readout";
      let readoutHtml = "";
      readout.setAttribute("aria-hidden", "true");
      SpaceKit.append(readout);
      let builtFor = "", reveal = 0;

      return {
        render(t, dt) {
          if (builtFor !== W + "x" + H) { build(); builtFor = W + "x" + H; }
          const R = CFG.revealRadius || Math.max(110, Math.min(W, H) * 0.16);
          const cp = uniforms.u_copy.value;
          const overCopy = Math.hypot((pointer.x - cp.x) / cp.z, (pointer.y - cp.y) / cp.w) < 0.95;
          reveal += ((overCopy ? 0 : 1) - reveal) * (1 - Math.exp(-dt * 5));
          for (const o of [dots, labels]) {
            const u = o.material.uniforms;
            u.u_dpr.value = uniforms.u_dpr.value;
            u.u_E.value = uniforms.u_lensR.value * uniforms.u_lens.value;
            u.u_R.value = R;
            u.u_reveal.value = reveal;
          }
          // Count the vectors under the reveal, from their positions before the lens bends them.
          const par = uniforms.u_par.value;
          let count = 0;
          for (let i = 0; i < base.length; i += 4) {
            if (Math.hypot(base[i] + par.x * 8 - pointer.x, base[i + 1] + par.y * 8 - pointer.y) < R * 0.75) count++;
          }
          const html = `<b>${count}</b><span>VECTORS</span><span>MASS ${uniforms.u_lens.value.toFixed(2)}</span>`;
          if (html !== readoutHtml) readout.innerHTML = readoutHtml = html; // only when it changes (performance, 2026-11-27)
          readout.style.transform = `translate(${pointer.x + R * 0.78}px, ${pointer.y + R * 0.62}px)`;
          readout.style.opacity = reveal.toFixed(2);
          renderer.autoClear = false;
          renderer.render(dscene, dcam);
          renderer.autoClear = true;
        },
      };
    }

    layout();
    const loop = SpaceKit.run(render, { start: 12 });
    SpaceKit.observe(() => { layout(); loop.redraw(); });
    document.fonts?.ready.then(() => { if (!SpaceKit.alive) return; layout(); loop.redraw(); });
})();
  return { destroy: SpaceKit.destroy, setBoost: SpaceKit.setBoost, ready };
}

/** mount(container, options) -> { destroy(), setBoost(0..1), ready }. See README for every option. */
export const mount = responsive(mountOnce, defaults);
