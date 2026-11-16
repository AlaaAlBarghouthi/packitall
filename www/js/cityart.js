// City art kit: procedural textures, multi-material builder, facade parts and all buildings.
import * as THREE from './lib/three.module.min.js';

// ---------------------------------------------------------------- textures
function canvasTex(size, draw, repeat = true) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function noise(g, s, n, a, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${rnd() * a})`;
    g.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 2, 1 + rnd() * 2);
  }
}

export const TEX = {};
function makeTextures() {
  TEX.plaster = canvasTex(128, (g, s) => { g.fillStyle = '#f4f1ec'; g.fillRect(0, 0, s, s); noise(g, s, 900, 0.18, false); noise(g, s, 500, 0.5); });
  TEX.brick = canvasTex(256, (g, s) => {
    g.fillStyle = '#e9e2dc'; g.fillRect(0, 0, s, s);
    const bw = 64, bh = 28;
    for (let r = 0; r < s / bh + 1; r++) for (let c = -1; c < s / bw + 1; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0), y = r * bh;
      const l = 225 + rnd() * 30; g.fillStyle = `rgb(${l},${l - 4},${l - 8})`;
      g.beginPath(); g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 4); g.fill();
    }
    noise(g, s, 800, 0.12, false);
  });
  TEX.roof = canvasTex(256, (g, s) => {
    g.fillStyle = '#d8d0cc'; g.fillRect(0, 0, s, s);
    const tw = 42, th = 32;
    for (let r = 0; r < s / th + 1; r++) for (let c = -1; c < s / tw + 1; c++) {
      const x = c * tw + (r % 2 ? tw / 2 : 0), y = r * th;
      const grd = g.createLinearGradient(0, y, 0, y + th);
      grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.75, '#efe9e6'); grd.addColorStop(1, '#a99f9b');
      g.fillStyle = grd; g.beginPath();
      g.moveTo(x + 1, y); g.lineTo(x + tw - 1, y); g.lineTo(x + tw - 1, y + th * 0.6);
      g.quadraticCurveTo(x + tw / 2, y + th + 6, x + 1, y + th * 0.6); g.closePath(); g.fill();
    }
  });
  TEX.wood = canvasTex(128, (g, s) => {
    g.fillStyle = '#efe6dc'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(120,80,40,.18)'; g.fillRect(0, i * 16, s, 2); }
    for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(120,80,40,.08)'; g.beginPath(); const y = rnd() * s; g.moveTo(0, y); g.bezierCurveTo(s / 3, y + 4, s / 2, y - 4, s, y + 2); g.stroke(); }
  });
  TEX.paving = canvasTex(128, (g, s) => {
    g.fillStyle = '#cfc8bf'; g.fillRect(0, 0, s, s);
    const n = 4, w = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = 228 + rnd() * 20; g.fillStyle = `rgb(${l},${l - 3},${l - 8})`;
      g.beginPath(); g.roundRect(i * w + 2, j * w + 2, w - 4, w - 4, 5); g.fill();
    }
    noise(g, s, 300, 0.1, false);
  });
  TEX.asphalt = canvasTex(128, (g, s) => { g.fillStyle = '#80838f'; g.fillRect(0, 0, s, s); noise(g, s, 1400, 0.15, false); noise(g, s, 700, 0.15); });
  TEX.grass = canvasTex(256, (g, s) => {
    g.fillStyle = '#d9f0c4'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1800; i++) { const l = rnd(); g.fillStyle = l < .5 ? 'rgba(80,140,40,.12)' : 'rgba(255,255,220,.25)'; g.fillRect(rnd() * s, rnd() * s, 2, 3 + rnd() * 3); }
  });
  TEX.stone = canvasTex(256, (g, s) => {
    g.fillStyle = '#b9b2aa'; g.fillRect(0, 0, s, s);
    let y = 0; while (y < s) { const h = 26 + rnd() * 18; let x = -rnd() * 40; while (x < s) { const w = 34 + rnd() * 40; const l = 205 + rnd() * 40; g.fillStyle = `rgb(${l},${l - 5},${l - 12})`; g.beginPath(); g.roundRect(x + 3, y + 3, w - 6, h - 6, 8); g.fill(); x += w; } y += h; }
  });
  TEX.water = canvasTex(256, (g, s) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(150,220,255,${0.25 + rnd() * 0.35})`; g.lineWidth = 2 + rnd() * 2; g.beginPath(); const x = rnd() * s, y = rnd() * s, w = 14 + rnd() * 30; g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 5, x + w, y); g.stroke(); }
  });
  TEX.blob = canvasTex(128, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(20,30,10,.55)'); grd.addColorStop(0.55, 'rgba(20,30,10,.28)'); grd.addColorStop(1, 'rgba(20,30,10,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }, false);
  TEX.foam = canvasTex(256, (g, s) => {
    const grd = g.createLinearGradient(0, 0, 0, s); grd.addColorStop(0, 'rgba(255,255,255,0.95)'); grd.addColorStop(0.35, 'rgba(210,245,255,0.6)'); grd.addColorStop(1, 'rgba(160,230,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  });
}

// texture world-size (units per texture repeat) per material
const UVSCALE = { base: 0, wall: 1 / 1.6, brick: 1 / 1.4, roof: 1 / 1.3, wood: 1 / 1.2, paving: 1 / 1.6, asphalt: 1 / 6, grass: 1 / 4, stone: 1 / 2.2, glass: 0, lit: 0, water: 0 };

export const MAT = {};
function makeMaterials() {
  makeTextures();
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.75, metalness: 0 }, o));
  MAT.base = std({ roughness: 0.55 });
  MAT.wall = std({ map: TEX.plaster, roughness: 0.9 });
  MAT.brick = std({ map: TEX.brick, roughness: 0.9 });
  MAT.roof = std({ map: TEX.roof, roughness: 0.7 });
  MAT.wood = std({ map: TEX.wood, roughness: 0.8 });
  MAT.paving = std({ map: TEX.paving, roughness: 0.95 });
  MAT.asphalt = std({ map: TEX.asphalt, roughness: 0.95 });
  MAT.grass = std({ map: TEX.grass, roughness: 1 });
  MAT.stone = std({ map: TEX.stone, roughness: 0.95 });
  MAT.glass = std({ roughness: 0.15, metalness: 0.1, emissive: new THREE.Color('#2f6f9a'), emissiveIntensity: 0.35 });
  MAT.lit = std({ roughness: 0.2, emissive: new THREE.Color('#ffb84a'), emissiveIntensity: 0.55 });
  MAT.clearglass = new THREE.MeshStandardMaterial({ color: 0xcff4ff, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.38, depthWrite: false });
}
const MAT_ORDER = ['base', 'wall', 'brick', 'roof', 'wood', 'paving', 'asphalt', 'grass', 'stone', 'glass', 'lit'];
export function ensureArt() { if (!MAT.base) makeMaterials(); return MAT; }

// ---------------------------------------------------------------- builder with material groups + transform stack
const _c = new THREE.Color();
const geoCache = new Map();
function cached(key, mk) { let g = geoCache.get(key); if (!g) { g = mk(); geoCache.set(key, g); } return g; }

function roundedBoxGeo(w, h, d, r, seg = 2) {
  r = Math.min(r, w / 2 - 0.001, d / 2 - 0.001, h / 2 - 0.001);
  const key = `rb${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}_${r.toFixed(3)}_${seg}`;
  return cached(key, () => {
    const sw = w - 2 * r, sd = d - 2 * r, cr = Math.min(r, sw / 2, sd / 2) * 0.999;
    const s = new THREE.Shape();
    const x = -sw / 2, y = -sd / 2;
    if (cr > 0.001) {
      s.moveTo(x + cr, y); s.lineTo(x + sw - cr, y); s.quadraticCurveTo(x + sw, y, x + sw, y + cr);
      s.lineTo(x + sw, y + sd - cr); s.quadraticCurveTo(x + sw, y + sd, x + sw - cr, y + sd);
      s.lineTo(x + cr, y + sd); s.quadraticCurveTo(x, y + sd, x, y + sd - cr); s.lineTo(x, y + cr); s.quadraticCurveTo(x, y, x + cr, y);
    } else { s.moveTo(x, y); s.lineTo(x + sw, y); s.lineTo(x + sw, y + sd); s.lineTo(x, y + sd); s.lineTo(x, y); }
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, h - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg, curveSegments: 3 });
    g.rotateX(-Math.PI / 2); g.translate(0, -(h - 2 * r) / 2, 0);
    return g;
  });
}

export class K {
  constructor() { this.parts = []; this.stack = [new THREE.Matrix4()]; }
  push(p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
    this.stack.push(this.stack[this.stack.length - 1].clone().multiply(m)); return this;
  }
  pop() { this.stack.pop(); return this; }
  add(geo, color, mat = 'base', p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
    this.parts.push({ geo, color: new THREE.Color(color), mat, m: this.stack[this.stack.length - 1].clone().multiply(m) });
    return this;
  }
  box(w, h, d, c, mat, p, r) { return this.add(cached(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d)), c, mat, p, r); }
  rbox(w, h, d, rad, c, mat, p, r) { return this.add(roundedBoxGeo(w, h, d, rad), c, mat, p, r); }
  cyl(rt, rb, h, c, mat, p, r, seg = 16) { return this.add(cached(`c${rt}_${rb}_${h}_${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)), c, mat, p, r); }
  sph(rad, c, mat, p, s = [1, 1, 1], seg = 12) { return this.add(cached(`s${rad}_${seg}`, () => new THREE.SphereGeometry(rad, seg, Math.max(6, (seg * 0.7) | 0))), c, mat, p, [0, 0, 0], s); }
  ico(rad, c, mat, p, s = [1, 1, 1], det = 1) { return this.add(cached(`i${rad}_${det}`, () => new THREE.IcosahedronGeometry(rad, det)), c, mat, p, [0, 0, 0], s); }
  cone(rad, h, c, mat, p, r, seg = 16) { return this.add(cached(`k${rad}_${h}_${seg}`, () => new THREE.ConeGeometry(rad, h, seg)), c, mat, p, r); }
  tor(R, t, c, mat, p, r, arc = Math.PI * 2, seg = 24) { return this.add(cached(`t${R}_${t}_${arc}_${seg}`, () => new THREE.TorusGeometry(R, t, 8, seg, arc)), c, mat, p, r); }
  prism(w, h, d, c, mat, p, r) { // triangular prism (gable), ridge along x
    return this.add(cached(`p${w}_${h}_${d}`, () => {
      const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0);
      const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(-w / 2, 0, 0); return g;
    }), c, mat, p, r);
  }

  build() {
    const groups = {};
    for (const pt of this.parts) {
      const g = pt.geo.index ? pt.geo.toNonIndexed() : pt.geo.clone();
      g.applyMatrix4(pt.m);
      const P = g.attributes.position.array, N = g.attributes.normal.array;
      const G = groups[pt.mat] || (groups[pt.mat] = { p: [], n: [], c: [], uv: [] });
      const sc = UVSCALE[pt.mat] || 0;
      for (let i = 0; i < P.length; i += 3) {
        const x = P[i], y = P[i + 1], z = P[i + 2], nx = Math.abs(N[i]), ny = Math.abs(N[i + 1]), nz = Math.abs(N[i + 2]);
        G.p.push(x, y, z); G.n.push(N[i], N[i + 1], N[i + 2]); G.c.push(pt.color.r, pt.color.g, pt.color.b);
        if (ny >= nx && ny >= nz) G.uv.push(x * sc, z * sc); else if (nx >= nz) G.uv.push(z * sc, y * sc); else G.uv.push(x * sc, y * sc);
      }
      g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    const keys = MAT_ORDER.filter((k) => groups[k]);
    const total = keys.reduce((a, k) => a + groups[k].p.length / 3, 0);
    const P = new Float32Array(total * 3), N = new Float32Array(total * 3), C = new Float32Array(total * 3), U = new Float32Array(total * 2), mats = [];
    let start = 0;
    keys.forEach((k) => {
      const G = groups[k], cnt = G.p.length / 3;
      P.set(G.p, start * 3); N.set(G.n, start * 3); C.set(G.c, start * 3); U.set(G.uv, start * 2);
      geo.addGroup(start, cnt, mats.length); mats.push(MAT[k]); start += cnt;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    geo.computeBoundingBox(); geo.computeBoundingSphere();
    return { geo, mats };
  }
}

// ---------------------------------------------------------------- palette
const P = {
  cream: '#fff1dc', cream2: '#ffe2c2', white: '#ffffff', trim: '#fffaf2', terracotta: '#e3573f', tile2: '#d0453a',
  navy: '#3d5fd6', purple: '#a869f2', pink: '#ff8fbf', hot: '#ff5c9e', mint: '#7fe0c0', yellow: '#ffd23f', gold: '#f2b631',
  door: '#8b5a36', doorDark: '#6b4128', glassBlue: '#9fd8ff', lit: '#ffe39a', leaf: '#5cc85a', leaf2: '#3fae4f', leaf3: '#7ed957',
  blossom: '#ffa8d2', blossom2: '#ff8cc3', trunk: '#9a6233', stone: '#d9d2c8', dark: '#3b3446', shutter: '#5ea6e8', shutterG: '#56b870',
  brickRed: '#e48a6d', brickSand: '#f0c89a', choco: '#8a5232', sky: '#bfe8ff',
};
const FLOWERS = ['#ff6fae', '#ffd23f', '#ffffff', '#b98cff', '#ff8a5c'];

// ---------------------------------------------------------------- facade parts (drawn on a wall facing +z at given push())
// window centred at (x,y) on plane z=0, protruding +z
function win(k, x, y, w = 0.7, h = 0.85, o = {}) {
  const fr = o.frame || P.trim, lit = o.lit !== false;
  k.rbox(w + 0.16, h + 0.16, 0.08, 0.03, fr, 'base', [x, y, 0.03]);
  k.box(w, h, 0.04, lit ? P.lit : P.glassBlue, lit ? 'lit' : 'glass', [x, y, 0.06]);
  if (!o.noCross) { k.box(0.05, h, 0.06, fr, 'base', [x, y, 0.08]); k.box(w, 0.05, 0.06, fr, 'base', [x, y + h * 0.1, 0.08]); }
  k.rbox(w + 0.3, 0.07, 0.2, 0.02, fr, 'base', [x, y - h / 2 - 0.1, 0.1]); // sill
  if (o.shutter) {
    k.rbox(w * 0.42, h + 0.08, 0.05, 0.015, o.shutter, 'wood', [x - w / 2 - w * 0.26, y, 0.05]);
    k.rbox(w * 0.42, h + 0.08, 0.05, 0.015, o.shutter, 'wood', [x + w / 2 + w * 0.26, y, 0.05]);
  }
  if (o.flowers) {
    k.rbox(w + 0.1, 0.18, 0.22, 0.03, o.box || P.door, 'wood', [x, y - h / 2 - 0.2, 0.2]);
    for (let i = 0; i < 5; i++) k.sph(0.08, FLOWERS[(i + (x * 10 | 0)) % FLOWERS.length], 'base', [x - w / 2 + 0.05 + i * (w / 4.4), y - h / 2 - 0.07, 0.22], [1, 1, 1], 6);
    for (let i = 0; i < 4; i++) k.sph(0.09, P.leaf, 'base', [x - w / 2 + 0.15 + i * (w / 3.6), y - h / 2 - 0.1, 0.17], [1, 0.8, 1], 6);
  }
  if (o.arch) k.cyl(w / 2 + 0.08, w / 2 + 0.08, 0.08, fr, 'base', [x, y + h / 2, 0.03], [Math.PI / 2, 0, 0], 16);
}
function shopWin(k, x, y, w, h, frame) {
  k.rbox(w + 0.14, h + 0.14, 0.1, 0.03, frame, 'base', [x, y, 0.04]);
  k.box(w, h, 0.05, P.lit, 'lit', [x, y, 0.08]);
  for (let i = 1; i < 3; i++) k.box(0.05, h, 0.07, frame, 'base', [x - w / 2 + i * w / 3, y, 0.1]);
}
function door(k, x, w = 0.75, h = 1.15, o = {}) {
  const c = o.color || P.door, yb = o.yb ?? 0.2;
  k.push([0, yb, 0]);
  k.rbox(w + 0.18, h + 0.12, 0.1, 0.03, o.frame || P.trim, 'base', [x, h / 2 + 0.02, 0.03]);
  k.box(w, h, 0.06, c, 'wood', [x, h / 2, 0.07]);
  if (o.glass) k.box(w * 0.6, h * 0.35, 0.03, P.lit, 'lit', [x, h * 0.68, 0.11]);
  else { k.box(w * 0.32, h * 0.32, 0.03, P.lit, 'lit', [x - w * 0.2, h * 0.7, 0.11]); k.box(w * 0.32, h * 0.32, 0.03, P.lit, 'lit', [x + w * 0.2, h * 0.7, 0.11]); }
  k.sph(0.04, P.gold, 'base', [x + w * 0.35, h * 0.47, 0.12], [1, 1, 1], 6);
  k.pop();
  k.rbox(w + 0.5, yb + 0.02, 0.6, 0.03, P.stone, 'paving', [x, (yb + 0.02) / 2, 0.3]); // step
}
// scalloped striped awning
function awning(k, x, y, w, c1, c2, depth = 0.75) {
  const n = Math.max(4, Math.round(w / 0.32));
  const sw = w / n, ang = 0.42;
  for (let i = 0; i < n; i++) {
    const cx = x - w / 2 + sw * (i + 0.5), col = i % 2 ? c1 : c2;
    k.box(sw, 0.05, depth, col, 'base', [cx, y, depth / 2 * Math.cos(ang)], [ang, 0, 0]);
    k.add(cached('scal', () => new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, Math.PI * 1.5, Math.PI)), col, 'base', [cx, y - depth / 2 * Math.sin(ang), depth * Math.cos(ang)], [Math.PI / 2, 0, 0], [sw / 2, 0.05, sw / 2]);
  }
  k.box(w, 0.08, 0.08, c1, 'base', [x, y + 0.02, 0.02]);
}
function sign(k, x, y, w, h, bg, fg) {
  k.rbox(w, h, 0.12, 0.05, bg, 'base', [x, y, 0.08]);
  k.rbox(w - 0.16, h - 0.14, 0.13, 0.04, fg, 'base', [x, y, 0.09]);
}
function cornice(k, w, d, y, c, t = 0.14) { k.rbox(w + 0.24, t, d + 0.24, 0.04, c, 'base', [0, y, 0]); }

// Roofs (centered at origin, base at y)
function gableRoof(k, w, d, y, h, col, trimC = P.trim) {
  const over = 0.3, L = Math.hypot(d / 2 + over, h), ang = Math.atan2(h, d / 2 + over);
  k.prism(w - 0.02, h, d, P.cream, 'wall', [0, y, 0]);
  for (const sgn of [1, -1]) {
    k.push([0, y + h / 2 + 0.06, sgn * (d / 2 + over) / 2], [sgn * ang, 0, 0]);
    k.rbox(w + over * 2, 0.16, L, 0.05, col, 'roof', [0, 0, sgn * 0.0]);
    k.pop();
  }
  k.cyl(0.11, 0.11, w + over * 2, col, 'base', [0, y + h + 0.03, 0], [0, 0, Math.PI / 2], 8);
  void trimC;
}
function hipRoof(k, w, d, y, h, col) {
  k.add(cached(`hip${h}`, () => { const g = new THREE.ConeGeometry(1, h, 4, 1); g.rotateY(Math.PI / 4); return g; }), col, 'roof', [0, y + h / 2, 0], [0, 0, 0], [(w + 0.6) / 1.4142, 1, (d + 0.6) / 1.4142]);
  k.rbox(w + 0.5, 0.12, d + 0.5, 0.04, P.trim, 'base', [0, y + 0.02, 0]);
}
function flatRoof(k, w, d, y, col) {
  k.rbox(w + 0.2, 0.18, d + 0.2, 0.05, col, 'base', [0, y + 0.09, 0]);
  k.box(w - 0.2, 0.06, d - 0.2, '#d8d4dc', 'base', [0, y + 0.17, 0]);
}
function chimney(k, x, y, z, h = 0.9) { k.rbox(0.42, h, 0.42, 0.04, P.brickRed, 'brick', [x, y + h / 2, z]); k.rbox(0.52, 0.1, 0.52, 0.03, P.stone, 'base', [x, y + h, z]); }
function wallBox(k, w, h, d, col, mat, y0) { k.rbox(w, h, d, 0.06, col, mat, [0, y0 + h / 2, 0]); }
function base(k, w, d) { k.rbox(w + 0.3, 0.22, d + 0.3, 0.05, P.stone, 'stone', [0, 0.11, 0]); }

// faces helper: apply fn on 4 sides; fn(k, faceWidth, isFront)
function faces(k, w, d, fn, which = 'fr') {
  if (which.includes('f')) { k.push([0, 0, d / 2]); fn(k, w, 'f'); k.pop(); }
  if (which.includes('r')) { k.push([w / 2, 0, 0], [0, Math.PI / 2, 0]); fn(k, d, 'r'); k.pop(); }
  if (which.includes('l')) { k.push([-w / 2, 0, 0], [0, -Math.PI / 2, 0]); fn(k, d, 'l'); k.pop(); }
  if (which.includes('b')) { k.push([0, 0, -d / 2], [0, Math.PI, 0]); fn(k, w, 'b'); k.pop(); }
}
function rowWindows(k, fw, y, n, o) { for (let i = 0; i < n; i++) win(k, -fw / 2 + fw / n * (i + 0.5), y, o.w || 0.62, o.h || 0.8, o); }

// ---------------------------------------------------------------- props
export function tree(k, x, z, s = 1, kind = 'green') {
  if (kind === 'palm') {
    for (let i = 0; i < 6; i++) k.cyl(0.11 * s - i * 0.006, 0.12 * s - i * 0.006, 0.42 * s, '#b98a52', 'base', [x + i * 0.04 * s, 0.21 * s + i * 0.4 * s, z], [0, 0, -0.08], 8);
    const top = [x + 0.25 * s, 2.5 * s, z];
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; k.push(top, [0, a, 0]); k.add(cached('leaf', () => { const g = new THREE.SphereGeometry(0.5, 8, 5); g.scale(1.9, 0.22, 0.55); g.translate(0.85, -0.25, 0); return g; }), i % 2 ? P.leaf : P.leaf2, 'base', [0, 0, 0], [0, 0, -0.35 * s]); k.pop(); }
    k.sph(0.12 * s, '#8a5a2a', 'base', [top[0], top[1] - 0.1, top[2] + 0.1], [1, 1, 1], 6);
    return;
  }
  const trunkH = 0.9 * s;
  k.cyl(0.1 * s, 0.15 * s, trunkH, P.trunk, 'base', [x, trunkH / 2, z], [0, 0, 0], 7);
  const cols = kind === 'pink' ? [P.blossom, P.blossom2, '#ffc2e0'] : kind === 'cone' ? [P.leaf2, P.leaf, P.leaf2] : [P.leaf, P.leaf2, P.leaf3];
  if (kind === 'cone') {
    for (let i = 0; i < 3; i++) k.cone((0.75 - i * 0.18) * s, 0.9 * s, cols[i], 'base', [x, trunkH + (0.25 + i * 0.5) * s, z], [0, 0, 0], 9);
    return;
  }
  const blobs = [[0, 0.55, 0, 0.62], [0.35, 0.35, 0.15, 0.45], [-0.32, 0.4, -0.12, 0.48], [0.05, 0.95, -0.05, 0.45], [-0.1, 0.3, 0.35, 0.4]];
  blobs.forEach(([bx, by, bz, r], i) => k.ico(r * s, cols[i % 3], 'base', [x + bx * s, trunkH + by * s, z + bz * s], [1, 0.92, 1], 1));
}
export function bush(k, x, z, s = 1, flowers = true, seedN = 0) {
  k.ico(0.32 * s, P.leaf2, 'base', [x, 0.22 * s, z], [1.25, 0.8, 1], 1);
  k.ico(0.24 * s, P.leaf, 'base', [x + 0.2 * s, 0.26 * s, z + 0.08 * s], [1, 0.85, 1], 1);
  if (flowers) for (let i = 0; i < 5; i++) { const a = i * 1.3 + seedN; k.sph(0.06 * s, FLOWERS[(i + seedN) % 5], 'base', [x + Math.cos(a) * 0.25 * s, 0.4 * s + (i % 2) * 0.05, z + Math.sin(a) * 0.2 * s], [1, 1, 1], 5); }
}
export function hedge(k, x, z, len, rotY = 0) {
  k.push([x, 0, z], [0, rotY, 0]);
  k.rbox(len, 0.42, 0.38, 0.14, P.leaf2, 'base', [0, 0.21, 0]);
  k.pop();
}
export function lamp(k, x, z, s = 1) {
  k.cyl(0.05 * s, 0.07 * s, 2.0 * s, P.dark, 'base', [x, 1.0 * s, z], [0, 0, 0], 8);
  k.cyl(0.14 * s, 0.16 * s, 0.14 * s, P.dark, 'base', [x, 0.07 * s, z], [0, 0, 0], 8);
  k.sph(0.17 * s, '#fff2b8', 'lit', [x, 2.12 * s, z], [1, 1.15, 1], 10);
  k.cone(0.22 * s, 0.18 * s, P.dark, 'base', [x, 2.36 * s, z], [0, 0, 0], 8);
}
export function bench(k, x, z, rotY = 0) {
  k.push([x, 0, z], [0, rotY, 0]);
  for (let i = 0; i < 3; i++) k.box(1.2, 0.05, 0.12, '#c98a4f', 'wood', [0, 0.42, -0.14 + i * 0.14]);
  for (let i = 0; i < 2; i++) k.box(1.2, 0.1, 0.05, '#c98a4f', 'wood', [0, 0.6 + i * 0.14, -0.24], [-0.15, 0, 0]);
  for (const sx of [-0.5, 0.5]) { k.box(0.06, 0.42, 0.4, P.dark, 'base', [sx, 0.21, 0]); }
  k.pop();
}
function umbrellaTable(k, x, z, c) {
  k.cyl(0.32, 0.32, 0.05, P.white, 'base', [x, 0.55, z], [0, 0, 0], 14); k.cyl(0.03, 0.03, 1.4, P.white, 'base', [x, 0.7, z], [0, 0, 0], 6);
  k.cone(0.65, 0.3, c, 'base', [x, 1.45, z], [0, 0, 0], 8);
  for (const a of [0, Math.PI]) k.box(0.22, 0.04, 0.22, P.white, 'base', [x + Math.cos(a) * 0.48, 0.32, z + Math.sin(a) * 0.48]);
}
function flowerBed(k, x, z, w, d, seedN = 0) {
  k.rbox(w, 0.16, d, 0.05, '#8a5a3a', 'base', [x, 0.08, z]);
  const n = Math.max(3, Math.round(w * d * 6));
  for (let i = 0; i < n; i++) { const fx = x + (((i * 37 + seedN * 13) % 100) / 100 - 0.5) * (w - 0.15), fz = z + (((i * 61 + seedN * 7) % 100) / 100 - 0.5) * (d - 0.15); k.sph(0.07, i % 3 ? FLOWERS[(i + seedN) % 5] : P.leaf, 'base', [fx, 0.2, fz], [1, 1, 1], 5); }
}

// ---------------------------------------------------------------- BUILDINGS
// Each returns a K. Front faces +z. Footprint ≤ ~4.6 x 4.2. Ground at y=0.
const B = {};

B.house = (lv) => {
  const k = new K(), w = 3.2, d = 2.7, fh = 1.45, floors = lv >= 2 ? 2 : 1;
  base(k, w, d);
  wallBox(k, w, fh * floors, d, P.cream, 'wall', 0.2);
  cornice(k, w, d, 0.2 + fh * floors, P.trim, 0.12);
  faces(k, w, d, (k, fw, side) => {
    if (side === 'f') {
      door(k, 0, 0.72, 1.12);
      k.push([0, 0.2 + 1.45, 0.05]); awning(k, 0, 0, 1.1, P.terracotta, P.white, 0.5); k.pop();
      win(k, -1.0, 0.2 + 0.85, 0.58, 0.7, { shutter: P.shutter, flowers: true });
      win(k, 1.0, 0.2 + 0.85, 0.58, 0.7, { shutter: P.shutter, flowers: true });
      if (floors > 1) rowWindows(k, fw, 0.2 + fh + 0.8, 3, { w: 0.55, h: 0.72, shutter: P.shutter });
    } else {
      rowWindows(k, fw, 0.2 + 0.85, 2, { w: 0.52, h: 0.68 });
      if (floors > 1) rowWindows(k, fw, 0.2 + fh + 0.8, 2, { w: 0.52, h: 0.68 });
    }
  }, 'frl');
  if (lv >= 3) { // balcony
    k.push([0, 0.2 + fh, d / 2]);
    k.rbox(1.8, 0.1, 0.7, 0.03, P.trim, 'base', [0, 0, 0.35]);
    for (let i = 0; i <= 8; i++) k.box(0.04, 0.45, 0.04, P.trim, 'base', [-0.85 + i * 0.2125, 0.25, 0.66]);
    k.box(1.8, 0.05, 0.06, P.trim, 'base', [0, 0.48, 0.66]);
    for (let i = 0; i < 3; i++) k.sph(0.12, FLOWERS[i], 'base', [-0.6 + i * 0.6, 0.12, 0.5], [1, 1, 1], 6);
    k.pop();
  }
  const top = 0.2 + fh * floors + 0.06;
  gableRoof(k, w, d, top, 1.15, P.terracotta);
  chimney(k, 0.9, top + 0.3, -0.45, 0.95);
  return k;
};

function shopBuilding(cfg, lv) {
  const k = new K(), w = cfg.w || 3.6, d = cfg.d || 2.9, fh = 1.55, floors = Math.min(lv, cfg.maxFloors || 3);
  base(k, w, d);
  // ground floor (shop) + upper floors
  wallBox(k, w, fh, d, cfg.groundColor || cfg.wall, cfg.groundMat || 'brick', 0.2);
  if (floors > 1) wallBox(k, w - 0.1, fh * (floors - 1), d - 0.1, cfg.wall, cfg.wallMat || 'wall', 0.2 + fh);
  for (let f = 1; f <= floors; f++) cornice(k, w - (f > 1 ? 0.1 : 0), d - (f > 1 ? 0.1 : 0), 0.2 + fh * f, cfg.trim || P.trim, 0.12);
  faces(k, w, d, (k, fw, side) => {
    if (side === 'f') {
      door(k, cfg.doorX ?? -fw / 2 + 0.75, 0.72, 1.15, { glass: true, color: cfg.doorColor || P.doorDark, frame: cfg.trim });
      shopWin(k, 0.45, 0.2 + 0.8, fw - 1.9, 0.95, cfg.trim || P.trim);
      k.push([0, 0.2 + 1.42, 0.06]); awning(k, 0, 0, fw - 0.15, cfg.aw1, cfg.aw2, 0.8); k.pop();
      if (cfg.sign) sign(k, 0, 0.2 + fh - 0.0 + 0.0 + (floors > 1 ? 0.18 : 0.2), Math.min(2.4, fw - 0.6), 0.42, cfg.sign, cfg.signInner || P.trim);
      for (let f = 1; f < floors; f++) rowWindows(k, fw, 0.2 + fh * f + 0.8, 3, { w: 0.55, h: 0.75, shutter: cfg.shutter, flowers: f === 1 && cfg.flowers, frame: cfg.trim });
    } else {
      rowWindows(k, fw, 0.2 + 0.8, 2, { w: 0.55, h: 0.7, frame: cfg.trim });
      for (let f = 1; f < floors; f++) rowWindows(k, fw, 0.2 + fh * f + 0.8, 2, { w: 0.55, h: 0.72, frame: cfg.trim });
    }
  }, 'frl');
  const top = 0.2 + fh * floors + 0.06;
  if (cfg.roof === 'gable') gableRoof(k, w, d, top, 1.0, cfg.roofColor);
  else if (cfg.roof === 'hip') hipRoof(k, w, d, top, 1.1, cfg.roofColor);
  else flatRoof(k, w, d, top, cfg.roofColor || cfg.trim || P.trim);
  if (cfg.prop) cfg.prop(k, cfg.roof === 'flat' || !cfg.roof ? top + 0.2 : top + 0.5, lv);
  if (cfg.extra) cfg.extra(k, w, d, lv);
  return k;
}

B.cafe = (lv) => shopBuilding({
  wall: '#f7dcc0', groundColor: P.brickSand, roof: 'gable', roofColor: '#9a5b3a', aw1: '#ff5a5a', aw2: P.white, sign: '#ff5a5a', shutter: '#e86b5a', flowers: true,
  prop: (k, y) => { // giant coffee cup on roof ridge
    k.cyl(0.42, 0.32, 0.6, P.white, 'base', [0, y + 0.55, -0.1], [0, 0, 0], 16); k.tor(0.18, 0.06, P.white, 'base', [0.45, y + 0.6, -0.1], [0, 0, 0]);
    k.cyl(0.38, 0.38, 0.04, P.choco, 'base', [0, y + 0.84, -0.1], [0, 0, 0], 16); k.cyl(0.55, 0.55, 0.05, P.white, 'base', [0, y + 0.25, -0.1], [0, 0, 0], 16);
  },
  extra: (k, w, d) => { umbrellaTable(k, -1.3, d / 2 + 1.0, '#ff5a5a'); umbrellaTable(k, 1.2, d / 2 + 1.05, P.white); },
}, lv);

B.icecream = (lv) => shopBuilding({
  wall: '#ffd6ec', groundColor: '#ffc2e0', groundMat: 'wall', roof: 'flat', roofColor: '#c48cff', aw1: '#b05cf0', aw2: P.white, sign: '#ff7fb5', trim: '#ffffff', flowers: true, shutter: '#b05cf0',
  prop: (k, y) => {
    k.cone(0.45, 1.3, '#e9b673', 'base', [0, y + 0.65, 0], [Math.PI, 0, 0], 14);
    for (let i = 0; i < 6; i++) k.box(0.9, 0.03, 0.03, '#c98f4a', 'base', [0, y + 0.4 + i * 0.16, 0], [0, i * 0.5, 0.6]);
    k.sph(0.55, '#fff0f6', 'base', [0, y + 1.42, 0], [1, 0.9, 1], 14); k.sph(0.48, '#ff9fc8', 'base', [0, y + 1.95, 0], [1, 0.9, 1], 14);
    k.sph(0.14, '#ff3b4e', 'base', [0.05, y + 2.42, 0], [1, 1, 1], 10);
    for (let i = 0; i < 10; i++) k.box(0.1, 0.03, 0.03, FLOWERS[i % 5], 'base', [Math.cos(i) * 0.38, y + 2.05 + Math.sin(i * 2) * 0.12, Math.sin(i) * 0.38], [0, i, 0]);
  },
  extra: (k, w, d) => { umbrellaTable(k, -1.25, d / 2 + 1.0, '#ff8fbf'); umbrellaTable(k, 1.25, d / 2 + 1.0, '#b05cf0'); },
}, lv);

B.bakery = (lv) => shopBuilding({
  wall: '#fff0d6', groundColor: '#f2b07a', roof: 'gable', roofColor: '#c56b2e', aw1: '#ffb347', aw2: P.white, sign: '#c56b2e', shutter: '#7cc4a8', flowers: true,
  prop: (k, y) => { // croissant-ish loaf on sign pole
    k.sph(0.35, '#e7a457', 'base', [0, y + 0.45, -0.1], [1.9, 0.75, 1], 12); for (let i = -2; i <= 2; i++) k.box(0.05, 0.22, 0.5, '#c4782e', 'base', [i * 0.22, y + 0.6, -0.1], [0, 0, 0.3]);
  },
  extra: (k, w, d) => { k.rbox(0.9, 0.5, 0.5, 0.06, '#c98a4f', 'wood', [1.3, 0.25, d / 2 + 0.8]); for (let i = 0; i < 3; i++) k.sph(0.13, '#e7a457', 'base', [1.05 + i * 0.25, 0.58, d / 2 + 0.8], [1.4, 0.8, 1], 8); },
}, lv);

B.pizzeria = (lv) => shopBuilding({
  wall: '#fff3e0', groundColor: P.brickSand, roof: 'flat', roofColor: '#2f8a3e', aw1: '#e8323e', aw2: '#2f9a44', sign: '#e8323e', trim: '#ffffff', shutter: '#2f9a44', flowers: true,
  prop: (k, y) => { // giant pizza tilted on the roof
    k.cyl(0.95, 0.95, 0.14, '#e6a14d', 'base', [0, y + 0.95, -0.1], [Math.PI / 2 - 0.25, 0, 0], 24);
    k.cyl(0.82, 0.82, 0.15, '#ffd76a', 'base', [0, y + 0.95, -0.06], [Math.PI / 2 - 0.25, 0, 0], 24);
    for (const [x, yy] of [[0.35, 0.3], [-0.3, 0.2], [0.05, -0.35], [-0.4, -0.25], [0.45, -0.2], [0, 0.05]]) k.cyl(0.13, 0.13, 0.06, '#d8323c', 'base', [x, y + 0.95 + yy * 0.97, 0.06 - yy * 0.25], [Math.PI / 2 - 0.25, 0, 0], 12);
    k.box(0.12, 0.8, 0.12, '#7a4a2a', 'wood', [0, y + 0.3, -0.35]);
  },
  extra: (k, w, d) => { umbrellaTable(k, -1.3, d / 2 + 1.0, '#e8323e'); umbrellaTable(k, 1.25, d / 2 + 1.0, '#2f9a44'); },
}, lv);

B.boutique = (lv) => shopBuilding({
  wall: '#ffffff', groundColor: '#e6ecff', groundMat: 'wall', roof: 'hip', roofColor: P.navy, aw1: P.navy, aw2: P.white, sign: P.gold, signInner: P.navy, trim: '#ffffff', shutter: P.navy, flowers: true,
  prop: (k, y) => { k.rbox(0.8, 0.9, 0.35, 0.08, P.yellow, 'base', [0, y + 0.95, 0]); k.tor(0.22, 0.05, P.navy, 'base', [0, y + 1.4, 0], [0, 0, 0], Math.PI); },
  extra: (k, w, d) => { for (const x of [-1.6, 1.6]) { k.cyl(0.25, 0.2, 0.45, P.white, 'base', [x, 0.22, d / 2 + 0.55], [0, 0, 0], 12); k.ico(0.32, P.leaf2, 'base', [x, 0.7, d / 2 + 0.55], [1, 1.2, 1], 1); } },
}, lv);

B.toystore = (lv) => shopBuilding({
  wall: '#d6ecff', groundColor: '#ffe27a', groundMat: 'wall', roof: 'flat', roofColor: '#ff9a3c', aw1: P.yellow, aw2: '#3d8bff', sign: '#ff3b4e', shutter: '#ff3b4e',
  prop: (k, y) => { k.sph(0.6, '#ff3b4e', 'base', [-0.6, y + 0.6, 0], [1, 1, 1], 16); k.tor(0.6, 0.07, P.white, 'base', [-0.6, y + 0.6, 0], [Math.PI / 2, 0, 0]); k.tor(0.6, 0.07, P.yellow, 'base', [-0.6, y + 0.6, 0], [0, 0, 0]);
    k.rbox(0.5, 0.5, 0.5, 0.06, '#3d8bff', 'base', [0.7, y + 0.25, 0.2]); k.rbox(0.5, 0.5, 0.5, 0.06, '#56b870', 'base', [0.85, y + 0.75, 0], [0, 0.5, 0]); },
  extra: (k, w, d) => { k.sph(0.35, P.yellow, 'base', [1.5, 0.35, d / 2 + 0.9], [1, 1, 1], 12); },
}, lv);

B.cinema = (lv) => shopBuilding({
  wall: '#5a3f8a', groundColor: '#3b2b5a', groundMat: 'wall', wallMat: 'wall', roof: 'flat', roofColor: '#2b1f45', aw1: '#ff4f9a', aw2: P.gold, sign: P.gold, signInner: '#ff4f9a', trim: P.gold, doorX: 0,
  prop: (k, y) => {
    k.rbox(2.8, 1.1, 0.25, 0.08, '#ff4f9a', 'base', [0, y + 0.55, 1.0]); k.rbox(2.5, 0.8, 0.27, 0.06, '#ffe9f3', 'base', [0, y + 0.55, 1.0]);
    for (let i = 0; i < 9; i++) { k.sph(0.07, '#fff6b0', 'lit', [-1.25 + i * 0.3125, y + 1.15, 1.12], [1, 1, 1], 6); k.sph(0.07, '#fff6b0', 'lit', [-1.25 + i * 0.3125, y - 0.05, 1.12], [1, 1, 1], 6); }
    k.cyl(0.05, 0.05, 0.9, '#ff4f9a', 'base', [-0.9, y + 0.45, -0.6], [0, 0, 0], 6);
  },
  extra: (k, w, d) => { k.box(2.2, 0.03, 1.2, '#e8323e', 'base', [0, 0.23, d / 2 + 0.6]); for (const x of [-1.2, 1.2]) { k.cyl(0.05, 0.05, 0.6, P.gold, 'base', [x, 0.3, d / 2 + 0.9], [0, 0, 0], 6); k.sph(0.08, P.gold, 'base', [x, 0.62, d / 2 + 0.9], [1, 1, 1], 6); } },
}, lv);

B.fountain = (lv) => {
  const k = new K();
  k.cyl(2.3, 2.4, 0.2, P.stone, 'paving', [0, 0.1, 0], [0, 0, 0], 32);
  k.cyl(1.9, 2.0, 0.55, '#ece6dc', 'stone', [0, 0.45, 0], [0, 0, 0], 32);
  k.tor(1.95, 0.1, P.trim, 'base', [0, 0.72, 0], [Math.PI / 2, 0, 0], Math.PI * 2, 40);
  k.cyl(1.75, 1.75, 0.1, '#6fd0ff', 'glass', [0, 0.62, 0], [0, 0, 0], 32);
  k.cyl(0.32, 0.45, 1.25, '#ece6dc', 'stone', [0, 1.2, 0], [0, 0, 0], 14);
  k.cyl(1.0, 0.7, 0.28, '#ece6dc', 'base', [0, 1.85, 0], [0, 0, 0], 24); k.cyl(0.9, 0.9, 0.06, '#7fdcff', 'glass', [0, 1.98, 0], [0, 0, 0], 24);
  k.tor(0.95, 0.06, P.trim, 'base', [0, 1.99, 0], [Math.PI / 2, 0, 0], Math.PI * 2, 32);
  let y = 2.0;
  if (lv >= 2) { k.cyl(0.14, 0.2, 0.65, '#ece6dc', 'base', [0, 2.3, 0], [0, 0, 0], 10); k.cyl(0.55, 0.4, 0.16, '#ece6dc', 'base', [0, 2.65, 0], [0, 0, 0], 18); k.cyl(0.48, 0.48, 0.05, '#7fdcff', 'glass', [0, 2.74, 0], [0, 0, 0], 18); y = 2.75; }
  // water jets
  k.sph(0.22, '#d6f4ff', 'glass', [0, y + 0.35, 0], [1, 2.2, 1], 12);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.sph(0.09, '#d6f4ff', 'glass', [Math.cos(a) * 0.75, 2.2, Math.sin(a) * 0.75], [1, 1.6, 1], 8); }
  if (lv >= 3) for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.78; k.sph(0.24, P.gold, 'base', [Math.cos(a) * 1.6, 0.95, Math.sin(a) * 1.6], [1, 1, 1], 10); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; bush(k, Math.cos(a) * 2.65, Math.sin(a) * 2.65, 0.7, true, i); }
  return k;
};

B.park = (lv) => {
  const k = new K();
  k.rbox(5.3, 0.14, 5.3, 0.06, '#9fdc7c', 'grass', [0, 0.07, 0]);
  k.cyl(1.0, 1.0, 0.16, P.stone, 'paving', [0, 0.09, 0], [0, 0, 0], 24);
  k.box(5.3, 0.15, 0.8, P.stone, 'paving', [0, 0.08, 0]); k.box(0.8, 0.15, 5.3, P.stone, 'paving', [0, 0.08, 0]);
  const spots = [[-1.7, -1.7, 'pink'], [1.7, -1.7, 'green'], [-1.7, 1.7, 'green'], [1.7, 1.7, 'pink'], [-2.2, 0, 'cone'], [2.2, 0, 'cone']];
  spots.slice(0, 2 + lv * 1 + (lv >= 3 ? 1 : 0)).forEach(([x, z, t], i) => tree(k, x, z, 0.95, t));
  bench(k, 0, -1.25, 0); bench(k, 0, 1.25, Math.PI);
  flowerBed(k, -1.6, 0.0, 0.9, 0.6, 1); flowerBed(k, 1.6, 0.0, 0.9, 0.6, 3);
  if (lv >= 2) { k.cyl(0.35, 0.4, 0.4, P.stone, 'base', [0, 0.3, 0], [0, 0, 0], 14); k.sph(0.25, '#d6f4ff', 'glass', [0, 0.65, 0], [1, 1.6, 1], 10); }
  if (lv >= 3) { lamp(k, -0.6, -0.6, 0.7); lamp(k, 0.6, 0.6, 0.7); }
  return k;
};

B.greenhouse = (lv) => {
  const k = new K(), w = 4.2, d = 3.2, h = 1.8 + lv * 0.25;
  base(k, w, d);
  k.rbox(w, 0.5, d, 0.05, P.white, 'brick', [0, 0.45, 0]);
  // plants inside
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = -1.4 + i * 0.95, z = -0.65 + j * 1.3; k.ico(0.38, j ? P.leaf : P.leaf2, 'base', [x, 1.0, z], [1, 0.9, 1], 1); k.sph(0.1, FLOWERS[(i + j) % 5], 'base', [x + 0.1, 1.35, z + 0.1], [1, 1, 1], 6); }
  // white frame
  const top = 0.7 + h;
  for (const x of [-w / 2, -w / 4, 0, w / 4, w / 2]) for (const z of [-d / 2, d / 2]) k.box(0.07, h, 0.07, P.white, 'base', [x, 0.7 + h / 2, z]);
  for (const z of [-d / 2, 0, d / 2]) for (const x of [-w / 2, w / 2]) k.box(0.07, h, 0.07, P.white, 'base', [x, 0.7 + h / 2, z]);
  for (const y of [0.7 + h * 0.5, top]) { k.box(w, 0.07, 0.07, P.white, 'base', [0, y, d / 2]); k.box(w, 0.07, 0.07, P.white, 'base', [0, y, -d / 2]); k.box(0.07, 0.07, d, P.white, 'base', [w / 2, y, 0]); k.box(0.07, 0.07, d, P.white, 'base', [-w / 2, y, 0]); }
  // arched roof ribs
  for (let i = 0; i <= 4; i++) k.tor(d / 2, 0.04, P.white, 'base', [-w / 2 + i * w / 4, top, 0], [0, Math.PI / 2, 0], Math.PI, 16);
  k.box(w, 0.06, 0.06, P.white, 'base', [0, top + d / 2, 0]);
  door(k.push([0, 0, d / 2]), 0, 0.7, 1.2, { glass: true, color: P.white, yb: 0.22 }); k.pop();
  k.userGlass = { w, d, h, top };
  return k;
};

B.mansion = (lv) => {
  const k = new K(), w = 3.9, d = 2.8, fh = 1.4;
  base(k, w + 0.4, d);
  wallBox(k, w, fh * 2, d, '#fdebd3', 'wall', 0.2);
  cornice(k, w, d, 0.2 + fh, P.trim, 0.1); cornice(k, w, d, 0.2 + fh * 2, P.trim, 0.16);
  faces(k, w, d, (k, fw, side) => {
    if (side === 'f') { door(k, 0, 0.85, 1.25, { glass: true }); win(k, -1.2, 0.2 + 0.8, 0.6, 0.8, { shutter: P.shutterG }); win(k, 1.2, 0.2 + 0.8, 0.6, 0.8, { shutter: P.shutterG }); rowWindows(k, fw, 0.2 + fh + 0.75, 3, { w: 0.58, h: 0.78, shutter: P.shutterG, arch: true }); }
    else { rowWindows(k, fw, 0.2 + 0.8, 2, { w: 0.55, h: 0.75 }); rowWindows(k, fw, 0.2 + fh + 0.75, 2, { w: 0.55, h: 0.75 }); }
  }, 'frl');
  // portico
  k.push([0, 0, d / 2]);
  for (const x of [-0.75, -0.25, 0.25, 0.75]) k.cyl(0.1, 0.12, fh + 0.05, P.white, 'base', [x, 0.2 + fh / 2, 0.75], [0, 0, 0], 12);
  k.rbox(2.0, 0.14, 1.0, 0.04, P.white, 'base', [0, 0.2 + fh + 0.05, 0.55]);
  k.prism(2.0, 0.45, 1.0, P.white, 'base', [0, 0.2 + fh + 0.12, 0.55]);
  k.pop();
  hipRoof(k, w, d, 0.2 + fh * 2 + 0.08, 1.3, '#3d5fd6');
  chimney(k, -1.2, 0.2 + fh * 2 + 0.4, -0.5, 1.0); chimney(k, 1.2, 0.2 + fh * 2 + 0.4, -0.5, 1.0);
  if (lv >= 2) { k.rbox(1.3, 0.08, 1.0, 0.03, '#6fd0ff', 'glass', [-1.9, 0.24, d / 2 + 1.2]); k.rbox(1.45, 0.12, 1.15, 0.04, P.white, 'paving', [-1.9, 0.18, d / 2 + 1.2]); }
  if (lv >= 3) { // side tower
    k.cyl(0.65, 0.65, 3.4, '#fdebd3', 'wall', [w / 2 + 0.3, 1.9, -0.7], [0, 0, 0], 16);
    win(k.push([w / 2 + 0.3, 0, -0.05]), 0, 2.6, 0.4, 0.6, {}); k.pop();
    k.cone(0.85, 1.3, '#3d5fd6', 'roof', [w / 2 + 0.3, 4.25, -0.7], [0, 0, 0], 16);
  }
  return k;
};

B.hotel = (lv) => {
  const k = new K(), w = 3.5, d = 3.0, floors = 2 + lv * 2, fh = 0.95;
  base(k, w + 0.3, d + 0.2);
  wallBox(k, w, 1.3, d, '#f6e6d6', 'stone', 0.2);
  wallBox(k, w - 0.15, fh * floors, d - 0.15, '#ffd9c2', 'wall', 1.5);
  for (let f = 0; f <= floors; f++) cornice(k, w - 0.15, d - 0.15, 1.5 + f * fh, f === floors ? P.trim : '#ffe9dc', f === floors ? 0.16 : 0.06);
  faces(k, w - 0.15, d - 0.15, (k, fw, side) => {
    if (side === 'f') { door(k, 0, 1.1, 1.05, { glass: true, color: P.gold, frame: P.gold }); k.push([0, 1.3, 0.06]); awning(k, 0, 0, 2.2, '#ff5a8a', P.white, 0.9); k.pop(); shopWin(k, -1.25, 0.75, 0.7, 0.75, P.trim); shopWin(k, 1.25, 0.75, 0.7, 0.75, P.trim); }
    for (let f = 0; f < floors; f++) rowWindows(k, fw, 1.5 + f * fh + fh * 0.5, side === 'f' ? 4 : 3, { w: 0.48, h: 0.55, noCross: true, lit: (f + side.length) % 3 !== 0 });
    if (side === 'f') for (let f = 1; f < floors; f += 2) { k.rbox(fw - 0.4, 0.06, 0.4, 0.02, P.trim, 'base', [0, 1.5 + f * fh + 0.06, 0.2]); k.box(fw - 0.4, 0.3, 0.03, P.trim, 'glass', [0, 1.5 + f * fh + 0.22, 0.4]); }
  }, 'frl');
  const top = 1.5 + floors * fh + 0.08;
  flatRoof(k, w - 0.15, d - 0.15, top, '#ff5a8a');
  sign(k.push([0, 0, (d - 0.15) / 2]), 0, top + 0.45, 2.2, 0.6, '#ff5a8a', P.white); k.pop();
  k.rbox(1.2, 0.04, 0.9, 0.02, '#6fd0ff', 'glass', [0.6, top + 0.22, -0.4]);
  return k;
};

B.tower = (lv) => {
  const k = new K(), w = 2.8, h = 5.5 + lv * 2.2;
  base(k, w + 1.0, w + 1.0);
  wallBox(k, w + 0.4, 1.3, w + 0.4, '#e8eef9', 'stone', 0.2);
  k.rbox(w, h, w, 0.12, '#9fd3ff', 'glass', [0, 1.5 + h / 2, 0]);
  for (let y = 1.5; y < 1.5 + h; y += 0.85) k.rbox(w + 0.06, 0.1, w + 0.06, 0.03, P.white, 'base', [0, y, 0]);
  for (const a of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) k.box(0.12, h, 0.12, P.white, 'base', [a[0] * w / 2, 1.5 + h / 2, a[1] * w / 2]);
  faces(k, w + 0.4, w + 0.4, (k) => { door(k, 0, 1.1, 1.1, { glass: true, color: '#cfe8ff', frame: P.white }); k.push([0, 1.3, 0.06]); awning(k, 0, 0, 2.2, P.navy, P.white, 0.7); k.pop(); }, 'f');
  const top = 1.5 + h;
  k.rbox(w - 0.6, 1.0, w - 0.6, 0.1, '#d8efff', 'glass', [0, top + 0.5, 0]);
  k.rbox(w + 0.2, 0.18, w + 0.2, 0.05, P.white, 'base', [0, top + 0.05, 0]);
  k.cyl(0.05, 0.05, 2, '#c0c0c0', 'base', [0, top + 2, 0], [0, 0, 0], 6); k.sph(0.16, '#ff3b4e', 'lit', [0, top + 3.05, 0], [1, 1, 1], 8);
  return k;
};

B.ferris = (lv) => {
  const k = new K(), R = 2.0 + lv * 0.25, cy = R + 0.7;
  k.rbox(5.2, 0.16, 3.2, 0.06, '#f1e4cf', 'paving', [0, 0.08, 0]);
  for (const z of [-0.45, 0.45]) { k.box(0.16, cy + 0.2, 0.16, P.white, 'base', [-0.8, cy / 2, z], [0, 0, -0.32]); k.box(0.16, cy + 0.2, 0.16, P.white, 'base', [0.8, cy / 2, z], [0, 0, 0.32]); }
  k.cyl(0.14, 0.14, 1.1, P.gold, 'base', [0, cy, 0], [Math.PI / 2, 0, 0], 12);
  for (const z of [-0.35, 0.35]) { k.tor(R, 0.07, '#ff6fae', 'base', [0, cy, z], [0, 0, 0], Math.PI * 2, 40); k.tor(R * 0.45, 0.05, P.white, 'base', [0, cy, z], [0, 0, 0], Math.PI * 2, 24); }
  const cols = ['#ffd23f', '#3d8bff', '#56b870', '#ff5a5a', '#b05cf0', '#ff9a3c', '#7fe0c0', '#ff8fbf', '#5ec8ff', '#ffb347'];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, x = Math.cos(a) * R, y = cy + Math.sin(a) * R;
    for (const z of [-0.35, 0.35]) k.box(0.05, R, 0.05, P.white, 'base', [Math.cos(a) * R / 2, cy + Math.sin(a) * R / 2, z], [0, 0, a - Math.PI / 2]);
    k.box(0.04, 0.04, 0.8, P.white, 'base', [x, y, 0]);
    k.rbox(0.5, 0.45, 0.5, 0.1, cols[i], 'base', [x, y - 0.38, 0]); k.cone(0.34, 0.18, cols[i], 'base', [x, y - 0.08, 0], [0, 0, 0], 8);
    k.box(0.36, 0.16, 0.52, P.lit, 'lit', [x, y - 0.32, 0]);
  }
  k.rbox(1.0, 0.8, 0.8, 0.08, '#ff6fae', 'base', [1.9, 0.56, 1.0]); k.cone(0.7, 0.45, P.white, 'base', [1.9, 1.18, 1.0], [0, Math.PI / 4, 0], 4);
  for (let i = 0; i < 12; i++) k.sph(0.06, '#fff6b0', 'lit', [Math.cos(i / 12 * 6.28) * R, cy + Math.sin(i / 12 * 6.28) * R, 0.45], [1, 1, 1], 5);
  return k;
};

B.stadium = (lv) => {
  const k = new K(), h = 1.3 + lv * 0.35, R = 2.8;
  const openCyl = (r, hh, inward) => cached(`oc${r}_${hh}_${inward}`, () => {
    let g = new THREE.CylinderGeometry(r, r, hh, 40, 1, true).toNonIndexed();
    if (inward) { const p = g.attributes.position.array, n = g.attributes.normal.array;
      for (let i = 0; i < p.length; i += 9) for (let j = 0; j < 3; j++) { const t = p[i + 3 + j]; p[i + 3 + j] = p[i + 6 + j]; p[i + 6 + j] = t; const u = n[i + 3 + j]; n[i + 3 + j] = n[i + 6 + j]; n[i + 6 + j] = u; }
      for (let i = 0; i < n.length; i++) n[i] = -n[i]; }
    return g; });
  const ring = (r0, r1) => cached(`ring${r0}_${r1}`, () => { const g = new THREE.RingGeometry(r0, r1, 40, 1); g.rotateX(-Math.PI / 2); return g; });
  k.rbox(5.6, 0.16, 5.6, 0.08, P.stone, 'paving', [0, 0.08, 0]);
  k.add(openCyl(R, h, false), '#e9eef7', 'stone', [0, h / 2 + 0.15, 0]);
  k.add(openCyl(R - 0.12, h, true), '#dfe6f3', 'base', [0, h / 2 + 0.15, 0]);
  k.add(ring(R - 0.14, R + 0.02), '#3d5fd6', 'base', [0, h + 0.151, 0]);
  // stepped seating rings down to the pitch
  const steps = 4, field = 1.75, fy = 0.5;
  for (let i = 0; i < steps; i++) {
    const r1 = R - 0.12 - i * (R - 0.12 - field) / steps, r0 = r1 - (R - 0.12 - field) / steps, y = h + 0.1 - (i + 1) * (h - fy) / steps;
    k.add(ring(r0, r1), i % 2 ? '#ff5a5a' : '#3d8bff', 'base', [0, y, 0]);
    k.add(openCyl(r0, (h - fy) / steps, true), '#f4f6fb', 'base', [0, y + (h - fy) / steps / 2, 0]);
  }
  k.add(cached('pitch', () => { const g = new THREE.CircleGeometry(field + 0.01, 40); g.rotateX(-Math.PI / 2); return g; }), '#5cc85a', 'grass', [0, fy + 0.15 - (h - fy) / steps + (h - fy) / steps, 0]);
  const py = fy + 0.16;
  k.box(2.2, 0.01, 0.05, P.white, 'base', [0, py, 0]); k.add(ring(0.38, 0.43), P.white, 'base', [0, py, 0]);
  k.box(0.05, 0.01, 1.1, P.white, 'base', [-1.4, py, 0]); k.box(0.05, 0.01, 1.1, P.white, 'base', [1.4, py, 0]);
  for (const x of [-1.62, 1.62]) { k.box(0.04, 0.35, 0.6, P.white, 'base', [x, py + 0.17, 0]); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; win(k.push([Math.cos(a) * (R + 0.01), 0, Math.sin(a) * (R + 0.01)], [0, Math.PI / 2 - a, 0]), 0, 0.75, 0.4, 0.45, { noCross: true }); k.pop(); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.78; const x = Math.cos(a) * (R + 0.2), z = Math.sin(a) * (R + 0.2); k.cyl(0.07, 0.09, 3.6, '#c0c4cc', 'base', [x, 1.9, z], [0, 0, 0], 8); k.rbox(0.8, 0.45, 0.15, 0.04, '#fff6b0', 'lit', [x, 3.7, z], [0.5, -a - Math.PI / 2, 0]); }
  return k;
};

B.castle = (lv) => {
  const k = new K(), w = 3.2, h = 2.4 + lv * 0.35;
  k.rbox(5.2, 0.28, 5.2, 0.08, P.stone, 'stone', [0, 0.14, 0]);
  wallBox(k, w, h, w, '#f1e4ff', 'stone', 0.28);
  for (let i = 0; i < 7; i++) for (const s of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = -w / 2 + 0.2 + i * (w - 0.4) / 6; k.box(0.24, 0.3, 0.24, '#f1e4ff', 'stone', [s[0] ? s[0] * w / 2 : t, 0.28 + h + 0.15, s[1] ? s[1] * w / 2 : t]); }
  const th = h + 1.1;
  for (const x of [-1.85, 1.85]) for (const z of [-1.85, 1.85]) {
    k.cyl(0.62, 0.66, th, '#e6d4ff', 'stone', [x, 0.28 + th / 2, z], [0, 0, 0], 16);
    k.cyl(0.72, 0.72, 0.2, P.white, 'base', [x, 0.28 + th, z], [0, 0, 0], 16);
    k.cone(0.78, 1.5, '#a65cf0', 'roof', [x, 0.28 + th + 0.85, z], [0, 0, 0], 16);
    k.cyl(0.02, 0.02, 0.5, P.dark, 'base', [x, 0.28 + th + 1.85, z], [0, 0, 0], 4); k.box(0.32, 0.2, 0.02, '#ff6fae', 'base', [x + 0.17, 0.28 + th + 1.98, z]);
    win(k.push([x, 0, z + 0.63]), 0, 0.28 + th * 0.6, 0.3, 0.5, { arch: true, noCross: true }); k.pop();
  }
  const kh = 1.4;
  k.cyl(0.95, 0.95, kh, '#e6d4ff', 'stone', [0, 0.28 + h + kh / 2, 0], [0, 0, 0], 20);
  k.cone(1.15, 2.0, '#a65cf0', 'roof', [0, 0.28 + h + kh + 1.0, 0], [0, 0, 0], 20);
  k.sph(0.12, P.gold, 'base', [0, 0.28 + h + kh + 2.1, 0], [1, 1, 1], 8);
  faces(k, w, w, (k) => { k.rbox(1.1, 1.5, 0.12, 0.3, '#7a4a2a', 'wood', [0, 1.0, 0.04]); k.cyl(0.55, 0.55, 0.12, '#7a4a2a', 'wood', [0, 1.75, 0.04], [Math.PI / 2, 0, 0], 16); win(k, -1.0, 0.28 + h * 0.65, 0.4, 0.6, { arch: true, noCross: true }); win(k, 1.0, 0.28 + h * 0.65, 0.4, 0.6, { arch: true, noCross: true }); }, 'f');
  return k;
};

B.workshop = (lv) => {
  const k = new K(), w = 3.4, d = 2.8, fh = 1.6;
  base(k, w, d);
  wallBox(k, w, fh, d, '#b9774a', 'wood', 0.2);
  if (lv >= 2) wallBox(k, w - 0.1, fh * 0.85, d - 0.1, '#c98a5a', 'wood', 0.2 + fh);
  const top = 0.2 + fh * (lv >= 2 ? 1.85 : 1) + 0.04;
  faces(k, w, d, (k, fw, side) => {
    if (side === 'f') {
      door(k, 0, 0.8, 1.15, { color: '#c0392b', frame: '#ffffff' });
      k.tor(0.22, 0.07, '#2fae55', 'base', [0, 1.62, 0.12], [0, 0, 0], Math.PI * 2, 20); k.sph(0.07, '#e8323e', 'base', [0, 1.42, 0.16], [1, 1, 1], 8);
      win(k, -1.15, 0.95, 0.55, 0.65, { frame: '#ffffff', shutter: '#2fae55' }); win(k, 1.15, 0.95, 0.55, 0.65, { frame: '#ffffff', shutter: '#2fae55' });
      if (lv >= 2) rowWindows(k, fw, 0.2 + fh + 0.7, 2, { w: 0.5, h: 0.6, frame: '#ffffff' });
      // candy-cane pillars
      for (const x of [-0.75, 0.75]) for (let i = 0; i < 7; i++) k.cyl(0.07, 0.07, 0.2, i % 2 ? '#ffffff' : '#e8323e', 'base', [x, 0.3 + i * 0.2, 0.55], [0, 0, 0], 10);
    } else rowWindows(k, fw, 0.95, 2, { w: 0.5, h: 0.6, frame: '#ffffff' });
  }, 'frl');
  gableRoof(k, w, d, top, 1.2, '#d6453b');
  // snow on the roof ridge + eaves
  k.rbox(w + 0.7, 0.16, 0.5, 0.08, '#ffffff', 'base', [0, top + 1.2, 0]);
  for (const sgn of [1, -1]) k.rbox(w + 0.7, 0.12, 0.35, 0.06, '#ffffff', 'base', [0, top + 0.12, sgn * (d / 2 + 0.25)]);
  chimney(k, 1.0, top + 0.3, -0.4, 1.0); k.rbox(0.55, 0.12, 0.55, 0.05, '#ffffff', 'base', [1.0, top + 1.34, -0.4]);
  // string lights along the eave
  const bulbs = ['#ff3b4e', '#ffd23f', '#4cd07d', '#3d8bff'];
  for (let i = 0; i < 13; i++) k.sph(0.07, bulbs[i % 4], 'lit', [-w / 2 - 0.2 + i * (w + 0.4) / 12, top - 0.02 - Math.sin(i / 12 * Math.PI * 4) * 0.04, d / 2 + 0.42], [1, 1, 1], 6);
  // presents pile
  const pc = [['#2fae55', '#e8323e'], ['#e8323e', '#ffd23f'], ['#3d8bff', '#ffffff'], ['#ffd23f', '#b05cf0']];
  pc.forEach(([c, r], i) => { const x = 1.6 - (i % 2) * 0.5, z = d / 2 + 0.9 - Math.floor(i / 2) * 0.1, sz = 0.42 - i * 0.04, y = i >= 2 ? 0.45 : 0.21;
    k.rbox(sz, sz, sz, 0.04, c, 'base', [x - (i >= 2 ? 0.25 : 0), y + 0.02, z]); k.box(0.07, sz + 0.02, sz + 0.02, r, 'base', [x - (i >= 2 ? 0.25 : 0), y + 0.02, z]); });
  if (lv >= 3) { k.cone(0.55, 1.4, '#249a48', 'base', [-1.7, 0.95, d / 2 + 0.9], [0, 0, 0], 12); k.add(new THREE.OctahedronGeometry(0.14, 0), '#ffd23f', 'lit', [-1.7, 1.75, d / 2 + 0.9], [0, 0, 0], [1, 1, 0.5]); }
  return k;
};

const cache = new Map();
export function buildingMesh(type, lv) {
  ensureArt();
  const key = type + lv;
  if (!cache.has(key)) {
    const k = B[type](lv);
    const built = k.build();
    built.glass = k.userGlass || null;
    cache.set(key, built);
  }
  const b = cache.get(key);
  const m = new THREE.Mesh(b.geo, b.mats);
  if (b.glass) { // translucent greenhouse panes
    const { w, d, h, top } = b.glass;
    const gl = new THREE.Mesh(cached('ghbox' + h, () => new THREE.BoxGeometry(w - 0.05, h, d - 0.05)), MAT.clearglass); gl.position.y = 0.7 + h / 2; m.add(gl);
    const roof = new THREE.Mesh(cached('ghroof' + d, () => new THREE.CylinderGeometry(d / 2, d / 2, w - 0.05, 20, 1, true, 0, Math.PI)), MAT.clearglass);
    roof.rotation.z = Math.PI / 2; roof.rotation.y = 0; roof.position.y = top; roof.rotation.x = Math.PI / 2; roof.rotation.set(0, 0, Math.PI / 2); m.add(roof);
  }
  return m;
}
export function buildingParts(type, lv) { buildingMesh(type, lv); return cache.get(type + lv); }

// Garden decoration around a building on a 6x6 plot (front = +z). Seeded per plot.
export function gardenFor(type, i) {
  ensureArt();
  const k = new K();
  const S = 2.75; // half lot
  if (type === 'park' || type === 'fountain' || type === 'stadium' || type === 'ferris') {
    if (type !== 'park') { bush(k, -S + 0.4, S - 0.4, 0.8, true, i); bush(k, S - 0.4, S - 0.4, 0.8, true, i + 2); }
    return k.build();
  }
  // path from door to sidewalk
  k.rbox(1.0, 0.06, 1.3, 0.03, P.stone, 'paving', [type === 'cafe' || type === 'icecream' ? 0 : 0, 0.24, S - 0.6]);
  hedge(k, -S + 0.85, S - 0.25, 1.5); hedge(k, S - 0.85, S - 0.25, 1.5);
  bush(k, -S + 0.35, S - 0.75, 0.8, true, i); bush(k, S - 0.35, S - 0.75, 0.8, true, i + 1);
  bush(k, -S + 0.35, -S + 0.4, 0.75, i % 2 === 0, i + 2);
  const t = ['pink', 'green', 'cone', 'palm'][(i * 7) % 4];
  tree(k, S - 0.5, -S + 0.55, 0.75, t);
  if (i % 3 !== 0) tree(k, -S + 0.45, -0.3, 0.6, i % 2 ? 'pink' : 'green');
  if (i % 2) lamp(k, -S + 0.35, S - 1.35, 0.7);
  if (i % 3 === 1) flowerBed(k, S - 0.45, 0.4, 0.55, 1.1, i);
  return k.build();
}
