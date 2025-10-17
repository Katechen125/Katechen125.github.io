(function () {
  const IMG_SRC = {
    williams: "assets/img/confetti/Williams_logo.png",
    chili: "assets/img/confetti/Chili.png",
    mclaren: "assets/img/confetti/mclaren_logo.png",
    ln4: "assets/img/confetti/lando_logo.png"
  };

  const TEAM_COLORS = {
    "Red Bull": ["#00183e", "#ff3a20", "#ffd200"],
    "Ferrari": ["#dc0000", "#ffe600", "#ffffff"],
    "Mercedes": ["#00a19c", "#111111", "#c0c0c0"],
    "McLaren": ["#ff8000", "#0c0c0d", "#ffffff"],
    "Aston Martin": ["#006f62", "#003b36", "#c0f3e8"],
    "Williams": ["#0d347e", "#ffffff", "#c9d7ff"],
    "Alpine": ["#0090ff", "#15151e", "#ffffff"],
    "Haas": ["#e6002b", "#1a1a1a", "#ffffff"],
    "RB": ["#2b2d70", "#ffffff", "#ff4b4b"],
    "Sauber": ["#00e701", "#141414", "#ffffff"]
  };

  const TEAM_ALIAS = [
    ["oracle red bull", "red bull racing", "redbull", "rbr"], "Red Bull",
    ["scuderia ferrari hp", "ferrari"], "Ferrari",
    ["mercedes-amg", "mercedes amg", "mercedes"], "Mercedes",
    ["mclaren f1", "mclaren"], "McLaren",
    ["aston martin aramco", "aston martin"], "Aston Martin",
    ["williams racing", "williams"], "Williams",
    ["bwt alpine", "alpine"], "Alpine",
    ["haas f1", "haas"], "Haas",
    ["visa cash app rb", "vcarb", "rb f1", "rb"], "RB",
    ["stake f1", "kick sauber", "sauber"], "Sauber"
  ];

  function canonicalTeam(name) {
    if (!name) return "";
    const s = name.toString().toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    for (let i = 0; i < TEAM_ALIAS.length; i += 2) {
      const keys = TEAM_ALIAS[i], canon = TEAM_ALIAS[i + 1];
      if (keys.some(k => s.includes(k))) return canon;
    }
    for (const k of Object.keys(TEAM_COLORS)) {
      if (s.includes(k.toLowerCase())) return k;
    }
    return "";
  }

  const IMAGES = {};
  const LOADED = {};
  for (const k in IMG_SRC) {
    const img = new Image();
    img.onload = () => (LOADED[k] = true);
    img.onerror = () => (LOADED[k] = false);
    img.src = IMG_SRC[k];
    IMAGES[k] = img;
    LOADED[k] = false;
  }

  let cvs, ctx, DPR = 1, W = 0, H = 0, rafId = null, burstId = 0;

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
    if (force || w !== W || h !== H) {
      W = cvs.width = w;
      H = cvs.height = h;
    }
  }

  function wait(keys) {
    return new Promise((r) => {
      const ok = () => keys.every((k) => IMAGES[k]?.complete && LOADED[k] !== false);
      if (ok()) return r();
      const i = setInterval(() => {
        if (ok()) { clearInterval(i); r(); }
      }, 30);
    });
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function stopConfetti() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (ctx && W && H) ctx.clearRect(0, 0, W, H);
  }

  function burst(opts = {}) {
    ensureCanvas();
    resize(false);
    stopConfetti();

    const myId = ++burstId;

    const colors = opts.colors || ["#ffd6a5", "#caffbf", "#bdb2ff", "#a0c4ff", "#ffadad"];
    const labels = opts.labels || [];
    const durationMs = opts.durationMs ?? 2200;
    const count = opts.count ?? 280;
    const imgSize = (opts.imgSize ?? 22) * DPR;
    const gravity = (opts.gravity ?? 0.010) * DPR;
    const drag = opts.drag ?? 0.996;
    const speedMin = (opts.speedMin ?? 1.2) * DPR;
    const speedMax = (opts.speedMax ?? 2.4) * DPR;
    const spinRange = opts.spinRange ?? 0.12;

    const start = performance.now();
    let last = start;

    const parts = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      const useImg = labels.length > 0 && Math.random() < 0.55;
      return {
        x: Math.random() * W,
        y: -Math.random() * H * 0.25,
        vx: Math.cos(angle) * speed,
        vy: Math.abs(Math.sin(angle) * speed),
        rot: Math.random() * Math.PI,
        vr: (Math.random() * 2 - 1) * spinRange,
        color: colors[(Math.random() * colors.length) | 0],
        label: useImg ? labels[(Math.random() * labels.length) | 0] : null,
        size: imgSize * (0.85 + Math.random() * 0.5),
        w: (6 + Math.random() * 6) * DPR,
        h: (4 + Math.random() * 8) * DPR
      };
    });

    function draw(p) {
      if (p.label && IMAGES[p.label]) {
        const s = p.size;
        ctx.drawImage(IMAGES[p.label], -s / 2, -s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.moveTo(-p.w / 2, -p.h / 2);
        ctx.lineTo(p.w / 2, -p.h / 2);
        ctx.lineTo(p.w / 2, p.h / 2);
        ctx.lineTo(-p.w / 2, p.h / 2);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    }

    function tick(now) {
      if (myId !== burstId) return;
      const dt = Math.min((now - last) / 16.666, 3);
      last = now;
      const t = Math.min(1, (now - start) / durationMs);
      const fade = t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1;
      const smooth = easeInOut(t);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.max(0, Math.min(1, fade));

      for (const p of parts) {
        p.vy += gravity * dt * (0.8 + smooth * 0.6);
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      }

      for (const p of parts) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        draw(p);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      if (now - start < durationMs && myId === burstId) {
        rafId = requestAnimationFrame(tick);
      } else if (myId === burstId) {
        ctx.clearRect(0, 0, W, H);
        rafId = null;
      }
    }

    if (labels.length) wait([...new Set(labels)]).then(() => (rafId = requestAnimationFrame(tick)));
    else rafId = requestAnimationFrame(tick);
  }

  function startThemedConfetti(theme) {
    const t = (theme || "").toLowerCase().trim();
    if (t === "carlos") { burst({ labels: ["williams", "chili"], imgSize: 26, count: 260, durationMs: 2200 }); return; }
    if (t === "lando") { burst({ labels: ["mclaren", "ln4"], imgSize: 26, count: 260, durationMs: 2200 }); return; }
  }

  function startResetConfetti() {
    const cs = getComputedStyle(document.documentElement);
    const accent = (cs.getPropertyValue("--accent") || "#6fa387").trim();
    burst({ colors: [accent, "#e6f7ee", "#eaf0ff", "#ffe9f4", "#fef3c7"], count: 300, durationMs: 2000, gravity: 0.010, drag: 0.996 });
  }

  function resolveTeamColors(arg) {
    if (Array.isArray(arg) && arg.length) return arg;
    const canon = canonicalTeam(arg || "");
    if (canon && TEAM_COLORS[canon]) return TEAM_COLORS[canon];
    return ["#e6f7ee", "#eaf0ff", "#ffe9f4"];
  }

  function startDriverConfetti(arg) {
    const cols = resolveTeamColors(arg);
    burst({ colors: cols, count: 240, durationMs: 4000, gravity: 0.008, drag: 0.998, speedMin: 0.9, speedMax: 1.6, spinRange: 0.09 });
  }

  function startDriverConfettiForTeam(teamName) {
    startDriverConfetti(teamName);
  }

  window.prepareConfetti = () => ensureCanvas();
  window.stopConfetti = stopConfetti;
  window.startThemedConfetti = startThemedConfetti;
  window.startResetConfetti = startResetConfetti;
  window.startDriverConfetti = startDriverConfetti;
  window.startDriverConfettiForTeam = startDriverConfettiForTeam;
})();
