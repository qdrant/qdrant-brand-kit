// ---- Vector kit: used by Vector Galaxy -----------------------------------------------------------
// Sphere and ring geometry (with the same math in JS and GLSL, so the kNN search sees exactly what is drawn), the
// stage between the hero's buttons and its stats, a line overlay for the query, and DOM labels in Geist Mono.
export function createVectorKit(kit) {
  const hero = kit.hero;

  // Evenly spread directions on a sphere (Fibonacci lattice).
  function fibonacci(n) {
    const out = new Float32Array(n * 3);
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * g;
      out.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    }
    return out;
  }

  // Spin about the planet's axis (yaw), then tilt toward the viewer about x. +z faces the viewer, +y is up.
  function orient(x, y, z, yaw, tilt) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    return [x1, y * ct - z1 * st, y * st + z1 * ct];
  }
  const GLSL = /* glsl */ `
    vec3 orient(vec3 v, float yaw, float tilt) {
      float cy = cos(yaw), sy = sin(yaw);
      vec3 a = vec3(v.x * cy + v.z * sy, v.y, -v.x * sy + v.z * cy);
      float ct = cos(tilt), st = sin(tilt);
      return vec3(a.x, a.y * ct - a.z * st, a.y * st + a.z * ct);
    }
    // A hexagon's distance field (flat-top), 1 at the edge.
    float hexDist(vec2 p) { p = abs(p); return max(dot(p, vec2(.8660254, .5)), p.y) / .8660254; }
    const vec3 LIGHT = vec3(-.5, .62, .6);
  `;
  const LIGHT = (() => { const l = [-0.5, 0.62, 0.6], n = Math.hypot(...l); return l.map((v) => v / n); })();

  // The stage: the free band between the buttons and the stats row, in CSS pixels from the hero's top left.
  function stage() {
    const h = hero.getBoundingClientRect();
    const top = 0, bottom = h.height, x = h.width / 2;
    return { x, y: (top + bottom) / 2, w: h.width, h: Math.max(120, bottom - top), top, bottom };
  }

  // Lines for the query: segments, rings, a crosshair. Additive, rebuilt each frame.
  function overlay(THREE, scene, max = 3000) {
    const pos = new Float32Array(max * 6), col = new Float32Array(max * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
    const lines = new THREE.LineSegments(geo, kit.blend(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthTest: false })));
    lines.frustumCulled = false;
    lines.renderOrder = 5;
    scene.add(lines);
    let n = 0;
    const o = {
      begin() { n = 0; },
      line(x0, y0, x1, y1, c, a) {
        if (n >= max || a <= 0.003) return;
        const k = n * 6;
        pos[k] = x0; pos[k + 1] = y0; pos[k + 2] = 0; pos[k + 3] = x1; pos[k + 4] = y1; pos[k + 5] = 0;
        let r = c.r * a, g = c.g * a, b = c.b * a;
        if (kit.light) {
          // Ink, as hsInk() in the kit's GLSL: taken away from the background in light.
          const m = Math.max(r, g, b, 1e-4), s = 0.55 / m;
          r = (1 - r * s) * m; g = (1 - g * s) * m; b = (1 - b * s) * m;
        }
        for (const v of [0, 3]) { col[k + v] = r; col[k + v + 1] = g; col[k + v + 2] = b; }
        n++;
      },
      ring(x, y, r, c, a, segs = 24, from = 0, to = Math.PI * 2) {
        for (let i = 0; i < segs; i++) {
          const a0 = from + ((to - from) * i) / segs, a1 = from + ((to - from) * (i + 1)) / segs;
          o.line(x + Math.cos(a0) * r, y + Math.sin(a0) * r, x + Math.cos(a1) * r, y + Math.sin(a1) * r, c, a);
        }
      },
      cross(x, y, c, a, r = 7, gap = 3) {
        o.ring(x, y, r * 0.55, c, a, 16);
        o.line(x - r - gap * 1.6, y, x - gap, y, c, a); o.line(x + gap, y, x + r + gap * 1.6, y, c, a);
        o.line(x, y - r - gap * 1.6, x, y - gap, c, a); o.line(x, y + gap, x, y + r + gap * 1.6, c, a);
      },
      end() {
        geo.setDrawRange(0, n * 2);
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
      },
    };
    return o;
  }

  // DOM labels: a chip at the stage's top left, and a tag that follows the nearest neighbour.
  function labels() {
    const ui = document.createElement("div");
    ui.className = "vx-ui";
    ui.setAttribute("aria-hidden", "true");
    ui.innerHTML = '<div class="vx-chip"></div><div class="vx-tag"></div>';
    kit.append(ui);
    const chip = ui.querySelector(".vx-chip"), tag = ui.querySelector(".vx-tag");
    // Their HTML is written only when it changes (performance, 2026-11-27): not on every frame.
    let chipHtml = "", tagHtml = "";
    return {
      ui, chip, tag,
      setChip(html, x, y) { if (html !== chipHtml) chip.innerHTML = chipHtml = html; chip.style.transform = `translate(${x}px, ${y}px)`; },
      setTag(text, x, y, opacity) {
        if (text !== tagHtml) tag.innerHTML = tagHtml = text;
        tag.style.transform = `translate(${x}px, ${y}px)`;
        tag.style.opacity = opacity;
      },
    };
  }

  // A stable 4-digit id for a point, like a record id.
  const recordId = (i) => 1000 + ((i * 7919 + 4243) % 9000);

  // k nearest of a candidate list by 2D distance; returns indices, nearest first.
  function knn(k, n, xs, ys, ok, qx, qy) {
    const best = [];
    for (let i = 0; i < n; i++) {
      if (!ok[i]) continue;
      const d = (xs[i] - qx) ** 2 + (ys[i] - qy) ** 2;
      if (best.length < k) { best.push([d, i]); best.sort((a, b) => a[0] - b[0]); }
      else if (d < best[k - 1][0]) { best[k - 1] = [d, i]; best.sort((a, b) => a[0] - b[0]); }
    }
    return best;
  }

  return { fibonacci, orient, GLSL, LIGHT, stage, overlay, labels, recordId, knn };
}
