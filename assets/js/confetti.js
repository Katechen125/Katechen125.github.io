(function () {
  const SRC = { williams: "assets/img/Williams_logo.png", chili: "assets/img/Chili.png", mclaren: "assets/img/mclaren_logo.png", ln4: "assets/img/lando_logo.png" };
  const IMGS = {}, OK = {}; for (const k in SRC) { const i = new Image(); i.onload = () => OK[k] = true; i.onerror = () => OK[k] = false; i.src = SRC[k]; IMGS[k] = i; OK[k] = false }
  let cvs, ctx, DPR = 1, W = 0, H = 0, raf = null;
  function ensure() { if (cvs && ctx) return; DPR = Math.max(1, window.devicePixelRatio || 1); cvs = document.getElementById("kc-confetti"); if (!cvs) { cvs = document.createElement("canvas"); cvs.id = "kc-confetti"; Object.assign(cvs.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "99999" }); document.body.appendChild(cvs) } ctx = cvs.getContext("2d"); fit(true); window.addEventListener("resize", () => fit(false), { passive: true }) }
  function fit(force) { if (!cvs) return; const w = Math.max(1, (innerWidth | 0) * DPR), h = Math.max(1, (innerHeight | 0) * DPR); if (force || w !== W || h !== H) { W = cvs.width = w; H = cvs.height = h } }
  function wait(keys) { return new Promise(r => { const ok = () => keys.every(k => IMGS[k]?.complete && OK[k] !== false); if (ok()) return r(); const t = setInterval(() => { if (ok()) { clearInterval(t); r() } }, 30) }) }
  function burst(o) {
    ensure(); fit(false); if (!ctx) return; if (raf) { cancelAnimationFrame(raf); raf = null }
    const colors = o?.colors || ["#ffd6a5", "#caffbf", "#bdb2ff", "#a0c4ff", "#ffadad"], labels = o?.labels || [], dur = o?.durationMs ?? 2200, count = o?.count ?? 280, size = (o?.imgSize ?? 22) * DPR;
    const start = performance.now(); let last = start;
    const p = Array.from({ length: count }, () => ({ x: Math.random() * W, y: -Math.random() * H * .35, vx: (Math.random() * 2 - 1) * .7 * DPR, vy: (1.3 + Math.random() * 1.5) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * .22 - .11), c: colors[(Math.random() * colors.length) | 0], lab: labels.length ? labels[(Math.random() * labels.length) | 0] : null, s: size * (.85 + Math.random() * .5) }));
    function drawPiece(pp) { if (pp.lab && IMGS[pp.lab] && OK[pp.lab]) { const s = pp.s; ctx.drawImage(IMGS[pp.lab], -s / 2, -s / 2, s, s) } else { ctx.beginPath(); ctx.moveTo(-5 * DPR, -3 * DPR); ctx.lineTo(5 * DPR, -3 * DPR); ctx.lineTo(5 * DPR, 3 * DPR); ctx.lineTo(-5 * DPR, 3 * DPR); ctx.closePath(); ctx.fillStyle = pp.c; ctx.fill() } }
    function tick(now) {
      const dt = Math.min((now - last) / 16.666, 3); last = now;
      const t = (now - start) / dur; const fade = t < .8 ? 1 : Math.max(0, 1 - (t - .8) / .2); const alpha = fade * fade;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalAlpha = alpha;
      for (const e of p) { e.vy += .007 * DPR * dt; e.vx *= .998; e.vy *= .998; e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt }
      for (const e of p) { ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot); drawPiece(e); ctx.restore() }
      ctx.globalAlpha = 1;
      if (now - start < dur) raf = requestAnimationFrame(tick); else { ctx.clearRect(0, 0, W, H); raf = null }
    }
    if (labels.length) wait([...new Set(labels)]).then(() => { raf = requestAnimationFrame(tick) }); else { raf = requestAnimationFrame(tick) }
  }
  function themed(n) { if (n === "carlos") { burst({ colors: ["#0d347e", "#ffffff", "#c9d7ff"], labels: ["williams", "chili"], imgSize: 24 }) } else if (n === "lando") { burst({ colors: ["#ff8000", "#0c0c0d", "#ffffff"], labels: ["mclaren", "ln4"], imgSize: 24 }) } else { burst({}) } }
  function emoji() { burst({ colors: ["#e0ffe5", "#e8f0ff", "#ffe8f6"], labels: [], durationMs: 1800, count: 240 }) }
  function normal() { burst({}) }
  window.startThemedConfetti = themed; window.startEmojiConfetti = emoji; window.startNormalConfetti = normal; window.prepareConfetti = () => ensure();
})();
