// Procedural low-poly models. Each model is merged into ONE geometry with vertex
// colors so every item is a single draw call (fast on phones).
import * as THREE from './lib/three.module.min.js';

const C = (hex) => new THREE.Color(hex);
const rbCache = new Map();
function roundedBox(w, h, d, r) {
  r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const key = [w, h, d, r].map(v => v.toFixed(3)).join('_');
  if (rbCache.has(key)) return rbCache.get(key);
  const sw = w - 2 * r, sd = d - 2 * r, cr = Math.min(r, sw / 2, sd / 2) * 0.999;
  const s = new THREE.Shape(), x = -sw / 2, y = -sd / 2;
  s.moveTo(x + cr, y); s.lineTo(x + sw - cr, y); s.quadraticCurveTo(x + sw, y, x + sw, y + cr);
  s.lineTo(x + sw, y + sd - cr); s.quadraticCurveTo(x + sw, y + sd, x + sw - cr, y + sd);
  s.lineTo(x + cr, y + sd); s.quadraticCurveTo(x, y + sd, x, y + sd - cr); s.lineTo(x, y + cr); s.quadraticCurveTo(x, y, x + cr, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, h - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4 });
  g.rotateX(-Math.PI / 2); g.translate(0, -(h - 2 * r) / 2, 0);
  rbCache.set(key, g); return g;
}

export class B {
  constructor() { this.parts = []; }
  add(geo, color, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...p),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),
      new THREE.Vector3(...s));
    this.parts.push({ geo, color: C(color), m });
    return this;
  }
  box(w, h, d, c, p, r, s) { return this.add(new THREE.BoxGeometry(w, h, d), c, p, r, s); }
  rbox(w, h, d, rad, c, p, r, s) { return this.add(roundedBox(w, h, d, rad), c, p, r, s); }
  cyl(rt, rb, h, c, p, r, seg = 16, s) { return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), c, p, r, s); }
  sph(rad, c, p, s, seg = 16) { return this.add(new THREE.SphereGeometry(rad, seg, Math.max(6, seg * 0.7 | 0)), c, p, [0, 0, 0], s); }
  tor(R, t, c, p, r, arc = Math.PI * 2, seg = 28) { return this.add(new THREE.TorusGeometry(R, t, 10, seg, arc), c, p, r); }
  cone(rad, h, c, p, r, seg = 14) { return this.add(new THREE.ConeGeometry(rad, h, seg), c, p, r); }
  build() {
    let pos = [], nor = [], col = [];
    const nm = new THREE.Matrix3();
    for (const pt of this.parts) {
      const g = pt.geo.index ? pt.geo.toNonIndexed() : pt.geo.clone();
      g.applyMatrix4(pt.m);
      const P = g.attributes.position.array, N = g.attributes.normal.array;
      for (let i = 0; i < P.length; i += 3) {
        pos.push(P[i], P[i + 1], P[i + 2]); nor.push(N[i], N[i + 1], N[i + 2]);
        col.push(pt.color.r, pt.color.g, pt.color.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    // sit on y=0 and center in xz
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    geo.computeBoundingBox(); geo.computeBoundingSphere();
    return geo;
  }
}

const GOLD = '#f6c143', WHITE = '#ffffff', BLACK = '#2b2233', PINK = '#ff7fb5', HOT = '#ff4f9a',
  PURPLE = '#9a5cf0', VIOLET = '#7b3fe4', YELLOW = '#ffd23f', RED = '#ff3b4e', BLUE = '#3d8bff',
  SKY = '#7cc8ff', GREEN = '#4cd07d', ORANGE = '#ff9a3c', BROWN = '#b8743d', TAN = '#e9b673', MINT = '#7ff0c8';

const sprinkleColors = [WHITE, YELLOW, BLUE, GREEN, PURPLE, RED];

function gift(box, ribbon) {
  const b = new B();
  b.rbox(1, 0.9, 1, 0.07, box, [0, 0.45, 0]);
  b.rbox(1.06, 0.22, 1.06, 0.06, box, [0, 0.95, 0]); // lid
  b.box(0.18, 1.12, 1.06, ribbon, [0, 0.56, 0]);
  b.box(1.06, 1.12, 0.18, ribbon, [0, 0.56, 0]);
  b.tor(0.18, 0.06, ribbon, [-0.16, 1.15, 0], [0, 0, 0.6]);
  b.tor(0.18, 0.06, ribbon, [0.16, 1.15, 0], [0, 0, -0.6]);
  return b;
}

export const MODELS = {
  // ---------- beauty
  perfume: () => {
    const b = new B();
    b.rbox(0.9, 0.9, 0.5, 0.14, '#ff9ccb', [0, 0.45, 0]);
    b.rbox(0.68, 0.68, 0.53, 0.1, '#ffc2de', [0, 0.45, 0]);
    b.cyl(0.13, 0.13, 0.18, GOLD, [0, 0.99, 0]);
    b.cyl(0.2, 0.2, 0.28, GOLD, [0, 1.2, 0]);
    b.box(0.32, 0.08, 0.02, GOLD, [0, 0.55, 0.27]);
    return b;
  },
  lipstick: () => {
    const b = new B();
    b.cyl(0.26, 0.26, 0.7, BLACK, [0, 0.35, 0]);
    b.cyl(0.22, 0.22, 0.28, GOLD, [0, 0.84, 0]);
    b.cyl(0.17, 0.17, 0.3, RED, [0, 1.12, 0]);
    b.cyl(0.0, 0.17, 0.22, RED, [0, 1.36, 0], [0, 0, 0.5]);
    return b;
  },
  gift_purple: () => gift(PURPLE, GOLD),
  gift_yellow: () => gift(YELLOW, PURPLE),
  gift_red: () => gift(RED, WHITE),
  bag: () => {
    const b = new B();
    b.rbox(0.95, 1.05, 0.45, 0.07, '#b37dff', [0, 0.52, 0]);
    b.tor(0.26, 0.04, GOLD, [0, 1.05, 0.12], [0, 0, 0], Math.PI);
    b.tor(0.26, 0.04, GOLD, [0, 1.05, -0.12], [0, 0, 0], Math.PI);
    b.sph(0.1, WHITE, [-0.07, 0.6, 0.23], [1, 1, 0.4]);
    b.sph(0.1, WHITE, [0.07, 0.6, 0.23], [1, 1, 0.4]);
    b.cone(0.13, 0.17, WHITE, [0, 0.5, 0.23], [Math.PI, 0, 0]);
    return b;
  },
  headphones: () => {
    const b = new B();
    b.tor(0.55, 0.08, WHITE, [0, 0.62, 0], [0, 0, 0], Math.PI);
    b.cyl(0.3, 0.3, 0.26, WHITE, [-0.55, 0.32, 0], [0, 0, Math.PI / 2]);
    b.cyl(0.3, 0.3, 0.26, WHITE, [0.55, 0.32, 0], [0, 0, Math.PI / 2]);
    b.cyl(0.22, 0.22, 0.28, '#ffb3d1', [-0.55, 0.32, 0], [0, 0, Math.PI / 2]);
    b.cyl(0.22, 0.22, 0.28, '#ffb3d1', [0.55, 0.32, 0], [0, 0, Math.PI / 2]);
    return b;
  },
  camera: () => {
    const b = new B();
    b.rbox(1.2, 0.8, 0.55, 0.14, BLUE, [0, 0.4, 0]);
    b.rbox(1.22, 0.26, 0.57, 0.1, WHITE, [0, 0.13, 0]);
    b.cyl(0.3, 0.32, 0.25, '#e8eef9', [0, 0.42, 0.37], [Math.PI / 2, 0, 0]);
    b.cyl(0.2, 0.2, 0.27, BLACK, [0, 0.42, 0.39], [Math.PI / 2, 0, 0]);
    b.rbox(0.25, 0.16, 0.2, 0.05, WHITE, [-0.38, 0.86, 0]);
    b.cyl(0.08, 0.08, 0.08, RED, [0.4, 0.84, 0]);
    return b;
  },
  mirror: () => {
    const b = new B();
    b.cyl(0.55, 0.55, 0.1, '#d8b4ff', [0, 0.05, 0]);
    b.cyl(0.45, 0.45, 0.11, '#e9f6ff', [0, 0.06, 0]);
    b.box(0.2, 0.1, 0.6, '#d8b4ff', [0, 0.05, 0.75]);
    return b;
  },
  nailpolish: () => {
    const b = new B();
    b.cyl(0.25, 0.28, 0.5, HOT, [0, 0.25, 0], [0, 0, 0], 8);
    b.cyl(0.11, 0.11, 0.08, GOLD, [0, 0.54, 0]);
    b.cyl(0.12, 0.12, 0.45, BLACK, [0, 0.8, 0], [0, 0, 0], 8);
    return b;
  },
  // ---------- sweets
  donut: () => {
    const b = new B();
    b.tor(0.42, 0.22, TAN, [0, 0.22, 0], [Math.PI / 2, 0, 0]);
    b.tor(0.42, 0.2, PINK, [0, 0.28, 0], [Math.PI / 2, 0, 0], Math.PI * 2, 24);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2 + (i % 2) * 0.2, R = 0.32 + (i % 3) * 0.08;
      b.box(0.1, 0.03, 0.03, sprinkleColors[i % 6], [Math.cos(a) * R, 0.47, Math.sin(a) * R], [0, a * 1.7, 0]);
    }
    return b;
  },
  cupcake: () => {
    const b = new B();
    b.cyl(0.42, 0.3, 0.5, '#7bd0ff', [0, 0.25, 0], [0, 0, 0], 12);
    b.sph(0.45, '#fff0f6', [0, 0.6, 0], [1, 0.7, 1]);
    b.sph(0.3, PINK, [0, 0.85, 0], [1, 0.8, 1]);
    b.sph(0.11, RED, [0, 1.1, 0]);
    return b;
  },
  candy: () => {
    const b = new B();
    b.sph(0.32, ORANGE, [0, 0.32, 0], [1.2, 1, 1]);
    b.cone(0.22, 0.32, ORANGE, [-0.55, 0.32, 0], [0, 0, -Math.PI / 2], 8);
    b.cone(0.22, 0.32, ORANGE, [0.55, 0.32, 0], [0, 0, Math.PI / 2], 8);
    b.box(0.08, 0.5, 0.66, YELLOW, [0, 0.32, 0]);
    return b;
  },
  lollipop: () => {
    const b = new B();
    b.cyl(0.05, 0.05, 1.1, WHITE, [0, 0.55, 0], [0, 0, 0], 8);
    b.cyl(0.45, 0.45, 0.16, HOT, [0, 1.3, 0], [Math.PI / 2, 0, 0], 20);
    b.tor(0.28, 0.06, WHITE, [0, 1.3, 0.08], [0, 0, 0]);
    return b;
  },
  icecream: () => {
    const b = new B();
    b.cone(0.3, 0.8, TAN, [0, 0.4, 0], [Math.PI, 0, 0], 12);
    b.sph(0.34, '#ffd1e6', [0, 0.9, 0]);
    b.sph(0.3, '#c8f7e1', [0, 1.25, 0]);
    b.sph(0.08, RED, [0, 1.58, 0]);
    return b;
  },
  macaron: () => {
    const b = new B();
    b.cyl(0.42, 0.42, 0.2, MINT, [0, 0.1, 0], [0, 0, 0], 18);
    b.cyl(0.38, 0.38, 0.12, WHITE, [0, 0.25, 0], [0, 0, 0], 18);
    b.cyl(0.42, 0.42, 0.2, MINT, [0, 0.4, 0], [0, 0, 0], 18);
    return b;
  },
  cake: () => {
    const b = new B();
    b.cyl(1.0, 1.0, 0.7, '#fff3e6', [0, 0.35, 0], [0, 0, 0], 24);
    b.cyl(1.02, 1.02, 0.14, PINK, [0, 0.72, 0], [0, 0, 0], 24);
    b.cyl(0.65, 0.65, 0.55, '#fff3e6', [0, 1.05, 0], [0, 0, 0], 24);
    b.cyl(0.67, 0.67, 0.12, PINK, [0, 1.33, 0], [0, 0, 0], 24);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.sph(0.1, RED, [Math.cos(a) * 0.45, 1.45, Math.sin(a) * 0.45]); }
    b.cyl(0.05, 0.05, 0.35, YELLOW, [0, 1.55, 0], [0, 0, 0], 8);
    return b;
  },
  // ---------- toys
  teddy: () => {
    const b = new B(), c = '#c98544', l = '#efc28a';
    b.sph(0.45, c, [0, 0.45, 0], [1, 1.05, 0.9]);
    b.sph(0.36, c, [0, 1.08, 0]);
    b.sph(0.13, c, [-0.27, 1.38, 0]); b.sph(0.13, c, [0.27, 1.38, 0]);
    b.sph(0.14, l, [0, 1.0, 0.3], [1, 0.8, 0.7]);
    b.sph(0.05, BLACK, [0, 1.06, 0.4]);
    b.sph(0.045, BLACK, [-0.13, 1.17, 0.31]); b.sph(0.045, BLACK, [0.13, 1.17, 0.31]);
    b.sph(0.15, c, [-0.45, 0.6, 0.1]); b.sph(0.15, c, [0.45, 0.6, 0.1]);
    b.sph(0.17, c, [-0.25, 0.12, 0.25]); b.sph(0.17, c, [0.25, 0.12, 0.25]);
    b.sph(0.22, l, [0, 0.45, 0.32], [1, 1.1, 0.5]);
    b.cone(0.1, 0.18, RED, [-0.1, 0.78, 0.3], [0, 0, Math.PI / 2], 6);
    b.cone(0.1, 0.18, RED, [0.1, 0.78, 0.3], [0, 0, -Math.PI / 2], 6);
    return b;
  },
  ball: () => {
    const b = new B();
    b.sph(0.45, RED, [0, 0.45, 0], [1, 1, 1], 18);
    b.tor(0.45, 0.05, WHITE, [0, 0.45, 0], [Math.PI / 2, 0, 0]);
    b.tor(0.45, 0.05, YELLOW, [0, 0.45, 0], [0, 0, 0]);
    return b;
  },
  blocks: () => {
    const b = new B();
    b.rbox(0.5, 0.5, 0.5, 0.08, RED, [-0.28, 0.25, 0]);
    b.rbox(0.5, 0.5, 0.5, 0.08, BLUE, [0.28, 0.25, 0]);
    b.rbox(0.5, 0.5, 0.5, 0.08, YELLOW, [0, 0.75, 0], [0, 0.4, 0]);
    return b;
  },
  duck: () => {
    const b = new B();
    b.sph(0.42, YELLOW, [0, 0.35, 0], [1.2, 0.85, 1]);
    b.sph(0.26, YELLOW, [0.25, 0.8, 0]);
    b.cone(0.1, 0.22, ORANGE, [0.55, 0.78, 0], [0, 0, -Math.PI / 2], 8);
    b.sph(0.04, BLACK, [0.4, 0.88, 0.15]); b.sph(0.04, BLACK, [0.4, 0.88, -0.15]);
    b.sph(0.15, YELLOW, [-0.45, 0.5, 0], [1, 0.6, 1]);
    return b;
  },
  rocket: () => {
    const b = new B();
    b.cyl(0.3, 0.3, 1.0, WHITE, [0, 0.7, 0]);
    b.cone(0.3, 0.5, RED, [0, 1.45, 0]);
    b.cyl(0.13, 0.13, 0.62, SKY, [0, 0.9, 0.24], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; b.box(0.06, 0.45, 0.35, RED, [Math.cos(a) * 0.35, 0.3, Math.sin(a) * 0.35], [0, -a, 0]); }
    b.cone(0.22, 0.25, ORANGE, [0, 0.1, 0], [Math.PI, 0, 0]);
    return b;
  },
  robot: () => {
    const b = new B();
    b.rbox(0.7, 0.7, 0.5, 0.1, '#9fb3c8', [0, 0.65, 0]);
    b.rbox(0.55, 0.45, 0.45, 0.1, '#c9d6e3', [0, 1.25, 0]);
    b.sph(0.07, SKY, [-0.13, 1.28, 0.23]); b.sph(0.07, SKY, [0.13, 1.28, 0.23]);
    b.cyl(0.03, 0.03, 0.25, BLACK, [0, 1.58, 0], [0, 0, 0], 6); b.sph(0.07, RED, [0, 1.72, 0]);
    b.box(0.2, 0.3, 0.25, '#7e93a8', [-0.18, 0.15, 0]); b.box(0.2, 0.3, 0.25, '#7e93a8', [0.18, 0.15, 0]);
    b.box(0.15, 0.55, 0.18, '#7e93a8', [-0.45, 0.65, 0]); b.box(0.15, 0.55, 0.18, '#7e93a8', [0.45, 0.65, 0]);
    b.box(0.3, 0.15, 0.02, YELLOW, [0, 0.7, 0.26]);
    return b;
  },
  toycar: () => carModel(HOT, 0.8),
  // ---------- city
  cone: () => {
    const b = new B();
    b.box(0.7, 0.08, 0.7, ORANGE, [0, 0.04, 0]);
    b.cone(0.28, 0.9, ORANGE, [0, 0.5, 0]);
    b.cyl(0.18, 0.21, 0.14, WHITE, [0, 0.55, 0]);
    return b;
  },
  hydrant: () => {
    const b = new B();
    b.cyl(0.22, 0.25, 0.7, RED, [0, 0.35, 0]);
    b.sph(0.22, RED, [0, 0.72, 0]);
    b.cyl(0.08, 0.08, 0.6, RED, [0, 0.45, 0], [0, 0, Math.PI / 2], 8);
    b.cyl(0.3, 0.3, 0.08, RED, [0, 0.04, 0]);
    return b;
  },
  bench: () => {
    const b = new B();
    b.box(1.6, 0.08, 0.45, BROWN, [0, 0.45, 0]);
    b.box(1.6, 0.35, 0.06, BROWN, [0, 0.72, -0.2]);
    b.box(0.08, 0.45, 0.4, BLACK, [-0.65, 0.22, 0]); b.box(0.08, 0.45, 0.4, BLACK, [0.65, 0.22, 0]);
    return b;
  },
  lamp: () => {
    const b = new B();
    b.cyl(0.06, 0.08, 2.2, BLACK, [0, 1.1, 0], [0, 0, 0], 8);
    b.cyl(0.18, 0.2, 0.15, BLACK, [0, 0.07, 0], [0, 0, 0], 8);
    b.sph(0.2, '#fff1a8', [0, 2.3, 0]);
    b.cone(0.26, 0.2, BLACK, [0, 2.5, 0], [0, 0, 0], 8);
    return b;
  },
  tree: () => {
    const b = new B();
    b.cyl(0.12, 0.16, 0.9, BROWN, [0, 0.45, 0], [0, 0, 0], 8);
    b.sph(0.6, GREEN, [0, 1.3, 0], [1, 1, 1], 10);
    b.sph(0.45, '#5fe08f', [0.3, 1.6, 0.1], [1, 1, 1], 10);
    b.sph(0.42, '#3fbf6d', [-0.3, 1.5, -0.1], [1, 1, 1], 10);
    return b;
  },
  mailbox: () => {
    const b = new B();
    b.cyl(0.06, 0.06, 0.9, BLACK, [0, 0.45, 0], [0, 0, 0], 8);
    b.rbox(0.5, 0.4, 0.35, 0.06, BLUE, [0, 1.05, 0]);
    b.cyl(0.175, 0.175, 0.5, BLUE, [0, 1.25, 0], [0, 0, Math.PI / 2], 12);
    b.box(0.04, 0.2, 0.12, RED, [0.27, 1.25, 0]);
    return b;
  },
  car: () => carModel(SKY, 1.3),
  taxi: () => carModel(YELLOW, 1.3),
  bus: () => {
    const b = new B();
    b.rbox(3.4, 1.3, 1.2, 0.18, ORANGE, [0, 0.95, 0]);
    b.box(3.42, 0.4, 1.22, SKY, [0, 1.2, 0]);
    b.box(3.44, 0.12, 1.24, WHITE, [0, 0.62, 0]);
    for (const x of [-1.1, 1.1]) for (const z of [-0.6, 0.6]) b.cyl(0.3, 0.3, 0.2, BLACK, [x, 0.3, z], [Math.PI / 2, 0, 0], 12);
    return b;
  },
  house: () => {
    const b = new B();
    b.rbox(2.2, 1.6, 2.0, 0.08, '#ffe6c7', [0, 0.8, 0]);
    b.cone(1.75, 1.1, RED, [0, 2.15, 0], [0, Math.PI / 4, 0], 4);
    b.box(0.5, 0.9, 0.05, BROWN, [0, 0.45, 1.01]);
    b.box(0.45, 0.45, 0.05, '#ffe17a', [-0.65, 1.0, 1.01]); b.box(0.45, 0.45, 0.05, '#ffe17a', [0.65, 1.0, 1.01]);
    return b;
  },
  // ---------- picnic
  watermelon: () => {
    const b = new B();
    b.cyl(0.55, 0.55, 0.25, GREEN, [0, 0.55, 0], [Math.PI / 2, 0, 0], 20);
    b.cyl(0.47, 0.47, 0.27, '#ff5d73', [0, 0.55, 0], [Math.PI / 2, 0, 0], 20);
    b.box(1.2, 0.6, 0.32, '#fbe4c8', [0, 0.0, 0]);
    return b;
  },
  sandwich: () => {
    const b = new B();
    b.rbox(0.9, 0.16, 0.9, 0.06, TAN, [0, 0.08, 0]);
    b.box(0.95, 0.06, 0.95, GREEN, [0, 0.19, 0]);
    b.box(0.88, 0.1, 0.88, '#ff8a8a', [0, 0.27, 0]);
    b.box(0.92, 0.06, 0.92, YELLOW, [0, 0.35, 0]);
    b.rbox(0.9, 0.18, 0.9, 0.08, TAN, [0, 0.46, 0]);
    return b;
  },
  juice: () => {
    const b = new B();
    b.rbox(0.5, 0.8, 0.4, 0.06, YELLOW, [0, 0.4, 0]);
    b.box(0.5, 0.15, 0.4, ORANGE, [0, 0.86, 0], [0, 0, 0]);
    b.cyl(0.03, 0.03, 0.5, WHITE, [0.1, 1.1, 0], [0, 0, 0.3], 6);
    b.sph(0.15, ORANGE, [0, 0.45, 0.2], [1, 1, 0.3]);
    return b;
  },
  basket: () => {
    const b = new B();
    b.rbox(1.6, 0.8, 1.1, 0.1, '#d49a5b', [0, 0.4, 0]);
    b.box(1.65, 0.12, 1.15, '#b77c3f', [0, 0.82, 0]);
    b.tor(0.6, 0.06, '#b77c3f', [0, 0.85, 0], [0, 0, 0], Math.PI);
    b.box(1.2, 0.05, 0.9, RED, [0, 0.9, 0], [0, 0, 0.05]);
    return b;
  },
  // ---------- more beauty
  ring: () => {
    const b = new B();
    b.rbox(0.62, 0.4, 0.62, 0.1, '#ff6fae', [0, 0.2, 0]); b.rbox(0.64, 0.12, 0.64, 0.05, '#ff9cc8', [0, 0.42, 0]);
    b.tor(0.16, 0.04, GOLD, [0, 0.62, 0], [0, 0, 0], Math.PI * 2, 20);
    b.add(new THREE.OctahedronGeometry(0.11, 0), '#bff3ff', [0, 0.82, 0], [0, 0.3, 0], [1, 0.8, 1]);
    return b;
  },
  heels: () => {
    const b = new B(), c = '#ff3d7f';
    b.rbox(0.9, 0.12, 0.32, 0.05, c, [0, 0.36, 0], [0, 0, -0.42]); b.rbox(0.38, 0.1, 0.34, 0.05, c, [0.42, 0.05, 0]);
    b.cyl(0.03, 0.05, 0.42, c, [-0.36, 0.21, 0], [0, 0, 0], 8); b.rbox(0.3, 0.3, 0.34, 0.08, c, [-0.28, 0.6, 0]);
    b.tor(0.12, 0.03, GOLD, [0.25, 0.35, 0.17], [Math.PI / 2, 0, 0], Math.PI, 10);
    return b;
  },
  sunglasses: () => {
    const b = new B();
    for (const x of [-0.24, 0.24]) { b.cyl(0.2, 0.2, 0.05, '#2b2233', [x, 0.22, 0], [Math.PI / 2, 0, 0], 18); b.cyl(0.16, 0.16, 0.06, '#7a5cff', [x, 0.22, 0.01], [Math.PI / 2, 0, 0], 18); }
    b.box(0.12, 0.04, 0.04, '#2b2233', [0, 0.3, 0]); b.box(0.04, 0.04, 0.6, '#2b2233', [-0.44, 0.28, -0.3]); b.box(0.04, 0.04, 0.6, '#2b2233', [0.44, 0.28, -0.3]);
    return b;
  },
  brush: () => {
    const b = new B();
    b.rbox(0.42, 0.12, 0.6, 0.06, '#b37dff', [0, 0.06, 0.2]); b.rbox(0.14, 0.1, 0.6, 0.05, '#b37dff', [0, 0.05, -0.38]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) b.cyl(0.02, 0.02, 0.12, WHITE, [-0.13 + i * 0.087, 0.17, j * 0.1], [0, 0, 0], 4);
    return b;
  },
  // ---------- more sweets
  chocobar: () => {
    const b = new B();
    b.rbox(0.8, 0.1, 0.45, 0.03, '#6b3a1e', [0, 0.05, 0]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) b.rbox(0.17, 0.06, 0.18, 0.03, '#7c4523', [-0.29 + i * 0.195, 0.12, -0.1 + j * 0.2]);
    b.rbox(0.42, 0.16, 0.47, 0.04, '#e8323e', [0.22, 0.08, 0]); b.box(0.06, 0.17, 0.48, GOLD, [0.06, 0.08, 0]);
    return b;
  },
  popsicle: () => {
    const b = new B();
    b.rbox(0.12, 0.45, 0.06, 0.03, '#e9c48a', [0, 0.22, 0]);
    b.rbox(0.42, 0.62, 0.22, 0.12, '#ff6fae', [0, 0.72, 0]); b.rbox(0.44, 0.22, 0.24, 0.1, '#ffd23f', [0, 0.92, 0]); b.rbox(0.44, 0.15, 0.24, 0.06, '#7fe0c0', [0, 0.52, 0]);
    return b;
  },
  milkshake: () => {
    const b = new B();
    b.cyl(0.3, 0.2, 0.75, '#ffd1e6', [0, 0.38, 0], [0, 0, 0], 18); b.cyl(0.31, 0.31, 0.06, WHITE, [0, 0.76, 0], [0, 0, 0], 18);
    b.sph(0.3, WHITE, [0, 0.82, 0], [1, 0.6, 1]); b.sph(0.08, RED, [0.05, 1.0, 0]);
    b.cyl(0.03, 0.03, 0.7, '#ff3b4e', [0.12, 1.05, 0], [0, 0, -0.25], 6);
    return b;
  },
  pancakes: () => {
    const b = new B();
    b.cyl(0.55, 0.55, 0.04, WHITE, [0, 0.02, 0], [0, 0, 0], 22);
    for (let i = 0; i < 4; i++) b.cyl(0.42, 0.42, 0.11, '#e3a85c', [0, 0.1 + i * 0.11, 0], [0, i * 0.3, 0], 20);
    b.cyl(0.36, 0.42, 0.05, '#c26a1a', [0, 0.55, 0], [0, 0, 0], 20); b.rbox(0.18, 0.08, 0.18, 0.03, '#fff3b0', [0.05, 0.6, 0]);
    return b;
  },
  // ---------- more toys
  dice: () => {
    const b = new B();
    b.rbox(0.6, 0.6, 0.6, 0.12, WHITE, [0, 0.3, 0], [0, 0.4, 0]);
    const d = [[0, 0.61, 0], [0.15, 0.61, 0.15], [-0.15, 0.61, -0.15]];
    d.forEach((p) => b.sph(0.05, RED, p, [1, 0.4, 1]));
    return b;
  },
  yoyo: () => {
    const b = new B();
    b.cyl(0.32, 0.32, 0.14, '#3d8bff', [0, 0.32, -0.1], [Math.PI / 2, 0, 0], 22); b.cyl(0.32, 0.32, 0.14, '#3d8bff', [0, 0.32, 0.1], [Math.PI / 2, 0, 0], 22);
    b.cyl(0.08, 0.08, 0.1, WHITE, [0, 0.32, 0], [Math.PI / 2, 0, 0], 10); b.sph(0.1, YELLOW, [0, 0.32, 0.18], [1, 1, 0.4]); b.sph(0.1, YELLOW, [0, 0.32, -0.18], [1, 1, 0.4]);
    return b;
  },
  train: () => {
    const b = new B();
    b.rbox(1.0, 0.45, 0.55, 0.08, RED, [0, 0.38, 0]); b.rbox(0.42, 0.45, 0.58, 0.08, '#3d8bff', [-0.32, 0.8, 0]);
    b.cyl(0.18, 0.18, 0.5, '#2b2233', [0.25, 0.75, 0], [0, 0, Math.PI / 2], 14); b.cyl(0.08, 0.12, 0.3, '#2b2233', [0.3, 0.9, 0], [0, 0, 0], 10);
    for (const x of [-0.32, 0.05, 0.38]) for (const z of [-0.3, 0.3]) b.cyl(0.16, 0.16, 0.08, YELLOW, [x, 0.16, z], [Math.PI / 2, 0, 0], 14);
    b.rbox(0.44, 0.08, 0.6, 0.03, YELLOW, [-0.32, 1.06, 0]);
    return b;
  },
  // ---------- more picnic
  hotdog: () => {
    const b = new B();
    b.rbox(0.9, 0.22, 0.38, 0.11, '#e9b673', [0, 0.11, 0]); b.cyl(0.1, 0.1, 1.0, '#d4553a', [0, 0.26, 0], [0, 0, Math.PI / 2], 12);
    b.sph(0.1, '#d4553a', [0.5, 0.26, 0]); b.sph(0.1, '#d4553a', [-0.5, 0.26, 0]);
    for (let i = 0; i < 5; i++) b.box(0.14, 0.03, 0.04, YELLOW, [-0.32 + i * 0.16, 0.37, (i % 2 ? 0.03 : -0.03)], [0, i % 2 ? 0.6 : -0.6, 0]);
    return b;
  },
  frisbee: () => {
    const b = new B();
    b.cyl(0.45, 0.48, 0.08, '#ff9a3c', [0, 0.04, 0], [0, 0, 0], 26); b.tor(0.42, 0.04, '#ff7a1c', [0, 0.08, 0], [Math.PI / 2, 0, 0], Math.PI * 2, 26);
    b.tor(0.2, 0.025, WHITE, [0, 0.09, 0], [Math.PI / 2, 0, 0], Math.PI * 2, 20);
    return b;
  },
  flowerpot: () => {
    const b = new B();
    b.cyl(0.3, 0.22, 0.42, '#d4733a', [0, 0.21, 0], [0, 0, 0], 16); b.cyl(0.33, 0.33, 0.08, '#e08850', [0, 0.42, 0], [0, 0, 0], 16);
    const fc = ['#ff6fae', '#ffd23f', '#b98cff', WHITE, '#ff8a5c'];
    for (let i = 0; i < 5; i++) { const a = i * 1.26, x = Math.cos(a) * 0.15, z = Math.sin(a) * 0.15, h = 0.75 + (i % 2) * 0.15;
      b.cyl(0.02, 0.02, h - 0.4, GREEN, [x, 0.4 + (h - 0.4) / 2, z], [0, 0, 0], 4); b.sph(0.1, fc[i], [x, h, z]); b.sph(0.04, YELLOW, [x, h + 0.06, z]); }
    return b;
  },
  parasol: () => {
    const b = new B();
    b.cyl(0.04, 0.04, 1.5, WHITE, [0, 0.75, 0], [0, 0, 0], 8); b.cyl(0.18, 0.2, 0.08, '#d9d4cf', [0, 0.04, 0], [0, 0, 0], 12);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.add(new THREE.ConeGeometry(0.85, 0.35, 3, 1, true, a, Math.PI / 4), i % 2 ? WHITE : '#ff5a8a', [0, 1.55, 0]); }
    b.sph(0.06, WHITE, [0, 1.74, 0]);
    return b;
  },
  // ---------- more city
  trashbin: () => {
    const b = new B();
    b.cyl(0.3, 0.26, 0.7, '#4cb46f', [0, 0.35, 0], [0, 0, 0], 16); b.cyl(0.33, 0.33, 0.08, '#3a9a5a', [0, 0.72, 0], [0, 0, 0], 16);
    b.rbox(0.25, 0.06, 0.08, 0.03, '#2a7a44', [0, 0.79, 0]);
    return b;
  },
  trafficlight: () => {
    const b = new B();
    b.cyl(0.05, 0.06, 1.4, '#3b3446', [0, 0.7, 0], [0, 0, 0], 8); b.rbox(0.3, 0.75, 0.25, 0.06, '#2b2233', [0, 1.6, 0]);
    b.sph(0.08, '#ff3b4e', [0, 1.84, 0.12]); b.sph(0.08, '#ffd23f', [0, 1.6, 0.12]); b.sph(0.08, '#4cd07d', [0, 1.36, 0.12]);
    return b;
  },
  bike: () => {
    const b = new B();
    for (const x of [-0.45, 0.45]) { b.tor(0.28, 0.04, '#2b2233', [x, 0.3, 0], [0, 0, 0], Math.PI * 2, 22); b.cyl(0.03, 0.03, 0.06, '#c0c0c0', [x, 0.3, 0], [Math.PI / 2, 0, 0], 6); }
    b.cyl(0.03, 0.03, 0.62, '#3d8bff', [0, 0.45, 0], [0, 0, Math.PI / 2 - 0.3], 6); b.cyl(0.03, 0.03, 0.5, '#3d8bff', [-0.2, 0.5, 0], [0, 0, 0.5], 6);
    b.cyl(0.03, 0.03, 0.45, '#3d8bff', [0.35, 0.55, 0], [0, 0, 0.3], 6); b.rbox(0.22, 0.05, 0.1, 0.02, '#2b2233', [-0.25, 0.73, 0]);
    b.box(0.04, 0.04, 0.4, '#2b2233', [0.42, 0.78, 0]);
    return b;
  },
  // ---------- floor pickups
  coinpile: () => {
    const b = new B();
    for (let i = 0; i < 5; i++) b.cyl(0.22, 0.22, 0.07, i % 2 ? '#ffd23f' : '#f5b423', [((i * 37) % 5) * 0.012, 0.035 + i * 0.07, 0], [0, 0, 0], 18);
    b.cyl(0.22, 0.22, 0.07, '#ffd23f', [0.3, 0.035, 0.1], [0, 0, 0], 18); b.cyl(0.22, 0.22, 0.07, '#f5b423', [0.28, 0.105, 0.12], [0, 0, 0], 18);
    return b;
  },
  clock: () => {
    const b = new B();
    b.cyl(0.3, 0.3, 0.16, '#ff5a6e', [0, 0.4, 0], [Math.PI / 2, 0, 0], 22); b.cyl(0.24, 0.24, 0.17, WHITE, [0, 0.4, 0.01], [Math.PI / 2, 0, 0], 22);
    b.box(0.03, 0.17, 0.02, '#2b2233', [0, 0.47, 0.1]); b.box(0.13, 0.03, 0.02, '#2b2233', [0.06, 0.4, 0.1]);
    b.sph(0.1, '#ff5a6e', [-0.2, 0.68, 0], [1, 0.7, 0.7]); b.sph(0.1, '#ff5a6e', [0.2, 0.68, 0], [1, 0.7, 0.7]);
    b.cyl(0.03, 0.03, 0.18, '#ff5a6e', [-0.18, 0.12, 0], [0, 0, 0.4], 6); b.cyl(0.03, 0.03, 0.18, '#ff5a6e', [0.18, 0.12, 0], [0, 0, -0.4], 6);
    return b;
  },
  gem: () => {
    const b = new B();
    b.add(new THREE.OctahedronGeometry(0.32, 0), '#e04bff', [0, 0.42, 0], [0, 0.4, 0], [1, 1.25, 1]);
    b.add(new THREE.OctahedronGeometry(0.2, 0), '#ff9cff', [0, 0.47, 0.06], [0, 0.4, 0], [1, 1.2, 1]);
    return b;
  },
  // ================= BEACH
  shell: () => {
    const b = new B();
    for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3; b.sph(0.32, i % 2 ? '#ffd1e0' : '#ffc0d4', [Math.sin(a) * 0.12, 0.14, -Math.cos(a) * 0.12 + 0.1], [0.32, 0.4, 1], 10); }
    b.sph(0.12, '#ffb3c9', [0, 0.1, 0.32], [1.4, 0.7, 0.8]);
    return b;
  },
  starfish: () => {
    const b = new B();
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; b.cone(0.13, 0.5, '#ff8a3c', [Math.cos(a) * 0.22, 0.07, Math.sin(a) * 0.22], [0, -a, Math.PI / 2], 8); }
    b.cyl(0.16, 0.18, 0.12, '#ff8a3c', [0, 0.06, 0], [0, 0, 0], 12);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; b.sph(0.035, '#ffd1a0', [Math.cos(a) * 0.25, 0.13, Math.sin(a) * 0.25]); }
    return b;
  },
  sandcastle: () => {
    const b = new B(), S = '#f2cf8a';
    b.rbox(1.2, 0.5, 1.2, 0.06, S, [0, 0.25, 0]);
    for (const x of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) { b.cyl(0.2, 0.22, 0.75, S, [x, 0.38, z], [0, 0, 0], 12); b.cone(0.22, 0.25, '#e9bf74', [x, 0.88, z], [0, 0, 0], 12); }
    b.cyl(0.3, 0.32, 0.6, S, [0, 0.8, 0], [0, 0, 0], 14); b.cyl(0.01, 0.01, 0.4, '#8a6a4a', [0, 1.3, 0], [0, 0, 0], 4); b.box(0.2, 0.12, 0.01, RED, [0.1, 1.42, 0]);
    b.rbox(0.25, 0.3, 0.06, 0.08, '#c99a55', [0, 0.15, 0.6]);
    return b;
  },
  surfboard: () => {
    const b = new B();
    b.sph(0.5, '#3dc6ff', [0, 0.08, 0], [0.42, 0.12, 2.1], 18); b.box(0.06, 0.02, 1.8, WHITE, [0, 0.14, 0]); b.box(0.42, 0.021, 0.06, '#ffd23f', [0, 0.14, 0.4]);
    b.cone(0.1, 0.18, '#2a9fd6', [0, 0.04, -0.85], [Math.PI, 0, 0], 3);
    return b;
  },
  crab: () => {
    const b = new B(), C = '#ff4e3a';
    b.sph(0.36, C, [0, 0.24, 0], [1.3, 0.6, 1]);
    for (const s of [-1, 1]) { b.cyl(0.03, 0.03, 0.28, C, [s * 0.18, 0.46, 0.18], [0, 0, 0], 6); b.sph(0.07, WHITE, [s * 0.18, 0.6, 0.18]); b.sph(0.035, BLACK, [s * 0.18, 0.61, 0.24]);
      b.sph(0.14, C, [s * 0.55, 0.3, 0.3], [1.2, 0.8, 0.9]); b.cyl(0.04, 0.04, 0.3, C, [s * 0.38, 0.26, 0.2], [0, 0, s * 1.1], 6);
      for (let i = 0; i < 3; i++) b.cyl(0.03, 0.03, 0.35, C, [s * 0.45, 0.12, -0.12 + i * 0.12], [0, 0, s * 1.2], 5); }
    return b;
  },
  bucket: () => {
    const b = new B();
    b.cyl(0.32, 0.24, 0.5, '#ffd23f', [0, 0.25, 0], [0, 0, 0], 18); b.cyl(0.29, 0.29, 0.02, '#f2cf8a', [0, 0.48, 0], [0, 0, 0], 16);
    b.tor(0.3, 0.025, '#ff5a5a', [0, 0.5, 0], [0, 0, 0], Math.PI, 14);
    b.rbox(0.18, 0.04, 0.22, 0.02, '#3d8bff', [0.45, 0.02, 0.1], [0, 0.4, 0]); b.cyl(0.025, 0.025, 0.45, '#3d8bff', [0.55, 0.04, -0.15], [Math.PI / 2, 0, 0.4], 6);
    return b;
  },
  lifebuoy: () => {
    const b = new B();
    for (let i = 0; i < 8; i++) b.tor(0.38, 0.13, i % 2 ? WHITE : '#ff4e5e', [0, 0.13, 0], [Math.PI / 2, 0, i * Math.PI / 4], Math.PI / 4, 6);
    return b;
  },
  palm: () => {
    const b = new B();
    for (let i = 0; i < 6; i++) b.cyl(0.11 - i * 0.008, 0.12 - i * 0.008, 0.36, '#b98a52', [i * 0.05, 0.18 + i * 0.35, 0], [0, 0, -0.1], 8);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.sph(0.45, i % 2 ? '#3fbf6d' : '#5fe08f', [0.3 + Math.cos(a) * 0.55, 2.15, Math.sin(a) * 0.55], [1.6, 0.18, 0.5]); }
    b.sph(0.1, '#8a5a2a', [0.35, 2.0, 0.1]); b.sph(0.1, '#8a5a2a', [0.25, 2.0, -0.08]);
    return b;
  },
  boat: () => {
    const b = new B();
    b.rbox(2.4, 0.55, 1.0, 0.25, WHITE, [0, 0.3, 0]); b.rbox(2.42, 0.12, 1.02, 0.05, '#3d8bff', [0, 0.18, 0]);
    b.rbox(0.9, 0.5, 0.75, 0.12, '#ffd23f', [-0.3, 0.8, 0]); b.box(0.92, 0.18, 0.76, '#bfe8ff', [-0.3, 0.88, 0]);
    b.cyl(0.04, 0.04, 1.3, '#8a6a4a', [0.6, 1.2, 0], [0, 0, 0], 6); b.add(new THREE.ConeGeometry(0.55, 1.1, 3), '#ff5a5a', [0.88, 1.3, 0], [0, 0, 0], [0.6, 1, 0.05]);
    return b;
  },
  // ================= FARM
  chicken: () => {
    const b = new B();
    b.sph(0.32, WHITE, [0, 0.36, 0], [1.2, 1, 0.95]); b.sph(0.2, WHITE, [0.28, 0.66, 0]);
    b.cone(0.06, 0.14, '#ffb21f', [0.48, 0.64, 0], [0, 0, -Math.PI / 2], 6); b.sph(0.06, '#ff3b4e', [0.32, 0.85, 0], [1.4, 0.7, 0.6]); b.sph(0.04, '#ff3b4e', [0.44, 0.56, 0]);
    b.sph(0.03, BLACK, [0.4, 0.71, 0.1]); b.sph(0.03, BLACK, [0.4, 0.71, -0.1]); b.sph(0.14, '#f2f2f2', [-0.38, 0.45, 0], [0.8, 1.2, 0.6]);
    b.cyl(0.025, 0.025, 0.14, '#ffb21f', [0.05, 0.07, 0.1], [0, 0, 0], 5); b.cyl(0.025, 0.025, 0.14, '#ffb21f', [0.05, 0.07, -0.1], [0, 0, 0], 5);
    return b;
  },
  egg: () => { const b = new B(); b.sph(0.22, '#fff6e6', [0, 0.28, 0], [1, 1.3, 1]); return b; },
  carrot: () => {
    const b = new B();
    b.cone(0.16, 0.8, ORANGE, [0, 0.16, 0], [0, 0, Math.PI / 2], 12);
    for (let i = 0; i < 3; i++) b.cone(0.06, 0.32, GREEN, [-0.5, 0.2 + i * 0.03, -0.06 + i * 0.06], [0, 0, Math.PI / 2 + 0.3 - i * 0.3], 6);
    return b;
  },
  pumpkin: () => {
    const b = new B();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.sph(0.3, i % 2 ? '#ff9a3c' : '#ff8a2a', [Math.cos(a) * 0.17, 0.34, Math.sin(a) * 0.17], [0.7, 1, 0.7]); }
    b.cyl(0.05, 0.06, 0.18, '#6b8a2a', [0, 0.7, 0], [0, 0, 0.2], 8); b.sph(0.1, GREEN, [0.12, 0.66, 0], [1.4, 0.4, 0.8]);
    return b;
  },
  haybale: () => {
    const b = new B();
    b.cyl(0.45, 0.45, 0.8, '#f2cf5a', [0, 0.45, 0], [Math.PI / 2, 0, 0], 20); b.cyl(0.38, 0.38, 0.82, '#e5bd45', [0, 0.45, 0], [Math.PI / 2, 0, 0], 20);
    b.tor(0.455, 0.025, '#b9874a', [0, 0.45, 0.2], [0, 0, 0], Math.PI * 2, 20); b.tor(0.455, 0.025, '#b9874a', [0, 0.45, -0.2], [0, 0, 0], Math.PI * 2, 20);
    return b;
  },
  corn: () => {
    const b = new B();
    b.sph(0.14, '#ffd23f', [0, 0.14, 0], [3, 1, 1]);
    for (const s of [-1, 1]) b.sph(0.12, '#7ed957', [-0.1, 0.13, s * 0.08], [3.2, 0.5, 1]);
    return b;
  },
  milkcan: () => {
    const b = new B();
    b.cyl(0.3, 0.3, 0.6, '#d9dde6', [0, 0.3, 0], [0, 0, 0], 18); b.cyl(0.3, 0.16, 0.2, '#d9dde6', [0, 0.7, 0], [0, 0, 0], 18);
    b.cyl(0.18, 0.18, 0.1, '#b9bfcc', [0, 0.84, 0], [0, 0, 0], 16); b.cyl(0.31, 0.31, 0.06, '#3d8bff', [0, 0.35, 0], [0, 0, 0], 18);
    return b;
  },
  cow: () => {
    const b = new B();
    b.rbox(1.2, 0.6, 0.6, 0.25, WHITE, [0, 0.75, 0]);
    [[-0.2, 0.9, 0.28], [0.3, 0.7, -0.28], [-0.35, 0.65, -0.28], [0.15, 1.0, 0.1]].forEach((p) => b.sph(0.15, BLACK, p, [1.2, 0.8, 0.3]));
    b.rbox(0.42, 0.42, 0.42, 0.14, WHITE, [0.72, 1.0, 0]); b.rbox(0.26, 0.2, 0.36, 0.08, '#ffb8c6', [0.92, 0.9, 0]);
    b.cone(0.05, 0.16, '#f2e6c9', [0.7, 1.28, 0.15], [0, 0, 0], 6); b.cone(0.05, 0.16, '#f2e6c9', [0.7, 1.28, -0.15], [0, 0, 0], 6);
    b.sph(0.04, BLACK, [0.9, 1.08, 0.12]); b.sph(0.04, BLACK, [0.9, 1.08, -0.12]);
    for (const x of [-0.42, 0.42]) for (const z of [-0.2, 0.2]) b.cyl(0.08, 0.08, 0.45, WHITE, [x, 0.23, z], [0, 0, 0], 8);
    b.sph(0.12, '#ffb8c6', [0.05, 0.42, 0], [1, 0.6, 1]);
    return b;
  },
  tractor: () => {
    const b = new B();
    b.rbox(1.3, 0.5, 0.7, 0.1, '#ff4e3a', [0.1, 0.6, 0]); b.rbox(0.6, 0.7, 0.72, 0.1, '#ff4e3a', [-0.35, 1.1, 0]); b.box(0.62, 0.4, 0.74, '#bfe8ff', [-0.35, 1.2, 0]);
    b.cyl(0.42, 0.42, 0.24, '#2b2233', [-0.4, 0.42, 0.42], [Math.PI / 2, 0, 0], 18); b.cyl(0.42, 0.42, 0.24, '#2b2233', [-0.4, 0.42, -0.42], [Math.PI / 2, 0, 0], 18);
    b.cyl(0.25, 0.25, 0.18, '#2b2233', [0.55, 0.25, 0.38], [Math.PI / 2, 0, 0], 14); b.cyl(0.25, 0.25, 0.18, '#2b2233', [0.55, 0.25, -0.38], [Math.PI / 2, 0, 0], 14);
    b.cyl(0.18, 0.18, 0.26, '#ffd23f', [-0.4, 0.42, 0.43], [Math.PI / 2, 0, 0], 12); b.cyl(0.18, 0.18, 0.26, '#ffd23f', [-0.4, 0.42, -0.43], [Math.PI / 2, 0, 0], 12);
    b.cyl(0.05, 0.05, 0.45, '#5a5566', [0.45, 1.05, 0.15], [0, 0, 0], 6);
    return b;
  },
  barn: () => {
    const b = new B();
    b.rbox(1.8, 1.2, 1.4, 0.06, '#d6453b', [0, 0.6, 0]);
    for (const s of [1, -1]) b.rbox(2.0, 0.1, 1.05, 0.04, '#7a4a2a', [0, 1.55, s * 0.42], [s * 0.75, 0, 0]);
    b.rbox(0.7, 0.85, 0.06, 0.04, WHITE, [0, 0.43, 0.71]); b.box(0.7, 0.05, 0.07, WHITE, [0, 0.43, 0.72], [0, 0, 0.9]); b.box(0.7, 0.05, 0.07, WHITE, [0, 0.43, 0.72], [0, 0, -0.9]);
    b.rbox(0.35, 0.3, 0.06, 0.04, WHITE, [0, 1.25, 0.71]);
    return b;
  },
  // ================= SPACE
  planet: () => {
    const b = new B();
    b.sph(0.4, '#b98cff', [0, 0.45, 0]); b.sph(0.12, '#9a6ae6', [0.2, 0.55, 0.28], [1, 0.6, 0.3]);
    b.tor(0.62, 0.05, '#ffd23f', [0, 0.45, 0], [Math.PI / 2 - 0.35, 0, 0], Math.PI * 2, 32);
    return b;
  },
  star: () => {
    const b = new B();
    const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.17 : 0.4, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 }); g.translate(0, 0, -0.06);
    b.add(g, '#ffd23f', [0, 0.45, 0], [-0.3, 0, 0]);
    return b;
  },
  satellite: () => {
    const b = new B();
    b.rbox(0.4, 0.4, 0.4, 0.06, '#d9dde6', [0, 0.5, 0]); b.box(0.9, 0.02, 0.32, '#3d6bff', [-0.65, 0.5, 0]); b.box(0.9, 0.02, 0.32, '#3d6bff', [0.65, 0.5, 0]);
    b.cyl(0.02, 0.02, 0.3, '#9aa0ad', [0, 0.85, 0], [0, 0, 0], 4); b.cone(0.18, 0.12, WHITE, [0, 1.0, 0], [Math.PI, 0, 0], 12);
    return b;
  },
  ufo: () => {
    const b = new B();
    b.sph(0.6, '#b9bfcc', [0, 0.35, 0], [1, 0.28, 1], 20); b.sph(0.3, '#7ff0c8', [0, 0.5, 0], [1, 0.8, 1]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.sph(0.05, i % 2 ? '#ffd23f' : '#ff4e5e', [Math.cos(a) * 0.5, 0.33, Math.sin(a) * 0.5]); }
    return b;
  },
  astronaut: () => {
    const b = new B();
    b.rbox(0.45, 0.5, 0.32, 0.14, WHITE, [0, 0.55, 0]); b.sph(0.26, WHITE, [0, 1.0, 0]); b.sph(0.18, '#3b3a7a', [0, 1.0, 0.12], [1, 0.8, 0.6]);
    b.rbox(0.32, 0.36, 0.14, 0.05, '#d9dde6', [0, 0.6, -0.22]); b.rbox(0.15, 0.32, 0.15, 0.06, WHITE, [-0.13, 0.17, 0]); b.rbox(0.15, 0.32, 0.15, 0.06, WHITE, [0.13, 0.17, 0]);
    b.rbox(0.13, 0.36, 0.13, 0.06, WHITE, [-0.32, 0.6, 0], [0, 0, 0.3]); b.rbox(0.13, 0.36, 0.13, 0.06, WHITE, [0.32, 0.6, 0], [0, 0, -0.3]);
    b.box(0.12, 0.08, 0.02, '#ff4e5e', [0.1, 0.7, 0.17]);
    return b;
  },
  alien: () => {
    const b = new B(), G = '#7ed957';
    b.sph(0.26, G, [0, 0.34, 0], [1, 1.2, 1]); b.sph(0.24, G, [0, 0.78, 0], [1.2, 1, 1]);
    b.sph(0.09, WHITE, [-0.1, 0.82, 0.18]); b.sph(0.09, WHITE, [0.1, 0.82, 0.18]); b.sph(0.045, BLACK, [-0.1, 0.82, 0.25]); b.sph(0.045, BLACK, [0.1, 0.82, 0.25]);
    b.cyl(0.02, 0.02, 0.25, G, [-0.12, 1.08, 0], [0, 0, 0.3], 5); b.cyl(0.02, 0.02, 0.25, G, [0.12, 1.08, 0], [0, 0, -0.3], 5); b.sph(0.05, '#ff6fae', [-0.16, 1.2, 0]); b.sph(0.05, '#ff6fae', [0.16, 1.2, 0]);
    return b;
  },
  meteor: () => {
    const b = new B();
    b.add(new THREE.IcosahedronGeometry(0.42, 0), '#8a7f99', [0, 0.4, 0], [0.3, 0.5, 0.2], [1.2, 0.9, 1]);
    b.sph(0.1, '#6b6278', [0.25, 0.6, 0.2], [1, 0.5, 1]); b.sph(0.08, '#6b6278', [-0.2, 0.55, 0.25], [1, 0.5, 1]);
    return b;
  },
  rover: () => {
    const b = new B();
    b.rbox(1.3, 0.3, 0.8, 0.08, '#d9dde6', [0, 0.55, 0]); b.box(0.9, 0.04, 0.6, '#3d6bff', [-0.1, 0.72, 0]);
    for (const x of [-0.5, 0, 0.5]) for (const z of [-0.48, 0.48]) b.cyl(0.18, 0.18, 0.14, '#3b3446', [x, 0.2, z], [Math.PI / 2, 0, 0], 12);
    b.cyl(0.03, 0.03, 0.6, '#9aa0ad', [0.45, 1.0, 0.2], [0, 0, 0], 5); b.cone(0.2, 0.12, WHITE, [0.45, 1.33, 0.2], [Math.PI, 0, 0], 12);
    b.rbox(0.3, 0.2, 0.3, 0.05, '#ffd23f', [0.5, 0.82, -0.15]);
    return b;
  },
  // ---------- streak / pre-level boosters
  bolt: () => {
    const b = new B();
    const sh = new THREE.Shape(); [[-0.12, 0.6], [0.28, 0.6], [0.08, 0.12], [0.34, 0.12], [-0.18, -0.6], [-0.02, -0.08], [-0.3, -0.08]].forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }); g.translate(0, 0, -0.09);
    b.add(g, '#ffc21f', [0, 0.62, 0], [-0.35, 0, 0.12], [1.3, 1.3, 1.3]);
    return b;
  },
  hourglass: () => {
    const b = new B();
    b.cyl(0.3, 0.3, 0.1, '#3d8bff', [0, 0.05, 0], [0, 0, 0], 20); b.cyl(0.3, 0.3, 0.1, '#3d8bff', [0, 0.95, 0], [0, 0, 0], 20);
    b.cyl(0.05, 0.24, 0.38, '#dff3ff', [0, 0.69, 0], [0, 0, 0], 16); b.cyl(0.24, 0.05, 0.38, '#dff3ff', [0, 0.31, 0], [0, 0, 0], 16);
    b.cyl(0.04, 0.2, 0.2, '#ffb21f', [0, 0.22, 0], [0, 0, 0], 16); b.cyl(0.14, 0.04, 0.12, '#ffb21f', [0, 0.6, 0], [0, 0, 0], 16);
    return b;
  },
  // ---------- hazard
  bomb: () => {
    const b = new B();
    b.sph(0.42, '#23202b', [0, 0.42, 0]);
    b.sph(0.13, '#5a5566', [-0.15, 0.6, 0.3], [1, 0.6, 0.4]); // shine
    b.cyl(0.13, 0.15, 0.14, '#8d8a99', [0, 0.86, 0], [0, 0, 0], 14);
    b.tor(0.14, 0.035, '#9a6233', [0.14, 0.96, 0], [0, 0, 0], Math.PI * 0.9, 12);
    b.sph(0.08, '#ffb21f', [0.28, 0.98, 0]); b.sph(0.05, '#ff4e2f', [0.31, 1.03, 0]);
    return b;
  },
  // ---------- holiday season
  xtree: () => {
    const b = new B();
    b.rbox(0.7, 0.45, 0.7, 0.08, '#d6453b', [0, 0.22, 0]);
    b.cyl(0.12, 0.14, 0.4, BROWN, [0, 0.6, 0], [0, 0, 0], 10);
    [[0.95, 0.9, 1.05], [0.75, 0.8, 1.55], [0.52, 0.7, 2.0]].forEach(([r, h, y], i) => b.cone(r, h, i % 2 ? '#2fae55' : '#249a48', [0, y, 0], [0, 0, 0], 18));
    b.add(new THREE.OctahedronGeometry(0.2, 0), GOLD, [0, 2.48, 0], [0, 0, 0], [1, 1, 0.45]);
    const balls = ['#ff3b4e', '#ffd23f', '#3d8bff', '#ffffff', '#b05cf0', '#ff8fbf'];
    for (let i = 0; i < 16; i++) { const t = i / 16, a = i * 2.4, y = 0.85 + t * 1.25, r = 0.85 - t * 0.6; b.sph(0.075, balls[i % 6], [Math.cos(a) * r, y, Math.sin(a) * r]); }
    return b;
  },
  snowman: () => {
    const b = new B();
    b.sph(0.5, WHITE, [0, 0.45, 0], [1, 0.9, 1]); b.sph(0.36, WHITE, [0, 1.08, 0]); b.sph(0.26, WHITE, [0, 1.56, 0]);
    b.cone(0.05, 0.28, ORANGE, [0, 1.56, 0.36], [Math.PI / 2, 0, 0], 8);
    b.sph(0.035, BLACK, [-0.09, 1.64, 0.22]); b.sph(0.035, BLACK, [0.09, 1.64, 0.22]);
    for (let i = 0; i < 3; i++) b.sph(0.04, BLACK, [0, 0.95 + i * 0.13 - 0.1, 0.34 - i * 0.02]);
    b.tor(0.26, 0.07, RED, [0, 1.36, 0], [Math.PI / 2, 0, 0]); b.rbox(0.13, 0.36, 0.06, 0.03, RED, [0.15, 1.2, 0.24], [0.2, 0, 0.3]);
    b.cyl(0.28, 0.28, 0.04, BLACK, [0, 1.78, 0]); b.cyl(0.18, 0.18, 0.3, BLACK, [0, 1.94, 0]); b.cyl(0.185, 0.185, 0.06, RED, [0, 1.84, 0]);
    b.cyl(0.025, 0.025, 0.6, BROWN, [-0.5, 1.15, 0], [0, 0, 1.0], 6); b.cyl(0.025, 0.025, 0.6, BROWN, [0.5, 1.15, 0], [0, 0, -1.0], 6);
    return b;
  },
  candycane: () => {
    const b = new B();
    for (let i = 0; i < 8; i++) b.cyl(0.09, 0.09, 0.15, i % 2 ? WHITE : RED, [0, 0.075 + i * 0.15, 0], [0, 0, 0], 12);
    for (let i = 0; i < 6; i++) { const a = Math.PI * i / 5; b.sph(0.095, i % 2 ? WHITE : RED, [0.22 - Math.cos(a) * 0.22, 1.2 + Math.sin(a) * 0.22, 0]); }
    return b;
  },
  gingerbread: () => {
    const b = new B(), G = '#c8793a';
    b.rbox(0.5, 0.6, 0.16, 0.08, G, [0, 0.62, 0]); b.cyl(0.24, 0.24, 0.16, G, [0, 1.12, 0], [Math.PI / 2, 0, 0], 20);
    b.rbox(0.18, 0.5, 0.16, 0.08, G, [-0.14, 0.25, 0], [0, 0, 0.15]); b.rbox(0.18, 0.5, 0.16, 0.08, G, [0.14, 0.25, 0], [0, 0, -0.15]);
    b.rbox(0.45, 0.17, 0.16, 0.08, G, [-0.38, 0.78, 0], [0, 0, 0.5]); b.rbox(0.45, 0.17, 0.16, 0.08, G, [0.38, 0.78, 0], [0, 0, -0.5]);
    b.sph(0.035, WHITE, [-0.08, 1.17, 0.09]); b.sph(0.035, WHITE, [0.08, 1.17, 0.09]);
    b.tor(0.08, 0.02, WHITE, [0, 1.06, 0.08], [0, 0, Math.PI], Math.PI, 12);
    ['#ff3b4e', '#4cd07d', '#3d8bff'].forEach((c, i) => b.sph(0.05, c, [0, 0.78 - i * 0.15, 0.09]));
    return b;
  },
  ornament: () => {
    const b = new B();
    b.sph(0.4, '#ff3b4e', [0, 0.4, 0]); b.tor(0.4, 0.035, GOLD, [0, 0.4, 0], [Math.PI / 2, 0, 0]);
    b.cyl(0.11, 0.11, 0.12, GOLD, [0, 0.84, 0]); b.tor(0.06, 0.02, GOLD, [0, 0.95, 0]);
    return b;
  },
  stocking: () => {
    const b = new B();
    b.rbox(0.36, 0.7, 0.24, 0.1, RED, [0, 0.55, 0]); b.rbox(0.55, 0.3, 0.24, 0.12, RED, [0.1, 0.17, 0]);
    b.rbox(0.44, 0.2, 0.3, 0.09, WHITE, [0, 0.95, 0]); b.sph(0.08, '#4cd07d', [0.03, 1.1, 0]);
    return b;
  },
  bell: () => {
    const b = new B();
    b.cyl(0.18, 0.42, 0.55, GOLD, [0, 0.4, 0], [0, 0, 0], 20); b.sph(0.18, GOLD, [0, 0.68, 0]);
    b.tor(0.42, 0.04, '#e0a020', [0, 0.13, 0], [Math.PI / 2, 0, 0]); b.sph(0.09, '#c98a1a', [0, 0.1, 0]);
    b.tor(0.12, 0.05, RED, [-0.12, 0.86, 0], [0, 0, 0.6]); b.tor(0.12, 0.05, RED, [0.12, 0.86, 0], [0, 0, -0.6]);
    return b;
  },
  santahat: () => {
    const b = new B();
    b.cone(0.42, 1.0, RED, [0.08, 0.62, 0], [0, 0, -0.25], 18);
    b.tor(0.4, 0.12, WHITE, [0, 0.14, 0], [Math.PI / 2, 0, 0]); b.sph(0.14, WHITE, [0.36, 1.08, 0]);
    return b;
  },
  present_green: () => gift('#2fae55', RED),
  present_white: () => gift(WHITE, RED),
  cookie: () => {
    const b = new B();
    b.cyl(0.42, 0.42, 0.12, '#e3a85c', [0, 0.06, 0], [0, 0, 0], 22);
    for (let i = 0; i < 7; i++) { const a = i * 2.3, r = 0.1 + (i % 3) * 0.1; b.sph(0.05, '#5a3418', [Math.cos(a) * r, 0.12, Math.sin(a) * r], [1, 0.5, 1]); }
    return b;
  },
  sled: () => {
    const b = new B();
    for (const z of [-0.45, 0.45]) { b.box(2.0, 0.07, 0.07, GOLD, [0, 0.05, z]); b.tor(0.25, 0.035, GOLD, [1.0, 0.3, z], [0, 0, 0], Math.PI, 14); }
    b.rbox(1.9, 0.5, 1.1, 0.15, RED, [-0.05, 0.55, 0]); b.rbox(0.4, 0.75, 1.12, 0.12, RED, [-0.85, 0.75, 0]);
    b.rbox(1.92, 0.06, 1.12, 0.03, GOLD, [-0.05, 0.82, 0]);
    b.rbox(0.6, 0.45, 0.5, 0.06, '#2fae55', [0.1, 0.98, 0.2]); b.rbox(0.45, 0.35, 0.4, 0.06, '#ffd23f', [-0.4, 0.95, -0.2]);
    return b;
  },
  gingerhouse: () => {
    const b = new B(), G = '#c8793a';
    b.rbox(1.6, 1.0, 1.3, 0.08, G, [0, 0.5, 0]);
    for (const s of [1, -1]) b.rbox(1.8, 0.1, 0.95, 0.04, WHITE, [0, 1.25, s * 0.37], [s * 0.72, 0, 0]);
    b.rbox(0.36, 0.55, 0.06, 0.06, '#7a4a20', [0, 0.28, 0.66]);
    b.box(0.3, 0.3, 0.05, '#ffe17a', [-0.5, 0.6, 0.66]); b.box(0.3, 0.3, 0.05, '#ffe17a', [0.5, 0.6, 0.66]);
    for (let i = 0; i < 9; i++) b.sph(0.06, ['#ff3b4e', '#4cd07d', '#3d8bff', '#ffd23f'][i % 4], [-0.75 + i * 0.19, 1.02, 0.66]);
    for (const x of [-0.95, 0.95]) for (let i = 0; i < 4; i++) b.cyl(0.05, 0.05, 0.1, i % 2 ? WHITE : RED, [x, 0.05 + i * 0.1, 0.55], [0, 0, 0], 8);
    return b;
  },
  apple: () => {
    const b = new B();
    b.sph(0.36, RED, [0, 0.36, 0], [1, 0.95, 1]);
    b.cyl(0.03, 0.03, 0.2, BROWN, [0, 0.78, 0], [0, 0, 0.2], 6);
    b.sph(0.1, GREEN, [0.1, 0.8, 0], [1.4, 0.4, 0.8]);
    return b;
  },
  // ---------- food world (orders)
  coffee: () => {
    const b = new B();
    b.cyl(0.62, 0.62, 0.06, WHITE, [0, 0.03, 0], [0, 0, 0], 20); // saucer
    b.cyl(0.38, 0.3, 0.62, WHITE, [0, 0.37, 0], [0, 0, 0], 18);
    b.cyl(0.34, 0.34, 0.03, '#6b3b1f', [0, 0.67, 0], [0, 0, 0], 18);
    b.sph(0.1, '#f3e2c7', [0.05, 0.69, 0.04], [1.4, 0.25, 1]);
    b.tor(0.15, 0.05, WHITE, [0.43, 0.4, 0], [0, 0, 0], Math.PI * 2, 14);
    b.box(0.5, 0.1, 0.04, '#c98a54', [0, 0.38, 0.33]);
    return b;
  },
  croissant: () => {
    const b = new B();
    b.add(new THREE.TorusGeometry(0.42, 0.2, 10, 20, Math.PI * 1.15), '#e7a04a', [0, 0.2, 0], [Math.PI / 2, 0, -0.35 * Math.PI], [1, 1, 0.85]);
    b.sph(0.27, '#f0b55e', [0, 0.24, -0.35], [1.25, 0.9, 1]);
    b.sph(0.14, '#c9782e', [0.5, 0.15, 0.18], [1.2, 0.9, 1]);
    b.sph(0.14, '#c9782e', [-0.5, 0.15, 0.18], [1.2, 0.9, 1]);
    for (const x of [-0.25, 0, 0.25]) b.box(0.04, 0.03, 0.34, '#b8682a', [x, 0.46, -0.3], [0, x * 0.8, 0]);
    return b;
  },
  bread: () => {
    const b = new B();
    b.rbox(1.3, 0.46, 0.62, 0.2, '#d98f43', [0, 0.23, 0]);
    b.sph(0.4, '#e6a356', [0, 0.42, 0], [1.6, 0.6, 0.78]);
    for (const x of [-0.38, 0, 0.38]) b.box(0.08, 0.04, 0.5, '#f7d9a4', [x, 0.66, 0], [0, 0.5, 0]);
    return b;
  },
  pizza: () => {
    const b = new B();
    b.cyl(0.95, 0.95, 0.12, '#e6a14d', [0, 0.06, 0], [0, 0, 0], 28);
    b.cyl(0.84, 0.84, 0.13, '#ff5a36', [0, 0.07, 0], [0, 0, 0], 28);
    b.cyl(0.78, 0.78, 0.14, '#ffe08a', [0, 0.075, 0], [0, 0, 0], 28);
    const pep = [[0.35, 0.2], [-0.3, 0.38], [-0.4, -0.25], [0.15, -0.45], [0.5, -0.15], [-0.05, 0.05], [0.05, 0.52]];
    for (const [x, z] of pep) b.cyl(0.13, 0.13, 0.05, '#d8323c', [x, 0.16, z], [0, 0, 0], 12);
    for (const [x, z] of [[0.2, 0.0], [-0.15, -0.5], [-0.55, 0.05], [0.3, 0.45]]) b.box(0.14, 0.04, 0.06, '#3fa84e', [x, 0.165, z], [0, x * 3, 0]);
    return b;
  },
  tomato: () => {
    const b = new B();
    b.sph(0.4, '#ff4434', [0, 0.36, 0], [1, 0.85, 1], 18);
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; b.box(0.24, 0.03, 0.07, '#3fa84e', [Math.cos(a) * 0.1, 0.69, Math.sin(a) * 0.1], [0, -a, 0]); }
    b.cyl(0.03, 0.03, 0.14, '#2f8a3e', [0, 0.76, 0], [0, 0, 0], 6);
    return b;
  },
  lettuce: () => {
    const b = new B();
    b.sph(0.42, '#9be35a', [0, 0.38, 0], [1, 0.9, 1], 14);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; b.sph(0.3, i % 2 ? '#6fcf3f' : '#86dc4c', [Math.cos(a) * 0.32, 0.3, Math.sin(a) * 0.32], [1, 1.1, 0.55]); }
    return b;
  },
  burger: () => {
    const b = new B();
    b.cyl(0.55, 0.5, 0.18, '#e09a4c', [0, 0.09, 0], [0, 0, 0], 22);
    b.cyl(0.58, 0.58, 0.16, '#6b3b1f', [0, 0.26, 0], [0, 0, 0], 22);
    b.box(0.9, 0.04, 0.9, '#ffd23f', [0, 0.36, 0], [0, 0.6, 0]);
    b.cyl(0.6, 0.6, 0.06, '#5fcf4a', [0, 0.4, 0], [0, 0, 0], 12);
    b.sph(0.56, '#eda552', [0, 0.43, 0], [1, 0.62, 1]);
    for (const [x, z] of [[0.2, 0.1], [-0.2, 0.25], [0, -0.25], [-0.25, -0.1], [0.25, -0.2]]) b.sph(0.04, '#fff3d6', [x, 0.76, z], [1.4, 0.6, 0.8], 6);
    return b;
  },
  fries: () => {
    const b = new B();
    for (let i = 0; i < 9; i++) { const x = (i % 3 - 1) * 0.16, z = ((i / 3 | 0) - 1) * 0.1; b.box(0.09, 0.8, 0.09, '#ffd04a', [x, 0.75 + (i * 37 % 5) * 0.04, z], [(i % 2 - 0.5) * 0.25, 0, (i % 3 - 1) * 0.15]); }
    b.cyl(0.42, 0.32, 0.75, '#ff3b4e', [0, 0.38, 0], [0, 0, 0], 4, [1, 1, 0.6]);
    b.box(0.3, 0.2, 0.02, '#ffd23f', [0, 0.42, 0.22]);
    return b;
  },
  teapot: () => {
    const b = new B();
    b.sph(0.5, '#7fd6c0', [0, 0.45, 0], [1, 0.85, 1], 18);
    b.cyl(0.24, 0.3, 0.12, '#5fbfa8', [0, 0.85, 0], [0, 0, 0], 16);
    b.sph(0.08, WHITE, [0, 0.95, 0]);
    b.cyl(0.06, 0.12, 0.5, '#7fd6c0', [0.55, 0.55, 0], [0, 0, -0.9], 10);
    b.tor(0.2, 0.06, '#5fbfa8', [-0.5, 0.5, 0], [0, 0, 0], Math.PI * 2, 14);
    b.tor(0.5, 0.03, WHITE, [0, 0.45, 0], [Math.PI / 2, 0, 0]);
    return b;
  },
};

function carModel(color, s) {
  const b = new B();
  b.rbox(1.6 * s, 0.5 * s, 0.85 * s, 0.14 * s, color, [0, 0.45 * s, 0]);
  b.rbox(0.9 * s, 0.44 * s, 0.78 * s, 0.12 * s, color, [-0.05 * s, 0.88 * s, 0]);
  b.rbox(0.93 * s, 0.28 * s, 0.8 * s, 0.08 * s, '#cdeeff', [-0.05 * s, 0.9 * s, 0]);
  for (const x of [-0.5, 0.5]) for (const z of [-0.42, 0.42]) b.cyl(0.2 * s, 0.2 * s, 0.14 * s, BLACK, [x * s, 0.2 * s, z * s], [Math.PI / 2, 0, 0], 12);
  b.box(0.06, 0.12 * s, 0.2 * s, '#fff6b0', [0.81 * s, 0.5 * s, 0.25 * s]);
  b.box(0.06, 0.12 * s, 0.2 * s, '#fff6b0', [0.81 * s, 0.5 * s, -0.25 * s]);
  return b;
}

// Cache built geometry + footprint per model
const cache = {};
export function getModel(name) {
  if (!cache[name]) {
    const geo = MODELS[name]().build();
    const bb = geo.boundingBox;
    // true footprint radius: farthest point from the centre (box corners count!)
    const pa = geo.attributes.position.array; let foot = 0;
    for (let i = 0; i < pa.length; i += 3) foot = Math.max(foot, Math.hypot(pa[i], pa[i + 2]));
    cache[name] = { geo, foot, height: bb.max.y };
  }
  return cache[name];
}

export const itemMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.36, metalness: 0.04 });

// Render any geometry to a small PNG data URL (goal icons, building thumbnails)
let iconRenderer = null;
const iconCache = {};
export function geoIcon(key, geo, material, yaw = -0.6) {
  if (iconCache[key] !== undefined) return iconCache[key];
  try {
    if (!iconRenderer) {
      iconRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      iconRenderer.setSize(128, 128); iconRenderer.setPixelRatio(1);
      iconRenderer.toneMapping = THREE.ACESFilmicToneMapping; iconRenderer.toneMappingExposure = 1.15;
      iconRenderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffd6ec, 2.2));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(2, 4, 3); scene.add(dl);
    if (!geo.boundingBox) geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const foot = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2, height = bb.max.y;
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.y = yaw; scene.add(mesh);
    const size = Math.max(foot * 2, height);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    const d = size * 2.3;
    cam.position.set(0, height * 0.5 + d * 0.55, d);
    cam.lookAt(0, height * 0.45, 0);
    iconRenderer.render(scene, cam);
    iconCache[key] = iconRenderer.domElement.toDataURL('image/png');
  } catch (e) { iconCache[key] = ''; }
  return iconCache[key];
}
export function modelIcon(name) { return geoIcon('m_' + name, getModel(name).geo, itemMaterial); }
