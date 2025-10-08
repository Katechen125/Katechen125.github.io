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

function nationalityToFlagEmoji(nationality) {
    const map = {
        Australian: '🇦🇺', Austrian: '🇦🇹', Belgian: '🇧🇪', Brazilian: '🇧🇷', British: '🇬🇧',
        Canadian: '🇨🇦', Chinese: '🇨🇳', Danish: '🇩🇰', Dutch: '🇳🇱', Finnish: '🇫🇮',
        French: '🇫🇷', German: '🇩🇪', Italian: '🇮🇹', Japanese: '🇯🇵', Monegasque: '🇲🇨',
        'Monégasque': '🇲🇨', Mexican: '🇲🇽', NewZealander: '🇳🇿', 'New Zealander': '🇳🇿',
        Spanish: '🇪🇸', Swiss: '🇨🇭', American: '🇺🇸', Thai: '🇹🇭', Argentinian: '🇦🇷',
        Portuguese: '🇵🇹', SouthAfrican: '🇿🇦', 'South African': '🇿🇦', Swedish: '🇸🇪',
        Norwegian: '🇳🇴', Irish: '🇮🇪', Czech: '🇨🇿', Romanian: '🇷🇴', Qatari: '🇶🇦',
        Saudi: '🇸🇦', Singaporean: '🇸🇬', Turkish: '🇹🇷', Estonian: '🇪🇪'
    };
    return map[nationality?.trim()] || '🏁';
}

async function getLatestWinner() {
    try {
        const url = 'https://ergast.com/api/f1/current/last/results.json';
        const data = await fetch(url, { cache: 'no-store' }).then(r => r.json());
        const race = data?.MRData?.RaceTable?.Races?.[0];
        const result = race?.Results?.[0];
        if (!race || !result) throw new Error('No race data');

        const d = result.Driver;
        const c = result.Constructor;

        const name = `${d.givenName} ${d.familyName}`.trim();
        const number = d.permanentNumber || result.number || '';
        const team = c?.name || '';
        const nat = d?.nationality || '';
        const flag = nationalityToFlagEmoji(nat);
        const gp = race.raceName || 'Grand Prix';
        const img = (window.DRIVER_IMAGES?.[name]?.img) || '';

        return { name, number: String(number), team, flag, gp, img };
    } catch (e) {

        return {
            name: 'George Russell',
            number: '63',
            team: 'Mercedes',
            flag: '🇬🇧',
            gp: 'British Grand Prix',
            img: (window.DRIVER_IMAGES?.['George Russell']?.img) || ''
        };
    }
}

function resetLights() {
    lights.forEach(l => (l.className = 'seq-light'));
}

function animateLights() {
    resetLights();
    let i = 0;
    return new Promise(resolve => {
        const t = setInterval(() => {
            if (i < 5) {
                lights[i].classList.add('on', 'red');
                i++;
            } else {
                clearInterval(t);
                setTimeout(resolve, 420);
            }
        }, 240);
    });
}

function goGreen() {
    lights.forEach(l => {
        l.classList.remove('red');
        l.classList.add('on', 'green');
    });
    setTimeout(() => lights.forEach(l => l.classList.remove('on', 'green')), 1100);
}

async function runSequence() {
    overlay.style.display = 'flex';
    winCard.style.display = 'none';
    document.getElementById('seqSub').textContent = 'Starting…';

    await animateLights();
    document.getElementById('seqSub').textContent = 'Fetching winner…';

    goGreen();
    if (typeof window.startNormalConfetti === 'function') {
        window.startNormalConfetti();
    }

    const winner = await getLatestWinner();

    if (winner) {
        winCard.style.display = 'grid';
        winName.textContent = winner.name;
        winNum.textContent = winner.number ? `#${winner.number}` : '';
        winTeam.textContent = winner.team || 'Team';
        winNat.textContent = winner.flag;
        winGP.textContent = `${winner.gp} • ${winner.team || ''}`;

        if (winner.img) {
            winImg.src = winner.img;
            winImg.alt = winner.name;
        } else {
            winImg.src = 'https://images.placeholders.dev/?width=192&height=192&text=%F0%9F%8F%81';
            winImg.alt = '';
        }

        hint.textContent = `Tap ${winner.flag} again to replay`;
    } else {
        winCard.style.display = 'none';
        hint.textContent = 'Tap 🏁 again to replay';
    }

    setTimeout(() => {
        overlay.style.display = 'none';
        resetLights();
    }, 2000);
}

flagBtn.addEventListener('click', e => {
    e.stopPropagation();
    runSequence();
});
