(function () {
  const IMG_SRC = {
    williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp",
    chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png",
    mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png",
    ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png",
  };
  const IMAGES = {};
  for (const k in IMG_SRC) { const img = new Image(); img.src = IMG_SRC[k]; IMAGES[k] = img; }

  let cvs, ctx, W = 0, H = 0, DPR = Math.max(1, window.devicePixelRatio || 1), rafId = null;
  function ensureCanvas() {
    if (cvs) return;
    cvs = document.createElement('canvas');
    cvs.id = 'kc-confetti';
    Object.assign(cvs.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999' });
    document.body.appendChild(cvs);
    ctx = cvs.getContext('2d');
    resize(); addEventListener('resize', resize);
  }
  function resize() { W = cvs.width = Math.floor(innerWidth * DPR); H = cvs.height = Math.floor(innerHeight * DPR); }

  function burst({ colors, labels = [], durationMs = 2800, fadeMs = 700, imgSize = 24, textPx = 16, count = 280 }) {
    ensureCanvas();
    if (rafId) cancelAnimationFrame(rafId);
    const start = performance.now();
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: -Math.random() * H * 0.6,
      vx: (Math.random() * 2 - 1) * 0.8 * DPR, vy: (2 + Math.random() * 2) * DPR,
      rot: Math.random() * Math.PI, vr: (Math.random() * 0.2 - 0.1),
      color: colors[(Math.random() * colors.length) | 0],
      label: labels.length ? labels[(Math.random() * labels.length) | 0] : null
    }));
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    function tick(t) {
      const elapsed = t - start, remaining = Math.max(0, durationMs - elapsed);
      const fade = 1 - (Math.max(0, Math.min(1, remaining / fadeMs)));
      const alpha = 1 - easeOutCubic(fade);
      ctx.clearRect(0, 0, W, H);
      parts.forEach(p => { const d = 1 - 0.12 * fade; p.vy += 0.01 * DPR; p.vx *= d; p.vy *= d; p.rot += p.vr * d; p.x += p.vx; p.y += p.vy; });
      parts.forEach(p => {
        if (p.y > H + 40 * DPR) { p.y = -20 * DPR; p.x = Math.random() * W; }
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.label && IMAGES[p.label] && IMAGES[p.label].complete) { const s = imgSize * DPR; ctx.drawImage(IMAGES[p.label], -s / 2, -s / 2, s, s); }
        else if (p.label && typeof p.label === 'string' && p.label.length <= 3) {
          ctx.font = (textPx * DPR) + "px Playfair Display,serif"; ctx.fillStyle = p.color; ctx.fillText(p.label, -ctx.measureText(p.label).width / 2, 0);
        } else { ctx.fillStyle = p.color; ctx.fillRect(-4, -4, 8, 8); }
        ctx.restore();
      });
      if (elapsed < durationMs) rafId = requestAnimationFrame(tick); else { ctx.clearRect(0, 0, W, H); rafId = null; }
    }
    rafId = requestAnimationFrame(tick);
  }

  function startThemedConfetti(theme) {
    if (theme === 'carlos') {
      burst({ colors: ['#0f3d91', '#ffffff'], labels: ['williams', 'chili'], imgSize: 24, count: 260 });
    } else if (theme === 'lando') {
      burst({ colors: ['#ff8000', '#ffffff', '#0c0c0d'], labels: ['mclaren', 'ln4'], imgSize: 24, count: 260 });
    } else {
      burst({ colors: ['#e07b97', '#6fa387', '#6aa9d8'], labels: ['💻', '🫀', '🏎️'], imgSize: 22, count: 220 });
    }
  }

  window.startThemedConfetti = startThemedConfetti;
})();

