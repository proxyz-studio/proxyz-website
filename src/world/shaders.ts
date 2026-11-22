// Build 12: the live film's shaders (WebGL 2).
//
// The world program draws every surface by casting the stills back onto it. For each of up to two scenes on screen
// (a "slot"), and each of that scene's up to three light passes, the vertex shader carries the surface point into the
// still's own camera (the projector); the fragment shader reads the still there, if that point was in sight of the
// camera when the still was drawn (its depth map), and lays the passes over each other as the page lays the
// pictures (pass 1, then each later pass over it at its strength; scene 6's later passes inside a growing oval). A
// thing the still did not hold is drawn as what that still shows behind it, so it is not there. Where no still saw
// the point (outside its frame, or hidden behind something), the surface is lit live by that scene's key light: the
// same light, colours and camera curve as the picture maker, without its shadows. The scene's picture filter and
// fade are applied, and the slots are mixed by their strength, all in the pictures' own colour values, as the page
// mixes pictures.

const SLOTS = 2, PASSES = 3, N = SLOTS * PASSES;
const each = (f: (i: number) => string) => Array.from({ length: N }, (_, i) => f(i)).join('\n');

export const WORLD_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aNor;
uniform mat4 uVP;
uniform mat4 uModel;
uniform mat4 uPM[${N}];
uniform mat4 uMP[${N}];
uniform vec3 uPE[${SLOTS}];
out vec3 vW;
out vec3 vN;
out vec3 vL;
out vec4 vC[${N}];
out float vF[${N}];
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz;
  vN = mat3(uModel) * aNor;
  vL = aPos;
${each((i) => `  vC[${i}] = uPM[${i}] * vec4(aPos, 1.0);
  { vec3 p = (uMP[${i}] * vec4(aPos, 1.0)).xyz; vec3 n = mat3(uMP[${i}]) * aNor; vF[${i}] = dot(normalize(n), normalize(uPE[${Math.floor(i / PASSES)}] - p)); }`)}
  gl_Position = uVP * w;
}`;

const AGX = `
// three.js AgX (r160+), as the stills' picture maker used it
vec3 agxDefaultContrastApprox(vec3 x) {
  vec3 x2 = x * x; vec3 x4 = x2 * x2;
  return + 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}
vec3 agx(vec3 color) {
  const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
  const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
  const mat3 AgXInsetMatrix = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 AgXOutsetMatrix = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  const float AgxMinEv = -12.47393; const float AgxMaxEv = 4.026069;
  color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
  color = AgXInsetMatrix * color;
  color = max(color, 1e-10);
  color = log2(color);
  color = (color - AgxMinEv) / (AgxMaxEv - AgxMinEv);
  color = clamp(color, 0.0, 1.0);
  color = agxDefaultContrastApprox(color);
  color = AgXOutsetMatrix * color;
  color = pow(max(vec3(0.0), color), vec3(2.2));
  color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
  return clamp(color, 0.0, 1.0);
}
// the stills' camera curve after AgX: a gentle S curve (0.35) and a touch of colour (1.08), in display values
vec3 display(vec3 lin) {
  vec3 c = agx(lin);
  vec3 s = mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
  vec3 m = s * s * (3.0 - 2.0 * s);
  s = s + (m - s) * 0.35;
  float L = dot(s, vec3(0.2126, 0.7152, 0.0722));
  return clamp(L + (s - L) * 1.08, 0.0, 1.0);
}`;

export const WORLD_FS = (expo = 1) => `#version 300 es
precision highp float;
precision highp sampler2D;
in vec3 vW;
in vec3 vN;
in vec3 vL;
in vec4 vC[${N}];
in float vF[${N}];
${each((i) => `uniform sampler2D uC${i};\nuniform sampler2D uD${i};`)}
uniform float uT[${N}];
uniform float uPres[${N}];
uniform vec4 uOv[${N}];
uniform vec2 uDT[${N}];
uniform int uNP[${SLOTS}];
uniform float uW[${SLOTS}];
uniform float uNear[${N}];
uniform float uHold[${SLOTS}];
uniform float uHoldOn;
uniform float uSat[${SLOTS}];
uniform vec4 uFade[${SLOTS}];
uniform vec3 uSides[${SLOTS}];
uniform float uPr;
// the canvas in device px (build 12E: the pool's lens falloff)
uniform vec2 uRes;
uniform vec3 uLp[${SLOTS}];
uniform vec3 uLd[${SLOTS}];
uniform vec2 uLc[${SLOTS}];
uniform float uLi[${SLOTS}];
uniform float uLk[${SLOTS}];
// build 12E: each slot's key light may have a black card (a flag) in its path: centre, two half sides (zero: none)
uniform vec3 uLf[${SLOTS * 3}];
uniform vec3 uAlb;
uniform float uMap;
uniform sampler2D uCoinMap;
uniform float uRough;
uniform float uMetal;
uniform float uLiveK;
// build 12H: the slot of scene 2 (its light draws the live phone), and the page its screen shows (0 calm, 1 the page)
uniform int uLiveSlot;
// build 12H: which tile this draw is (-1: not a tile); its four icons, side by side, are then in uCoinMap's unit
uniform float uTile;
uniform float uScrPage;
uniform float uTol;
uniform int uPart;
uniform sampler2D uScreen;
uniform sampler2D uB0;
uniform sampler2D uB1;
uniform float uIsFloor;
uniform float uSolid;
uniform float uScreenGain;
uniform vec3 uEye;
uniform float uFg;
// the copy above the words: how strongly this thing stands in front of them (1 at rest)
uniform float uFgA;
uniform vec4 uShade[2];
uniform float uFgH;
uniform float uDepthFar;
uniform float uDbg;
// build 12G: scene 2's phone, which only some of scene 2's stills hold, is laid over what is drawn behind it by how much
// of it the stills show (see slot*): 1 while it draws, 0 for every other thing
uniform float uMenu;
// build 12G: the stills are read through their smaller copies; this shifts which copy (negative: sharper)
uniform float uBias;
// the floor's light while the camera moves between two scenes: one light travelling from the first scene's key to the
// second's (where it stands, where it aims, its cone and strength), and how far it has come (0: none)
uniform vec3 uMp;
uniform vec3 uMd;
uniform vec2 uMc;
// (its cone for the pool on the empty floor, opened on the way)
uniform vec2 uMw;
uniform float uMi;
uniform float uMove;
// where the travelling light's axis meets the floor (the middle of its pool)
uniform vec3 uPc;
// the two ends of that travel: each scene's key spot (a soft panel never travels: scene 3's spot, not its panel)
uniform vec3 uTp[2];
uniform vec3 uTd[2];
uniform vec2 uTc[2];
uniform float uTi[2];
// scene 2's first still's projector (the glass of the lifted phone reflects what it shows)
uniform mat4 uEnvVP;
out vec4 o;
${AGX}
const vec3 FILM = vec3(1.0 / 255.0);
// the live light against the picture maker's: matched on the lit floor of scenes 2, 5 and 6 (build 12)
#define LIVE_EXPOSURE ${expo.toFixed(4)}
#define POOL_LIN 0.024
float unpack(vec4 c) { return dot(c, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
// in sight of the projector: its depth map (the depth of the nearest surface it saw, along its axis, in mm over
// uDepthFar), read at the point's own texel and its four neighbours. The depth map is coarser than the still, so a
// point next to a sharp step (the route's edge on the coin) may read the step's texel: a neighbour that saw the point
// counts too, and the test is soft over one tolerance, so no edge is drawn as a hard staircase or a dark crack.
float dz(sampler2D d, vec2 uv) { return unpack(texture(d, uv)) * uDepthFar; }
// build 12G: under the floor, the nearest thing the still's camera saw within about a texel (its own texel and its eight
// neighbours): the floor counts as seen only where no thing stood next to it in the still (see seen())
float dzNear(sampler2D d, vec2 uv, vec2 texel) {
  float z = dz(d, uv);
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) if (i != 0 || j != 0) z = min(z, dz(d, uv + vec2(float(i), float(j)) * texel));
  return z;
}
float seen(sampler2D d, vec2 uv, float w, vec2 texel) {
  // (uTol: a thing hidden only by itself, a hill of the coin behind another, takes the still's colour there all the
  // same, stretched like a rubber sheet, where a hole lit live would show as a dark crack)
  // (the floor seen at a glancing angle changes depth fast from pixel to pixel: its share of the tolerance is capped,
  // else the floor far behind a thing passed as seen and took the thing's colours, smeared)
  float tol = 0.8 + 0.006 * w + (uIsFloor > 0.5 ? min(2.0 * fwidth(w), 3.0) : 2.0 * fwidth(w)) + uTol;
  float z0 = dz(d, uv);
  float z;
  if (uIsFloor > 0.5) {
    // build 12G: the floor is seen only where no thing stood within about a texel of it in the still's camera. With its
    // own texel alone (the depth map is coarser than the still, and read texel by texel), a point of the floor just
    // outside a thing's outline in the still took the still's pixel there, which is the thing's own lit rim, drawn on
    // the floor where the camera has moved: a dotted ghost of the thing's outline (scene 2's backboard, Tew's iPhone)
    z = dzNear(d, uv, texel);
  } else {
    float zn = max(max(dz(d, uv + vec2(texel.x, 0.0)), dz(d, uv - vec2(texel.x, 0.0))), max(dz(d, uv + vec2(0.0, texel.y)), dz(d, uv - vec2(0.0, texel.y))));
    // (nothing there in the still's camera: the map's clear value, past its far end)
    z = max(z0, zn);
  }
  if (z > uDepthFar * 0.999) return 1.0;
  return clamp((z + 2.0 * tol - w) / tol, 0.0, 1.0);
}
float inFrame(vec2 uv, float w) {
  vec2 e = min(uv, 1.0 - uv);
  return w > 0.0 ? clamp(min(e.x, e.y) * 400.0 + 0.5, 0.0, 1.0) : 0.0;
}
float oval(vec4 ov, vec2 uv) {
  if (ov.z <= 0.0) return 1.0;
  float d = length((vec2(uv.x, 1.0 - uv.y) - ov.xy) / ov.zw);
  return clamp((1.0 - d) / 0.32, 0.0, 1.0);
}
vec3 sat(vec3 c, float s) {
  // CSS saturate(): the feColorMatrix saturate matrix, on the colour values
  mat3 m = mat3(0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
                0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
                0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s);
  return clamp(m * c, 0.0, 1.0);
}
float fadeOf(vec4 f, float y) {
  // y down the picture (0 top, 1 foot): transparent before f.x, whole from f.y to f.z, transparent at f.w
  if (f.w <= 0.0) return 1.0;
  float a = f.y > f.x ? clamp((y - f.x) / (f.y - f.x), 0.0, 1.0) : 1.0;
  float b = f.w > f.z ? clamp((f.w - y) / (f.w - f.z), 0.0, 1.0) : 1.0;
  return min(a, b);
}
// build 12E: how much of a light passes a black card on its way to P (the scene's flag; 1 with no card), softened at
// the card's edge as a light the size of the stills' spot (20 mm) softens it
float flagPass(vec3 P, vec3 lp, vec3 fc, vec3 fu, vec3 fv) {
  float uu = dot(fu, fu), vv = dot(fv, fv);
  if (uu < 1e-6) return 1.0;
  vec3 n = normalize(cross(fu, fv)), d = lp - P;
  float den = dot(d, n);
  if (abs(den) < 1e-6) return 1.0;
  float t = dot(fc - P, n) / den;
  if (t <= 0.0 || t >= 1.0) return 1.0;
  vec3 X = P + d * t - fc;
  float e = max(abs(dot(X, fu)) / uu, abs(dot(X, fv)) / vv);
  return smoothstep(0.88, 1.0, e);
}
// the live light where no still saw the surface: the scene's key light on this surface (no shadows)
vec3 shade(vec3 n, vec3 v, vec3 P, vec3 alb, float rough, float metal, vec3 lp, vec3 ld, vec2 lc, float li, float lk) {
  vec3 L = lp - P;
  float d = length(L);
  vec3 l = L / d;
  float E;
  if (lk < 0.5) E = li * smoothstep(lc.x, lc.y, dot(-l, ld)) / (d * d);
  else E = li * 1.9;
  float nl = max(dot(n, l), 0.0);
  vec3 h = normalize(l + v);
  float a = rough * rough, a2 = a * a, nh = max(dot(n, h), 0.0), dd = nh * nh * (a2 - 1.0) + 1.0;
  float D = a2 / (3.14159 * dd * dd);
  vec3 F0 = mix(vec3(0.04), alb, metal);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - max(dot(h, v), 0.0), 5.0);
  float k = (rough + 1.0) * (rough + 1.0) / 8.0, nv = max(dot(n, v), 1e-3);
  float G = nl / (nl * (1.0 - k) + k) * nv / (nv * (1.0 - k) + k);
  vec3 spec = D * F * G / max(4.0 * nl * nv, 1e-3);
  vec3 diff = (1.0 - metal) * alb / 3.14159;
  return (diff + spec) * E * nl * LIVE_EXPOSURE;
}
vec3 srgbLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
vec3 live(vec3 n, vec3 v, vec3 lp, vec3 ld, vec2 lc, float li, float lk, float held, vec3 fc, vec3 fu, vec3 fv) {
  // scene 2's phone outside scene 2: not there (the floor under it)
  if (held < 0.5 && uSolid < 0.5) { vec3 F = vec3(vW.x, 0.0, vW.z); return display(shade(vec3(0.0, 1.0, 0.0), v, F, vec3(0.006, 0.006, 0.0058), 0.95, 0.0, lp, ld, lc, li * flagPass(F, lp, fc, fu, fv), lk)); }
  // the coin: its own colours by part (its spools), where no still saw it
  vec3 alb = uMap > 0.5 ? texture(uCoinMap, vL.xz / 130.0 + 0.5).rgb : uAlb;
  // build 12H: a tile's printed icon, a 24 mm square on its face (the face 8 mm up its own axis, its top toward the back)
  if (uTile >= 0.0 && vL.y > 7.6 && abs(vL.x) < 12.0 && abs(vL.z) < 12.0) {
    vec4 ic = texture(uCoinMap, vec2((uTile + (vL.x + 12.0) / 24.0) / 4.0, (vL.z + 12.0) / 24.0));
    alb = mix(alb, srgbLin(ic.rgb) * 0.8, ic.a);
  }
  return display(shade(n, v, vW, alb, uRough, uMetal, lp, ld, lc, li * flagPass(vW, lp, fc, fu, fv), lk));
}
/** scene 2's phone while it lifts: drawn whole by the live light, its screen the menu (the stills' screen light) */
vec3 phoneLive(vec3 n, vec3 v, vec3 lp, vec3 ld, vec2 lc, float li, float lk) {
  vec3 c = shade(n, v, vW, uAlb, uRough, uMetal, lp, ld, lc, li, lk);
  if (uPart >= 1) {
    // the glass reflects the room as the stills light it: scene 2's still, small and soft, looked up along the
    // reflected ray (a picture of the room taken from about where the phone is), stronger at a glancing angle
    vec3 r = reflect(-v, n);
    vec3 env = vec3(0.0);
    if (r.y < -0.01) {
      // where the reflected ray meets the floor: scene 2's first still there (the pool of light, the stand in it), and
      // past that still's frame the pool as scene 2's spot lights the floor (the room behind the camera)
      vec3 F = vW + r * (-vW.y / r.y);
      vec3 pool = srgbLin(display(shade(vec3(0.0, 1.0, 0.0), -r, F, vec3(0.006, 0.006, 0.0058), 0.95, 0.0, lp, ld, lc, li, lk)));
      vec4 cl = uEnvVP * vec4(F, 1.0);
      vec2 uv = cl.xy / max(cl.w, 1e-3) * 0.5 + 0.5, e = min(uv, 1.0 - uv);
      float inside = cl.w > 0.0 ? smoothstep(0.0, 0.06, min(e.x, e.y)) : 0.0;
      // (its base level, as before: read inside a branch that differs from pixel to pixel, where a picture with
      // smaller copies has no defined choice of copy)
      env = mix(pool, srgbLin(textureLod(uC0, vec2(uv.x, 1.0 - uv.y), 0.0).rgb), inside);
    }
    // the spot itself, a small bright disc where the glass mirrors it
    env += vec3(1.0, 0.975, 0.94) * 40.0 * smoothstep(0.99955, 0.99995, dot(r, normalize(lp - vW)));
    float fr = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
    c += env * fr * 2.2;
  }
  if (uPart == 2) {
    vec2 st = vec2(((vL.x + 33.4) / 66.8 + uScrPage) * 0.5, (vL.z + 72.4) / 144.8);
    c += srgbLin(texture(uScreen, st).rgb) * uScreenGain;
  }
  return display(c);
}
${[0, 1].map((s) => {
    const p = (k: number) => s * PASSES + k;
    return `vec4 slot${s}(vec3 n, vec3 v, out float al) {
  vec3 fb = live(n, v, uLp[${s}], uLd[${s}], uLc[${s}], uLi[${s}], uLk[${s}], uHold[${s}], uLf[${s * 3}], uLf[${s * 3 + 1}], uLf[${s * 3 + 2}]);
  // the floor (and the room) where this still did not see it, past its frame or hidden behind a thing: the still
  // itself, softened (its small copy), carried out from its nearest edge, so its light and falloff go on with no seam
  // and no dark gap
  if (uIsFloor > 0.5 && uNP[${s}] > 0 && vC[${p(0)}].w > 0.0) {
    vec2 u0 = vC[${p(0)}].xy / vC[${p(0)}].w * 0.5 + 0.5, bu = clamp(u0, 0.0, 1.0);
    // the farther past the edge, the wider the soft average (an edge carried straight out would streak)
    float r = min(0.3, 0.015 + 1.2 * length(u0 - bu));
    vec3 acc = vec3(0.0);
    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
      vec2 q = clamp(bu + vec2(float(i), float(j)) * r, 0.0, 1.0);
      acc += texture(uB${s}, vec2(q.x, 1.0 - q.y)).rgb;
    }
    // inside its frame, hidden behind a thing: the soft still only just behind the thing's edge (its soft glow, as in
    // the still), the live floor farther behind (else a blurred copy of the thing would show on the floor beyond it)
    // past the frame it gives way to the live floor within a short distance (a still that is all thing at its edge, the
    // close up of the coin, would carry that thing's colours out across the floor)
    // (build 12G: by the same nearest thing as the test of sight, so the floor just outside a thing's outline in the
    // still, hidden now by that thing, is the live floor as the floor farther behind it: by its own texel alone it took
    // the soft copy, a thin pale line round the thing's outline in the still, on the dark floor)
    float far = u0 == bu ? smoothstep(12.0, 50.0, vC[${p(0)}].w - dzNear(uD${p(0)}, bu, uDT[${p(0)}])) : smoothstep(0.0, 0.12, length(u0 - bu));
    fb = mix(acc / 9.0, fb, far);
  }
  if (uDbg > 0.5 && uDbg < 1.5) fb = vec3(0.6, 0.0, 0.0) + fb;
  vec3 c = fb;
  float frameY = 0.0, frameW = 0.0, cover = 0.0;
  // build 12G, scene 2's phone: its colour from the stills that hold it alone, and how much of it they show (premultiplied)
  vec3 mc = vec3(0.0);
  float ma = 0.0;
${[0, 1, 2].map((k) => `  if (uNP[${s}] > ${k}) {
    vec4 cl = vC[${p(k)}];
    vec2 uv = cl.xy / cl.w * 0.5 + 0.5;
    // a still's frame: sharp at its own camera (a rest), feathered while the camera moves (no straight seam)
    vec2 ed = min(uv, 1.0 - uv);
    // (wider on a thing: a still's frame edge crossing a thing that moves through it, the coin in 4 to 5 on a phone,
    // showed as a hard diagonal between the still's light and the live light)
    float soft = cl.w > 0.0 ? smoothstep(0.0, uIsFloor > 0.5 ? 0.07 : 0.22, min(ed.x, ed.y)) : 0.0;
    float f = uDbg > 1.5 ? 0.0 : mix(soft, inFrame(uv, cl.w), uNear[${p(k)}]);
    // at the still's own camera every point on screen is the still's (no test); away from it, what the still saw
    // a thing this still does not hold: if another still of this scene holds it, what lies behind it here (it comes in
    // with that pass); if no still of this scene holds it, the thing itself under this scene's light (in its dark, as
    // a solid thing: never see-through while the camera moves), the still's own pixel only at the still's camera
    float vis = uPres[${p(k)}] > 0.5 ? mix(seen(uD${p(k)}, uv, cl.w, uDT[${p(k)}]) * max(smoothstep(-0.02, 0.08, vF[${p(k)}]), step(5.0, uTol)), 1.0, uNear[${p(k)}]) : uHold[${s}] > 0.5 || uSolid < 0.5 ? 1.0 : uNear[${p(k)}];
    vec3 pc = texture(uC${p(k)}, vec2(uv.x, 1.0 - uv.y), uBias).rgb;
    ${k === 0 ? `c = mix(fb, pc, f * vis); frameY = 1.0 - uv.y; frameW = f; cover = uIsFloor > 0.5 ? 1.0 : soft;
    if (uPres[${p(k)}] > 0.5) { mc = c; ma = 1.0; }` : `float a${k} = uT[${p(k)}] * oval(uOv[${p(k)}], uv);
    c = mix(c, pc, a${k} * f * vis);
    // (a still without the phone lays over it what lay behind it: it fades out; one with it, the phone as it shows it)
    mc *= 1.0 - a${k}; ma *= 1.0 - a${k};
    if (uPres[${p(k)}] > 0.5) { mc += mix(fb, pc, f * vis) * a${k}; ma += a${k}; }`}
  }`).join('\n')}
  // scene 2's phone: drawn only as much as the stills show it, over what is drawn behind it (a still without it once
  // showed what lay behind it at the phone's own place, which is right only at that still's camera: while the camera
  // moved, the lip of the stand and the floor in front of it, carried onto the phone, showed as a notch and a grey wedge)
  if (uMenu > 0.5) { c = ma > 1e-4 ? mc / ma : fb; al = ma; } else al = 1.0;
  c = sat(c, uSat[${s}]);
  float fm = fadeOf(uFade[${s}], frameY);
  c = mix(FILM, c, mix(1.0, fm, frameW));
  // a phone's soft side edges (as the page's mask on the pictures' box: screen px)
  vec3 sd = uSides[${s}];
  if (sd.z > 0.0) { float x = gl_FragCoord.x / uPr; c = mix(FILM, c, clamp((x - sd.x) / sd.z, 0.0, 1.0) * clamp((sd.y - x) / sd.z, 0.0, 1.0)); }
  return vec4(c, cover);
}`;
  }).join('\n')}
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(uEye - vW);
  if (dot(n, v) < 0.0) n = -n;
  // a thing one scene's stills hold and the other's do not is drawn by the scene that holds it, until that scene has
  // nearly gone (no half there thing while the camera moves from one to the other)
  float w0 = uW[0], w1 = uW[1];
  bool held = uHoldOn > 0.5 && uNP[0] > 0 && uNP[1] > 0 && (uHold[0] > 0.5) != (uHold[1] > 0.5);
  if (held) {
    // handed over in the dark: the thing of the scene leaving goes into the dark before the camera is half way, the
    // thing of the scene arriving is lit only after it (never two lit at once: the trophy's coin and scene 4's coin)
    float k = smoothstep(0.46, 0.54, uHold[0] > 0.5 ? w0 : w1);
    w0 = uHold[0] > 0.5 ? k : 1.0 - k; w1 = 1.0 - w0;
  }
  // between two scenes, each point is drawn mostly by the scene whose still saw it (the other one's live light, where
  // its still did not reach, is only a stand in: a washed grey patch where the old scene's spot lit what its still
  // never held)
  float al0 = 0.0, al1 = 0.0;
  vec4 a = uNP[0] > 0 && w0 > 0.0 ? slot0(n, v, al0) : vec4(0.0), b = uNP[1] > 0 && w1 > 0.0 ? slot1(n, v, al1) : vec4(0.0);
  // (not for a thing only one of them holds: that one draws it whole, above)
  if (!held && w0 > 0.0 && w1 > 0.0) {
    float x0 = w0 * mix(0.001, 1.0, a.a), x1 = w1 * mix(0.001, 1.0, b.a);
    // build 12E: not on a thing one scene's flag keeps in the dark (the coin in 4 to 5 and 5 to 6): there the two scenes
    // mix by their strength alone, so the whole thing goes into the dark, or comes out of it, at once (by coverage, the
    // part outside one still's frame stayed lit while the rest went dark: a diagonal across the coin)
    float fl = uIsFloor > 0.5 ? 0.0 : max(1.0 - flagPass(vW, uLp[0], uLf[0], uLf[1], uLf[2]), 1.0 - flagPass(vW, uLp[1], uLf[3], uLf[4], uLf[5]));
    w0 = mix(x0 / (x0 + x1), w0, fl); w1 = 1.0 - w0;
  }
  vec3 c = w0 * a.rgb + w1 * b.rgb;
  // (scene 2's phone: each scene's colour by how much of the phone it shows)
  float ma = uMenu > 0.5 ? w0 * al0 + w1 * al1 : 1.0;
  if (uMenu > 0.5) c = ma > 1e-4 ? (w0 * al0 * a.rgb + w1 * al1 * b.rgb) / ma : c;
  if (uMove > 0.0 && uIsFloor > 0.5 && n.y > 0.9) {
    // the floor between two scenes: the two stills' floors mixed, relit by one light travelling from the first scene's
    // key to the second's, so the pool of light moves across the floor with the camera (never a whole floor brightening
    // at once). At a rest the travelling light is that scene's own: the still, untouched.
    const vec3 FA = vec3(0.006, 0.006, 0.0058);
    vec3 P = vec3(vW.x, 0.0, vW.z);
    float la = dot(display(shade(n, v, P, FA, 0.95, 0.0, uTp[0], uTd[0], uTc[0], uTi[0], 0.0)), vec3(0.2126, 0.7152, 0.0722));
    float lb = dot(display(shade(n, v, P, FA, 0.95, 0.0, uTp[1], uTd[1], uTc[1], uTi[1], 0.0)), vec3(0.2126, 0.7152, 0.0722));
    float lm = dot(display(shade(n, v, P, FA, 0.95, 0.0, uMp, uMd, uMc, uMi, 0.0)), vec3(0.2126, 0.7152, 0.0722));
    float e = 3.0 / 255.0;
    c *= clamp((lm + e) / (w0 * la + w1 * lb + e), 0.0, 3.0);
    // where neither still saw the floor (the empty floor between the race piece and the coin in 3 to 4), the travelling
    // light itself: a pool moving over it, never a black frame. Its shape is the travelling spot's on the floor, its
    // brightness at its middle a still's lit floor (the live light of the low raking spots of scenes 3 and 4 alone is
    // far darker than their stills' floor, which carries the room's bounce)
    float sp = dot(shade(n, v, P, FA, 0.95, 0.0, uMp, uMd, uMw, uMi, 0.0), vec3(0.2126, 0.7152, 0.0722));
    float sc = dot(shade(n, v, uPc, FA, 0.95, 0.0, uMp, uMd, uMw, uMi, 0.0), vec3(0.2126, 0.7152, 0.0722));
    // (a pool, not a wash: it fades out within about 40 cm of its middle)
    float near = 1.0 - smoothstep(120.0, 420.0, length(P.xz - uPc.xz));
    // build 12E: the same dark floor as the stills', never a flat grey card (a phone close to the floor in 3 to 4 sees
    // only the pool): the lens falloff, darker toward the frame's edges; the floor's own faint mottle (the stills' floor
    // texture, a few percent, fixed to the floor); and its grain, fixed to the floor at about a screen pixel
    vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * length(uRes));
    float lens = 1.0 - 0.7 * pow(min(length(q), 1.2), 2.0);
    vec2 m = P.xz / 38.0, mi = floor(m), mf = fract(m);
    mf = mf * mf * (3.0 - 2.0 * mf);
    float mot = mix(mix(hash(mi), hash(mi + vec2(1.0, 0.0)), mf.x), mix(hash(mi + vec2(0.0, 1.0)), hash(mi + vec2(1.0, 1.0)), mf.x), mf.y);
    vec3 pool = display(vec3(POOL_LIN * near * lens * (0.82 + 0.36 * mot) * clamp(sp / max(sc, 1e-12), 0.0, 1.5)));
    float cell = exp2(ceil(log2(max(max(fwidth(P.x), fwidth(P.z)), 0.05))));
    float gr = (hash(floor(P.xz / cell)) + hash(floor(P.xz / cell) + 17.31) - 1.0) * 3.2 / 255.0 * smoothstep(0.0, 0.03, pool.g);
    c = max(c, pool + gr);
  }
  if (uMove > 0.0 && uIsFloor < 0.5) {
    // build 12F: a thing a flag keeps in the dark (the coin, by scene 5's card) is never darker than the floor it stands
    // on while the camera moves: the travelling light that lights the floor's pool at its base lights it too, at the same
    // time and as strongly (its own colours and shading, at least the floor's light there, at most four times it), so it
    // rises out of the dark with the floor round it, in 5 to 6 and back in 6 to 5. Only while the scene whose card it is
    // leaves for the next one (the first of the two scenes drawn, slot 0, in both directions): in 4 to 5 the coin still
    // falls into the card's shadow as scene 5's light takes over (as 12E judged right)
    float fk = 1.0 - flagPass(vW, uLp[0], uLf[0], uLf[1], uLf[2]);
    if (fk > 0.0) {
      const vec3 FA = vec3(0.006, 0.006, 0.0058);
      vec3 B = vec3(vW.x, 0.0, vW.z), up = vec3(0.0, 1.0, 0.0);
      float near = 1.0 - smoothstep(120.0, 420.0, length(B.xz - uPc.xz));
      vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * length(uRes));
      float lens = 1.0 - 0.7 * pow(min(length(q), 1.2), 2.0);
      float sb = dot(shade(up, v, B, FA, 0.95, 0.0, uMp, uMd, uMw, uMi, 0.0), vec3(0.2126, 0.7152, 0.0722));
      float sc = dot(shade(up, v, uPc, FA, 0.95, 0.0, uMp, uMd, uMw, uMi, 0.0), vec3(0.2126, 0.7152, 0.0722));
      // the floor's light at the base, as the floor's pool draws it
      float base = POOL_LIN * near * lens * clamp(sb / max(sc, 1e-12), 0.0, 1.5);
      // the thing under the same light, against the floor under it
      vec3 alb = uMap > 0.5 ? texture(uCoinMap, vL.xz / 130.0 + 0.5).rgb : uAlb;
      vec3 sh = shade(n, v, vW, alb, uRough, uMetal, uMp, uMd, uMw, uMi, 0.0);
      float shl = dot(sh, vec3(0.2126, 0.7152, 0.0722));
      vec3 tint = shl > 1e-12 ? sh / shl : vec3(1.0);
      float r = clamp(shl / max(sb, 1e-12), 1.0, 4.0);
      c = mix(c, max(c, display(base * r * tint)), fk);
    }
  }
  if (uLiveK > 0.0) { c = mix(c, phoneLive(n, v, uLp[uLiveSlot], uLd[uLiveSlot], uLc[uLiveSlot], uLi[uLiveSlot], uLk[uLiveSlot]), uLiveK); ma = mix(ma, 1.0, uLiveK); }
  if (uFg > 0.5) {
    // the copy above the words: the scenes' dark band at the foot, which the page lays over the live picture under it
    float y = gl_FragCoord.y / uFgH, keep = 1.0;
    for (int i = 0; i < 2; i++) {
      vec4 sh = uShade[i];
      float a = y < sh.y ? mix(0.88, sh.w, y / sh.y) : mix(sh.w, 0.0, clamp((y - sh.y) / (sh.z - sh.y), 0.0, 1.0));
      keep *= 1.0 - sh.x * a;
    }
    c = mix(FILM, c, keep);
  }
  // (the copy above the words, premultiplied: a thing only scene 6's words stand behind comes in front as scene 6 comes in)
  // (scene 2's phone is laid over what is behind it, premultiplied: 1 for every other thing)
  o = uFg > 0.5 ? vec4(c * uFgA * ma, uFgA * ma) : vec4(c * ma, ma);
}`;

/** the depth of each surface along the projector's axis, packed into 8 bit colour (works on every phone) */
export const DEPTH_VS = `#version 300 es
precision highp float;
in vec3 aPos;
uniform mat4 uPM;
out float vZ;
void main() { vec4 c = uPM * vec4(aPos, 1.0); vZ = c.w; gl_Position = c; }`;
export const DEPTH_FS = `#version 300 es
precision highp float;
in float vZ;
uniform float uDepthFar;
out vec4 o;
void main() {
  float d = clamp(vZ / uDepthFar, 0.0, 0.9999999);
  vec4 e = fract(d * vec4(1.0, 255.0, 65025.0, 16581375.0));
  e -= e.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
  o = e;
}`;
export { SLOTS, PASSES, N as UNITS };
