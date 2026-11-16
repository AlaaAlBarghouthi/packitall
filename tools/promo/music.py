# Synthesizes an upbeat original music bed + sound effects synced to the recorded events.
import numpy as np, json, sys, wave, os
XMAS = os.environ.get('XMAS') == '1'
SUF = '_x' if XMAS else ''
SR = 44100
FPS = 30
dur_game, dur_city, dur_end = [float(x) for x in sys.argv[1:4]]
T = dur_game + dur_city + dur_end
N = int(T * SR)
mix = np.zeros((N, 2))
t_all = np.arange(N) / SR

def env(n, a=0.005, r=0.2, sustain=False):
    e = np.ones(n)
    na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if not sustain:
        e *= np.exp(-np.arange(n) / (r * SR))
    return e

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    mix[i:i + len(sig), 0] += sig * gain * l * 1.41
    mix[i:i + len(sig), 1] += sig * gain * r * 1.41

def osc(f, d, kind='sine'):
    t = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * f * t if np.isscalar(f) else 2 * np.pi * np.cumsum(f) / SR
    if kind == 'sine': return np.sin(ph)
    if kind == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if kind == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == 'sq': return np.sign(np.sin(ph)) * 0.6

def note(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- music: 124 bpm, I–V–vi–IV in C
BPM = 132 if XMAS else 124; beat = 60 / BPM; bar = beat * 4
chords = [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]]  # C G Am F
if XMAS: chords = [[43, 47, 50], [43, 47, 50], [48, 52, 55], [43, 47, 50], [48, 52, 55], [43, 47, 50], [45, 49, 52], [50, 54, 57]] * 2  # G G C G C G A D
rng = np.random.default_rng(3)
music_end = dur_game + dur_city + 0.6
nb = int(music_end / bar) + 1
for b in range(nb):
    t0 = b * bar; ch = chords[b % len(chords)]
    intro = t0 < bar * 0.99  # first bar lighter
    for k in range(4):
        tb = t0 + k * beat
        if tb > music_end: break
        # kick
        d = 0.32; f = 50 + 110 * np.exp(-np.arange(int(d * SR)) / (0.035 * SR))
        add(osc(f, d) * env(int(d * SR), 0.001, 0.12), tb, 0.85)
        # clap on 2 & 4
        if k % 2 == 1 and not intro:
            n = int(0.18 * SR); nz = rng.standard_normal(n); nz = np.convolve(nz, np.ones(6) / 6, 'same')
            add(nz * env(n, 0.001, 0.05), tb, 0.32)
        # hats on off-beats
        for h in (0.5,):
            n = int(0.05 * SR); nz = rng.standard_normal(n); nz = nz - np.convolve(nz, np.ones(3) / 3, 'same')
            add(nz * env(n, 0.001, 0.015), tb + h * beat, 0.22, 0.3)
        # bass (root, eighths)
        for e in (0, 0.5):
            d = beat * 0.45; f = note(ch[0] - 12 + (12 if e else 0))
            s = osc(f, d, 'tri') * 0.9 + osc(f * 2, d, 'sine') * 0.15
            add(s * env(int(d * SR), 0.004, 0.18), tb + e * beat, 0.42)
    # pluck arpeggio, sixteenths
    if not intro and not XMAS:
        pat = [0, 1, 2, 1, 2, 0, 1, 2]
        for s16 in range(16):
            ts = t0 + s16 * beat / 4
            if ts > music_end: break
            m = ch[pat[s16 % 8]] + 24 + (12 if s16 % 8 == 6 else 0)
            d = 0.22; f = note(m)
            sig = (osc(f, d, 'sq') * 0.5 + osc(f * 2, d, 'tri') * 0.4) * env(int(d * SR), 0.002, 0.07)
            add(sig, ts, 0.10, 0.25 if s16 % 2 else -0.25)
    # soft pad
    d = bar
    pad = sum(osc(note(m + 12), d, 'saw') for m in ch) / 3
    pad = np.convolve(pad, np.ones(40) / 40, 'same') * env(int(d * SR), 0.3, 0, True) * np.linspace(1, 0.6, int(d * SR))
    add(pad, t0, 0.07 if not intro else 0.05)

# Jingle Bells chorus (James Lord Pierpont, 1857 — public domain), glockenspiel + sleigh bells
if XMAS:
    B4, C5, D5, G4, A4 = 71, 72, 74, 67, 69
    l1 = [(B4,1),(B4,1),(B4,2),(B4,1),(B4,1),(B4,2),(B4,1),(D5,1),(G4,1.5),(A4,.5),(B4,4)]
    l2 = [(C5,1),(C5,1),(C5,1.5),(C5,.5),(C5,1),(B4,1),(B4,1),(B4,.5),(B4,.5),(B4,1),(A4,1),(A4,1),(B4,1),(A4,2),(D5,2)]
    l4 = [(C5,1),(C5,1),(C5,1.5),(C5,.5),(C5,1),(B4,1),(B4,1),(B4,.5),(B4,.5),(D5,1),(D5,1),(C5,1),(A4,1),(G4,4)]
    tm = bar  # melody starts after the intro bar
    for m, dbeats in l1 + l2 + l1 + l4:
        if tm > music_end: break
        d = min(1.2, dbeats * beat + 0.3); f = note(m + 12)
        sig = (osc(f, d) + 0.35 * osc(f * 2.76, d) + 0.15 * osc(f * 5.4, d)) * env(int(d * SR), 0.002, 0.35)
        add(sig, tm, 0.2, 0.1)
        tm += dbeats * beat
    for k8 in range(int(music_end / (beat / 2))):
        tb = k8 * beat / 2
        if tb < bar: continue
        n = int(0.09 * SR); nz = rng.standard_normal(n); nz = nz - np.convolve(nz, np.ones(4) / 4, 'same')
        jingle = nz * env(n, 0.001, 0.03) * (1 + 0.6 * np.sin(2 * np.pi * 5200 * np.arange(n) / SR))
        add(jingle, tb, 0.16 if k8 % 2 == 0 else 0.1, 0.4)

# fade music out near the end card
fo0, fo1 = int((dur_game + dur_city - 0.4) * SR), int(music_end * SR)
fade = np.ones(N); fade[fo0:fo1] = np.linspace(1, 0.0, fo1 - fo0); fade[fo1:] = 0
mix *= fade[:, None]

# ---------------- sfx
ev_game = json.load(open(f'events_game{SUF}.json')); ev_city = json.load(open(f'events_city{SUF}.json'))
last_pop = -1; combo = 0
for kind, f, n, R in ev_game:
    t = f / FPS
    if kind == 'pop':
        combo = combo + 1 if f - last_pop < 12 else 0
        last_pop = f
        fr = 420 * 2 ** (min(combo, 24) / 24)
        d = 0.12; fs = np.linspace(fr, fr * 2.2, int(d * SR))
        add(osc(fs, d, 'tri') * env(int(d * SR), 0.002, 0.05), t, 0.28, rng.uniform(-0.3, 0.3))
        if n >= 3 or R > 3:
            d = 0.3; fs = np.linspace(160, 60, int(d * SR)); add(osc(fs, d) * env(int(d * SR), 0.002, 0.12), t, 0.35)
    elif kind == 'boost':
        d = 0.7; fs = np.linspace(250, 900, int(d * SR))
        add((osc(fs, d, 'saw') * 0.4 + rng.standard_normal(int(d * SR)) * 0.2) * env(int(d * SR), 0.05, 0.35), t, 0.22)
for kind, f, n, R in ev_city:
    t = dur_game + f / FPS
    for i, m in enumerate([72, 76, 79, 84]):
        d = 0.25; add(osc(note(m), d, 'tri') * env(int(d * SR), 0.003, 0.12), t + i * 0.05, 0.14)
    d = 0.2; fs = np.linspace(500, 120, int(d * SR)); add(osc(fs, d) * env(int(d * SR), 0.002, 0.06), t, 0.25)
# end card sparkle chord
te = dur_game + dur_city + 0.15
for i, m in enumerate([72, 76, 79, 84, 88]):
    d = 1.6; add((osc(note(m), d, 'tri') + osc(note(m) * 2, d) * 0.3) * env(int(d * SR), 0.005, 0.6), te + i * 0.07, 0.13, (i - 2) * 0.2)

# master: soft clip + normalize
mix = np.tanh(mix * 1.1)
mix /= max(1e-6, np.abs(mix).max()) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(f'audio{SUF}.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('audio', T, 's')
