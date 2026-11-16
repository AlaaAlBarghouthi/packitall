// The hole level: 3D scene, input, swallowing, goals, boosters
import * as THREE from './lib/three.module.min.js';
import { getModel, itemMaterial, modelIcon } from './models.js';
import { generateLevel, populate } from './levels.js';
import { sfx, haptic } from './audio.js';
import { t, fmt, fmtTime } from './i18n.js';

const $ = (s) => document.querySelector(s);
const R0 = 0.9, GROW_K = 0.3, MAX_R = 6;
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

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 60, 128, 128, 128);
  grd.addColorStop(0, 'rgba(190,110,255,0.0)');
  grd.addColorStop(0.42, 'rgba(190,110,255,0.75)');
  grd.addColorStop(0.55, 'rgba(230,170,255,0.45)');
  grd.addColorStop(1, 'rgba(190,110,255,0)');
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
  start(n, boosters) {
    this.clear();
    const lvl = populate(generateLevel(n), (name) => getModel(name).foot);
    this.level = lvl;
    this.boostersInv = boosters; // reference to save.boosters (mutated by main via callback)
    this.timeLeft = lvl.time; this.elapsed = 0;
    this.holeR = R0; this.area = R0 * R0; this.bonusR = 1;
    this.hole = new THREE.Vector3(0, 0, lvl.H * 0.75);
    this.vel = new THREE.Vector2();
    this.coinsEarned = 0; this.swallowed = 0; this.combo = 0; this.comboT = 0;
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
    floorMat.onBeforeCompile = (sh) => {
      sh.uniforms.uHole = this.uniforms.uHole; sh.uniforms.uHoleR = this.uniforms.uHoleR;
      sh.vertexShader = 'varying vec3 vWPos;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n vWPos = (modelMatrix * vec4(position,1.0)).xyz;');
      sh.fragmentShader = 'uniform vec2 uHole; uniform float uHoleR; varying vec3 vWPos;\n' +
        sh.fragmentShader.replace('#include <clipping_planes_fragment>',
          'if (distance(vWPos.xz, uHole) < uHoleR) discard;\n#include <clipping_planes_fragment>');
    };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    this.scene.add(floor); this.floor = floor;

    // out-of-bounds tint + border fence
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xb06bff, roughness: 0.4 });
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
      mesh.castShadow = true; mesh.receiveShadow = false;
      this.scene.add(mesh);
      return { mesh, name: it.name, scale: it.scale, r: m.foot * it.scale, h: m.height * it.scale,
        big: !!it.big, x: it.x, z: it.z, y: 0, vy: 0, falling: false, alive: true, tilt: 0, spin: (Math.random() - 0.5) * 8 };
    });

    this.goals = lvl.goals.map(g => ({ ...g, got: 0 }));
    this._buildHud();
    this._updateHole(true);
    this.running = true; this.paused = false;
    this._resize();
    this._showIntro();
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
      <div class="intro-hint">${t('tapToMove')}</div></div>`;
    el.classList.add('show');
    this.introT = 2.0;
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
    this.active[k] = BOOST_TIME[k];
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
    if (this.introT <= 0 && !this.active.freeze) this.timeLeft -= dt;
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
      const fits = it.r < R * 0.92;
      // pulls
      if (fits && (magnet || (tornado && this._isGoal(it)))) {
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
          if (d < R - it.r * 0.35) { it.falling = true; it.vy = 0; it.y = 0; }
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
    this.swallowed++;
    // growth by area
    this.area += it.r * it.r * GROW_K;
    const before = this.holeR;
    this.holeR = Math.min(MAX_R, Math.sqrt(this.area));
    // coins
    const coins = Math.max(1, Math.round(it.r * it.r * 10));
    this.coinsEarned += coins;
    $('#run-coins').textContent = fmt(this.coinsEarned);
    // combo
    this.combo++; this.comboT = 0.7;
    const big = it.r > 1.0;
    if (big) { sfx.big(); haptic('heavy'); this.floater('+' + coins, 'big-f'); }
    else { sfx.pop(this.combo); haptic('light'); if (this.combo % 5 === 0) this.floater(t('combo') + ' x' + this.combo, 'combo-f'); else if (coins > 1) this.floater('+' + coins); }
    // size bar (progress to next "tier")
    const pct = ((this.holeR - R0) / (MAX_R - R0)) * 100;
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

  _end(win) {
    if (this.ended) return;
    this.ended = true; this.input.active = false; $('#joy').classList.remove('show');
    const pctLeft = this.timeLeft / this.level.time;
    const stars = win ? (pctLeft > 0.4 ? 3 : pctLeft > 0.15 ? 2 : 1) : 0;
    const timeBonus = win ? Math.round(this.timeLeft * 2) : 0;
    const winBonus = win ? 40 + this.level.n * 8 : 0;
    setTimeout(() => this.events.onEnd({
      win, stars, level: this.level.n, coins: this.coinsEarned, timeBonus, winBonus,
      swallowed: this.swallowed, canExtend: !win && !this.extraUsed,
    }), win ? 700 : 300);
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
    this.camera.lookAt(this.hole.x, 0, this.hole.z - 1.5);
  }

  render() { if (this.running) this.renderer.render(this.scene, this.camera); }
}
