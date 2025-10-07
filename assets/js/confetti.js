(function () {
  const IMG_SRC = {
    williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp",
    chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png",
    mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png",
    ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png"
  };

  const IMAGES = {};
  for (const k in IMG_SRC) { const img = new Image(); img.src = IMG_SRC[k]; IMAGES[k] = img; }

  let cvs, ctx, W = 0, H = 0, DPR = Math.max(1, window.devicePixelRatio || 1), rafId = null, prepared = false;

  function ensureCanvas() {
    if (cvs) return;
    cvs = document.createElement('canvas');
    cvs.id = 'kc-confetti';
    Object.assign(cvs.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '100' });
    document.body.appendChild(cvs);
    ctx = cvs.getContext('2d');
    resize();
    addEventListener('resize', resize);
  }
  function resize() { if (!cvs) return; W = cvs.width = Math.floor(innerWidth * DPR); H = cvs.height = Math.floor(innerHeight * DPR); }

  function makePartsRect(colors, n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W, y: -Math.random() * H * 0.45,
      vx: (Math.random() * 2 - 1) * 0.9 * DPR, vy: (1.8 + Math.random() * 2.2) * DPR,
      rot: Math.random() * Math.PI, vr: (Math.random() * 0.28 - 0.14),
      color: colors[(Math.random() * colors.length) | 0], w: 6 * DPR, h: 10 * DPR
    }));
  }
  function makePartsLabeled(colors, labels, n, imgSize, textPx) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W, y: -Math.random() * H * 0.5,
      vx: (Math.random() * 2 - 1) * 0.8 * DPR, vy: (2 + Math.random() * 2) * DPR,
      rot: Math.random() * Math.PI, vr: (Math.random() * 0.2 - 0.1),
      color: colors[(Math.random() * colors.length) | 0],
      label: labels[(Math.random() * labels.length) | 0],
      imgSize, textPx
    }));
  }

  function run(parts, durationMs) {
    ensureCanvas();
    if (rafId) cancelAnimationFrame(rafId);
    const start = performance.now();
    function tick(t) {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(p => {
        p.vy += 0.01 * DPR;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > H + 24 * DPR) { p.y = -12 * DPR; p.x = Math.random() * W; }
      });
      parts.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.label && IMAGES[p.label] && IMAGES[p.label].complete) {
          const s = p.imgSize * DPR; ctx.drawImage(IMAGES[p.label], -s / 2, -s / 2, s, s);
        } else if (p.label && typeof p.label === 'string' && p.label.length <= 3) {
          ctx.font = (p.textPx * DPR) + "px Playfair Display,serif"; ctx.fillStyle = p.color;
          const m = ctx.measureText(p.label); ctx.fillText(p.label, -m.width / 2, 0);
        } else if (p.w) {
          ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.fillStyle = p.color; ctx.fillRect(-4, -4, 8, 8);
        }
        ctx.restore();
      });
      if (t - start < durationMs) { rafId = requestAnimationFrame(tick); } else { ctx.clearRect(0, 0, W, H); rafId = null; }
    }
    rafId = requestAnimationFrame(tick);
  }

  function startNormalConfetti() {
    run(makePartsRect(['#ff7676', '#ffd166', '#6ee7b7', '#93c5fd', '#fbcfe8', '#e9d5ff'], 240), 2600);
  }

  function startEmojiConfetti() {
    const colors = ['#e07b97', '#6fa387', '#6aa9d8'];
    const labels = ['💻', '🫀', '🏎️'];
    run(makePartsLabeled(colors, labels, 240, 22, 16), 2600);
  }

  function startThemedConfetti(theme) {
    if (theme === 'carlos') {
      run(makePartsLabeled(['#0f3d91', '#ffffff'], ['williams', 'chili'], 260, 24, 16), 2600);
    } else if (theme === 'lando') {
      run(makePartsLabeled(['#ff8000', '#ffffff', '#0c0c0d'], ['mclaren', 'ln4'], 260, 24, 16), 2600);
    } else {
      startEmojiConfetti();
    }
  }

  function prepareConfetti() {
    ensureCanvas();
    if (prepared) return;
    run(makePartsRect(['#000000'], 1), 10);
    prepared = true;
  }

  window.prepareConfetti = prepareConfetti;
  window.startNormalConfetti = startNormalConfetti;
  window.startEmojiConfetti = startEmojiConfetti;
  window.startThemedConfetti = startThemedConfetti;
})();
