(function () {
  const IMG_SRC = {
    williams: "assets/img/williams.png",
    chili: "assets/img/chili.png",
    mclaren: "assets/img/mclaren.png",
    ln4: "assets/img/ln4.png"
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

  let cvs, ctx, DPR = 1, W = 0, H = 0, rafId = null, active = false;

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
    window.addEventListener("blur", () => cancel());
  }

  function resize(force) {
    if (!cvs) return;
    const w = Math.max(1, (innerWidth | 0) * DPR);
    const h = Math.max(1, (innerHeight | 0) * DPR);
    if (force || w !== W || h !== H) { W = cvs.width = w; H = cvs.height = h; }
  }

  function cancel() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); }
    active = false;
  }

  function burst(opts) {
    ensureCanvas();
    resize(false);
    cancel();

    const colors = opts?.colors || ["#ff7676", "#ffd166", "#6ee7b7", "#93c5fd", "#fbcfe8", "#e9d5ff"];
    const labels = opts?.labels || [];
    const durationMs = opts?.durationMs ?? 2000;
    const tailMs = opts?.tailMs ?? 650;
    const count = opts?.count ?? 260;
    const imgSize = (opts?.imgSize ?? 22) * DPR;
    const textPx = (opts?.textPx ?? 18) * DPR;

    const start = performance.now();
    let last = start;
    active = true;

    const parts = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI - Math.PI / 2;
      const speed = (1.8 + Math.random() * 1.8) * DPR;
      return {
        x: Math.random() * W,
        y: -Math.random() * H * 0.25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1.6 * DPR,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() * 0.5 - 0.25),
        sway: 0.6 + Math.random() * 0.9,
        life: 1,
        color: colors[(Math.random() * colors.length) | 0],
        label: labels.length ? labels[(Math.random() * labels.length) | 0] : null,
        w: (6 + Math.random() * 8) * DPR,
        h: (10 + Math.random() * 12) * DPR
      };
    });

    function drawPiece(p, globalAlpha) {
      ctx.globalAlpha = globalAlpha;
      if (p.label && IMAGES[p.label] && LOADED[p.label]) {
        ctx.drawImage(IMAGES[p.label], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        return;
      }
      if (p.label && typeof p.label === "string" && p.label.length <= 2 && /\p{Extended_Pictographic}/u.test(p.label) === false) {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        return;
      }
      if (p.label && /\p{Extended_Pictographic}/u.test(p.label)) {
        ctx.font = textPx + "px Playfair Display, serif";
        ctx.textBaseline = "middle";
        const m = ctx.measureText(p.label);
        ctx.fillText(p.label, -m.width / 2, 0);
        return;
      }
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }

    function tick(now) {
      if (!active) return;
      const t = now - start;
      const dt = Math.min((now - last) / 16.666, 3);
      last = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const aliveT = Math.max(0, durationMs - t);
      const fadeT = Math.max(0, t - durationMs);
      const fade = 1 - Math.min(1, fadeT / tailMs);
      const globalAlpha = Math.max(0, Math.min(1, aliveT > 0 ? 1 : fade));

      for (const p of parts) {
        p.vy += 0.015 * DPR * dt;
        p.vx += Math.sin((now + p.x) * 0.001) * p.sway * 0.02 * DPR * dt;
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      }

      for (const p of parts) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        drawPiece(p, globalAlpha);
        ctx.restore();
      }

      if (t < durationMs + tailMs) {
        rafId = requestAnimationFrame(tick);
      } else {
        cancel();
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function startThemedConfetti(theme) {
    prepareConfetti();
    if (theme === "carlos") {
      burst({
        colors: ["#0d347e", "#00A0DE", "#ffffff"],
        labels: ["williams", "chili"],
        imgSize: 22,
        count: 280,
        durationMs: 2100,
        tailMs: 700
      });
    } else if (theme === "lando") {
      burst({
        colors: ["#ff8000", "#0c0c0d", "#ffffff"],
        labels: ["mclaren", "ln4"],
        imgSize: 22,
        count: 280,
        durationMs: 2100,
        tailMs: 700
      });
    } else {
      startNormalConfetti();
    }
  }

  function startTeamConfetti(team) {
    prepareConfetti();
    const c = TEAM_COLORS[team];
    if (c) {
      burst({ colors: c, count: 260, durationMs: 2000, tailMs: 650 });
    } else {
      startNormalConfetti();
    }
  }

  function startNormalConfetti() {
    prepareConfetti();
    burst({ count: 260, durationMs: 1900, tailMs: 650 });
  }

  function startEmojiConfetti() {
    prepareConfetti();
    burst({
      colors: ["#6fa387", "#7cc0ff", "#ffd8a8"],
      labels: ["💻", "🧠", "🏎️"],
      imgSize: 20,
      count: 260,
      durationMs: 1800,
      tailMs: 700
    });
  }

  function prepareConfetti() {
    ensureCanvas();
    ctx.clearRect(0, 0, W, H);
  }

  window.startThemedConfetti = startThemedConfetti;
  window.startTeamConfetti = startTeamConfetti;
  window.startNormalConfetti = startNormalConfetti;
  window.startEmojiConfetti = startEmojiConfetti;
  window.prepareConfetti = prepareConfetti;
})();
