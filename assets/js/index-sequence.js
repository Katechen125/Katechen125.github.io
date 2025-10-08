const overlay = document.getElementById('seqOverlay');
const lights = [1, 2, 3, 4, 5].map(i => document.getElementById('L' + i));
const flagBtn = document.getElementById('flagGo');
const hint = document.getElementById('flagHint');

const winCard = document.getElementById('winnerCard');
const winImg = document.getElementById('winImg');
const winName = document.getElementById('winName');
const winNum = document.getElementById('winNum');
const winTeam = document.getElementById('winTeam');
const winNat = document.getElementById('winNat');
const winGP = document.getElementById('winGP');

const FLAG_MAP = { ARG: '🇦🇷', AUS: '🇦🇺', AUT: '🇦🇹', BEL: '🇧🇪', BRA: '🇧🇷', CAN: '🇨🇦', CHN: '🇨🇳', CZE: '🇨🇿', DEN: '🇩🇰', ESP: '🇪🇸', EST: '🇪🇪', FIN: '🇫🇮', FRA: '🇫🇷', DEU: '🇩🇪', GBR: '🇬🇧', ITA: '🇮🇹', JPN: '🇯🇵', MCO: '🇲🇨', MEX: '🇲🇽', NED: '🇳🇱', NOR: '🇳🇴', NZL: '🇳🇿', PRT: '🇵🇹', QAT: '🇶🇦', ROU: '🇷🇴', RSA: '🇿🇦', SAU: '🇸🇦', SGP: '🇸🇬', SWE: '🇸🇪', THA: '🇹🇭', TUR: '🇹🇷', USA: '🇺🇸', URY: '🇺🇾' };
function toFlag(code) {
    if (!code) return '🏁';
    const c = String(code).trim().toUpperCase();
    if (FLAG_MAP[c]) return FLAG_MAP[c];
    if (c.length === 2) { const A = 0x1F1E6, a = 'A'.charCodeAt(0); return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a)); }
    return '🏁';
}

const FALLBACK_LAST_WINNER = {
    meeting_name: "British Grand Prix",
    driver_name: "George Russell",
    team_name: "Mercedes",
    driver_number: "63",
    country_code: "GBR"
};

async function getLatestWinner() {
    const year = new Date().getUTCFullYear();

    try {
        const sessions = await fetch(`https://api.openf1.org/v1/sessions?session_type=Race&year=${year}&orderby=-date_start&limit=1`).then(r => r.json());
        const s = sessions?.[0]; if (!s) throw 0;
        const r1 = (await fetch(`https://api.openf1.org/v1/results?session_key=${s.session_key}&position=1`).then(r => r.json()))?.[0]; if (!r1) throw 0;
        const d = (await fetch(`https://api.openf1.org/v1/drivers?driver_number=${r1.driver_number}&session_key=${s.session_key}`).then(r => r.json()))?.[0];

        return {
            name: d ? d.full_name : (r1.driver_name || 'Winner'),
            team: (r1.team_name || d?.team_name || '').trim(),
            number: String(r1.driver_number),
            flag: toFlag(d?.country_code || s.country_code || ''),
            gp: s.meeting_name || (s.country_name ? `${s.country_name} Grand Prix` : 'Grand Prix'),
            img: (DRIVER_IMAGES[d ? d.full_name : r1.driver_name]?.img) || ''
        };
    } catch (_) { }

    try {
        const mt = await fetch(`https://api.openf1.org/v1/meetings?year=${year}&orderby=-date_start&limit=1`).then(r => r.json());
        const m = mt?.[0]; if (!m) throw 0;
        const race = (await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${m.meeting_key}&session_type=Race`).then(r => r.json()))?.[0]; if (!race) throw 0;
        const r1 = (await fetch(`https://api.openf1.org/v1/results?session_key=${race.session_key}&position=1`).then(r => r.json()))?.[0]; if (!r1) throw 0;
        const d = (await fetch(`https://api.openf1.org/v1/drivers?driver_number=${r1.driver_number}&session_key=${race.session_key}`).then(r => r.json()))?.[0];

        return {
            name: d ? d.full_name : (r1.driver_name || 'Winner'),
            team: (r1.team_name || d?.team_name || '').trim(),
            number: String(r1.driver_number),
            flag: toFlag(d?.country_code || race.country_code || ''),
            gp: race.meeting_name || (race.country_name ? `${race.country_name} Grand Prix` : 'Grand Prix'),
            img: (DRIVER_IMAGES[d ? d.full_name : r1.driver_name]?.img) || ''
        };
    } catch (_) { }

    const f = FALLBACK_LAST_WINNER;
    return {
        name: f.driver_name, team: f.team_name, number: String(f.driver_number),
        flag: toFlag(f.country_code), gp: f.meeting_name,
        img: (DRIVER_IMAGES[f.driver_name]?.img) || ''
    };
}

function resetLights() { lights.forEach(l => l.className = 'seq-light'); }
function animateLights() {
    resetLights(); let i = 0;
    return new Promise(res => {
        const t = setInterval(() => { if (i < 5) { lights[i].classList.add('on', 'red'); i++; } else { clearInterval(t); setTimeout(res, 420); } }, 240);
    });
}
function goGreen() { lights.forEach(l => { l.classList.remove('red'); l.classList.add('on', 'green'); }); setTimeout(() => lights.forEach(l => l.classList.remove('on', 'green')), 1100); }

async function runSequence() {
    overlay.style.display = 'flex';
    winCard.style.display = 'none';
    document.getElementById('seqSub').textContent = 'Starting…';

    await animateLights();
    document.getElementById('seqSub').textContent = 'Fetching winner…';

    const w = await getLatestWinner();

    goGreen();
    startNormalConfetti();

    if (w) {
        winCard.style.display = 'grid';
        winName.textContent = w.name;
        winNum.textContent = '#' + w.number;
        winTeam.textContent = w.team || 'Team';
        winNat.textContent = w.flag;          
        winNat.style.fontSize = '18px';          
        winGP.textContent = `${w.gp} • ${w.team || ''}`;
        if (w.img) { winImg.src = w.img; winImg.alt = w.name; }
        else { winImg.src = 'https://images.placeholders.dev/?width=192&height=192&text=%F0%9F%8F%81'; winImg.alt = ''; }
        hint.textContent = `Tap ${w.flag} again to replay`;
    } else {
        winCard.style.display = 'none';
        hint.textContent = 'Tap 🏁 again to replay';
    }

    setTimeout(() => { overlay.style.display = 'none'; resetLights(); }, 2000);
}

flagBtn.addEventListener('click', e => { e.stopPropagation(); runSequence(); });
