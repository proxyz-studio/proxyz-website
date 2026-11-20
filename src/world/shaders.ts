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
uniform vec3 uLp[${SLOTS}];
uniform vec3 uLd[${SLOTS}];
uniform vec2 uLc[${SLOTS}];
uniform float uLi[${SLOTS}];
uniform float uLk[${SLOTS}];
uniform vec3 uAlb;
uniform float uMap;
uniform sampler2D uCoinMap;
uniform float uRough;
uniform float uMetal;
uniform float uLiveK;
uniform float uTol;
uniform int uPart;
uniform sampler2D uScreen;
uniform float uScreenGain;
uniform vec3 uEye;
uniform float uFg;
uniform vec4 uShade[2];
uniform float uFgH;
uniform float uDepthFar;
uniform float uDbg;
out vec4 o;
${AGX}
const vec3 FILM = vec3(1.0 / 255.0);
// the live light against the picture maker's: matched on the lit floor of scenes 2, 5 and 6 (build 12)
#define LIVE_EXPOSURE ${expo.toFixed(4)}
float unpack(vec4 c) { return dot(c, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
// in sight of the projector: its depth map (the depth of the nearest surface it saw, along its axis, in mm over
// uDepthFar), read at the point's own texel and its four neighbours. The depth map is coarser than the still, so a
// point next to a sharp step (the route's edge on the coin) may read the step's texel: a neighbour that saw the point
// counts too, and the test is soft over one tolerance, so no edge is drawn as a hard staircase or a dark crack.
float dz(sampler2D d, vec2 uv) { return unpack(texture(d, uv)) * uDepthFar; }
float seen(sampler2D d, vec2 uv, float w, vec2 texel) {
  // (uTol: a thing hidden only by itself, a hill of the coin behind another, takes the still's colour there all the
  // same, stretched like a rubber sheet, where a hole lit live would show as a dark crack)
  float tol = 0.8 + 0.006 * w + 2.0 * fwidth(w) + uTol;
  float z0 = dz(d, uv);
  float zn = max(max(dz(d, uv + vec2(texel.x, 0.0)), dz(d, uv - vec2(texel.x, 0.0))), max(dz(d, uv + vec2(0.0, texel.y)), dz(d, uv - vec2(0.0, texel.y))));
  // (nothing there in the still's camera: the map's clear value, past its far end)
  float z = max(z0, zn);
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
vec3 live(vec3 n, vec3 v, vec3 lp, vec3 ld, vec2 lc, float li, float lk, float held) {
  // a thing this still did not hold: the floor under it (it is not there), never the thing lit
  if (held < 0.5) return display(shade(vec3(0.0, 1.0, 0.0), v, vec3(vW.x, 0.0, vW.z), vec3(0.006, 0.006, 0.0058), 0.95, 0.0, lp, ld, lc, li, lk));
  // the coin: its own colours by part (its spools), where no still saw it
  vec3 alb = uMap > 0.5 ? texture(uCoinMap, vL.xz / 130.0 + 0.5).rgb : uAlb;
  return display(shade(n, v, vW, alb, uRough, uMetal, lp, ld, lc, li, lk));
}
vec3 srgbLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
/** scene 2's phone while it lifts: drawn whole by the live light, its screen the menu (the stills' screen light) */
vec3 phoneLive(vec3 n, vec3 v, vec3 lp, vec3 ld, vec2 lc, float li, float lk) {
  vec3 c = shade(n, v, vW, uAlb, uRough, uMetal, lp, ld, lc, li, lk);
  if (uPart == 2) {
    vec2 st = vec2((vL.x + 33.4) / 66.8, (vL.z + 72.4) / 144.8);
    c += srgbLin(texture(uScreen, st).rgb) * uScreenGain;
  }
  return display(c);
}
${[0, 1].map((s) => {
    const p = (k: number) => s * PASSES + k;
    return `vec4 slot${s}(vec3 n, vec3 v) {
  vec3 fb = live(n, v, uLp[${s}], uLd[${s}], uLc[${s}], uLi[${s}], uLk[${s}], uHold[${s}]);
  if (uDbg > 0.5 && uDbg < 1.5) fb = vec3(0.6, 0.0, 0.0) + fb;
  vec3 c = fb;
  float frameY = 0.0, frameW = 0.0, cover = 0.0;
${[0, 1, 2].map((k) => `  if (uNP[${s}] > ${k}) {
    vec4 cl = vC[${p(k)}];
    vec2 uv = cl.xy / cl.w * 0.5 + 0.5;
    float f = uDbg > 1.5 ? 0.0 : inFrame(uv, cl.w);
    // at the still's own camera every point on screen is the still's (no test); away from it, what the still saw
    float vis = uPres[${p(k)}] > 0.5 ? mix(seen(uD${p(k)}, uv, cl.w, uDT[${p(k)}]) * max(smoothstep(-0.02, 0.08, vF[${p(k)}]), step(5.0, uTol)), 1.0, uNear[${p(k)}]) : 1.0;
    vec3 pc = texture(uC${p(k)}, vec2(uv.x, 1.0 - uv.y)).rgb;
    ${k === 0 ? `c = mix(fb, pc, f * vis); frameY = 1.0 - uv.y; frameW = f; vec2 ed = min(uv, 1.0 - uv); cover = clamp(min(ed.x, ed.y) * 12.0, 0.0, 1.0) * step(0.0, cl.w) * vis;` : `c = mix(c, pc, uT[${p(k)}] * oval(uOv[${p(k)}], uv) * f * vis);`}
  }`).join('\n')}
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
    float k = smoothstep(0.0, 0.4, uHold[0] > 0.5 ? w0 : w1);
    w0 = uHold[0] > 0.5 ? k : 1.0 - k; w1 = 1.0 - w0;
  }
  // between two scenes, each point is drawn mostly by the scene whose still saw it (the other one's live light, where
  // its still did not reach, is only a stand in: a washed grey patch where the old scene's spot lit what its still
  // never held)
  vec4 a = uNP[0] > 0 && w0 > 0.0 ? slot0(n, v) : vec4(0.0), b = uNP[1] > 0 && w1 > 0.0 ? slot1(n, v) : vec4(0.0);
  // (not for a thing only one of them holds: that one draws it whole, above)
  if (!held && w0 > 0.0 && w1 > 0.0) {
    float x0 = w0 * mix(0.001, 1.0, a.a), x1 = w1 * mix(0.001, 1.0, b.a);
    w0 = x0 / (x0 + x1); w1 = 1.0 - w0;
  }
  vec3 c = w0 * a.rgb + w1 * b.rgb;
  if (uLiveK > 0.0) c = mix(c, phoneLive(n, v, uLp[0], uLd[0], uLc[0], uLi[0], uLk[0]), uLiveK);
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
  o = vec4(c, 1.0);
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
