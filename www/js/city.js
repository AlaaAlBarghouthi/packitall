// City builder scene
import * as THREE from './lib/three.module.min.js';
import { B, getModel, itemMaterial, geoIcon } from './models.js';
import { GRID, PLOT_UNLOCK } from './data.js';
import { S, plotUnlocked, pendingIncome } from './state.js';

const PLOT = 6, ROAD = 2.2;
const SPAN = GRID * PLOT + (GRID + 1) * ROAD;
const cityMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0xbfefff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55 });

function plotCenter(i) {
  const gx = i % GRID, gz = Math.floor(i / GRID);
  const x = -SPAN / 2 + ROAD + PLOT / 2 + gx * (PLOT + ROAD);
  const z = -SPAN / 2 + ROAD + PLOT / 2 + gz * (PLOT + ROAD);
  return [x, z];
}

// ---------------------------------------------------------------- buildings
const W = '#fff3e0', CREAM = '#ffe4c4', ROOF_R = '#e8483f', ROOF_B = '#3a6fe0', ROOF_P = '#b05cf0', WIN = '#ffd85a', DOOR = '#8a5a35',
  GREEN = '#4cc46f', STONE = '#d9d4cf', PINK = '#ff8fc0', WHITE = '#ffffff', GOLD = '#f6c143', DARK = '#3b3446';

function windows(b, w, d, y, color = WIN, n = 2) {
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * (w / n);
    b.box(0.55, 0.6, 0.06, color, [x, y, d / 2 + 0.02]);
    b.box(0.06, 0.6, 0.55, color, [w / 2 + 0.02, y, -d / 2 + (i + 0.5) * (d / n)]);
  }
}
function awning(b, w, d, y, c1, c2) {
  const n = 6;
  for (let i = 0; i < n; i++) b.box(w / n, 0.08, 0.9, i % 2 ? c1 : c2, [-w / 2 + (i + 0.5) * (w / n), y, d / 2 + 0.4], [0.35, 0, 0]);
}
function pyramid(b, size, h, color, y) { b.cone(size * 0.72, h, color, [0, y + h / 2, 0], [0, Math.PI / 4, 0], 4); }

function shop({ wall, roof, aw1, aw2, sign, prop }, lv) {
  const b = new B();
  const w = 3.8, d = 3.4, fh = 1.5;
  const floors = lv;
  b.box(w + 0.4, 0.25, d + 0.4, STONE, [0, 0.12, 0]);
  for (let f = 0; f < floors; f++) {
    b.box(w, fh, d, wall, [0, 0.25 + fh / 2 + f * fh, 0]);
    windows(b, w, d, 0.25 + fh * 0.55 + f * fh, WIN, 2);
  }
  const top = 0.25 + floors * fh;
  b.box(0.8, 1.0, 0.07, DOOR, [0, 0.75, d / 2 + 0.03]);
  awning(b, w, d, 1.45, aw1, aw2);
  if (sign) b.box(1.6, 0.45, 0.1, sign, [0, top - 0.3, d / 2 + 0.08]);
  if (roof === 'flat') b.box(w + 0.2, 0.2, d + 0.2, aw1, [0, top + 0.1, 0]);
  else pyramid(b, Math.max(w, d) + 0.3, 1.4, roof, top);
  if (prop) prop(b, roof === 'flat' ? top + 0.2 : top + 0.6);
  return b;
}

const DEFS = {
  house: (lv) => {
    const b = new B();
    const w = 3.4, d = 3.0, fh = 1.6;
    b.box(4.6, 0.2, 4.6, GREEN, [0, 0.1, 0]);
    for (let f = 0; f < Math.min(lv, 2); f++) { b.box(w, fh, d, CREAM, [0, 0.2 + fh / 2 + f * fh, 0]); windows(b, w, d, 0.2 + fh * 0.55 + f * fh); }
    const top = 0.2 + Math.min(lv, 2) * fh;
    pyramid(b, 4.0, 1.5, ROOF_R, top);
    b.box(0.35, 0.9, 0.35, '#c0573f', [1.0, top + 0.9, -0.5]);
    b.box(0.7, 1.0, 0.07, DOOR, [0, 0.7, d / 2 + 0.03]);
    if (lv >= 3) { b.box(w + 0.3, 0.1, 0.8, WHITE, [0, 0.2 + fh, d / 2 + 0.4]); for (let i = -2; i <= 2; i++) b.box(0.06, 0.4, 0.06, WHITE, [i * 0.8, 0.2 + fh + 0.25, d / 2 + 0.78]); }
    for (const x of [-1.9, 1.9]) b.sph(0.45, '#ff9fd0', [x, 0.55, 1.9]);
    return b;
  },
  cafe: (lv) => shop({ wall: '#f6d7b0', roof: '#8b5a3c', aw1: '#ff5a5a', aw2: WHITE, sign: '#ff5a5a',
    prop: (b, y) => { b.cyl(0.45, 0.35, 0.6, WHITE, [0, y + 0.3, 0]); b.tor(0.2, 0.06, WHITE, [0.5, y + 0.3, 0]); b.cyl(0.4, 0.4, 0.05, '#6b3f22', [0, y + 0.58, 0]); } }, lv),
  icecream: (lv) => shop({ wall: '#f8c8ff', roof: 'flat', aw1: '#b05cf0', aw2: WHITE, sign: '#ff7fb5',
    prop: (b, y) => { b.cone(0.5, 1.3, '#e9b673', [0, y + 0.65, 0], [Math.PI, 0, 0]); b.sph(0.6, '#fff0f6', [0, y + 1.5, 0]); b.sph(0.5, '#ff9fc8', [0, y + 2.1, 0]); b.sph(0.15, '#ff3b4e', [0, y + 2.6, 0]); } }, lv),
  bakery: (lv) => shop({ wall: '#ffe9c7', roof: '#d9772b', aw1: '#ffb347', aw2: WHITE, sign: '#d9772b',
    prop: (b, y) => { b.sph(0.6, '#e9a55a', [0, y + 0.3, 0], [1.6, 0.6, 0.9]); } }, lv),
  boutique: (lv) => shop({ wall: WHITE, roof: ROOF_B, aw1: '#3a6fe0', aw2: WHITE, sign: GOLD,
    prop: (b, y) => { b.box(0.9, 1.0, 0.4, '#ffd23f', [0, y + 0.5, 0]); b.tor(0.25, 0.05, '#3a6fe0', [0, y + 1.0, 0], [0, 0, 0], Math.PI); } }, lv),
  toystore: (lv) => shop({ wall: '#cfe8ff', roof: '#ff9a3c', aw1: '#ffd23f', aw2: '#3d8bff', sign: '#ff3b4e',
    prop: (b, y) => { b.sph(0.6, '#ff3b4e', [0, y + 0.6, 0]); b.tor(0.6, 0.06, WHITE, [0, y + 0.6, 0], [Math.PI / 2, 0, 0]); } }, lv),
  cinema: (lv) => shop({ wall: '#3b2b5a', roof: 'flat', aw1: '#ff4f9a', aw2: GOLD, sign: GOLD,
    prop: (b, y) => { b.box(2.6, 0.9, 0.2, '#ff4f9a', [0, y + 0.45, 1.2]); for (let i = 0; i < 6; i++) b.sph(0.08, '#fff6b0', [-1.1 + i * 0.44, y + 0.9, 1.32]); } }, lv),
  fountain: (lv) => {
    const b = new B();
    b.cyl(2.4, 2.5, 0.2, STONE, [0, 0.1, 0], [0, 0, 0], 24);
    b.cyl(2.0, 2.1, 0.5, '#e8e1d8', [0, 0.35, 0], [0, 0, 0], 24);
    b.cyl(1.8, 1.8, 0.52, '#6fd0ff', [0, 0.36, 0], [0, 0, 0], 24);
    b.cyl(0.3, 0.4, 1.2, '#e8e1d8', [0, 1.1, 0], [0, 0, 0], 12);
    b.cyl(1.0, 0.8, 0.25, '#e8e1d8', [0, 1.75, 0], [0, 0, 0], 20);
    b.cyl(0.85, 0.85, 0.26, '#6fd0ff', [0, 1.77, 0], [0, 0, 0], 20);
    if (lv >= 2) { b.cyl(0.15, 0.2, 0.7, '#e8e1d8', [0, 2.2, 0]); b.cyl(0.5, 0.4, 0.15, '#e8e1d8', [0, 2.6, 0]); }
    b.sph(0.35, '#bfeaff', [0, lv >= 2 ? 2.9 : 2.1, 0], [1, 1.4, 1]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; b.sph(0.4, i % 2 ? '#ff9fd0' : '#ffd23f', [Math.cos(a) * 2.7, 0.4, Math.sin(a) * 2.7]); }
    return b;
  },
  park: (lv) => {
    const b = new B();
    b.box(5.4, 0.2, 5.4, '#6fd68a', [0, 0.1, 0]);
    b.box(5.4, 0.22, 0.8, '#e8d8b8', [0, 0.11, 0]); b.box(0.8, 0.22, 5.4, '#e8d8b8', [0, 0.11, 0]);
    const trees = [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]].slice(0, 2 + lv);
    trees.forEach(([x, z], i) => { b.cyl(0.15, 0.2, 1, '#9a6233', [x, 0.7, z]); b.sph(0.9, i % 2 ? '#ff9fd0' : '#3fbf6d', [x, 1.7, z]); });
    b.box(1.4, 0.1, 0.4, '#9a6233', [1.6, 0.55, 0.0]);
    if (lv >= 3) { b.sph(0.5, '#ffd23f', [-1.8, 0.5, 0]); }
    return b;
  },
  greenhouse: (lv) => {
    const b = new B();
    b.box(4.8, 0.3, 4.0, STONE, [0, 0.15, 0]);
    for (let i = 0; i < 5; i++) b.sph(0.4, ['#ff6fae', '#ffd23f', '#4cc46f', '#b05cf0', '#ff9a3c'][i], [-1.6 + i * 0.8, 0.6, 0]);
    // frame
    for (const x of [-2.2, 2.2]) for (const z of [-1.8, 1.8]) b.box(0.12, 2.0 + lv * 0.3, 0.12, WHITE, [x, 1.2 + lv * 0.15, z]);
    return b;
  },
  mansion: (lv) => {
    const b = new B();
    b.box(5.4, 0.2, 5.4, GREEN, [0, 0.1, 0]);
    b.box(4.2, 2.6, 3.0, '#fdebd3', [0, 1.5, -0.5]);
    windows(b, 4.2, 3.0, 1.0, WIN, 3); windows(b, 4.2, 3.0, 2.2, WIN, 3);
    b.cone(3.3, 1.6, ROOF_R, [0, 3.6, -0.5], [0, Math.PI / 4, 0], 4);
    for (const x of [-1.2, -0.4, 0.4, 1.2]) b.cyl(0.12, 0.12, 2.4, WHITE, [x, 1.4, 1.3], [0, 0, 0], 8);
    b.box(3.2, 0.2, 0.8, WHITE, [0, 2.7, 1.2]);
    if (lv >= 2) { b.box(1.4, 0.1, 1.6, '#6fd0ff', [-1.8, 0.21, 2.0]); }
    if (lv >= 3) { b.box(1.2, 3.4, 1.2, '#fdebd3', [2.0, 1.9, -1.2]); b.cone(1.0, 1.2, ROOF_R, [2.0, 4.2, -1.2], [0, Math.PI / 4, 0], 4); }
    return b;
  },
  hotel: (lv) => {
    const b = new B();
    const floors = 3 + lv * 2;
    b.box(5, 0.25, 4.4, STONE, [0, 0.12, 0]);
    for (let f = 0; f < floors; f++) { b.box(3.6, 1.0, 3.2, f % 2 ? '#ffd3b8' : '#ffe2cc', [0, 0.75 + f, 0]); windows(b, 3.6, 3.2, 0.8 + f, '#bfe8ff', 3); }
    b.box(3.8, 0.3, 3.4, '#ff5a8a', [0, 0.25 + floors + 0.15, 0]);
    b.box(2.0, 0.6, 0.15, GOLD, [0, floors - 0.2, 1.7]);
    awning(b, 3.6, 3.2, 1.3, '#ff5a8a', WHITE);
    return b;
  },
  tower: (lv) => {
    const b = new B();
    const h = 6 + lv * 2.5;
    b.box(4.4, 0.25, 4.4, STONE, [0, 0.12, 0]);
    b.box(2.8, h, 2.8, '#9fd3ff', [0, 0.25 + h / 2, 0]);
    for (let f = 0; f < h - 0.5; f += 0.8) b.box(2.84, 0.08, 2.84, WHITE, [0, 0.6 + f, 0]);
    b.box(1.6, 1.2, 1.6, '#d8efff', [0, h + 0.85, 0]);
    b.cyl(0.05, 0.05, 2, '#c0c0c0', [0, h + 2.4, 0], [0, 0, 0], 6); b.sph(0.15, '#ff3b4e', [0, h + 3.4, 0]);
    return b;
  },
  ferris: (lv) => {
    const b = new B();
    const R = 2.2 + lv * 0.2;
    b.box(5, 0.2, 3, '#e8d8b8', [0, 0.1, 0]);
    b.box(0.2, R + 0.6, 0.2, WHITE, [-0.9, (R + 0.6) / 2, 0], [0, 0, -0.35]);
    b.box(0.2, R + 0.6, 0.2, WHITE, [0.9, (R + 0.6) / 2, 0], [0, 0, 0.35]);
    b.tor(R, 0.09, '#ff6fae', [0, R + 0.6, 0]);
    b.tor(R * 0.5, 0.06, WHITE, [0, R + 0.6, 0]);
    const cols = ['#ffd23f', '#3d8bff', '#4cc46f', '#ff3b4e', '#b05cf0', '#ff9a3c', '#7ff0c8', '#ff8fc0'];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      b.box(0.06, R, 0.06, WHITE, [Math.cos(a) * R / 2, R + 0.6 + Math.sin(a) * R / 2, 0], [0, 0, a - Math.PI / 2]);
      b.box(0.55, 0.5, 0.5, cols[i], [Math.cos(a) * R, R + 0.6 + Math.sin(a) * R - 0.3, 0]);
    }
    return b;
  },
  stadium: (lv) => {
    const b = new B();
    b.cyl(2.8, 2.9, 1.2 + lv * 0.3, '#e9eef7', [0, 0.6 + lv * 0.15, 0], [0, 0, 0], 28);
    b.cyl(2.2, 2.2, 1.25 + lv * 0.3, '#4cc46f', [0, 0.62 + lv * 0.15, 0], [0, 0, 0], 28);
    b.box(2.4, 0.02, 0.06, WHITE, [0, 1.26 + lv * 0.3, 0]);
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.28 + 0.78; b.cyl(0.08, 0.08, 3, '#c0c0c0', [Math.cos(a) * 2.6, 1.5, Math.sin(a) * 2.6]); b.box(0.6, 0.3, 0.1, '#fff6b0', [Math.cos(a) * 2.6, 3.0, Math.sin(a) * 2.6]); }
    return b;
  },
  castle: (lv) => {
    const b = new B();
    b.box(5.2, 0.3, 5.2, STONE, [0, 0.15, 0]);
    b.box(3.4, 2.4 + lv * 0.4, 3.4, '#f1e4ff', [0, 1.5 + lv * 0.2, 0]);
    const th = 3.4 + lv * 0.5;
    for (const x of [-2, 2]) for (const z of [-2, 2]) {
      b.cyl(0.6, 0.6, th, '#e6d4ff', [x, 0.3 + th / 2, z]);
      b.cone(0.75, 1.3, ROOF_P, [x, 0.3 + th + 0.65, z]);
      b.box(0.04, 0.5, 0.35, '#ff6fae', [x, 0.3 + th + 1.6, z + 0.2]);
    }
    b.cyl(0.9, 0.9, 1.2, '#e6d4ff', [0, 2.7 + lv * 0.4 + 0.6, 0]);
    b.cone(1.1, 1.8, ROOF_P, [0, 2.7 + lv * 0.4 + 2.1, 0]);
    b.box(0.9, 1.3, 0.1, DOOR, [0, 0.95, 1.72]);
    return b;
  },
};

const bcache = {};
function buildingGeo(type, lv) {
  const k = type + lv;
  if (!bcache[k]) bcache[k] = DEFS[type](lv).build();
  return bcache[k];
}

function textSprite(draw, size = 1.6) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  draw(c.getContext('2d'));
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false }));
  s.scale.set(size, size, 1);
  return s;
}
const lockSprite = () => textSprite((g) => {
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill();
  g.strokeStyle = '#6b6b7b'; g.lineWidth = 10; g.beginPath(); g.arc(64, 54, 18, Math.PI, 0); g.stroke();
  g.fillStyle = '#6b6b7b'; g.fillRect(38, 54, 52, 40); g.fillStyle = '#fff'; g.fillRect(60, 66, 8, 14);
});
const plusSprite = () => textSprite((g) => {
  g.fillStyle = 'rgba(155,92,240,0.95)'; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke();
  g.fillStyle = '#fff'; g.fillRect(56, 32, 16, 64); g.fillRect(32, 56, 64, 16);
});
const coinSprite = () => textSprite((g) => {
  g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 60, 56, 0, 7); g.fill();
  g.beginPath(); g.moveTo(50, 110); g.lineTo(78, 110); g.lineTo(64, 126); g.fill();
  const grd = g.createRadialGradient(56, 50, 4, 64, 60, 44); grd.addColorStop(0, '#fff3a0'); grd.addColorStop(1, '#f0a81c');
  g.fillStyle = grd; g.beginPath(); g.arc(64, 60, 40, 0, 7); g.fill();
  g.strokeStyle = '#d98c0a'; g.lineWidth = 5; g.beginPath(); g.arc(64, 60, 30, 0, 7); g.stroke();
  g.fillStyle = '#d98c0a'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', 64, 62);
}, 1.8);

export class CityScene {
  constructor(renderer, events) {
    this.renderer = renderer; this.events = events; // { onPlotTap(i), onCoinTap(i) }
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#8fd3ff');
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 500);
    this.zoom = 1; this.pan = new THREE.Vector2(0, 0); this.yaw = Math.PI / 4;
    this.slots = []; this.ray = new THREE.Raycaster(); this.time = 0;
    this._buildWorld();
    this._bindInput();
    this.refresh();
  }

  _buildWorld() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight(0xffffff, 0x6fbf73, 1.5));
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
    sun.position.set(-25, 40, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.far = 120;
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
    s.add(sun);

    // water
    const water = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x3fb6ff, roughness: 0.25, metalness: 0.1 }));
    water.rotation.x = -Math.PI / 2; water.position.y = -1.2; s.add(water); this.water = water;
    // island
    const isl = SPAN + 10;
    const island = new THREE.Mesh(new THREE.BoxGeometry(isl, 2, isl), new THREE.MeshStandardMaterial({ color: 0x7ed06b, roughness: 0.9 }));
    island.position.y = -1; island.receiveShadow = true; s.add(island);
    const shore = new THREE.Mesh(new THREE.BoxGeometry(isl + 2, 1.2, isl + 2), new THREE.MeshStandardMaterial({ color: 0xf2dca6 }));
    shore.position.y = -1.5; s.add(shore);
    // roads
    const road = new THREE.Mesh(new THREE.BoxGeometry(SPAN, 0.1, SPAN), new THREE.MeshStandardMaterial({ color: 0x8f93a3, roughness: 0.9 }));
    road.position.y = 0.0; road.receiveShadow = true; s.add(road);
    // road dashes
    const dash = new B();
    for (let k = 0; k <= GRID; k++) {
      const c = -SPAN / 2 + ROAD / 2 + k * (PLOT + ROAD);
      for (let t = -SPAN / 2 + 1; t < SPAN / 2 - 0.5; t += 2) {
        dash.box(0.8, 0.02, 0.12, '#ffffff', [t, 0.06, c]);
        dash.box(0.12, 0.02, 0.8, '#ffffff', [c, 0.06, t]);
      }
    }
    const dm = new THREE.Mesh(dash.build(), cityMat); dm.position.y = 0.05; s.add(dm);

    // decor ring of trees and lamps
    const deco = new B();
    const R = () => Math.random();
    for (let i = 0; i < 70; i++) {
      const side = i % 4, tpos = (R() - 0.5) * (isl - 2);
      const off = SPAN / 2 + 1.3 + R() * 2.8;
      const [x, z] = side === 0 ? [tpos, -off] : side === 1 ? [tpos, off] : side === 2 ? [-off, tpos] : [off, tpos];
      const pink = R() < 0.35;
      deco.cyl(0.12, 0.16, 0.8, '#9a6233', [x, 0.4, z], [0, 0, 0], 6);
      deco.sph(0.55 + R() * 0.35, pink ? '#ff9fd0' : (R() < 0.5 ? '#3fbf6d' : '#5fe08f'), [x, 1.2, z], [1, 1, 1], 8);
    }
    const dmesh = new THREE.Mesh(deco.build(), cityMat); dmesh.castShadow = true;
    s.add(dmesh);
    // lamps at intersections
    const lampGeo = getModel('lamp');
    for (let a = 0; a <= GRID; a++) for (let b = 0; b <= GRID; b++) {
      if ((a + b) % 2) continue;
      const m = new THREE.Mesh(lampGeo.geo, itemMaterial);
      m.position.set(-SPAN / 2 + ROAD / 2 + a * (PLOT + ROAD) + 0.9, 0.05, -SPAN / 2 + ROAD / 2 + b * (PLOT + ROAD) + 0.9);
      m.scale.setScalar(0.8); m.castShadow = true; s.add(m);
    }
    // a few cars on roads
    this.cars = [];
    ['car', 'taxi', 'car', 'bus'].forEach((n, i) => {
      const m = new THREE.Mesh(getModel(n).geo, itemMaterial);
      m.scale.setScalar(n === 'bus' ? 0.5 : 0.6); m.castShadow = true; s.add(m);
      this.cars.push({ m, lane: i, t: Math.random() * SPAN, sp: 2.5 + Math.random() * 2 });
    });

    // plots
    for (let i = 0; i < GRID * GRID; i++) {
      const [x, z] = plotCenter(i);
      const g = new THREE.Group(); g.position.set(x, 0.05, z); s.add(g);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(PLOT - 0.3, 0.25, PLOT - 0.3), new THREE.MeshStandardMaterial({ color: 0xb8e6a0, roughness: 0.9 }));
      pad.position.y = 0.12; pad.receiveShadow = true; pad.userData.plot = i; g.add(pad);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(PLOT, 0.2, PLOT), new THREE.MeshStandardMaterial({ color: 0xe8e4dc }));
      curb.position.y = 0.08; g.add(curb);
      this.slots.push({ g, pad, building: null, key: '', marker: null, coin: null, glass: null });
    }
  }

  refresh() {
    this.slots.forEach((sl, i) => {
      const p = S.plots[i];
      const unlocked = plotUnlocked(i);
      const key = (unlocked ? 'u' : 'l') + (p.b || '') + p.lv;
      if (key === sl.key) return;
      sl.key = key;
      if (sl.building) { sl.g.remove(sl.building); sl.building = null; }
      if (sl.glass) { sl.g.remove(sl.glass); sl.glass = null; }
      if (sl.marker) { sl.g.remove(sl.marker); sl.marker = null; }
      sl.pad.material.color.set(!unlocked ? 0xb9bcc6 : p.b ? 0xa8dc8f : 0xc9f0b4);
      if (!unlocked) {
        sl.marker = lockSprite(); sl.marker.position.y = 1.4; sl.g.add(sl.marker);
      } else if (!p.b) {
        sl.marker = plusSprite(); sl.marker.position.y = 1.3; sl.g.add(sl.marker);
      } else {
        const m = new THREE.Mesh(buildingGeo(p.b, p.lv), cityMat);
        m.position.y = 0.25; m.castShadow = true; m.receiveShadow = true; m.userData.plot = i;
        sl.g.add(m); sl.building = m;
        if (p.b === 'greenhouse') {
          const gl = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2 + p.lv * 0.3, 3.6), glassMat);
          gl.position.y = 0.25 + 1.3 + p.lv * 0.15; sl.g.add(gl); sl.glass = gl;
          const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 4.4, 4, 1, false, 0, Math.PI), glassMat);
          roof.rotation.z = Math.PI / 2; roof.rotation.y = 0; roof.position.y = 0.25 + 2.3 + p.lv * 0.3; roof.scale.set(1, 1, 0.6); gl.add(roof); roof.position.set(0, 1 + p.lv * 0.15, 0);
        }
        // pop-in animation
        m.scale.setScalar(0.01); m.userData.grow = 0;
      }
    });
  }

  burst(i) {
    // celebratory particles above plot
    const [x, z] = plotCenter(i);
    const geo = new THREE.BufferGeometry(); const pts = [], vel = [];
    for (let k = 0; k < 40; k++) { pts.push(x, 2, z); vel.push((Math.random() - 0.5) * 8, 4 + Math.random() * 6, (Math.random() - 0.5) * 8); }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const cols = []; const pal = [[1, .8, .2], [1, .4, .7], [.6, .4, 1], [.3, .8, 1]];
    for (let k = 0; k < 40; k++) cols.push(...pal[k % 4]);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true }));
    p.userData = { vel, life: 1.2 }; this.scene.add(p);
    (this.bursts = this.bursts || []).push(p);
  }

  _bindInput() {
    const cvs = this.renderer.domElement;
    const pts = new Map(); let moved = 0, pinch0 = 0, zoom0 = 1;
    cvs.addEventListener('pointerdown', (e) => {
      if (!this.active) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0;
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = this.zoom; }
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.active || !pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId); const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved += Math.abs(dx) + Math.abs(dy);
      if (pts.size === 1) {
        const k = 0.045 * this.zoom;
        // screen -> world (camera yawed by 45deg)
        const c = Math.cos(this.yaw), s = Math.sin(this.yaw);
        this.pan.x -= (dx * c + dy * s) * k; this.pan.y -= (-dx * s + dy * c) * k;
        const L = SPAN / 2 + 2; this.pan.x = THREE.MathUtils.clamp(this.pan.x, -L, L); this.pan.y = THREE.MathUtils.clamp(this.pan.y, -L, L);
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoom = THREE.MathUtils.clamp(zoom0 * pinch0 / Math.max(1, d), 0.35, 1.3);
      }
    });
    const up = (e) => {
      if (!this.active) return;
      const wasTap = pts.size === 1 && moved < 10;
      pts.delete(e.pointerId);
      if (wasTap) this._tap(e.clientX, e.clientY);
    };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', (e) => pts.delete(e.pointerId));
    cvs.addEventListener('wheel', (e) => { if (!this.active) return; this.zoom = THREE.MathUtils.clamp(this.zoom * (e.deltaY > 0 ? 1.1 : 0.9), 0.45, 1.6); }, { passive: true });
  }

  _tap(x, y) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    // coin bubbles first
    const coins = this.slots.map(s => s.coin).filter(Boolean);
    let hit = this.ray.intersectObjects(coins, false)[0];
    if (hit) { this.events.onCoinTap(hit.object.userData.plot); return; }
    const objs = [];
    this.slots.forEach(s => { objs.push(s.pad); if (s.building) objs.push(s.building); if (s.marker) { s.marker.userData.plot = this.slots.indexOf(s); objs.push(s.marker); } });
    hit = this.ray.intersectObjects(objs, false)[0];
    if (hit && hit.object.userData.plot !== undefined) this.events.onPlotTap(hit.object.userData.plot);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  update(dt) {
    this.time += dt;
    // coin bubbles
    this.slots.forEach((sl, i) => {
      const has = S.plots[i].b && pendingIncome(i) >= 1;
      if (has && !sl.coin) { sl.coin = coinSprite(); sl.coin.userData.plot = i; sl.g.add(sl.coin); }
      if (!has && sl.coin) { sl.g.remove(sl.coin); sl.coin = null; }
      if (sl.coin) { const h = sl.building ? new THREE.Box3().setFromObject(sl.building).max.y : 2; sl.coin.position.y = Math.max(3, h + 1) + Math.sin(this.time * 3 + i) * 0.2; }
      if (sl.marker) sl.marker.position.y = 1.4 + Math.sin(this.time * 2 + i) * 0.12;
      if (sl.building && sl.building.userData.grow !== undefined) {
        const gr = sl.building.userData.grow = Math.min(1, sl.building.userData.grow + dt * 2.5);
        const e = gr < 1 ? 1 + Math.sin(gr * Math.PI) * 0.15 - (1 - gr) : 1;
        sl.building.scale.set(Math.max(0.01, e), Math.max(0.01, gr < 1 ? e : 1), Math.max(0.01, e));
        if (gr >= 1) { delete sl.building.userData.grow; sl.building.scale.setScalar(1); }
      }
    });
    // cars loop around the road grid
    this.cars.forEach((c) => {
      c.t = (c.t + c.sp * dt) % (SPAN * 4);
      const L = SPAN - ROAD; const off = -SPAN / 2 + ROAD / 2; const t = c.t % (L * 4); const seg = Math.floor(t / L), u = t % L;
      const lane = c.lane % (GRID + 1); const inner = off + lane * (PLOT + ROAD) * 0 ; // perimeter loop
      let x, z, ry;
      if (seg === 0) { x = off + u; z = off; ry = 0; } else if (seg === 1) { x = off + L; z = off + u; ry = -Math.PI / 2; }
      else if (seg === 2) { x = off + L - u; z = off + L; ry = Math.PI; } else { x = off; z = off + L - u; ry = Math.PI / 2; }
      const shift = (c.lane - 1.5) * 0.0;
      c.m.position.set(x + shift, 0.06, z); c.m.rotation.y = ry;
      if (c.lane % 2) { c.m.position.set(-x, 0.06, -z); c.m.rotation.y = ry + Math.PI; }
      void inner;
    });
    if (this.bursts) this.bursts = this.bursts.filter((p) => {
      p.userData.life -= dt; const a = p.geometry.attributes.position; const v = p.userData.vel;
      for (let k = 0; k < a.count; k++) { v[k * 3 + 1] -= 15 * dt; a.setXYZ(k, a.getX(k) + v[k * 3] * dt, a.getY(k) + v[k * 3 + 1] * dt, a.getZ(k) + v[k * 3 + 2] * dt); }
      a.needsUpdate = true; p.material.opacity = Math.max(0, p.userData.life);
      if (p.userData.life <= 0) { this.scene.remove(p); p.geometry.dispose(); p.material.dispose(); return false; }
      return true;
    });
    // camera
    const portrait = this.camera.aspect < 0.8;
    const dist = (portrait ? 105 : 58) * this.zoom;
    const target = new THREE.Vector3(this.pan.x, 0, this.pan.y);
    this.camera.position.set(target.x + Math.sin(this.yaw) * dist * 0.62, dist * 0.78, target.z + Math.cos(this.yaw) * dist * 0.62);
    this.camera.lookAt(target);
  }

  focusPlot(i) { const [x, z] = plotCenter(i); this.pan.set(x, z); }
  render() { this.renderer.render(this.scene, this.camera); }
}

export { PLOT_UNLOCK };
export function buildingIcon(type, lv = 1) { return geoIcon('b_' + type + lv, buildingGeo(type, lv), cityMat, -0.7); }
