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

const FLAG_MAP = {
    ARG: '🇦🇷', AUS: '🇦🇺', AUT: '🇦🇹', BEL: '🇧🇪', BRA: '🇧🇷', CAN: '🇨🇦', CHN: '🇨🇳', CZE: '🇨🇿',
    DEN: '🇩🇰', ESP: '🇪🇸', EST: '🇪🇪', FIN: '🇫🇮', FRA: '🇫🇷', DEU: '🇩🇪', GBR: '🇬🇧',
    ITA: '🇮🇹', JPN: '🇯🇵', MCO: '🇲🇨', MEX: '🇲🇽', NED: '🇳🇱', NOR: '🇳🇴', NZL: '🇳🇿',
    PRT: '🇵🇹', QAT: '🇶🇦', ROU: '🇷🇴', RSA: '🇿🇦', SAU: '🇸🇦', SGP: '🇸🇬', SWE: '🇸🇪',
    THA: '🇹🇭', TUR: '🇹🇷', USA: '🇺🇸', URY: '🇺🇾'
};
function getFlag(code) {
    if (!code) return '🏁';
    const c = String(code).trim().toUpperCase();
    if (FLAG_MAP[c]) return FLAG_MAP[c];
    if (c.length === 2) {
        const A = 0x1F1E6, a = 'A'.charCodeAt(0);
        return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a));
    }
    return '🏁';
}

async function getLatestWinner() {
    try {
        const year = new Date().getUTCFullYear();
        const sessions = await fetch(`https://api.openf1.org/v1/sessions?session_type=Race&year=${year}&orderby=-date_start&limit=1`).then(r => r.json());
        const session = sessions && sessions[0]; if (!session) return null;
        const results = await fetch(`https://api.openf1.org/v1/results?session_key=${session.session_key}&position=1`).then(r => r.json());
        const r1 = results && results[0]; if (!r1) return null;
        const drivers = await fetch(`https://api.openf1.org/v1/drivers?driver_number=${r1.driver_number}&session_key=${session.session_key}`).then(r => r.json());
        const d = drivers && drivers[0];

        const name = d ? d.full_name : (r1.driver_name || 'Winner');
        const team = (r1.team_name || (d ? d.team_name : '') || '').trim();
        const flag = getFlag((d && d.country_code) || session.country_code || '');
        const gp = session.meeting_name || (session.country_name ? `${session.country_name} Grand Prix` : 'Grand Prix');
        const img = (DRIVER_IMAGES[name] && DRIVER_IMAGES[name].img) || '';

        return { name, team, flag, number: String(r1.driver_number), gp, img };
    } catch (e) {
        return null;
    }
}

function resetLights() { lights.forEach(l => l.className = 'seq-light'); }

function animateLights() {
    resetLights();
    let i = 0;
    return new Promise(resolve => {
        const t = setInterval(() => {
            if (i < 5) { lights[i].classList.add('on', 'red'); i++; }
            else { clearInterval(t); setTimeout(resolve, 420); }
        }, 240);
    });
}
function goGreen() {
    lights.forEach(l => { l.classList.remove('red'); l.classList.add('on', 'green'); });
    setTimeout(() => lights.forEach(l => l.classList.remove('on', 'green')), 1100);
}

async function runSequence() {
    overlay.style.display = 'flex';
    winCard.style.display = 'none';
    document.getElementById('seqSub').textContent = 'Starting…';

    await animateLights();
    document.getElementById('seqSub').textContent = 'Fetching winner…';

    const winner = await getLatestWinner();

    goGreen();
    startNormalConfetti();

    if (winner) {
        winCard.style.display = 'grid';
        winName.textContent = winner.name;
        winNum.textContent = '#' + winner.number;
        winTeam.textContent = winner.team || 'Team';
        winNat.textContent = winner.flag;
        winGP.textContent = `${winner.gp} • ${winner.team || ''}`;
        if (winner.img) { winImg.src = winner.img; winImg.alt = winner.name; }
        else { winImg.src = 'https://images.placeholders.dev/?width=192&height=192&text=%F0%9F%8F%81'; winImg.alt = ''; }
        hint.textContent = `Tap ${winner.flag} again to replay`;
    } else {
        winCard.style.display = 'none';
        hint.textContent = 'Tap 🏁 again to replay';
    }

    setTimeout(() => { overlay.style.display = 'none'; resetLights(); }, 2000);
}

flagBtn.addEventListener('click', e => { e.stopPropagation(); runSequence(); });
