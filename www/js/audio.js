// Synthesized sound effects (no audio files needed) + haptics
import { S } from './state.js';

let ctx = null, master = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
export function unlockAudio() { ac(); }

function tone(freq, dur, { type = 'sine', vol = 0.3, slide = 0, delay = 0, attack = 0.005 } = {}) {
  const c = ac(); if (!c || !S.settings.sound) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
}

export const sfx = {
  boom() {
    const c = ac(); if (!c || !S.settings.sound) return;
    const t0 = c.currentTime, n = c.sampleRate * 0.9, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, t0); lp.frequency.exponentialRampToValueAtTime(120, t0 + 0.8);
    const g = c.createGain(); g.gain.value = 0.9; src.connect(lp); lp.connect(g); g.connect(master); src.start(t0);
    tone(90, 0.6, { type: 'sine', vol: 0.6, slide: 0.35 });
  },
  pop(combo = 0) {
    const f = 380 * Math.pow(1.06, Math.min(combo, 24));
    tone(f, 0.12, { type: 'triangle', vol: 0.25, slide: 2.2 });
    tone(f * 2, 0.06, { type: 'sine', vol: 0.08, delay: 0.02 });
  },
  big() { tone(160, 0.35, { type: 'sine', vol: 0.4, slide: 0.4 }); tone(520, 0.2, { type: 'triangle', vol: 0.15, slide: 2, delay: 0.05 }); },
  coin() { tone(988, 0.08, { type: 'square', vol: 0.08 }); tone(1319, 0.18, { type: 'square', vol: 0.08, delay: 0.07 }); },
  click() { tone(660, 0.05, { type: 'triangle', vol: 0.15 }); },
  bump() { tone(110, 0.08, { type: 'sine', vol: 0.12 }); },
  goal() { [784, 988, 1175].forEach((f, i) => tone(f, 0.15, { type: 'triangle', vol: 0.18, delay: i * 0.07 })); },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.22, delay: i * 0.11 })); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, { type: 'sawtooth', vol: 0.08, delay: i * 0.16 })); },
  build() { [262, 330, 392, 523].forEach((f, i) => tone(f, 0.16, { type: 'square', vol: 0.07, delay: i * 0.08 })); tone(1047, 0.4, { type: 'triangle', vol: 0.15, delay: 0.35 }); },
  booster() { tone(300, 0.4, { type: 'sawtooth', vol: 0.1, slide: 3 }); },
  tick() { tone(1200, 0.03, { type: 'square', vol: 0.05 }); },
  error() { tone(200, 0.15, { type: 'square', vol: 0.08 }); tone(150, 0.2, { type: 'square', vol: 0.08, delay: 0.1 }); },
};

export function haptic(kind = 'light') {
  if (!S.settings.vib) return;
  const H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
  try {
    if (H && window.Capacitor.isNativePlatform()) {
      H.impact({ style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' });
    } else if (navigator.vibrate) {
      navigator.vibrate(kind === 'heavy' ? 40 : kind === 'medium' ? 20 : 8);
    }
  } catch (e) {}
}
