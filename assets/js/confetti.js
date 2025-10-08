(function () {
  const IMG_SRC = {
    williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp",
    chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png",
    mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png",
    ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png"
  };

  const TEAM_COLORS = {
    "Red Bull": ["#3671C6", "#FFD200", "#00112B"],
    "Ferrari": ["#DC0000", "#FFFFFF", "#000000"],
    "Mercedes": ["#00D2BE", "#101010", "#C0C0C0"],
    "McLaren": ["#FF8000", "#0C0C0D", "#FFFFFF"],
    "Aston Martin": ["#006F62", "#99D9D9", "#0B2E2A"],
    "Alpine": ["#0090FF", "#FF87BC", "#0A0A0A"],
    "Williams": ["#00A0DE", "#041E42", "#FFFFFF"],
    "Kick Sauber": ["#00E701", "#111111", "#FFFFFF"],
    "Haas F1 Team": ["#B6BABD", "#1E1E1E", "#E10600"],
    "RB": ["#2B2D42", "#EDF2F4", "#EF233C"]
  };

  const IMAGES = {}, LOADED = {};
  for (const k in IMG_SRC) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => (LOADED[k] = true);
    img.onerror = () => (LOADED[k] = false);
    img.src = IMG_SRC[k];
    IMAGES[k] = img;
    LOADED[k] = false;
  }

  let cvs, ctx, DPR = 1, W = 0, H = 0, rafId = null, ready = false;

  function ensureCanvas() {
    if (cvs && ctx) return;
    DPR = Math.max(1, window.devicePixelRatio || 1);
    cvs = document.getElementById("kc-confetti");
    if (!cvs) {
      cvs = document.createElement("canvas");
      cvs.id = "kc-confetti";
      Object.assign(cvs.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "99999" });
      document.body.appendChild(cvs);
    }
    ctx = cvs.getContext("2d");
    resize(true);
    window.addEventListener("resize", () => resize(false), { passive: true });
  }

  function resize(force) {
    if (!cvs) return;
    const w = Math.max(1, (innerWidth | 0) * DPR);
    const h = Math.max(1, (innerHeight | 0) * DPR);
    if (force || w !== W || h !== H) { W = cvs.width = w; H = cvs.height = h; }
  }

  function burst(opts) {
    ensureCanvas();
    resize(false);
    if (!ctx) return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

    const colors = opts?.colors || ["#ff7676", "#ffd166", "#6ee7b7", "#93c5fd", "#fbcfe8", "#e9d5ff"];
    const labels = opts?.labels || [];
    const durationMs = opts?.durationMs ?? 1600;
    const count = opts?.count ?? 220;
    const imgSize = (opts?.imgSize ?? 20);
    const textPx = (opts?.textPx ?? 18);

    const start = performance.now();
    let last = start;

    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.35,
      vx: (Math.random() * 2 - 1) * 0.95 * DPR,
      vy: (1.9 + Math.random() * 2.0) * DPR,
      rot: Math.random() * Math.PI,
      vr: (Math.random() * 0.28 - 0.14),
      color: colors[(Math.random() * colors.length) | 0],
      label: labels.length ? labels[(Math.random() * labels.length) | 0] : null
    }));

    function drawLabel(p) {
      const key = p.label;
      if (!key) { ctx.fillStyle = p.color; ctx.fillRect(-4 * DPR, -4 * DPR, 8 * DPR, 8 * DPR); return; }
      if (IMAGES[key] && LOADED[key]) { const s = imgSize * DPR; ctx.drawImage(IMAGES[key], -s / 2, -s / 2, s, s); return; }
      ctx.font = (textPx * DPR) + "px Playfair Display,serif";
      ctx.fillStyle = p.color;
      const txt = key.length > 3 ? "🏎️" : key;
      const m = ctx.measureText(txt);
      ctx.fillText(txt, -m.width / 2, textPx * DPR * 0.33);
    }

    function tick(now) {
      const dt = Math.min((now - last) / 16.666, 3);
      last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (const p of parts) {
        p.vy += 0.012 * DPR * dt;
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > H + 24 * DPR) { p.y = -12 * DPR; p.x = Math.random() * W; }
      }
      for (const p of parts) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        drawLabel(p);
        ctx.restore();
      }
      if (now - start < durationMs) { rafId = requestAnimationFrame(tick); } else { ctx.clearRect(0, 0, W, H); rafId = null; }
    }

    rafId = requestAnimationFrame(tick);
  }

  function startThemedConfetti(theme) {
    prepareConfetti();
    if (theme === "carlos") burst({ colors: ["#0d347e", "#ffffff"], labels: ["williams", "chili"], imgSize: 22, count: 240, durationMs: 1700 });
    else if (theme === "lando") burst({ colors: ["#ff8000", "#ffffff", "#0c0c0d"], labels: ["mclaren", "ln4"], imgSize: 22, count: 240, durationMs: 1700 });
  }

  function startTeamConfetti(team) {
    prepareConfetti();
    const c = TEAM_COLORS[team];
    if (c) burst({ colors: c, count: 230, durationMs: 1800 }); else startNormalConfetti();
  }

  function startNormalConfetti() { prepareConfetti(); burst({ count: 220, durationMs: 1600 }); }
  function startEmojiConfetti() { prepareConfetti(); burst({ colors: ["#e07b97", "#6fa387", "#6aa9d8"], labels: ["💻", "🫀", "🏎️"], imgSize: 20, count: 220, durationMs: 1500 }); }
  function prepareConfetti() { ensureCanvas(); if (!ready) { ctx.clearRect(0, 0, W, H); ready = true; } }

  window.startThemedConfetti = startThemedConfetti;
  window.startTeamConfetti = startTeamConfetti;
  window.startNormalConfetti = startNormalConfetti;
  window.startEmojiConfetti = startEmojiConfetti;
  window.prepareConfetti = prepareConfetti;
})();
