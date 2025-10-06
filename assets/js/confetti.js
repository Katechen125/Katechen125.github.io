(function (w) {
  const Confetti = {};
  let canvas, ctx, W, H, DPR = Math.max(1, w.devicePixelRatio || 1), rafId = null;

  const logos = {};
  const logoFiles = {
    williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp",
    chili:    "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png",
    mclaren:  "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png",
    ln4:      "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png"
  };
  Object.keys(logoFiles).forEach(k => { logos[k] = new Image(); logos[k].src = logoFiles[k]; });

  function size() {
    if (!canvas) return;
    W = canvas.width  = w.innerWidth * DPR;
    H = canvas.height = w.innerHeight * DPR;
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (ctx) ctx.clearRect(0, 0, W, H);
  }

  function fall(opts = {}) {
    const {
      colors = ['#ddd'],
      labels = [],
      useImages = false,
      durationMs = 2800,
      fadeMs = 800,
      imgSize = 22,
      textPx = 16,
      count = 300,
      gravity = 0.01
    } = opts;

    stop();
    const parts = [];
    const start = performance.now();

    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * W,
        y: -Math.random() * H * 0.6,
        vx: (Math.random() * 2 - 1) * 0.8 * DPR,
        vy: (2 + Math.random() * 2) * DPR,
        rot: Math.random() * Math.PI,
        vr: (Math.random() * 0.2 - 0.1),
        color: colors[Math.floor(Math.random() * colors.length)],
        label: labels.length ? labels[Math.floor(Math.random() * labels.length)] : null,
        useImage: useImages
      });
    }

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const clamp01 = v => Math.max(0, Math.min(1, v));

    function tick(t) {
      const elapsed = t - start;
      const remaining = Math.max(0, durationMs - elapsed);
      const fadeProgress = 1 - clamp01(remaining / fadeMs);
      const alpha = 1 - easeOutCubic(fadeProgress);

      ctx.clearRect(0, 0, W, H);

      parts.forEach(p => {
        const damp = 1 - 0.12 * fadeProgress;
        p.vy += gravity * DPR;
        p.vx *= damp; p.vy *= damp;
        p.rot += p.vr * damp;
        p.x += p.vx; p.y += p.vy;
      });

      parts.forEach(p => {
        if (p.y > H + 40 * DPR) { p.y = -20 * DPR; p.x = Math.random() * W; }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.useImage && p.label && logos[p.label] && logos[p.label].complete) {
          const s = imgSize * DPR;
          ctx.drawImage(logos[p.label], -s/2, -s/2, s, s);
        } else if (!p.useImage && p.label) {
          ctx.font = (textPx * DPR) + "px Playfair Display, serif";
          ctx.fillStyle = p.color;
          const w = ctx.measureText(p.label).width;
          ctx.fillText(p.label, -w/2, 0);
        } else {
          ctx.fillStyle = p.color; ctx.fillRect(-4, -4, 8, 8);
        }
        ctx.restore();
      });

      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(tick);
      } else {
        stop();
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  Confetti.init = function (canvasId = 'confetti') {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    size();
    w.addEventListener('resize', size);
  };

  Confetti.carlos = function () {
    document.documentElement.setAttribute('data-theme', 'carlos');
    fall({
      colors: ['#0f3d91', '#ffffff'],
      labels: ['williams', 'chili'],
      useImages: true,
      imgSize: 22,
      durationMs: 3000
    });
  };

  Confetti.lando = function () {
    document.documentElement.setAttribute('data-theme', 'lando');
    fall({
      colors: ['#ff8000', '#0c0c0d', '#ffffff'],
      labels: ['mclaren', 'ln4'],
      useImages: true,
      imgSize: 22,
      durationMs: 3000
    });
  };

  Confetti.reset = function () {
    document.documentElement.removeAttribute('data-theme');
    fall({
      colors: ['#e07b97', '#6fa387', '#6aa9d8'],
      labels: ['🫀', '🏎️', '💻'],
      useImages: false,
      textPx: 18,
      durationMs: 2400
    });
  };

  Confetti.sequence = function () {
    fall({ colors: ['#d90429'], count: 120, durationMs: 700, fadeMs: 500 });
    setTimeout(()=> {
      fall({ colors: ['#20bf55'], count: 180, durationMs: 700, fadeMs: 500 });
    }, 700);
    setTimeout(()=> {
      fall({ colors: ['#000', '#fff'], labels: ['🏁'], useImages: false, textPx: 24, count: 260, durationMs: 1600 });
    }, 1400);
  };

  w.Confetti = Confetti;
})(window);
