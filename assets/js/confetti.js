(function () {
  const BASE = { COUNT: 220, DURATION: 1400, GRAVITY: 0.015, WIND: 0.0, MAX_VX: 1.05, MIN_VY: 2.1, MAX_VY: 4.0, IMG_SIZE: 22, TEXT_PX: 18 };
  const IMG_SRC = {
    williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp",
    chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png",
    mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png",
    ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png"
  };
  const IMAGES = {};
  for (const k in IMG_SRC) { const img = new Image(); img.crossOrigin = "anonymous"; img.decoding = "async"; img.loading = "eager"; img.src = IMG_SRC[k]; IMAGES[k] = img; }
  let cvs, ctx, DPR = 1, W = 0, H = 0, rafId = null, prepared = false;
  function ensureCanvas() { if (cvs) return; DPR = Math.max(1, window.devicePixelRatio || 1); cvs = document.createElement("canvas"); Object.assign(cvs.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "0" }); document.body.appendChild(cvs); ctx = cvs.getContext("2d"); resize(); addEventListener("resize", resize, { passive: true }); }
  function resize() { if (!cvs) return; W = cvs.width = Math.floor(innerWidth * DPR); H = cvs.height = Math.floor(innerHeight * DPR); }
  function burst({ colors, labels }) {
    ensureCanvas(); if (rafId) { cancelAnimationFrame(rafId); rafId = null; } const now = performance.now(); const end = now + BASE.DURATION; const parts = Array.from({ length: BASE.COUNT }, () => ({ x: Math.random() * W, y: -Math.random() * H * 0.35, vx: (Math.random() * 2 - 1) * BASE.MAX_VX * DPR + BASE.WIND * DPR, vy: (BASE.MIN_VY + Math.random() * (BASE.MAX_VY - BASE.MIN_VY)) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * 0.30 - 0.15), color: colors[(Math.random() * colors.length) | 0], label: labels?.length ? labels[(Math.random() * labels.length) | 0] : null }));
    function tick(t) { ctx.clearRect(0, 0, W, H); for (const p of parts) { p.vy += BASE.GRAVITY * DPR; p.x += p.vx; p.y += p.vy; p.rot += p.vr; if (p.y > H + 24 * DPR) { p.y = -12 * DPR; p.x = Math.random() * W; } } for (const p of parts) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); if (p.label && IMAGES[p.label] && IMAGES[p.label].complete) { const s = BASE.IMG_SIZE * DPR; ctx.drawImage(IMAGES[p.label], -s / 2, -s / 2, s, s); } else if (p.label && typeof p.label === "string" && p.label.length <= 3) { ctx.font = `${BASE.TEXT_PX * DPR}px "Playfair Display", serif`; ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillStyle = p.color; ctx.fillText(p.label, 0, 0); } else { ctx.fillStyle = p.color; const s = 8 * DPR; ctx.fillRect(-s / 2, -s / 2, s, s); } ctx.restore(); } if (t < end) { rafId = requestAnimationFrame(tick); } else { ctx.clearRect(0, 0, W, H); rafId = null; } }
    rafId = requestAnimationFrame(tick);
  }
  function startThemedConfetti(theme) { prepareConfetti(); if (theme === "carlos") { burst({ colors: ["#0f3d91", "#ffffff"], labels: ["williams", "chili"] }); } else if (theme === "lando") { burst({ colors: ["#ff8000", "#ffffff", "#0c0c0d"], labels: ["mclaren", "ln4"] }); } else { burst({ colors: ["#ffffff"], labels: [] }); } }
  function startNormalConfetti() { prepareConfetti(); burst({ colors: ["#ff7676", "#ffd166", "#6ee7b7", "#93c5fd", "#fbcfe8", "#e9d5ff"], labels: [] }); }
  function startEmojiConfetti() { prepareConfetti(); burst({ colors: ["#e07b97", "#6fa387", "#6aa9d8"], labels: ["💻", "🫀", "🏎️"] }); }
  function prepareConfetti() { if (prepared) return; ensureCanvas(); ctx.clearRect(0, 0, W, H); requestAnimationFrame(() => { ctx.clearRect(0, 0, W, H); prepared = true; }); }
  window.prepareConfetti = prepareConfetti;
  window.startThemedConfetti = startThemedConfetti;
  window.startNormalConfetti = startNormalConfetti;
  window.startEmojiConfetti = startEmojiConfetti;
})();
