(function () {
  const IMG_SRC = { williams: "assets/img/Williams_logo.png", chili: "assets/img/Chili.png", mclaren: "assets/img/mclaren_logo.png", ln4: "assets/img/lando_logo.png" };
  const IMAGES = {}, LOADED = {}; for (const k in IMG_SRC) { const img = new Image(); img.onload = () => LOADED[k] = true; img.onerror = () => LOADED[k] = false; img.src = IMG_SRC[k]; IMAGES[k] = img; LOADED[k] = false }
  let cvs, ctx, DPR = 1, W = 0, H = 0, rafId = null;
  function ensureCanvas() { if (cvs && ctx) return; DPR = Math.max(1, window.devicePixelRatio || 1); cvs = document.getElementById("kc-confetti"); if (!cvs) { cvs = document.createElement("canvas"); cvs.id = "kc-confetti"; Object.assign(cvs.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "99999" }); document.body.appendChild(cvs) } ctx = cvs.getContext("2d"); resize(true); window.addEventListener("resize", () => resize(false), { passive: true }) }
  function resize(force) { if (!cvs) return; const w = Math.max(1, (innerWidth | 0) * DPR), h = Math.max(1, (innerHeight | 0) * DPR); if (force || w !== W || h !== H) { W = cvs.width = w; H = cvs.height = h } }
  function wait(keys) { return new Promise(r => { const ok = () => keys.every(k => IMAGES[k]?.complete && LOADED[k] !== false); if (ok()) return r(); const i = setInterval(() => { if (ok()) { clearInterval(i); r() } }, 30) }) }
  function burst(o) {
    ensureCanvas(); resize(false); if (!ctx) return; if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    const colors = o?.colors || ["#ffd6a5", "#caffbf", "#bdb2ff", "#a0c4ff", "#ffadad"];
    const labels = o?.labels || [];
    const durationMs = o?.durationMs ?? 2200;
    const count = o?.count ?? 320;
    const imgSize = (o?.imgSize ?? 22) * DPR;
    const start = performance.now(); let last = start;
    const parts = Array.from({ length: count }, () => ({ x: Math.random() * W, y: -Math.random() * H * .35, vx: (Math.random() * 2 - 1) * .7 * DPR, vy: (1.3 + Math.random() * 1.5) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * .22 - .11), color: colors[(Math.random() * colors.length) | 0], label: labels.length ? labels[(Math.random() * labels.length) | 0] : null, size: imgSize * (.85 + Math.random() * .5) }));
    function draw(p) { if (p.label && IMAGES[p.label] && LOADED[p.label]) { const s = p.size; ctx.drawImage(IMAGES[p.label], -s / 2, -s / 2, s, s) } else { ctx.beginPath(); ctx.moveTo(-5 * DPR, -3 * DPR); ctx.lineTo(5 * DPR, -3 * DPR); ctx.lineTo(5 * DPR, 3 * DPR); ctx.lineTo(-5 * DPR, 3 * DPR); ctx.closePath(); ctx.fillStyle = p.color; ctx.fill() } }
    function tick(now) {
      const dt = Math.min((now - last) / 16.666, 3); last = now;
      const t = (now - start) / durationMs;
      const fade = t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.max(0, Math.min(1, fade));
      for (const p of parts) { p.vy += .007 * DPR * dt; p.vx *= .998; p.vy *= .998; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt }
      for (const p of parts) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); draw(p); ctx.restore() }
      ctx.globalAlpha = 1;
      if (now - start < durationMs) rafId = requestAnimationFrame(tick); else { ctx.clearRect(0, 0, W, H); rafId = null }
    }
    if (labels.length) wait([...new Set(labels)]).then(() => { rafId = requestAnimationFrame(tick) }); else { rafId = requestAnimationFrame(tick) }
  }
  function startThemedConfetti(theme) {
    if (theme === "carlos") { burst({ colors: ["#0d347e", "#ffffff", "#c9d7ff"], labels: ["williams", "chili"], imgSize: 24 }) }
    else if (theme === "lando") { burst({ colors: ["#ff8000", "#0c0c0d", "#ffffff"], labels: ["mclaren", "ln4"], imgSize: 24 }) }
    else { burst({ colors: ["#e6f7ee", "#eaf0ff", "#ffe9f4"] }) }
  }
  function startCustomConfetti(opts) { burst(opts) }
  function startEmojiConfetti() { burst({ colors: ["#e0ffe5", "#e8f0ff", "#ffe8f6"], labels: [], durationMs: 1800, count: 260 }) }
  function startNormalConfetti() { burst({}) }
  window.startThemedConfetti = startThemedConfetti;
  window.startCustomConfetti = startCustomConfetti;
  window.startEmojiConfetti = startEmojiConfetti;
  window.startNormalConfetti = startNormalConfetti;
  window.prepareConfetti = () => ensureCanvas();
})();
