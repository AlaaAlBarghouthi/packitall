// Procedural low-poly models. Each model is merged into ONE geometry with vertex
// colors so every item is a single draw call (fast on phones).
import * as THREE from './lib/three.module.min.js';

const C = (hex) => new THREE.Color(hex);

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
  cyl(rt, rb, h, c, p, r, seg = 16, s) { return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), c, p, r, s); }
  sph(rad, c, p, s, seg = 14) { return this.add(new THREE.SphereGeometry(rad, seg, Math.max(6, seg * 0.7 | 0)), c, p, [0, 0, 0], s); }
  tor(R, t, c, p, r, arc = Math.PI * 2, seg = 24) { return this.add(new THREE.TorusGeometry(R, t, 10, seg, arc), c, p, r); }
  cone(rad, h, c, p, r, seg = 14) { return this.add(new THREE.ConeGeometry(rad, h, seg), c, p, r); }
  build() {
    let pos = [], nor = [], col = [];
    const nm = new THREE.Matrix3();
    for (const pt of this.parts) {
      const g = pt.geo.index ? pt.geo.toNonIndexed() : pt.geo;
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
  b.box(1, 0.9, 1, box, [0, 0.45, 0]);
  b.box(1.04, 0.2, 1.04, box, [0, 0.95, 0]); // lid
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
    b.box(0.9, 0.9, 0.5, '#ff9ccb', [0, 0.45, 0]);
    b.box(0.7, 0.7, 0.52, '#ffc2de', [0, 0.45, 0]);
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
    b.box(0.95, 1.05, 0.45, '#b37dff', [0, 0.52, 0]);
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
    b.box(1.2, 0.8, 0.55, BLUE, [0, 0.4, 0]);
    b.box(1.22, 0.24, 0.57, WHITE, [0, 0.12, 0]);
    b.cyl(0.3, 0.32, 0.25, '#e8eef9', [0, 0.42, 0.37], [Math.PI / 2, 0, 0]);
    b.cyl(0.2, 0.2, 0.27, BLACK, [0, 0.42, 0.39], [Math.PI / 2, 0, 0]);
    b.box(0.25, 0.14, 0.2, WHITE, [-0.38, 0.86, 0]);
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
    b.box(0.5, 0.5, 0.5, RED, [-0.28, 0.25, 0]);
    b.box(0.5, 0.5, 0.5, BLUE, [0.28, 0.25, 0]);
    b.box(0.5, 0.5, 0.5, YELLOW, [0, 0.75, 0], [0, 0.4, 0]);
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
    b.box(0.7, 0.7, 0.5, '#9fb3c8', [0, 0.65, 0]);
    b.box(0.55, 0.45, 0.45, '#c9d6e3', [0, 1.25, 0]);
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
    b.box(0.5, 0.4, 0.35, BLUE, [0, 1.05, 0]);
    b.cyl(0.175, 0.175, 0.5, BLUE, [0, 1.25, 0], [0, 0, Math.PI / 2], 12);
    b.box(0.04, 0.2, 0.12, RED, [0.27, 1.25, 0]);
    return b;
  },
  car: () => carModel(SKY, 1.3),
  taxi: () => carModel(YELLOW, 1.3),
  bus: () => {
    const b = new B();
    b.box(3.4, 1.3, 1.2, ORANGE, [0, 0.95, 0]);
    b.box(3.42, 0.4, 1.22, SKY, [0, 1.2, 0]);
    b.box(3.44, 0.12, 1.24, WHITE, [0, 0.62, 0]);
    for (const x of [-1.1, 1.1]) for (const z of [-0.6, 0.6]) b.cyl(0.3, 0.3, 0.2, BLACK, [x, 0.3, z], [Math.PI / 2, 0, 0], 12);
    return b;
  },
  house: () => {
    const b = new B();
    b.box(2.2, 1.6, 2.0, '#ffe6c7', [0, 0.8, 0]);
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
    b.box(0.9, 0.16, 0.9, TAN, [0, 0.08, 0]);
    b.box(0.95, 0.06, 0.95, GREEN, [0, 0.19, 0]);
    b.box(0.88, 0.1, 0.88, '#ff8a8a', [0, 0.27, 0]);
    b.box(0.92, 0.06, 0.92, YELLOW, [0, 0.35, 0]);
    b.box(0.9, 0.16, 0.9, TAN, [0, 0.46, 0]);
    return b;
  },
  juice: () => {
    const b = new B();
    b.box(0.5, 0.8, 0.4, YELLOW, [0, 0.4, 0]);
    b.box(0.5, 0.15, 0.4, ORANGE, [0, 0.86, 0], [0, 0, 0]);
    b.cyl(0.03, 0.03, 0.5, WHITE, [0.1, 1.1, 0], [0, 0, 0.3], 6);
    b.sph(0.15, ORANGE, [0, 0.45, 0.2], [1, 1, 0.3]);
    return b;
  },
  basket: () => {
    const b = new B();
    b.box(1.6, 0.8, 1.1, '#d49a5b', [0, 0.4, 0]);
    b.box(1.65, 0.12, 1.15, '#b77c3f', [0, 0.82, 0]);
    b.tor(0.6, 0.06, '#b77c3f', [0, 0.85, 0], [0, 0, 0], Math.PI);
    b.box(1.2, 0.05, 0.9, RED, [0, 0.9, 0], [0, 0, 0.05]);
    return b;
  },
  apple: () => {
    const b = new B();
    b.sph(0.36, RED, [0, 0.36, 0], [1, 0.95, 1]);
    b.cyl(0.03, 0.03, 0.2, BROWN, [0, 0.78, 0], [0, 0, 0.2], 6);
    b.sph(0.1, GREEN, [0.1, 0.8, 0], [1.4, 0.4, 0.8]);
    return b;
  },
};

function carModel(color, s) {
  const b = new B();
  b.box(1.6 * s, 0.5 * s, 0.85 * s, color, [0, 0.45 * s, 0]);
  b.box(0.9 * s, 0.42 * s, 0.78 * s, color, [-0.05 * s, 0.9 * s, 0]);
  b.box(0.92 * s, 0.3 * s, 0.8 * s, '#cdeeff', [-0.05 * s, 0.9 * s, 0]);
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
    const foot = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2;
    cache[name] = { geo, foot, height: bb.max.y };
  }
  return cache[name];
}

export const itemMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05 });

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
