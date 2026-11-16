// City builder scene (detailed art from cityart.js)
import * as THREE from './lib/three.module.min.js';
import { getModel, itemMaterial, geoIcon } from './models.js';
import { GRID, PLOT_UNLOCK } from './data.js';
import { S, plotUnlocked, pendingIncome } from './state.js';
import { ensureArt, TEX, K, buildingMesh, buildingParts, gardenFor, tree, bush, lamp, bench } from './cityart.js';

const PLOT = 6, ROAD = 2.4;
const SPAN = GRID * PLOT + (GRID + 1) * ROAD;
const ISL = SPAN + 12;

function plotCenter(i) {
  const gx = i % GRID, gz = Math.floor(i / GRID);
  return [-SPAN / 2 + ROAD + PLOT / 2 + gx * (PLOT + ROAD), -SPAN / 2 + ROAD + PLOT / 2 + gz * (PLOT + ROAD)];
}

// ---------------------------------------------------------------- sprites
function textSprite(draw, size = 1.6) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  draw(c.getContext('2d'));
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false }));
  s.scale.set(size, size, 1);
  return s;
}
function badge(g, fill, ring) {
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(64, 70, 54, 0, 7); g.fill();
  g.fillStyle = ring; g.beginPath(); g.arc(64, 62, 56, 0, 7); g.fill();
  g.fillStyle = fill; g.beginPath(); g.arc(64, 62, 47, 0, 7); g.fill();
}
const lockSprite = () => textSprite((g) => {
  badge(g, '#f4f2f8', '#ffffff');
  g.strokeStyle = '#8a86a0'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(64, 52, 16, Math.PI, 0); g.stroke();
  g.fillStyle = '#8a86a0'; g.beginPath(); g.roundRect(40, 52, 48, 36, 8); g.fill(); g.fillStyle = '#f4f2f8'; g.beginPath(); g.arc(64, 68, 6, 0, 7); g.fill();
}, 1.5);
const plusSprite = () => textSprite((g) => {
  badge(g, '#9b5cf0', '#ffffff');
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(56, 34, 16, 56, 6); g.fill(); g.beginPath(); g.roundRect(36, 54, 56, 16, 6); g.fill();
}, 1.5);
const coinSprite = () => textSprite((g) => {
  g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 58, 54, 0, 7); g.fill();
  g.beginPath(); g.moveTo(48, 104); g.lineTo(80, 104); g.lineTo(64, 124); g.fill();
  const grd = g.createRadialGradient(54, 46, 4, 64, 58, 42); grd.addColorStop(0, '#fff3a0'); grd.addColorStop(1, '#f0a81c');
  g.fillStyle = grd; g.beginPath(); g.arc(64, 58, 40, 0, 7); g.fill();
  g.strokeStyle = '#d98c0a'; g.lineWidth = 5; g.beginPath(); g.arc(64, 58, 29, 0, 7); g.stroke();
  g.fillStyle = '#d98c0a'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', 64, 60);
}, 1.35);

function skyTexture() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'); const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#5cb8ff'); grd.addColorStop(0.55, '#a9dcff'); grd.addColorStop(1, '#e6f6ff');
  g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// merged soft "blob" shadows (fake ambient occlusion under trees/buildings)
function blobMesh(list) {
  const pos = [], uv = [], idx = [];
  list.forEach(([x, z, rx, rz], n) => {
    rz = rz || rx; const y = 0.012 + (n % 7) * 0.0006, b = n * 4;
    pos.push(x - rx, y, z - rz, x + rx, y, z - rz, x + rx, y, z + rz, x - rx, y, z + rz);
    uv.push(0, 0, 1, 0, 1, 1, 0, 1); idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: TEX.blob, transparent: true, depthWrite: false }));
}

const meshOf = (built, cast = true, recv = true) => { const m = new THREE.Mesh(built.geo, built.mats); m.castShadow = cast; m.receiveShadow = recv; return m; };

export class CityScene {
  constructor(renderer, events) {
    this.renderer = renderer; this.events = events;
    ensureArt();
    this.scene = new THREE.Scene();
    this.scene.background = skyTexture();
    this.scene.fog = new THREE.Fog('#cdeeff', 110, 240);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 600);
    this.zoom = 0.62; this.pan = new THREE.Vector2(0, 1.5); this.yaw = Math.PI / 4;
    this.slots = []; this.ray = new THREE.Raycaster(); this.time = 0;
    this._buildWorld();
    this._bindInput();
    this.refresh();
  }

  _buildWorld() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight('#d8efff', '#8ccf78', 1.35));
    const sun = new THREE.DirectionalLight('#fff1d6', 2.6);
    sun.position.set(-28, 48, 22); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -36; sc.right = 36; sc.top = 36; sc.bottom = -36; sc.near = 5; sc.far = 130;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
    s.add(sun);

    // ----- sea (layers seen through translucent water give a shallow-water band)
    const plane = (w, color, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w), new THREE.MeshBasicMaterial({ color })); m.rotation.x = -Math.PI / 2; m.position.y = y; s.add(m); return m; };
    plane(900, '#1c8fe0', -3.2); plane(ISL + 22, '#4cc6f2', -2.2); plane(ISL + 9, '#8eeee6', -1.35);
    TEX.water.repeat.set(60, 60);
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: '#3fb4ff', map: TEX.water, transparent: true, opacity: 0.78, roughness: 0.25, metalness: 0.05 }));
    this.water.rotation.x = -Math.PI / 2; this.water.position.y = -0.95; s.add(this.water);
    const foamMat = new THREE.MeshBasicMaterial({ map: TEX.foam, transparent: true, depthWrite: false });
    this.foam = [];
    for (let side = 0; side < 4; side++) {
      const a = side * Math.PI / 2, d = ISL / 2 + 0.4 + 0.9;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(ISL + 2.4, 1.8), foamMat);
      m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, a, 0);
      m.position.set(Math.sin(a) * d, -0.93, Math.cos(a) * d);
      s.add(m); this.foam.push(m);
    }

    // ----- island
    const ground = new K();
    ground.rbox(ISL + 0.8, 2.2, ISL + 0.8, 0.5, '#d7d0c6', 'stone', [0, -1.25, 0]);
    ground.rbox(ISL, 0.6, ISL, 0.35, '#c8ef9e', 'grass', [0, -0.3, 0]);
    ground.rbox(SPAN + 0.6, 0.12, SPAN + 0.6, 0.06, '#a7aab8', 'asphalt', [0, 0.02, 0]);
    s.add(meshOf(ground.build(), false, true));

    // ----- street markings, sidewalks, lamps
    const st = new K();
    for (let k = 0; k <= GRID; k++) {
      const c = -SPAN / 2 + ROAD / 2 + k * (PLOT + ROAD);
      for (let b = 0; b < GRID; b++) {
        const from = -SPAN / 2 + ROAD + b * (PLOT + ROAD);
        for (let t = from + 1.6; t < from + PLOT - 1.0; t += 1.3) {
          st.box(0.75, 0.02, 0.1, '#ffffff', 'base', [t, 0.09, c]);
          st.box(0.1, 0.02, 0.75, '#ffffff', 'base', [c, 0.09, t]);
        }
      }
    }
    for (let a = 0; a <= GRID; a++) for (let b = 0; b <= GRID; b++) {
      const cx = -SPAN / 2 + ROAD / 2 + a * (PLOT + ROAD), cz = -SPAN / 2 + ROAD / 2 + b * (PLOT + ROAD);
      if ((a + b) % 2) continue;
      for (let i = 0; i < 4; i++) {
        if (a < GRID) st.box(0.22, 0.02, ROAD - 0.6, '#ffffff', 'base', [cx + ROAD / 2 + 0.35 + i * 0.4, 0.09, cz]);
        if (b < GRID) st.box(ROAD - 0.6, 0.02, 0.22, '#ffffff', 'base', [cx, 0.09, cz + ROAD / 2 + 0.35 + i * 0.4]);
      }
    }
    for (let i = 0; i < GRID * GRID; i++) {
      const [x, z] = plotCenter(i);
      st.rbox(PLOT, 0.26, PLOT, 0.12, '#f0ebe4', 'paving', [x, 0.13, z]);
      lamp(st, x - PLOT / 2 + 0.3, z + PLOT / 2 - 0.3, 0.75);
      if (i % 2) lamp(st, x + PLOT / 2 - 0.3, z - PLOT / 2 + 0.3, 0.75);
    }
    s.add(meshOf(st.build(), true, true));

    // ----- decoration belt around the grid
    const dec = new K(); const blobs = [];
    let seed = 11; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const belt0 = SPAN / 2 + 0.5, belt1 = ISL / 2 - 0.9;
    const kinds = ['green', 'pink', 'green', 'palm', 'cone', 'pink'];
    for (let side = 0; side < 4; side++) {
      for (let t = -ISL / 2 + 1.5; t < ISL / 2 - 1.5; t += 2.0 + R() * 1.2) {
        const off = belt0 + 0.9 + R() * (belt1 - belt0 - 1.4);
        const [x, z] = side === 0 ? [t, -off] : side === 1 ? [t, off] : side === 2 ? [-off, t] : [off, t];
        const r = R();
        if (r < 0.58) { const sc = 0.8 + R() * 0.45; tree(dec, x, z, sc, kinds[(R() * kinds.length) | 0]); blobs.push([x, z, 1.1 * sc]); }
        else if (r < 0.82) { bush(dec, x, z, 0.9 + R() * 0.4, R() < 0.7, (R() * 9) | 0); blobs.push([x, z, 0.6]); }
        else if (r < 0.91) bench(dec, x, z, side === 0 ? 0 : side === 1 ? Math.PI : side === 2 ? Math.PI / 2 : -Math.PI / 2);
        else lamp(dec, x, z, 0.8);
      }
    }
    const fz = ISL / 2 - 0.25;
    for (let t = -ISL / 2 + 0.6; t <= ISL / 2 - 0.6; t += 1.4) {
      dec.box(0.12, 0.7, 0.12, '#b77b48', 'wood', [t, 0.35, fz]); dec.box(0.12, 0.7, 0.12, '#b77b48', 'wood', [fz, 0.35, t]);
    }
    for (const y of [0.55, 0.3]) { dec.box(ISL - 1.2, 0.08, 0.06, '#c98a4f', 'wood', [0, y, fz]); dec.box(0.06, 0.08, ISL - 1.2, '#c98a4f', 'wood', [fz, y, 0]); }
    s.add(meshOf(dec.build(), true, true));
    s.add(blobMesh(blobs));

    // ----- boats
    this.boats = [];
    for (let i = 0; i < 2; i++) {
      const bk = new K();
      bk.rbox(2.4, 0.5, 1.0, 0.25, i ? '#ff6f6f' : '#ffffff', 'base', [0, 0.25, 0]); bk.rbox(1.0, 0.45, 0.7, 0.12, '#ffffff', 'base', [-0.2, 0.7, 0]);
      bk.cyl(0.03, 0.03, 1.6, '#8a6a4a', 'base', [0.4, 1.2, 0], [0, 0, 0], 6); bk.add(new THREE.ConeGeometry(0.6, 1.3, 3), i ? '#ffd23f' : '#5ec8ff', 'base', [0.75, 1.3, 0], [0, 0, 0], [0.7, 1, 0.05]);
      const m = meshOf(bk.build(), true, false); m.position.y = -0.9; s.add(m); this.boats.push({ m, a: i * Math.PI + 0.6, r: ISL / 2 + 6 + i * 3 });
    }

    // ----- cars
    this.cars = [];
    ['car', 'taxi', 'car', 'bus', 'taxi'].forEach((n, i) => {
      const m = new THREE.Mesh(getModel(n).geo, itemMaterial);
      m.scale.setScalar(n === 'bus' ? 0.55 : 0.62); m.castShadow = true; s.add(m);
      this.cars.push({ m, i, t: i * SPAN * 0.8, sp: 2.4 + (i % 3) * 0.8 });
    });

    // ----- plot slots (inner lot = tap target)
    const lotGeo = new THREE.BoxGeometry(PLOT - 0.9, 0.06, PLOT - 0.9);
    for (let i = 0; i < GRID * GRID; i++) {
      const [x, z] = plotCenter(i);
      const g = new THREE.Group(); g.position.set(x, 0.26, z); s.add(g);
      const pad = new THREE.Mesh(lotGeo, new THREE.MeshStandardMaterial({ map: TEX.grass, color: '#bfe8a2', roughness: 1 }));
      pad.position.y = 0.02; pad.receiveShadow = true; pad.userData.plot = i; g.add(pad);
      this.slots.push({ g, pad, building: null, garden: null, blob: null, key: '', marker: null, coin: null, sign: null });
    }
  }

  refresh() {
    this.slots.forEach((sl, i) => {
      const p = S.plots[i];
      const unlocked = plotUnlocked(i);
      const key = (unlocked ? 'u' : 'l') + (p.b || '') + p.lv;
      if (key === sl.key) return;
      sl.key = key;
      for (const k of ['building', 'garden', 'blob', 'marker', 'sign']) if (sl[k]) { sl.g.remove(sl[k]); sl[k] = null; }
      const mat = sl.pad.material;
      if (!unlocked) { mat.map = null; mat.color.set('#c6c4cf'); }
      else { mat.map = TEX.grass; mat.color.set(p.b ? '#c4eda6' : '#d4f2b8'); }
      mat.needsUpdate = true;
      if (!unlocked) {
        sl.marker = lockSprite(); sl.marker.position.y = 1.3; sl.g.add(sl.marker);
      } else if (!p.b) {
        sl.marker = plusSprite(); sl.marker.position.y = 1.4; sl.g.add(sl.marker);
        const k = new K();
        k.box(0.08, 0.9, 0.08, '#b77b48', 'wood', [1.6, 0.45, 1.6]); k.rbox(0.9, 0.55, 0.08, 0.05, '#ffffff', 'base', [1.6, 0.95, 1.65]); k.rbox(0.7, 0.35, 0.09, 0.04, '#ffd23f', 'base', [1.6, 0.95, 1.66]);
        bush(k, -1.8, 1.8, 0.7, true, i); bush(k, 1.9, -1.8, 0.6, true, i + 3);
        sl.sign = meshOf(k.build()); sl.g.add(sl.sign);
      } else {
        const m = buildingMesh(p.b, p.lv);
        m.position.z = ['park', 'fountain', 'stadium'].includes(p.b) ? 0 : -0.35;
        m.castShadow = true; m.receiveShadow = true; m.userData.plot = i;
        m.traverse((c) => { c.userData.plot = i; });
        sl.g.add(m); sl.building = m;
        sl.garden = meshOf(gardenFor(p.b, i)); sl.g.add(sl.garden);
        sl.blob = blobMesh([[0, m.position.z, 2.6, 2.4]]); sl.blob.position.y = 0.04; sl.g.add(sl.blob);
        m.scale.setScalar(0.01); m.userData.grow = 0;
        sl.top = buildingParts(p.b, p.lv).geo.boundingBox.max.y;
      }
    });
  }

  burst(i) {
    const [x, z] = plotCenter(i);
    const geo = new THREE.BufferGeometry(); const pts = [], vel = [], cols = [];
    const pal = [[1, .8, .2], [1, .4, .7], [.6, .4, 1], [.3, .8, 1], [.4, .9, .5]];
    for (let k = 0; k < 60; k++) { pts.push(x, 2.5, z); vel.push((Math.random() - 0.5) * 9, 5 + Math.random() * 7, (Math.random() - 0.5) * 9); cols.push(...pal[k % 5]); }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true }));
    p.userData = { vel, life: 1.4 }; this.scene.add(p);
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
        const k = 0.05 * this.zoom, c = Math.cos(this.yaw), s = Math.sin(this.yaw);
        this.pan.x -= (dx * c + dy * s) * k; this.pan.y -= (-dx * s + dy * c) * k;
        const L = SPAN / 2 + 2; this.pan.x = THREE.MathUtils.clamp(this.pan.x, -L, L); this.pan.y = THREE.MathUtils.clamp(this.pan.y, -L, L);
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoom = THREE.MathUtils.clamp(zoom0 * pinch0 / Math.max(1, d), 0.3, 1.25);
      }
    });
    const up = (e) => {
      if (!this.active) return;
      const wasTap = pts.size === 1 && moved < 10;
      pts.delete(e.pointerId);
      if (wasTap) this._tap(e.clientX, e.clientY);
    };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', (e) => pts.delete(e.pointerId));
    cvs.addEventListener('wheel', (e) => { if (!this.active) return; this.zoom = THREE.MathUtils.clamp(this.zoom * (e.deltaY > 0 ? 1.1 : 0.9), 0.3, 1.25); }, { passive: true });
  }

  _tap(x, y) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    const coins = this.slots.map(s => s.coin).filter(Boolean);
    let hit = this.ray.intersectObjects(coins, false)[0];
    if (hit) { this.events.onCoinTap(hit.object.userData.plot); return; }
    const objs = [];
    this.slots.forEach((s, i) => {
      s.pad.userData.plot = i; objs.push(s.pad);
      if (s.building) objs.push(s.building);
      if (s.garden) { s.garden.userData.plot = i; objs.push(s.garden); }
      if (s.marker) { s.marker.userData.plot = i; objs.push(s.marker); }
    });
    hit = this.ray.intersectObjects(objs, true)[0];
    if (hit && hit.object.userData.plot !== undefined) this.events.onPlotTap(hit.object.userData.plot);
  }

  resize() { const w = window.innerWidth, h = window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }

  update(dt) {
    this.time += dt;
    TEX.water.offset.x = this.time * 0.012; TEX.water.offset.y = Math.sin(this.time * 0.3) * 0.02;
    this.foam.forEach((f, i) => { f.material.opacity = 0.75 + Math.sin(this.time * 1.5 + i) * 0.2; });
    this.boats.forEach((b, i) => {
      b.a += dt * 0.03 * (i ? -1 : 1);
      b.m.position.set(Math.cos(b.a) * b.r, -0.95 + Math.sin(this.time * 2 + i) * 0.05, Math.sin(b.a) * b.r);
      b.m.rotation.y = -b.a + (i ? 0 : Math.PI);
    });
    this.slots.forEach((sl, i) => {
      const has = S.plots[i].b && pendingIncome(i) >= 1;
      if (has && !sl.coin) { sl.coin = coinSprite(); sl.coin.userData.plot = i; sl.g.add(sl.coin); }
      if (!has && sl.coin) { sl.g.remove(sl.coin); sl.coin = null; }
      if (sl.coin) sl.coin.position.y = Math.max(2.8, (sl.top || 2) + 1.1) + Math.sin(this.time * 3 + i) * 0.2;
      if (sl.marker) sl.marker.position.y = 1.35 + Math.sin(this.time * 2 + i) * 0.12;
      const b = sl.building;
      if (b && b.userData.grow !== undefined) {
        const gr = b.userData.grow = Math.min(1, b.userData.grow + dt * 2.2);
        const e = gr * (1 + Math.sin(gr * Math.PI) * 0.12);
        b.scale.setScalar(Math.max(0.01, e));
        if (gr >= 1) { delete b.userData.grow; b.scale.setScalar(1); }
      }
    });
    // cars drive around the outer ring road (two directions)
    this.cars.forEach((c) => {
      const L = SPAN - ROAD, off = -SPAN / 2 + ROAD / 2;
      c.t = (c.t + c.sp * dt) % (L * 4); const seg = Math.floor(c.t / L), u = c.t % L;
      let x, z, ry;
      if (seg === 0) { x = off + u; z = off; ry = 0; } else if (seg === 1) { x = off + L; z = off + u; ry = -Math.PI / 2; }
      else if (seg === 2) { x = off + L - u; z = off + L; ry = Math.PI; } else { x = off; z = off + L - u; ry = Math.PI / 2; }
      const nx = [0, 1, 0, -1][seg] * 0.5, nz = [-1, 0, 1, 0][seg] * 0.5;
      if (c.i % 2) { c.m.position.set(-x - nx, 0.08, -z - nz); c.m.rotation.y = ry + Math.PI; }
      else { c.m.position.set(x + nx, 0.08, z + nz); c.m.rotation.y = ry; }
    });
    if (this.bursts) this.bursts = this.bursts.filter((p) => {
      p.userData.life -= dt; const a = p.geometry.attributes.position; const v = p.userData.vel;
      for (let k = 0; k < a.count; k++) { v[k * 3 + 1] -= 15 * dt; a.setXYZ(k, a.getX(k) + v[k * 3] * dt, a.getY(k) + v[k * 3 + 1] * dt, a.getZ(k) + v[k * 3 + 2] * dt); }
      a.needsUpdate = true; p.material.opacity = Math.max(0, p.userData.life);
      if (p.userData.life <= 0) { this.scene.remove(p); p.geometry.dispose(); p.material.dispose(); return false; }
      return true;
    });
    const portrait = this.camera.aspect < 0.8;
    const dist = (portrait ? 122 : 64) * this.zoom;
    const target = new THREE.Vector3(this.pan.x, 0, this.pan.y);
    this.camera.position.set(target.x + Math.sin(this.yaw) * dist * 0.6, dist * 0.8, target.z + Math.cos(this.yaw) * dist * 0.6);
    this.camera.lookAt(target);
  }

  focusPlot(i) { const [x, z] = plotCenter(i); this.pan.set(x, z); }
  render() { this.renderer.render(this.scene, this.camera); }
}

export { PLOT_UNLOCK };
export function buildingIcon(type, lv = 1) { const b = buildingParts(type, lv); return geoIcon('b2_' + type + lv, b.geo, b.mats, -0.6); }
