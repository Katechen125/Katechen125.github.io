(function () {
  const IMG_SRC = { williams: "assets/img/Williams_logo.png", chili: "assets/img/Chili.png", mclaren: "assets/img/mclaren_logo.png", ln4: "assets/img/lando_logo.png" };
  const IMAGES = {}, LOADED = {}; for (const k in IMG_SRC) { const im = new Image(); im.onload = () => LOADED[k] = true; im.onerror = () => LOADED[k] = false; im.src = IMG_SRC[k]; IMAGES[k] = im; LOADED[k] = false }
  let cvs, ctx, DPR = 1, W = 0, H = 0, rafId = null;
  function ensureCanvas() { if (cvs && ctx) return; DPR = Math.max(1, window.devicePixelRatio || 1); cvs = document.getElementById("kc-confetti"); if (!cvs) { cvs = document.createElement("canvas"); cvs.id = "kc-confetti"; Object.assign(cvs.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "99999" }); document.body.appendChild(cvs) } ctx = cvs.getContext("2d"); resize(true); addEventListener("resize", () => resize(false), { passive: true }) }
  function resize(force) { if (!cvs) return; const w = (innerWidth | 0) * DPR, h = (innerHeight | 0) * DPR; if (force || w !== W || h !== H) { W = cvs.width = w; H = cvs.height = h } }
  function wait(keys) { return new Promise(r => { const ok = () => keys.every(k => IMAGES[k]?.complete && LOADED[k] !== false); if (ok()) return r(); const i = setInterval(() => { if (ok()) { clearInterval(i); r() } }, 30) }) }
  function burst(o) {
    ensureCanvas(); resize(false); if (!ctx) return; if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    const colors = o?.colors || ["#ffd6a5", "#caffbf", "#bdb2ff", "#a0c4ff", "#ffadad"], labels = o?.labels || [], durationMs = o?.durationMs ?? 2600, count = o?.count ?? 320, imgSize = (o?.imgSize ?? 22) * DPR;
    const start = performance.now(); let last = start;
    const parts = Array.from({ length: count }, () => ({ x: Math.random() * W, y: -Math.random() * H * .35, vx: (Math.random() * 2 - 1) * .65 * DPR, vy: (1.1 + Math.random() * 1.3) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * .18 - .09), color: colors[(Math.random() * colors.length) | 0], label: labels.length ? labels[(Math.random() * labels.length) | 0] : null, size: imgSize * (.85 + Math.random() * .5) }));
    function draw(p, a) { ctx.globalAlpha = a; if (p.label && IMAGES[p.label] && LOADED[p.label]) { const s = p.size; ctx.drawImage(IMAGES[p.label], -s / 2, -s / 2, s, s) } else { ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(-5 * DPR, -3 * DPR); ctx.lineTo(5 * DPR, -3 * DPR); ctx.lineTo(5 * DPR, 3 * DPR); ctx.lineTo(-5 * DPR, 3 * DPR); ctx.closePath(); ctx.fill() } }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3) }
    function tick(now) {
      const dt = Math.min((now - last) / 16.666, 3); last = now;
      const t = Math.min((now - start) / durationMs, 1);
      const fade = t > 0.7 ? 1 - ((t - 0.7) / 0.3) : 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      for (const p of parts) { p.vy += .006 * DPR * dt; p.vx *= .998; p.vy *= .998; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt }
      for (const p of parts) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); draw(p, easeOut(fade)); ctx.restore() }
      if (t < 1) rafId = requestAnimationFrame(tick); else { ctx.clearRect(0, 0, W, H); ctx.globalAlpha = 1; rafId = null }
    }
    if (labels.length) wait([...new Set(labels)]).then(() => rafId = requestAnimationFrame(tick)); else rafId = requestAnimationFrame(tick)
  }
  function startThemedConfetti(theme) { if (theme === "carlos") { burst({ colors: ["#0d347e", "#ffffff", "#c9d7ff"], labels: ["williams", "chili"], imgSize: 24 }) } else if (theme === "lando") { burst({ colors: ["#ff8000", "#0c0c0d", "#ffffff"], labels: ["mclaren", "ln4"], imgSize: 24 }) } else { burst({}) } }
  function startEmojiConfetti() { burst({ colors: ["#e7ffe9", "#edf3ff", "#ffeaf7"], labels: [], durationMs: 2400, count: 300 }) }
  function startNormalConfetti() { burst({}) }
  window.startThemedConfetti = startThemedConfetti; window.startEmojiConfetti = startEmojiConfetti; window.startNormalConfetti = startNormalConfetti; window.prepareConfetti = () => ensureCanvas();
})();
