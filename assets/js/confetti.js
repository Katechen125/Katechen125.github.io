
  (function () {
  const DPR = Math.max(1, devicePixelRatio || 1);
  let cvs, ctx, W = 0, H = 0, raf = null;

  function ensure() {
    if (cvs) return;
  cvs = document.createElement('canvas');
  cvs.id = 'kc-confetti';
  Object.assign(cvs.style, {position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '1000' });
  document.body.appendChild(cvs);
  ctx = cvs.getContext('2d');
  resize(); addEventListener('resize', resize, {passive: true });
  }
  function resize() { if (!cvs) return; W = cvs.width = innerWidth * DPR; H = cvs.height = innerHeight * DPR; }

  function burstRects(colors, count = 240, dur = 2600) {
    ensure();
  if (raf) cancelAnimationFrame(raf);
  const start = performance.now();
  const parts = Array.from({length: count }, () => ({
    x: Math.random() * W, y: -Math.random() * H * 0.4,
  vx: (Math.random() * 2 - 1) * 0.9 * DPR,
  vy: (1.9 + Math.random() * 2.3) * DPR,
  rot: Math.random() * Math.PI, vr: (Math.random() * 0.3 - 0.15),
  w: (5 + Math.random() * 3) * DPR, h: (9 + Math.random() * 4) * DPR,
  c: colors[(Math.random() * colors.length) | 0]
    }));
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
      parts.forEach(p => {
    p.vy += 0.012 * DPR; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > H + 24 * DPR) {p.y = -12 * DPR; p.x = Math.random() * W; }
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
  ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
  if (t - start < dur) raf = requestAnimationFrame(tick); else {ctx.clearRect(0, 0, W, H); raf = null; }
    }
  raf = requestAnimationFrame(tick);
  }

  const EMOJI = ['💻','🫀','🏎️'];
  function burstEmoji(colors, count = 240, dur = 2600) {
    ensure();
  if (raf) cancelAnimationFrame(raf);
  const start = performance.now();
  ctx.font = 22 * DPR + "px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui";
  const parts = Array.from({length: count }, () => ({
    x: Math.random() * W, y: -Math.random() * H * 0.4,
  vx: (Math.random() * 2 - 1) * 0.9 * DPR,
  vy: (1.9 + Math.random() * 2.3) * DPR,
  rot: Math.random() * Math.PI, vr: (Math.random() * 0.3 - 0.15),
  k: EMOJI[(Math.random() * EMOJI.length) | 0], c: colors[(Math.random() * colors.length) | 0]
    }));
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
      parts.forEach(p => {
    p.vy += 0.012 * DPR; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > H + 30 * DPR) {p.y = -15 * DPR; p.x = Math.random() * W; }
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
  ctx.fillStyle = p.c; ctx.globalAlpha = 0.14; ctx.fillRect(-10, -10, 20, 20);
  ctx.globalAlpha = 1; ctx.rotate(-p.rot); ctx.fillText(p.k, -10, 8);
  ctx.restore();
      });
  if (t - start < dur) raf = requestAnimationFrame(tick); else {ctx.clearRect(0, 0, W, H); raf = null; }
    }
  raf = requestAnimationFrame(tick);
  }

  const TEAM_COLORS = {
    Ferrari: ['#dc0000','#ffd800'],
  McLaren: ['#ff8000','#00c2f3'],
  'Red Bull': ['#1e5bc6','#ed1c24','#ffc20e'],
  Mercedes: ['#00a19c','#e6e6e6'],
  Williams: ['#00a3e0','#002f6c'],
  Alpine: ['#ff87b7','#005baa'],
  'Aston Martin': ['#00665e','#ffe600'],
  Haas: ['#ffffff','#e6002b','#111111'],
  RB: ['#2b2d42','#edf2f4'],
  Sauber: ['#52e252','#111111']
  };

  function teamConfetti(team) {
    const colors = TEAM_COLORS[team] || ['#ff7676','#ffd166','#6ee7b7','#93c5fd','#fbcfe8','#e9d5ff'];
  burstRects(colors);
  }

  function carlosConfetti() {
    burstRects(['#0f3d91', '#ffffff']);
  }
  function landoConfetti() {
    burstRects(['#ff8000', '#ffffff', '#0c0c0d']);
  }
  function resetEmojiConfetti() {
    burstEmoji(['#e07b97', '#6fa387', '#6aa9d8']);
  }

  window.kcConfetti = {teamConfetti, carlosConfetti, landoConfetti, resetEmojiConfetti};
})();

