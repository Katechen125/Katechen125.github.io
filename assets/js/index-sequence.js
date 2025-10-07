(function () {
    const CSS = `
  #kc-seq{position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.48);backdrop-filter:blur(4px);z-index:9999}
  #kc-seq.show{display:grid}
  .kc-card{width:min(880px,92vw);border-radius:28px;background:linear-gradient(180deg,#fff,#fafafa);box-shadow:0 25px 60px rgba(0,0,0,.28);padding:26px 26px 20px;color:#111}
  :root[data-theme="lando"] #kc-seq .kc-card{background:linear-gradient(180deg,#1a1a1c,#151517);color:#f1f3f5}
  .kc-pod{height:96px;border-radius:64px;background:#eee;border:2px solid #e1e1e1;display:flex;align-items:center;justify-content:space-evenly;padding:0 28px}
  :root[data-theme="lando"] .kc-pod{background:#202024;border-color:#2b2b30}
  .kc-bulb{width:58px;height:58px;border-radius:50%;background:#2c2c2c;box-shadow:inset 0 -8px 0 rgba(0,0,0,.15);transform:scale(.92);transition:transform .2s ease}
  .kc-bulb.red{background:#c91515;transform:scale(1)}
  .kc-bulb.green{background:#2fb64a;transform:scale(1)}
  .kc-title{margin:18px 0 4px;text-align:center;font-family:"Playfair Display",Georgia,serif;font-size:clamp(20px,3.4vw,30px);font-weight:800;letter-spacing:.2px;opacity:.95}
  .kc-hint{margin:0;text-align:center;color:#6b7280;font-weight:700}
  :root[data-theme="lando"] .kc-hint{color:#9aa2b1}
  .kc-panel{margin:18px 0 6px;min-height:126px;display:grid;place-items:center}
  .kc-loader{width:34px;height:34px;border-radius:50%;border:3px solid rgba(0,0,0,.12);border-top-color:#6fa387;animation:spin 900ms linear infinite}
  :root[data-theme="lando"] .kc-loader{border-color:#2e3138;border-top-color:#ff8000}
  @keyframes spin{to{transform:rotate(360deg)}}
  .kc-card-wrap{display:grid;grid-template-columns:98px 1fr auto;gap:16px;align-items:center;width:100%;border:1px solid rgba(0,0,0,.08);border-radius:18px;padding:14px;background:linear-gradient(180deg,rgba(111,163,135,.06),transparent)}
  :root[data-theme="lando"] .kc-card-wrap{border-color:#2e3138;background:linear-gradient(180deg,rgba(255,128,0,.08),transparent)}
  .kc-img{width:98px;height:98px;border-radius:16px;object-fit:cover}
  .kc-name{font:800 24px/1.25 "Playfair Display",Georgia,serif}
  .kc-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
  .kc-chip{padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.12);font-weight:800}
  :root[data-theme="lando"] .kc-chip{border-color:#363a42}
  .kc-chip.soft{background:rgba(0,0,0,.05)}
  :root[data-theme="lando"] .kc-chip.soft{background:#1f1f22}
  .kc-p{margin:8px 0 0;font-weight:700;opacity:.9}
  .kc-pos{min-width:64px;height:44px;border-radius:12px;display:grid;place-items:center;border:1px solid rgba(0,0,0,.12);font-weight:900}
  :root[data-theme="lando"] .kc-pos{border-color:#363a42}
  `;
    const STYLE_ID = 'kc-seq-style';
    if (!document.getElementById(STYLE_ID)) {
        const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
    }

    const FLAG_MAP = {
        ARG: '🇦🇷', AUS: '🇦🇺', AUT: '🇦🇹', BEL: '🇧🇪', BRA: '🇧🇷', CAN: '🇨🇦', CHN: '🇨🇳', CZE: '🇨🇿',
        DEN: '🇩🇰', ESP: '🇪🇸', EST: '🇪🇪', FIN: '🇫🇮', FRA: '🇫🇷', DEU: '🇩🇪', GBR: '🇬🇧',
        ITA: '🇮🇹', JPN: '🇯🇵', MCO: '🇲🇨', MEX: '🇲🇽', NED: '🇳🇱', NOR: '🇳🇴', NZL: '🇳🇿',
        PRT: '🇵🇹', QAT: '🇶🇦', ROU: '🇷🇴', RSA: '🇿🇦', SAU: '🇸🇦', SGP: '🇸🇬', SWE: '🇸🇪',
        THA: '🇹🇭', TUR: '🇹🇷', USA: '🇺🇸', URY: '🇺🇾'
    };
    const TEAM_COLORS = {
        'Red Bull Racing': ['#3671C6', '#1E2A5A'],
        'Ferrari': ['#E10600', '#FFD800'],
        'Mercedes': ['#00A19C', '#2B2E2F'],
        'McLaren': ['#FF8000', '#0D0D0E'],
        'Aston Martin': ['#00594F', '#00A19C'],
        'RB': ['#001F5F', '#FFFFFF'],
        'Haas': ['#B7B7B7', '#E10600'],
        'Alpine': ['#0090FF', '#FF66CC'],
        'Williams': ['#00AEEF', '#0B1220'],
        'Sauber': ['#006341', '#FFFFFF']
    };
    const DRIVER_IMAGES = window.DRIVER_IMAGES || {};

    function ensureOverlay() {
        let root = document.getElementById('kc-seq');
        if (root) return root;
        root = document.createElement('div');
        root.id = 'kc-seq';
        root.innerHTML = `
      <div class="kc-card">
        <div class="kc-pod" id="kc-pod">
          <div class="kc-bulb"></div><div class="kc-bulb"></div><div class="kc-bulb"></div><div class="kc-bulb"></div><div class="kc-bulb"></div>
        </div>
        <div class="kc-title">Lights out and away we go!</div>
        <div class="kc-hint">Tap 🏁 again to replay</div>
        <div class="kc-panel" id="kc-panel"></div>
      </div>`;
        document.body.appendChild(root);
        return root;
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
    function winnerCard(d) {
        const img = DRIVER_IMAGES[d.name]?.img || d.photo || '';
        const num = DRIVER_IMAGES[d.name]?.number || d.number || '';
        const flag = FLAG_MAP[d.country_code] || '';
        const team = d.team || '';
        const meeting = d.meeting || 'Grand Prix';
        return `
      <div class="kc-card-wrap">
        <img class="kc-img" src="${img}" alt="${d.name}">
        <div>
          <div class="kc-name">${d.name}</div>
          <div class="kc-row">
            <div class="kc-chip soft">#${num}</div>
            <div class="kc-chip soft">${team}</div>
            <div class="kc-chip soft">${flag} ${d.nationality || ''}</div>
          </div>
          <div class="kc-p">${meeting} • ${team}</div>
        </div>
        <div class="kc-pos">P1</div>
      </div>`;
    }
    async function fetchWinner() {
        try {
            const r1 = await fetch('https://api.openf1.org/v1/results?position=1&session_key=latest');
            const top = (await r1.json())[0];
            if (!top) throw new Error('no result');
            const driverNum = top.driver_number, sessionKey = top.session_key, meetKey = top.meeting_key;
            const r2 = await fetch(`https://api.openf1.org/v1/drivers?driver_number=${driverNum}&session_key=${sessionKey}`);
            const dr = (await r2.json())[0] || {};
            const r3 = await fetch(`https://api.openf1.org/v1/meetings?meeting_key=${meetKey}`);
            const mt = (await r3.json())[0] || {};
            const name = (dr.full_name || (dr.first_name ? `${dr.first_name} ${dr.last_name}` : '') || top.broadcast_name || '').trim();
            return {
                name,
                number: String(driverNum),
                nationality: dr.nationality || '',
                country_code: (dr.country_code || '').toUpperCase(),
                team: top.team_name || dr.team_name || '',
                meeting: mt.meeting_official_name || mt.meeting_name || 'Grand Prix',
                photo: dr.headshot_url || ''
            };
        } catch { return null; }
    }
    function teamPalette(team) {
        const cols = TEAM_COLORS[team] || ['#ffd166', '#6ee7b7', '#93c5fd'];
        return { colors: cols, labels: [] };
    }

    async function runSequence() {
        const overlay = ensureOverlay();
        const panel = overlay.querySelector('#kc-panel');
        const bulbs = Array.from(overlay.querySelectorAll('.kc-bulb'));
        overlay.classList.add('show');
        panel.innerHTML = `<div class="kc-loader"></div>`;

        for (let i = 0; i < bulbs.length; i++) { bulbs[i].classList.add('red'); await sleep(230); }
        await sleep(420);
        bulbs.forEach(b => { b.classList.remove('red'); b.classList.add('green'); });

        if (window.startNormalConfetti) window.startNormalConfetti();

        const data = await fetchWinner();
        if (data) {
            panel.innerHTML = winnerCard(data);
            const pal = teamPalette(data.team);
            if (window.startConfettiPalette) window.startConfettiPalette(pal.colors, pal.labels);
        } else {
            panel.innerHTML = '';
        }

        await sleep(2600);
        bulbs.forEach(b => b.classList.remove('green', 'red'));
        overlay.classList.remove('show');
    }

    function bind() {
        const btn = document.getElementById('flagGo');
        if (!btn) return;
        btn.addEventListener('click', (e) => { e.stopPropagation(); runSequence(); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();

    window.kcRunSequence = runSequence;
})();
