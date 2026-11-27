// ---- Milky Way, as a GLSL function: the band from "Milky Way" (19), with a strength so it can sit behind ----------
// other scenes. Needs SpaceKit.GLSL (snoise, fbm, hash12, stars, palette) declared before it.
//
// Split in two (performance, 2026-11-27): milkyWayField() is the slow part (the band, its clouds and dust: eight fBm
// calls) and changes very slowly, so a scene can draw it into a small texture now and then and read it back;
// milkyWayLight() turns those values into color and adds the star powder and the stars, sharp, every frame.
// milkyWay() still does both at once, as before.
export const MilkyWayGLSL = /* glsl */ `
  float mwRidged(vec2 p) {
    float a = .5, s = 0.; mat2 r = mat2(.8, .6, -.6, .8);
    for (int i = 0; i < 4; i++) { s += a * (1. - abs(snoise(p))); p = r * p * 2.03 + 4.1; a *= .5; }
    return s;
  }
  // The band's own coordinates (sp, CSS px): it turns very slowly about a pivot far below, and shifts with par.
  vec2 milkyWayPivot(vec2 res) { return vec2(res.x * .5, res.y * 3.2); }
  vec2 milkyWaySpace(vec2 p, vec2 res, float t, vec2 par) {
    vec2 pivot = milkyWayPivot(res);
    float rot = t * .0016;
    return pivot + mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * (p - pivot) + par * 6.;
  }
  // Back from the band's coordinates to the screen as it was at time t with no par: where a field drawn at t holds sp.
  vec2 milkyWayScreen(vec2 sp, vec2 res, float t) {
    vec2 pivot = milkyWayPivot(res);
    float rot = t * .0016;
    return pivot + mat2(cos(rot), sin(rot), -sin(rot), cos(rot)) * (sp - pivot);
  }
  // The slow part, packed in 0..1: glow / 2, the dust's shadow, the clouds and the band.
  vec4 milkyWayField(vec2 sp, vec2 res, float t) {
    vec2 q = sp / res.y;
    vec2 axis = normalize(vec2(1., -.42));
    vec2 o = vec2(.5 * res.x / res.y, .5);
    float along = dot(q - o, axis);
    float across = dot(q - o, vec2(-axis.y, axis.x)) + .08 * fbm(vec2(along * 1.3, 2.));
    float width = .2 + .07 * fbm(vec2(along * 1.8, 7.));
    float band = exp(-pow(across / width, 2.));
    float core = exp(-pow(across / (width * .45), 2.));
    vec2 w = vec2(fbm(q * 2.2 + t * .002), fbm(q * 2.2 + 5.3));
    float clouds = fbm(q * 3.6 + w * 1.2) * .5 + .5;
    float fine = fbm(q * 11. + w * 2.) * .5 + .5;
    float glow = band * (.25 + .9 * smoothstep(.35, .9, clouds)) * (.7 + .5 * fine) + core * .45;
    float dust = smoothstep(.62, .92, mwRidged(q * vec2(2.6, 4.2) + w * .8 + vec2(along * .5, 0.)));
    float lane = exp(-pow((across + .03 * snoise(vec2(along * 4., 1.))) / (width * .32), 2.));
    float shadow = 1. - .85 * dust * (.35 + .65 * lane) * band;
    return vec4(glow * .5, shadow, clamp(clouds, 0., 1.), band);
  }
  // The fast part: color from the field, then the star powder and the stars, at full resolution.
  vec3 milkyWayLight(vec4 f, vec2 sp, float t, float strength) {
    float glow = f.x * 2., shadow = f.y, clouds = f.z, band = f.w;
    float core = pow(band, 4.938); // the core is the band, 0.45 as wide
    vec3 col = mix(C_DEEP, C_MAIN, smoothstep(.25, 1.1, glow)) * glow * .75 * shadow * strength;
    col += C_HOT * core * smoothstep(.55, .95, clouds) * .18 * shadow * strength;
    vec2 cell = floor(sp);
    float h = hash12(cell);
    float dens = .006 + .05 * band * shadow * (.5 + clouds) * strength;
    col += mix(C_MAIN, C_HOT, hash12(cell + 3.3)) * step(1. - dens, h) * (.25 + .75 * hash12(cell + 7.1)) * (.4 + .4 * strength);
    col += stars(sp, 9., .14 + .14 * band, 3., t, .4 + .2 * band);
    col += stars(sp, 34., .22, 8., t, .75);
    col += stars(sp, 120., .26, 17., t, 1.);
    return col;
  }
  // p and res in CSS px; strength 0..1 scales the glow and the star powder, not the resolved stars' presence.
  vec3 milkyWay(vec2 p, vec2 res, float t, vec2 par, float strength) {
    vec2 sp = milkyWaySpace(p, res, t, par);
    return milkyWayLight(milkyWayField(sp, res, t), sp, t, strength);
  }
`;
