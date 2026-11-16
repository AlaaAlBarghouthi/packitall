# Records promo video scenes from the real game, frame by frame (30 fps, 1080x1920).
import asyncio, json, sys, time, subprocess, os
from playwright.async_api import async_playwright

MODE = sys.argv[1] if len(sys.argv) > 1 else 'preview'   # preview | game | city | end
XMAS = os.environ.get('XMAS') == '1'
SUF = '_x' if XMAS else ''
OUT = '/home/claude/video'
FPS = 30
import threading, http.server, functools, socket
def _serve():
    try:
        h = functools.partial(http.server.SimpleHTTPRequestHandler, directory='/home/claude/packitall/www')
        h.log_message = lambda *a: None
        http.server.ThreadingHTTPServer(('127.0.0.1', 8099), h).serve_forever()
    except OSError: pass  # already running
threading.Thread(target=_serve, daemon=True).start()
now = int(time.time() * 1000)
SAVE = {'v': 1, 'coins': 12450, 'gems': 85, 'level': 6, 'stars': {}, 'hearts': 5, 'heartTs': now,
        'boosters': {'magnet': 3, 'tornado': 2, 'freeze': 2, 'grow': 2},
        'settings': {'sound': False, 'vib': False, 'lang': 'ar'}, 'tutorial': False, 'tut': {'move': True, 'city': True}}
if XMAS: SAVE.update({'level': 2, 'skin': 'candy', 'skins': ['classic', 'candy']})

CAPTION_CSS = """
#cap{position:fixed;left:0;right:0;top:30%;z-index:70;text-align:center;pointer-events:none;font-family:Baloo,sans-serif;
 font-weight:800;font-size:46px;line-height:1.15;color:#fff;-webkit-text-stroke:9px #3a1580;paint-order:stroke fill;
 filter:drop-shadow(0 5px 0 rgba(58,21,128,.55));padding:0 18px;transition:none}
#cap .y{color:#ffe14d}
"""

BOT = """() => {
  const g = window.__rec.game, R = g.holeR * g.bonusR; let best = null, bd = 1e9;
  for (const it of g.items) { if (!it.alive || it.falling || it.r >= R * 0.92) continue;
    const d = Math.hypot(it.x - g.hole.x, it.z - g.hole.z) - it.r * 4 - (g._isGoal(it) ? 3 : 0);
    if (d < bd) { bd = d; best = it; } }
  if (best) { const dx = best.x - g.hole.x, dz = best.z - g.hole.z, L = Math.hypot(dx, dz) || 1; g.input.dx = dx / L; g.input.dy = dz / L; }
  else { g.input.dx = 0; g.input.dy = 0; }
}"""

def ffmpeg_writer(name):
    tmp = f'{OUT}/{name}.tmp.mp4'
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                          '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
    return p, tmp

async def caption(pg, html):
    await pg.evaluate("(h) => { let c = document.getElementById('cap'); c.innerHTML = h; c.style.display = h ? 'block' : 'none'; }", html)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2, locale='ar-JO')
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.add_init_script("localStorage.setItem('packitall_save_v1', %s)" % json.dumps(json.dumps(SAVE)))
        await pg.goto('http://localhost:8099/index.html?rec' + ('&xmas' if XMAS else '&noxmas')); await pg.wait_for_function('window.__rec', timeout=60000)
        await pg.add_style_tag(content=CAPTION_CSS)
        await pg.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=\"cap\"></div>')")
        await pg.evaluate("document.fonts.ready")
        events = []

        async def shot(writer):
            buf = await pg.screenshot(type='jpeg', quality=92)
            writer.stdin.write(buf)

        if MODE in ('preview', 'game'):
            await pg.evaluate("""() => { const r = window.__rec; r.startLevel(); const g = r.game; g.introT = 0; document.querySelector('#intro').classList.remove('show');
              const orig = g._swallow.bind(g); g._end = () => {}; g._swallow = (it) => { orig(it); g.area += it.r * it.r * 0.05; g.holeR = Math.min(6, Math.sqrt(g.area)); };
              window.__lastSw = 0; }""")
            caps = [(0, 80, 'قدّيش بتقدر <span class="y">تبلع</span>؟ 🕳️'), (150, 245, 'كل ما تبلع...<br><span class="y">بتكبر!</span> 😳'),
                    (335, 420, '<span class="y">ابلع</span> كل شي! 🔥')]
            if XMAS: caps = [(0, 90, 'ابلع <span class="y">زينة العيد</span>! 🎄'), (150, 245, 'كل ما تبلع...<br><span class="y">بتكبر!</span> ❄️'),
                    (335, 420, '<span class="y">بابا نويل</span> ناطرك! 🎅')]
            N = 420
            if MODE == 'game': wr, tmp = ffmpeg_writer('s1_game' + SUF)
            for f in range(N):
                txt = next((c[2] for c in caps if c[0] <= f < c[1]), '')
                if f == 0 or any(f in (c[0], c[1]) for c in caps): await caption(pg, txt)
                if f == 200: await pg.evaluate("() => { const r = window.__rec; r.game.useBooster('magnet'); r.S().boosters.magnet--; r.game._hudBoosters(); }")
                if f == 320: await pg.evaluate("() => { const r = window.__rec; r.game.useBooster('tornado'); r.S().boosters.tornado--; r.game._hudBoosters(); }")
                rflag = 'true' if (MODE == 'game' or f in (40, 200, 260, 340, 470)) else 'false'
                sw = await pg.evaluate(f"""() => {{ ({BOT})(); window.__rec.step(1/{FPS}, 1, null, {rflag}); const g = window.__rec.game; const d = g.swallowed - window.__lastSw; window.__lastSw = g.swallowed; return [d, g.holeR]; }}""")
                if sw[0] > 0: events.append(['pop', f, sw[0], sw[1]])
                if f in (200, 320): events.append(['boost', f, 1, 0])
                if MODE == 'game': await shot(wr)
                elif f in (40, 200, 260, 340, 470):
                    await pg.screenshot(path=f'{OUT}/prev_game_{f}.jpg', type='jpeg', quality=85)
                if f % 60 == 0: print('frame', f, 'R', round(sw[1], 2), flush=True)
            if MODE == 'game':
                wr.stdin.close(); rc = wr.wait()
                if rc == 0: os.replace(tmp, f'{OUT}/s1_game{SUF}.mp4')
                json.dump(events, open(f'{OUT}/events_game{SUF}.json', 'w'))

        if MODE in ('preview', 'city'):
            await pg.evaluate("""() => { const r = window.__rec, S = r.S(); S.level = 30; S.coins = 12450;
              S.plots.forEach(p => { p.b = null; p.lv = 0; p.ts = Date.now(); });
              r.closeModal(true); r.backToMenu('city'); r.city.zoom = 0.34; r.city.pan.set(0, 1.5);
              document.querySelector('#btn-collect').style.visibility = 'hidden'; }""")
            order = [5, 6, 9, 10, 1, 2, 4, 8, 7, 11, 13, 14, 0, 3, 12, 15]
            types = ['house', 'cafe', 'icecream', 'fountain', 'boutique', 'bakery', 'greenhouse', 'park', 'mansion', 'cinema', 'hotel', 'tower', 'toystore', 'ferris', 'stadium', 'castle']
            caps = [(0, 130, 'وبالكوينز...<br><span class="y">ابنِ مدينتك</span> 🏙️'), (190, 330, 'من بيت صغير...<br><span class="y">لمدينة كاملة</span> ✨')]
            if XMAS:
                caps = [(0, 130, 'وزيّن <span class="y">مدينتك</span><br>للعيد 🎄'), (190, 330, 'ثلج... أضواء...<br><span class="y">ومزلجة طايرة!</span> 🛷')]
                types = ['workshop' if t == 'fountain' else t for t in types]
            N = 330
            if MODE == 'city': wr, tmp = ffmpeg_writer('s2_city' + SUF)
            for f in range(N):
                txt = next((c[2] for c in caps if c[0] <= f < c[1]), '')
                if f == 0 or any(f in (c[0], c[1]) for c in caps): await caption(pg, txt)
                k = (f - 20) // 17
                if f >= 20 and (f - 20) % 17 == 0 and k < len(order):
                    i = order[k]; lv = 3 if k % 3 == 0 else 2 if k % 3 == 1 else 1
                    await pg.evaluate(f"() => {{ const r = window.__rec; r.S().plots[{i}] = {{ b: '{types[k]}', lv: {lv}, ts: Date.now() }}; r.city.refresh(); r.city.burst({i}); }}")
                    events.append(['build', f, 1, 0])
                z = 0.34 + 0.3 * min(1, f / N)  # slow pull-back reveal
                rflag = 'true' if (MODE == 'city' or f in (60, 200, 329)) else 'false'
                await pg.evaluate(f"() => {{ const c = window.__rec.city; c.zoom = {z}; window.__rec.step(1/{FPS}, 1, null, {rflag}); }}")
                if MODE == 'city': await shot(wr)
                elif f in (60, 200, 329):
                    await pg.screenshot(path=f'{OUT}/prev_city_{f}.jpg', type='jpeg', quality=85)
            if MODE == 'city':
                wr.stdin.close(); rc = wr.wait()
                if rc == 0: os.replace(tmp, f'{OUT}/s2_city{SUF}.mp4')
                json.dump(events, open(f'{OUT}/events_city{SUF}.json', 'w'))

        if MODE in ('preview', 'end'):
            await pg.evaluate(f"window.__X = {'true' if XMAS else 'false'}")
            await pg.evaluate("""() => { document.body.insertAdjacentHTML('beforeend', `<div id="endcard" style="position:fixed;inset:0;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;background:${window.__X ? 'radial-gradient(circle at 50% 42%,#e8323e,#5a0a18 72%)' : 'radial-gradient(circle at 50% 42%,#9a5cf0,#2a1458 70%)'};font-family:Baloo,sans-serif">
              <img src="icon-512.png" style="width:230px;height:230px;border-radius:54px;box-shadow:0 12px 0 #1d0a4a,0 0 0 8px #fff">
              <div class="logo big" style="transform:rotate(-4deg) scale(1.15)"><span>PACK</span><span>IT ALL</span></div>
              <div style="font-weight:800;font-size:40px;color:#fff;text-shadow:0 3px 0 #3a1580">${window.__X ? 'عيد ميلاد مجيد 🎄' : 'ابلع · اجمع · ابنِ'}</div>
              <div class="btn btn-green btn-big" style="font-size:34px;min-width:300px">العبها مجاناً 🎮</div></div>`); }""")
            await pg.wait_for_timeout(800)
            await pg.screenshot(path=f'{OUT}/end{SUF}.png' if MODE == 'end' else f'{OUT}/prev_end.jpg', type='png' if MODE == 'end' else 'jpeg')
        await b.close()

asyncio.run(main())
