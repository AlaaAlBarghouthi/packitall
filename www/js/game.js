// The hole level: 3D scene, input, swallowing, goals, boosters
import * as THREE from './lib/three.module.min.js';
import { getModel, itemMaterial, modelIcon } from './models.js';
import { generateLevel, populate } from './levels.js';
import { sfx, haptic } from './audio.js';
import { MATERIAL_OF, materialGain } from './data.js';
import { t, fmt, fmtTime } from './i18n.js';

const $ = (s) => document.querySelector(s);
const R0 = 0.9, GROW_K = 0.22, MAX_R = 6;
const BOOST_TIME = { magnet: 6, tornado: 4, freeze: 10, grow: 8 };

function checkerTexture(a, b) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = a; g.fillRect(0, 0, 128, 128);
  g.fillStyle = b; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
  // soft inner highlight to feel like tiles
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
  g.strokeRect(1, 1, 62, 62); g.strokeRect(65, 65, 62, 62);
  const tx = new THREE.CanvasTexture(c);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

// ---- floor art atlas (4 cells) per world
const DECALS = {
  beauty: [['heart', '#ff7fb5'], ['star', '#ffffff'], ['flower', '#ffb3d6'], ['bow', '#c58cff']],
  sweets: [['sprinkles', '#ff7fb5'], ['swirl', '#ffffff'], ['drip', '#c97b4a'], ['star', '#ff9fc8']],
  toys:   [['puzzle', '#ffd23f'], ['star', '#ffffff'], ['target', '#ff6f6f'], ['puzzle', '#7fe0c0']],
  picnic: [['blanket', '#ff5a5a'], ['flower', '#ffffff'], ['grass', '#6fcf5a'], ['flower', '#ffd23f']],
  city:   [['zebra', '#ffffff'], ['arrow', '#ffffff'], ['manhole', '#8a8ea0'], ['parking', '#3d8bff']],
  xmas:   [['snowflake', '#ffffff'], ['star', '#ffd23f'], ['holly', '#2fae55'], ['snowflake', '#cfe8ff']],
};
const atlasCache = {};
function decalAtlas(id) {
  if (atlasCache[id]) return atlasCache[id];
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  (DECALS[id] || DECALS.beauty).forEach(([shape, col], i) => {
    g.save(); g.translate((i % 2) * 256 + 128, Math.floor(i / 2) * 256 + 128); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
    drawDecal(g, shape, col); g.restore();
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; atlasCache[id] = t; return t;
}
function drawDecal(g, shape, col) {
  const star = (r1, r2, n) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = i * Math.PI / n - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); };
  g.globalAlpha = 0.55;
  switch (shape) {
    case 'heart': g.beginPath(); g.moveTo(0, 70); g.bezierCurveTo(-110, -10, -60, -100, 0, -45); g.bezierCurveTo(60, -100, 110, -10, 0, 70); g.fill(); break;
    case 'star': star(100, 45, 5); break;
    case 'flower': for (let i = 0; i < 6; i++) { g.beginPath(); const a = i * Math.PI / 3; g.ellipse(Math.cos(a) * 52, Math.sin(a) * 52, 42, 30, a, 0, 7); g.fill(); } g.globalAlpha = 0.8; g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill(); break;
    case 'bow': g.beginPath(); g.moveTo(0, 0); g.lineTo(-100, -55); g.lineTo(-100, 55); g.closePath(); g.fill(); g.beginPath(); g.moveTo(0, 0); g.lineTo(100, -55); g.lineTo(100, 55); g.closePath(); g.fill(); g.beginPath(); g.arc(0, 0, 22, 0, 7); g.fill(); break;
    case 'sprinkles': ['#ff7fb5', '#ffd23f', '#7fe0c0', '#ffffff', '#b98cff'].forEach((cc, k) => { for (let j = 0; j < 4; j++) { g.save(); g.fillStyle = cc; g.rotate(k * 1.3 + j * 1.7); g.translate(25 + j * 22, k * 9 - 18); g.fillRect(-14, -5, 28, 10); g.restore(); } }); break;
    case 'swirl': g.lineWidth = 16; g.beginPath(); for (let a = 0; a < 14; a += 0.1) { const r = a * 7.5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); break;
    case 'drip': g.beginPath(); g.moveTo(-110, -60); g.lineTo(110, -60); for (let x = 110; x >= -110; x -= 44) { g.lineTo(x, -20); g.arc(x - 22, 10 + (x % 3) * 10, 18, 0, Math.PI); } g.closePath(); g.fill(); break;
    case 'puzzle': g.fillRect(-70, -70, 140, 140); g.beginPath(); g.arc(0, -70, 28, 0, 7); g.arc(70, 0, 28, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(-70, 0, 28, 0, 7); g.arc(0, 70, 28, 0, 7); g.fill(); break;
    case 'target': g.lineWidth = 18; [90, 55, 20].forEach((r) => { g.beginPath(); g.arc(0, 0, r, 0, 7); r === 20 ? g.fill() : g.stroke(); }); break;
    case 'blanket': g.globalAlpha = 0.5; for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) { g.fillStyle = (i + j) % 2 ? col : '#ffffff'; g.fillRect(i * 38, j * 38, 38, 38); } break;
    case 'grass': g.lineWidth = 10; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * 18, 60); g.quadraticCurveTo(i * 22, 0, i * 30, -50 + Math.abs(i) * 10); g.stroke(); } break;
    case 'zebra': g.globalAlpha = 0.7; for (let i = -3; i <= 3; i++) g.fillRect(i * 34 - 12, -110, 24, 220); break;
    case 'arrow': g.globalAlpha = 0.7; g.beginPath(); g.moveTo(0, -110); g.lineTo(70, -20); g.lineTo(25, -20); g.lineTo(25, 110); g.lineTo(-25, 110); g.lineTo(-25, -20); g.lineTo(-70, -20); g.closePath(); g.fill(); break;
    case 'manhole': g.globalAlpha = 0.6; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 6; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(-80, i * 22); g.lineTo(80, i * 22); g.stroke(); } break;
    case 'parking': g.globalAlpha = 0.6; g.beginPath(); g.roundRect(-90, -90, 180, 180, 30); g.fill(); g.fillStyle = '#ffffff'; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', 0, 8); break;
    case 'snowflake': g.lineWidth = 14; for (let i = 0; i < 6; i++) { g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -100); g.moveTo(0, -60); g.lineTo(-28, -85); g.moveTo(0, -60); g.lineTo(28, -85); g.stroke(); g.restore(); } break;
    case 'holly': for (const a of [-0.6, 0.6]) { g.save(); g.rotate(a); g.beginPath(); g.ellipse(0, -50, 30, 62, 0, 0, 7); g.fill(); g.restore(); } g.globalAlpha = 0.85; g.fillStyle = '#e8323e'; [[-16, 10], [16, 10], [0, -8]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); }); break;
  }
}

// ---- hole skins
export const SKINS = {
  classic: { rim: 0xc58cff, glow: [190, 110, 255] },
  candy:   { rim: 'stripes', glow: [255, 90, 110], glow2: [120, 255, 160] },
};
function stripeTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 32;
  const g = c.getContext('2d');
  for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#ff2f4e'; g.beginPath(); g.moveTo(i * 21.33, 0); g.lineTo(i * 21.33 + 21.33, 0); g.lineTo(i * 21.33 + 35, 32); g.lineTo(i * 21.33 + 13.67, 32); g.fill(); }
  const tx = new THREE.CanvasTexture(c); tx.wrapS = THREE.RepeatWrapping; tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
function glowTexture(rgb = [190, 110, 255], rgb2) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 60, 128, 128, 128);
  const [r, gg, bb] = rgb, c2 = rgb2 || [Math.min(255, r + 40), Math.min(255, gg + 60), Math.min(255, bb + 20)];
  grd.addColorStop(0, `rgba(${r},${gg},${bb},0.0)`);
  grd.addColorStop(0.42, `rgba(${r},${gg},${bb},0.75)`);
  grd.addColorStop(0.55, `rgba(${c2[0]},${c2[1]},${c2[2]},0.5)`);
  grd.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export class HoleGame {
  constructor(renderer, events) {
    this.renderer = renderer;
    this.events = events; // { onEnd(result), onCoin(n) }
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
    this.uniforms = { uHole: { value: new THREE.Vector2() }, uHoleR: { value: R0 } };
    this.input = { active: false, sx: 0, sy: 0, dx: 0, dy: 0, keys: {} };
    this.running = false; this.paused = false;
    this._bindInput();
    this.glowTex = glowTexture();
  }

  // ---------------------------------------------------------------- setup
  start(n, boosters, perks = {}, opts = {}) {
    this.perks = perks; this.opts = opts;
    this.clear();
    const lvl = populate(generateLevel(n, { xmas: !!opts.xmas }), (name) => getModel(name).foot);
    this.level = lvl;
    this.boostersInv = boosters; // reference to save.boosters (mutated by main via callback)
    lvl.time += perks.timeS || 0;
    this.timeLeft = lvl.time; this.elapsed = 0;
    const r0 = R0 * (1 + (perks.sizePct || 0) / 100);
    this.holeR = r0; this.area = r0 * r0; this.bonusR = 1; this.r0 = r0;
    this.hole = new THREE.Vector3(0, 0, lvl.H * 0.75);
    this.vel = new THREE.Vector2();
    this.coinsEarned = 0; this.swallowed = 0; this.combo = 0; this.comboT = 0; this.matsRun = {}; this.gemsRun = 0;
    this.active = {}; // booster timers
    this.ended = false; this.extraUsed = false; this.tooBigCooldown = 0;
    this.countdown = 1.6; this._camInit = false;

    const th = lvl.theme;
    this.scene.background = new THREE.Color(th.sky);
    this.scene.fog = new THREE.Fog(th.fog, 40, 110);

    // lights
    const hemi = new THREE.HemisphereLight(0xffffff, new THREE.Color(th.floor[0]), 1.25);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(-8, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 60;
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
    this.sun = sun; this.scene.add(sun); this.scene.add(sun.target);

    // floor with a hole (fragment discard)
    const fw = lvl.W * 2 + 60, fh = lvl.H * 2 + 60;
    const tex = checkerTexture(th.floor[0], th.floor[1]);
    tex.repeat.set(fw / 4, fh / 4);
    const floorMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    const patchHole = (mat) => { mat.onBeforeCompile = (sh) => {
      sh.uniforms.uHole = this.uniforms.uHole; sh.uniforms.uHoleR = this.uniforms.uHoleR;
      sh.vertexShader = 'varying vec3 vWPos;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n vWPos = (modelMatrix * vec4(position,1.0)).xyz;');
      sh.fragmentShader = 'uniform vec2 uHole; uniform float uHoleR; varying vec3 vWPos;\n' +
        sh.fragmentShader.replace('#include <clipping_planes_fragment>',
          'if (distance(vWPos.xz, uHole) < uHoleR) discard;\n#include <clipping_planes_fragment>');
    }; };
    patchHole(floorMat);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    this.scene.add(floor); this.floor = floor;
    // theme floor art (decals), merged into one mesh
    if (th.decal) {
      const dm = new THREE.MeshBasicMaterial({ map: decalAtlas(th.decal), transparent: true, depthWrite: false, opacity: 0.85 });
      patchHole(dm);
      const nDec = Math.round(lvl.W * lvl.H / 28), pos = [], uv = [], idx = [];
      for (let i = 0; i < nDec; i++) {
        const x = (Math.random() * 2 - 1) * (lvl.W - 2), z = (Math.random() * 2 - 1) * (lvl.H - 2), sz = 1.6 + Math.random() * 2.6, a = Math.random() * 6.28, cell = i % 4;
        const u0 = (cell % 2) * 0.5, v0 = Math.floor(cell / 2) * 0.5, b = i * 4, c = Math.cos(a) * sz, sn = Math.sin(a) * sz, y = 0.006 + (i % 9) * 0.0004;
        pos.push(x - c + sn, y, z - sn - c, x + c + sn, y, z + sn - c, x + c - sn, y, z + sn + c, x - c - sn, y, z - sn + c);
        uv.push(u0, v0, u0 + 0.5, v0, u0 + 0.5, v0 + 0.5, u0, v0 + 0.5); idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
      }
      const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); dg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); dg.setIndex(idx);
      this.scene.add(new THREE.Mesh(dg, dm));
    }

    // out-of-bounds tint + border fence
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const accent = new THREE.MeshStandardMaterial({ color: th.snow ? 0xe8323e : 0xb06bff, roughness: 0.4 });
    const mkWall = (w, d, x, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), borderMat); m.position.set(x, 0.25, z); m.castShadow = true; m.receiveShadow = true; this.scene.add(m);
      const s = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.12, d + 0.02), accent); s.position.set(x, 0.5, z); this.scene.add(s);
    };
    const W = lvl.W, H = lvl.H, T = 0.6;
    mkWall(W * 2 + T * 2, T, 0, -H - T / 2); mkWall(W * 2 + T * 2, T, 0, H + T / 2);
    mkWall(T, H * 2, -W - T / 2, 0); mkWall(T, H * 2, W + T / 2, 0);
    const outside = new THREE.MeshBasicMaterial({ color: new THREE.Color(th.floor[0]).multiplyScalar(0.85), transparent: true, opacity: 0.5, depthWrite: false });
    const big = 200;
    [[0, -H - big / 2 - T, big * 2, big], [0, H + big / 2 + T, big * 2, big], [-W - big / 2 - T, 0, big, H * 2 + 2 * T], [W + big / 2 + T, 0, big, H * 2 + 2 * T]]
      .forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), outside); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); this.scene.add(m); });

    // hole visuals
    this.holeGroup = new THREE.Group();
    const wellGeo = new THREE.CylinderGeometry(1, 1, 8, 48, 1, true);
    const cols = []; const pa = wellGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); const k = (y + 4) / 8; const kk = Math.pow(k, 3); cols.push(0.1 * kk, 0.03 * kk, 0.2 * kk); }
    wellGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const well = new THREE.Mesh(wellGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }));
    well.position.y = -4; this.holeGroup.add(well);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x07020f }));
    bottom.rotation.x = -Math.PI / 2; bottom.position.y = -7.9; this.holeGroup.add(bottom);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 10, 64), new THREE.MeshBasicMaterial({ color: 0xc58cff }));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.02; this.holeGroup.add(rim); this.rim = rim;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), new THREE.MeshBasicMaterial({ map: this.glowTex, transparent: true, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.03; this.holeGroup.add(glow); this.glow = glow;
    // skin
    const sk = SKINS[opts.skin] || SKINS.classic;
    if (sk.rim === 'stripes') { rim.material.map = stripeTexture(); rim.material.color.set(0xffffff); rim.geometry.dispose(); rim.geometry = new THREE.TorusGeometry(1, 0.085, 12, 96); }
    else rim.material.color.set(sk.rim);
    if (opts.skin && opts.skin !== 'classic') { glow.material.map = glowTexture(sk.glow, sk.glow2); }
    // falling snow in the holiday world
    this.snow = null;
    if (th.snow) {
      const N = 700, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 60; pos[i * 3 + 1] = Math.random() * 30; pos[i * 3 + 2] = (Math.random() - 0.5) * 60; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.snow = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.95, depthWrite: false }));
      this.scene.add(this.snow);
    }
    this.scene.add(this.holeGroup);

    // sparkles inside the hole
    const sp = new THREE.BufferGeometry(); const spp = [];
    for (let i = 0; i < 30; i++) { const a = Math.random() * 6.28, r = Math.random() * 0.8; spp.push(Math.cos(a) * r, -0.5 - Math.random() * 3, Math.sin(a) * r); }
    sp.setAttribute('position', new THREE.Float32BufferAttribute(spp, 3));
    this.sparkles = new THREE.Points(sp, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.85 }));
    this.holeGroup.add(this.sparkles);

    // magnet/tornado ring
    this.fxRing = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 64), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }));
    this.fxRing.rotation.x = -Math.PI / 2; this.fxRing.position.y = 0.05; this.scene.add(this.fxRing);

    // items
    this.items = lvl.items.map((it) => {
      const m = getModel(it.name);
      const mesh = new THREE.Mesh(m.geo, itemMaterial);
      mesh.position.set(it.x, 0, it.z); mesh.rotation.y = it.rot; mesh.scale.setScalar(it.scale);
      mesh.castShadow = m.foot * it.scale >= 0.35; mesh.receiveShadow = false;
      this.scene.add(mesh);
      return { mesh, name: it.name, scale: it.scale, r: m.foot * it.scale, h: m.height * it.scale,
        big: !!it.big, hazard: !!it.hazard, pickup: it.pickup || null, mover: !!it.mover, heading: Math.random() * 6.28, speed: 1.2 + Math.random() * 1.6, bob: Math.random() * 6.28, x: it.x, z: it.z, y: 0, vy: 0, falling: false, alive: true, tilt: 0, spin: (Math.random() - 0.5) * 8 };
    });

    // win-streak / selected boosters waiting in front of the hole (swallow to activate)
    const extras = [];
    for (let i = 0; i < (opts.startGrow || 0); i++) extras.push(['bolt', 'grow']);
    for (let i = 0; i < (opts.startTime || 0); i++) extras.push(['hourglass', 'time10']);
    extras.forEach(([name, kind], i) => {
      const md = getModel(name), x = this.hole.x + (i - (extras.length - 1) / 2) * 1.5, z = this.hole.z - 3.4;
      const mesh = new THREE.Mesh(md.geo, itemMaterial); mesh.position.set(x, 0, z); mesh.castShadow = true; this.scene.add(mesh);
      this.items.push({ mesh, name, scale: 1, r: md.foot, h: md.height, big: false, hazard: false, pickup: kind, mover: false, heading: 0, speed: 0,
        bob: i * 0.7, x, z, y: 0, vy: 0, falling: false, alive: true, tilt: 0, spin: 3, boost: true });
    });
    // pulsing rings: red under bombs, gold under boosters
    this.hazRings = [];
    const ringGeo = new THREE.RingGeometry(1.0, 1.5, 32);
    this.items.forEach((it) => {
      if (!it.hazard && !it.boost) return;
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: it.boost ? 0xffd23f : 0xff2a3a, transparent: true, opacity: 0.6, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(it.x, 0.03, it.z); m.scale.setScalar(it.r); this.scene.add(m); it.ring = m; this.hazRings.push(m);
    });
    this.invuln = 0;
    this.goals = lvl.goals.map(g => ({ ...g, got: 0 }));
    this._buildHud();
    this._updateHole(true);
    this.running = true; this.paused = false;
    this._resize();
    this._showIntro();
    this.tut = opts.tutorial ? { step: 0, x0: this.hole.x, z0: this.hole.z } : null;
    if (this.tut) this.introT = 1.2;
  }

  clear() {
    this.running = false;
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const o = this.scene.children[i];
      this.scene.remove(o);
      o.traverse((c) => {
        if (c.geometry && !c.geometry.__shared && c.material !== itemMaterial) c.geometry.dispose();
        if (c.material && c.material !== itemMaterial) {
          if (c.material.map && c.material.map !== this.glowTex) c.material.map.dispose();
          c.material.dispose();
        }
      });
    }
    this.items = [];
  }

  // ---------------------------------------------------------------- HUD
  _buildHud() {
    const goalsEl = $('#goals');
    goalsEl.innerHTML = this.goals.map((g, i) => `
      <div class="goal" data-i="${i}">
        <div class="goal-ico" style="background-image:url(${modelIcon(g.name)})">${g.big ? '<span class="big-tag">XL</span>' : ''}</div>
        <div class="goal-cnt"><span>0</span>/${g.need}</div>
        <div class="goal-check">✓</div>
      </div>`).join('');
    $('#lvl-label').textContent = t('level') + ' ' + this.level.n;
    this._hudBoosters();
    this._hudTime(true);
    $('#run-coins').textContent = '0';
    $('#size-fill').style.width = '0%';
  }
  _hudBoosters() {
    document.querySelectorAll('.boost').forEach((b) => {
      const k = b.dataset.b; const n = this.boostersInv[k] || 0;
      b.querySelector('.badge').textContent = n > 0 ? n : '+';
      b.classList.toggle('empty', n <= 0);
      b.classList.toggle('on', !!this.active[k]);
    });
  }
  _hudTime(force) {
    const s = Math.ceil(this.timeLeft);
    if (force || s !== this._lastSec) {
      this._lastSec = s;
      const el = $('#timer-txt'); el.textContent = fmtTime(this.timeLeft);
      $('#timer').classList.toggle('low', this.timeLeft <= 15);
      if (!force && this.timeLeft <= 10 && this.timeLeft > 0 && !this.active.freeze) sfx.tick();
    }
    $('#timer').classList.toggle('frozen', !!this.active.freeze);
  }
  _hudGoal(i) {
    const g = this.goals[i];
    const el = document.querySelector(`.goal[data-i="${i}"]`);
    if (!el) return;
    el.querySelector('.goal-cnt span').textContent = Math.min(g.got, g.need);
    el.classList.toggle('done', g.got >= g.need);
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
  _showIntro() {
    const el = $('#intro');
    el.innerHTML = `<div class="intro-card">
      <div class="intro-title">${t('level')} ${this.level.n}</div>
      <div class="intro-sub">${t('theme_' + this.level.theme.id)}</div>
      <div class="intro-goals">${this.goals.map(g => `<div class="ig"><img src="${modelIcon(g.name)}"/><b>×${g.need}</b></div>`).join('')}</div>
      ${this._perkChips()}
      <div class="intro-hint">${this.level.n <= 3 ? t('matsHint') : t('tapToMove')}</div></div>`;
    el.classList.add('show');
    this.introT = 2.0;
  }
  _perkChips() {
    const P = this.perks || {}, out = [];
    if (this.level && this.level.hazards) out.push(`⚠️ 💣 ×${this.level.hazards}`);
    if (P.timeS) out.push(`⏱️ +${P.timeS}s`); if (P.sizePct) out.push(`🕳️ +${P.sizePct}%`); if (P.coinPct) out.push(`🪙 +${P.coinPct}%`);
    return out.length ? `<div class="mrow" style="justify-content:center;margin:2px 0 4px">${out.map((x) => `<span class="mchip ${x.startsWith('⚠️') ? 'no' : 'ok'}">${x}</span>`).join('')}</div>` : '';
  }
  _tutorial(dt) {
    const el = $('#tut'); if (!el) return;
    if (!this.tut) { el.classList.add('hidden'); return; }
    const T = this.tut;
    if (T.step === 0) { if (Math.hypot(this.hole.x - T.x0, this.hole.z - T.z0) > 3) { T.step = 1; T.n0 = this.swallowed; } }
    else if (T.step === 1) { if (this.swallowed - T.n0 >= 5) { T.step = 2; T.t = 4; } }
    else { T.t -= dt; if (T.t <= 0) { if (T.step === 2) { T.step = 3; T.t = 3.5; } else { this.tut = null; el.classList.add('hidden'); if (this.events.onTutorialDone) this.events.onTutorialDone(); return; } } }
    el.classList.remove('hidden');
    el.classList.toggle('nohand', T.step !== 0);
    $('#tut-text').textContent = t(['tut1', 'tut2', 'tut3', 'tut4'][T.step]);
  }
  floater(text, cls = '') {
    const v = new THREE.Vector3(this.hole.x, 0.5, this.hole.z).project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = (v.x * 0.5 + 0.5) * rect.width, y = (-v.y * 0.5 + 0.5) * rect.height;
    const el = document.createElement('div');
    el.className = 'floater ' + cls; el.textContent = text;
    el.style.left = (x + (Math.random() - 0.5) * 60) + 'px'; el.style.top = (y - 30) + 'px';
    $('#floaters').appendChild(el);
    if (window.__RECMODE) { el.style.animation = 'none'; (this.recFloaters = this.recFloaters || []).push({ el, t: 0 }); return; }
    setTimeout(() => el.remove(), 900);
  }

  // ---------------------------------------------------------------- input
  _bindInput() {
    const cvs = this.renderer.domElement;
    const joy = $('#joy'), knob = $('#joy-knob');
    const down = (e) => {
      if (!this.running || this.paused || this.ended) return;
      this.input.active = true; this.input.sx = e.clientX; this.input.sy = e.clientY; this.input.dx = 0; this.input.dy = 0;
      joy.style.left = e.clientX + 'px'; joy.style.top = e.clientY + 'px'; joy.classList.add('show');
      knob.style.transform = 'translate(-50%,-50%)';
    };
    const move = (e) => {
      if (!this.input.active) return;
      let dx = e.clientX - this.input.sx, dy = e.clientY - this.input.sy;
      const L = Math.hypot(dx, dy), max = 55;
      if (L > max) {
        // drag the joystick base along so direction changes stay responsive
        const k = (L - max) / L; this.input.sx += dx * k; this.input.sy += dy * k;
        joy.style.left = this.input.sx + 'px'; joy.style.top = this.input.sy + 'px';
        dx = e.clientX - this.input.sx; dy = e.clientY - this.input.sy;
      }
      this.input.dx = dx / max; this.input.dy = dy / max;
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    const up = () => { this.input.active = false; this.input.dx = this.input.dy = 0; joy.classList.remove('show'); };
    cvs.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', (e) => { this.input.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { this.input.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('resize', () => this._resize());
  }
  _resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- boosters
  useBooster(k) {
    if (!this.running || this.paused || this.ended) return false;
    if ((this.boostersInv[k] || 0) <= 0) return false;
    if (this.active[k]) return false;
    this.active[k] = BOOST_TIME[k] + ((this.perks || {})[k + 'S'] || 0);
    sfx.booster(); haptic('medium');
    this.floater(t(k) + '!', 'boost-f');
    this._hudBoosters();
    return true;
  }

  addTime(sec) { this.timeLeft += sec; this.ended = false; this.paused = false; this._hudTime(true); }

  // ---------------------------------------------------------------- update
  update(dt) {
    if (!this.running) return;
    dt = Math.min(dt, 0.05);
    if (this.introT > 0) {
      this.introT -= dt;
      if (this.introT <= 0) $('#intro').classList.remove('show');
    }
    if (this.recFloaters) this.recFloaters = this.recFloaters.filter((f) => {
      f.t += dt; const p = f.t / 0.9;
      if (p >= 1) { f.el.remove(); return false; }
      const op = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      const sc = p < 0.15 ? 0.6 + (p / 0.15) * 0.5 : 1.1 - Math.min(0.1, (p - 0.15));
      const y = p < 0.15 ? 10 - (p / 0.15) * 10 : -70 * ((p - 0.15) / 0.85);
      f.el.style.opacity = op; f.el.style.transform = `translate(-50%, ${y}px) scale(${sc})`;
      return true;
    });
    this._hazardFx(dt);
    if (this.paused || this.ended) { this._camera(dt, true); return; }
    this.elapsed += dt;

    // boosters
    for (const k in this.active) {
      this.active[k] -= dt;
      if (this.active[k] <= 0) { delete this.active[k]; this._hudBoosters(); }
    }
    const targetBonus = this.active.grow ? 1.6 : 1;
    this.bonusR += (targetBonus - this.bonusR) * Math.min(1, dt * 5);

    // timer
    if (this.introT <= 0) this._tutorial(dt);
    if (this.introT <= 0 && !this.active.freeze && !(this.tut && this.tut.step === 0)) this.timeLeft -= dt;
    this._hudTime();
    if (this.timeLeft <= 0) { this.timeLeft = 0; this._end(false); return; }

    // movement
    let ix = this.input.dx, iy = this.input.dy;
    const K = this.input.keys;
    if (K['arrowleft'] || K['a']) ix -= 1; if (K['arrowright'] || K['d']) ix += 1;
    if (K['arrowup'] || K['w']) iy -= 1; if (K['arrowdown'] || K['s']) iy += 1;
    const L = Math.hypot(ix, iy); if (L > 1) { ix /= L; iy /= L; }
    const speed = 7.5 + this.holeR * 1.3;
    const tx = ix * speed, tz = iy * speed;
    const acc = Math.min(1, dt * 12);
    this.vel.x += (tx - this.vel.x) * acc; this.vel.y += (tz - this.vel.y) * acc;
    const R = this.holeR * this.bonusR;
    const W = this.level.W, H = this.level.H;
    this.hole.x = THREE.MathUtils.clamp(this.hole.x + this.vel.x * dt, -W + R * 0.6, W - R * 0.6);
    this.hole.z = THREE.MathUtils.clamp(this.hole.z + this.vel.y * dt, -H + R * 0.6, H - R * 0.6);

    this._updateHole();
    this._items(dt, R);
    this._snow(dt);
    if (this.invuln > 0) this.invuln -= dt;

    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
    if (this.tooBigCooldown > 0) this.tooBigCooldown -= dt;

    this._camera(dt);
  }

  _updateHole(instant) {
    const R = this.holeR * this.bonusR;
    this.uniforms.uHole.value.set(this.hole.x, this.hole.z);
    this.uniforms.uHoleR.value = R;
    this.holeGroup.position.set(this.hole.x, 0, this.hole.z);
    this.holeGroup.scale.set(R, 1, R);
    this.rim.scale.set(1, 1, 1 / 1); // rim thickness scales with group (fine)
    this.sparkles.rotation.y += 0.02;
    const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.03;
    this.glow.scale.set(pulse, pulse, 1);
    const ringOn = this.active.magnet || this.active.tornado;
    const ringR = this.active.tornado ? 1 : (R + 6);
    this.fxRing.material.opacity += ((ringOn ? 0.55 : 0) - this.fxRing.material.opacity) * 0.15;
    this.fxRing.material.color.set(this.active.tornado ? 0xffd34d : 0x66ccff);
    const ringScale = this.active.tornado ? R * (1.3 + (performance.now() % 600) / 600) : ringR;
    this.fxRing.scale.set(ringScale, ringScale, 1);
    this.fxRing.position.set(this.hole.x, 0.05, this.hole.z);
    this.sun.position.set(this.hole.x - 8, 20, this.hole.z + 10);
    this.sun.target.position.set(this.hole.x, 0, this.hole.z);
  }

  _items(dt, R) {
    const hx = this.hole.x, hz = this.hole.z;
    const magnet = this.active.magnet, tornado = this.active.tornado;
    for (const it of this.items) {
      if (!it.alive) continue;
      const m = it.mesh;
      if (!it.falling && (it.mover || it.pickup) && !it.tilt) {
        if (it.mover) {
          it.x += Math.cos(it.heading) * it.speed * dt; it.z += Math.sin(it.heading) * it.speed * dt;
          const W = this.level.W - it.r - 0.5, H = this.level.H - it.r - 0.5;
          if (Math.abs(it.x) > W) { it.x = Math.sign(it.x) * W; it.heading = Math.PI - it.heading; }
          if (Math.abs(it.z) > H) { it.z = Math.sign(it.z) * H; it.heading = -it.heading; }
          if (Math.random() < dt * 0.3) it.heading += (Math.random() - 0.5) * 1.5;
          m.position.x = it.x; m.position.z = it.z; m.rotation.y = -it.heading;
        } else {
          it.bob += dt * 3; m.position.y = 0.12 + Math.sin(it.bob) * 0.08;
          if (it.boost) m.rotation.y = Math.sin(it.bob * 0.6) * 0.45; else m.rotation.y += dt * 1.8;
        }
      }
      if (it.falling) {
        it.vy -= 30 * dt; it.y += it.vy * dt;
        // stay inside the hole while falling
        const dx = it.x - hx, dz = it.z - hz, d = Math.hypot(dx, dz);
        const lim = Math.max(0, R - it.r * 0.9);
        const pull = Math.min(1, dt * 6);
        it.x += (hx - it.x) * pull * 0.5; it.z += (hz - it.z) * pull * 0.5;
        if (d > lim && d > 0) { it.x = hx + dx / d * lim; it.z = hz + dz / d * lim; }
        it.tilt = Math.min(1.4, it.tilt + dt * 4);
        m.position.set(it.x, it.y, it.z);
        m.rotation.x = it.tilt * Math.sign(dz || 1) * 0.8; m.rotation.y += it.spin * dt;
        if (it.y < -it.h - 2.5) this._swallow(it);
        continue;
      }
      const fits = it.r < R * 0.95 && !(it.hazard && this.invuln > 0); // must truly fit inside the circle
      // pulls
      if (fits && !it.hazard && (magnet || (tornado && this._isGoal(it)))) {
        const dx = hx - it.x, dz = hz - it.z, d = Math.hypot(dx, dz);
        const range = tornado ? 999 : R + 6;
        if (d < range && d > 0.01) {
          const sp = (tornado ? 22 : 7) * dt;
          it.x += dx / d * Math.min(sp, d); it.z += dz / d * Math.min(sp, d);
          m.position.x = it.x; m.position.z = it.z;
          m.rotation.y += dt * 6;
        }
      }
      const dx = it.x - hx, dz = it.z - hz;
      if (Math.abs(dx) > R + it.r || Math.abs(dz) > R + it.r) { if (it.tilt) { it.tilt = 0; m.rotation.x = 0; m.rotation.z = 0; m.position.y = 0; } continue; }
      const d = Math.hypot(dx, dz);
      if (d < R + it.r * 0.5) {
        if (fits) {
          if (d < R - it.r * 0.75) { it.falling = true; it.vy = 0; it.y = 0; }
          else {
            // teetering on the edge: tilt towards the hole and slide in
            const k = 1 - (d - (R - it.r)) / (it.r * 1.5 + 0.001);
            it.tilt = THREE.MathUtils.clamp(k, 0, 1) * 0.6;
            m.rotation.x = -it.tilt * (dz / (d || 1)); m.rotation.z = it.tilt * (dx / (d || 1));
            m.position.y = -it.tilt * it.r * 0.5;
            it.x -= dx / (d || 1) * dt * 2.5; it.z -= dz / (d || 1) * dt * 2.5;
            m.position.x = it.x; m.position.z = it.z;
          }
        } else {
          // too big: wobble a little
          m.rotation.z = Math.sin(this.elapsed * 30) * 0.03;
          if (this.tooBigCooldown <= 0 && d < R * 0.8) { this.tooBigCooldown = 3; this.floater(t('tooBig'), 'warn-f'); sfx.bump(); }
        }
      } else if (it.tilt) { it.tilt = 0; m.rotation.x = 0; m.rotation.z = 0; m.position.y = 0; }
    }
  }

  _hazardFx(dt) {
    const t = performance.now() * 0.006;
    if (this.hazRings) this.hazRings.forEach((m, i) => { m.material.opacity = 0.45 + 0.45 * (0.5 + 0.5 * Math.sin(t + i)); });
    if (this.fx) this.fx = this.fx.filter((p) => {
      p.userData.life -= dt; const a = p.geometry.attributes.position, v = p.userData.vel;
      for (let k = 0; k < a.count; k++) { v[k * 3 + 1] -= 18 * dt; a.setXYZ(k, a.getX(k) + v[k * 3] * dt, a.getY(k) + v[k * 3 + 1] * dt, a.getZ(k) + v[k * 3 + 2] * dt); }
      a.needsUpdate = true; p.material.opacity = Math.max(0, p.userData.life);
      if (p.userData.life <= 0) { this.scene.remove(p); p.geometry.dispose(); p.material.dispose(); return false; }
      return true;
    });
  }
  _snow(dt) {
    if (!this.snow) return;
    const a = this.snow.geometry.attributes.position, p = a.array, cx = this.hole.x, cz = this.hole.z;
    for (let i = 0; i < p.length; i += 3) {
      p[i + 1] -= dt * (2.2 + (i % 7) * 0.25); p[i] += Math.sin(this.elapsed * 1.3 + i) * dt * 0.4;
      if (p[i + 1] < 0) { p[i + 1] = 28 + Math.random() * 4; p[i] = cx + (Math.random() - 0.5) * 60; p[i + 2] = cz - 10 + (Math.random() - 0.5) * 60; }
    }
    a.needsUpdate = true;
  }
  _isGoal(it) { return this._goalIndex(it) >= 0; }
  _goalIndex(it) {
    let idx = -1;
    this.goals.forEach((g, i) => {
      if (g.name !== it.name || g.got >= g.need) return;
      if (!!g.big === it.big) idx = i;
    });
    return idx;
  }

  _swallow(it) {
    it.alive = false; it.mesh.visible = false;
    this.scene.remove(it.mesh);
    if (it.ring) { this.scene.remove(it.ring); it.ring = null; }
    if (it.hazard) return this._explode(it);
    if (it.pickup) {
      if (it.pickup === 'coins') { this.coinsEarned += 25; $('#run-coins').textContent = fmt(this.coinsEarned); this.floater('+25 🪙', 'big-f'); sfx.coin(); }
      else if (it.pickup === 'time') { this.timeLeft += 5; this._hudTime(true); this.floater('+5s ⏱️', 'grow-f'); sfx.goal(); }
      else if (it.pickup === 'gem') { this.gemsRun++; this.floater('+1 💎', 'boost-f'); sfx.win(); }
      else if (it.pickup === 'grow') { this.area *= 1.36; this.holeR = Math.min(MAX_R, Math.sqrt(this.area)); this.floater('⚡ ' + t('size') + ' ↑', 'grow-f'); sfx.booster(); }
      else if (it.pickup === 'time10') { this.timeLeft += 10; this._hudTime(true); this.floater('+10s ⏳', 'grow-f'); sfx.goal(); }
      haptic('medium');
      return;
    }
    this.swallowed++;
    // growth by area
    this.area += it.r * it.r * GROW_K;
    const before = this.holeR;
    this.holeR = Math.min(MAX_R, Math.sqrt(this.area));
    // coins
    const mat = MATERIAL_OF[it.name];
    if (mat) this.matsRun[mat] = (this.matsRun[mat] || 0) + Math.round(materialGain(it.r) * (mat === 'festive' ? 1 + ((this.perks || {}).festivePct || 0) / 100 : 1));
    const coins = Math.max(1, Math.round(it.r * it.r * 10));
    this.coinsEarned += coins;
    $('#run-coins').textContent = fmt(this.coinsEarned);
    // combo
    this.combo++; this.comboT = 0.7;
    const big = it.r > 1.0;
    if (big) { sfx.big(); haptic('heavy'); this.floater('+' + coins, 'big-f'); }
    else { sfx.pop(this.combo); haptic('light'); if (this.combo % 5 === 0) this.floater(t('combo') + ' x' + this.combo, 'combo-f'); else if (coins > 1) this.floater('+' + coins); }
    // size bar (progress to next "tier")
    const pct = ((this.holeR - this.r0) / (MAX_R - this.r0)) * 100;
    $('#size-fill').style.width = Math.min(100, pct) + '%';
    if (Math.floor(this.holeR * 2) > Math.floor(before * 2)) { this.floater(t('size') + ' ↑', 'grow-f'); }
    // goals
    const gi = this._goalIndex(it);
    if (gi >= 0) {
      const g = this.goals[gi]; g.got++;
      this._hudGoal(gi);
      if (g.got === g.need) sfx.goal();
      if (this.goals.every(g => g.got >= g.need)) this._end(true);
    }
  }

  _explode(it) {
    sfx.boom(); haptic('heavy');
    this.shake = 0.6;
    const el = $('#boom'); if (el) { el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); }
    // fiery particles
    const N = 90, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = [];
    const pal = [[1, .85, .2], [1, .45, .1], [1, .2, .15], [.35, .32, .4]];
    for (let i = 0; i < N; i++) { pos.set([this.hole.x, 0.5, this.hole.z], i * 3); col.set(pal[i % 4], i * 3); const a = Math.random() * 6.28, sp = 4 + Math.random() * 9; vel.push(Math.cos(a) * sp, 6 + Math.random() * 10, Math.sin(a) * sp); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true }));
    p.userData = { vel, life: 1.3 }; this.scene.add(p); (this.fx = this.fx || []).push(p);
    this.floater('💥', 'big-f');
    this._end(false, 'bomb');
  }
  revive() {
    this.ended = false; this.paused = false; this.invuln = 3; this.extraUsed = true;
  }
  _end(win, reason) {
    if (this.ended) return;
    this.ended = true; this.input.active = false; $('#joy').classList.remove('show');
    const pctLeft = this.timeLeft / this.level.time;
    const stars = win ? (pctLeft > 0.4 ? 3 : pctLeft > 0.15 ? 2 : 1) : 0;
    const timeBonus = win ? Math.round(this.timeLeft * 2) : 0;
    const winBonus = win ? 40 + this.level.n * 8 : 0;
    setTimeout(() => this.events.onEnd({
      win, stars, level: this.level.n, coins: this.coinsEarned, timeBonus, winBonus,
      swallowed: this.swallowed, canExtend: !win && !this.extraUsed, reason: reason || (win ? 'win' : 'time'),
    }), win ? 700 : reason === 'bomb' ? 1100 : 300);
  }
  markExtended() { this.extraUsed = true; }

  _camera(dt, idle) {
    const R = this.holeR * this.bonusR;
    const aspect = this.camera.aspect;
    const distK = aspect < 0.7 ? 1.0 : 0.8;
    const height = (13 + R * 3.2) * distK, back = (10 + R * 2.6) * distK;
    const target = new THREE.Vector3(this.hole.x, height, this.hole.z + back);
    if (!this._camInit) { this.camera.position.copy(target); this._camInit = true; }
    this.camera.position.lerp(target, Math.min(1, dt * 5));
    if (this.shake > 0) { this.shake -= dt; const k = this.shake * 0.9; this.camera.position.x += (Math.random() - 0.5) * k; this.camera.position.y += (Math.random() - 0.5) * k; }
    this.camera.lookAt(this.hole.x, 0, this.hole.z - 1.5);
  }

  render() { if (this.running) this.renderer.render(this.scene, this.camera); }
}
