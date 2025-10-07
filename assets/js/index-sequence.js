(function () {
    const root = document.documentElement;

    const NATIONALITY_FLAG = {
        Dutch: '🇳🇱', Japanese: '🇯🇵', Monegasque: '🇲🇨', British: '🇬🇧', Spanish: '🇪🇸',
        Australian: '🇦🇺', NewZealander: '🇳🇿', French: '🇫🇷', Italian: '🇮🇹', German: '🇩🇪',
        Canadian: '🇨🇦', Thai: '🇹🇭', Finnish: '🇫🇮', Danish: '🇩🇰', Chinese: '🇨🇳',
        American: '🇺🇸', Mexican: '🇲🇽', Brazilian: '🇧🇷'
    };

    const TEAM_BY_DRIVER = {
        "Max Verstappen": "Red Bull", "Sergio Perez": "Red Bull",
        "Charles Leclerc": "Ferrari", "Carlos Sainz": "Ferrari",
        "Lando Norris": "McLaren", "Oscar Piastri": "McLaren",
        "George Russell": "Mercedes", "Lewis Hamilton": "Mercedes", "Kimi Antonelli": "Mercedes",
        "Fernando Alonso": "Aston Martin", "Lance Stroll": "Aston Martin",
        "Alexander Albon": "Williams", "Franco Colapinto": "Williams",
        "Pierre Gasly": "Alpine", "Esteban Ocon": "Alpine",
        "Yuki Tsunoda": "RB", "Liam Lawson": "RB", "Isack Hadjar": "RB",
        "Nico Hülkenberg": "Sauber", "Oliver Bearman": "Haas", "Gabriel Bortoleto": "Sauber"
    };

    const DRIVER_IMAGES = window.DRIVER_IMAGES || {};
    const IMG_FALLBACK = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png';

    function setTheme(name) {
        if (name === 'carlos') {
            root.setAttribute('data-theme', 'carlos');
            localStorage.setItem('kc-theme', 'carlos');
            window.kcConfetti?.carlosConfetti();
            return;
        }
        if (name === 'lando') {
            root.removeAttribute('data-theme');
            localStorage.setItem('kc-theme', '');
            window.kcConfetti?.landoConfetti();
            return;
        }
    }
    function resetTheme() {
        root.removeAttribute('data-theme');
        localStorage.removeItem('kc-theme');
        window.kcConfetti?.resetEmojiConfetti();
    }

    const saved = localStorage.getItem('kc-theme');
    if (saved === null || saved === '') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', saved);

    document.querySelectorAll('button[data-theme]').forEach(b => {
        b.addEventListener('click', e => { e.stopPropagation(); setTheme(b.dataset.theme); });
    });
    document.getElementById('resetTheme')?.addEventListener('click', e => { e.stopPropagation(); resetTheme(); });

    const overlay = document.getElementById('seqOverlay');
    const lightsWrap = document.querySelector('.lights-wrap');
    const lights = [1, 2, 3, 4, 5].map(i => document.getElementById('L' + i));
    const card = document.getElementById('winnerCard');
    const el = {
        img: document.getElementById('wImg'),
        name: document.getElementById('wName'),
        num: document.getElementById('wNum'),
        team: document.getElementById('wTeam'),
        nat: document.getElementById('wNat'),
        meta: document.getElementById('wMeta'),
        tip: document.getElementById('replayTip'),
        title: document.getElementById('seqTitle')
    };

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    function qsName() {
        const u = new URL(location.href);
        const n = u.searchParams.get('winner');
        return n ? decodeURIComponent(n) : '';
    }

    async function fetchLastWinner() {
        const testName = qsName();
        if (testName) {
            const nat = Object.keys(NATIONALITY_FLAG).find(k => k === 'British' && /george|russell/i.test(testName)) || 'British';
            const team = TEAM_BY_DRIVER[testName] || 'Mercedes';
            const number = DRIVER_IMAGES[testName]?.number || '63';
            return { name: testName, team, nat, number, flag: NATIONALITY_FLAG[nat] || '🏁', gp: 'Grand Prix' };
        }
        try {
            const r = await fetch('https://ergast.com/api/f1/current/last/results.json', { mode: 'cors' });
            if (!r.ok) throw 0;
            const j = await r.json();
            const race = j?.MRData?.RaceTable?.Races?.[0];
            const res = race?.Results?.[0];
            if (!race || !res) throw 0;
            const name = res.Driver.givenName + ' ' + res.Driver.familyName;
            const team = res.Constructor.name.replace('Team', '').trim();
            const nat = res.Driver.nationality || '';
            const number = res.number || DRIVER_IMAGES[name]?.number || '';
            const flag = NATIONALITY_FLAG[nat] || '🏁';
            const gp = race.raceName || 'Grand Prix';
            return { name, team, nat, number, flag, gp };
        } catch {
            return { name: 'George Russell', team: 'Mercedes', nat: 'British', number: '63', flag: '🇬🇧', gp: 'Grand Prix' };
        }
    }

    function showCard(d) {
        const pic = DRIVER_IMAGES[d.name]?.img || IMG_FALLBACK;
        el.img.src = pic;
        el.name.textContent = d.name;
        el.num.textContent = '#' + (d.number || '');
        el.team.textContent = d.team;
        el.nat.textContent = d.flag + ' ' + (d.nat || '');
        el.meta.textContent = d.gp + ' • ' + d.team;
        card.style.display = '';
        window.kcConfetti?.teamConfetti(d.team);
        if (el.tip) el.tip.textContent = 'Tap ' + d.flag + ' again to replay';
    }

    async function runSequence() {
        overlay.style.display = 'flex';
        card.style.display = 'none';
        if (el.title) el.title.textContent = 'Lights out and away we go!';
        lights.forEach(l => { l.className = 'light'; l.style.transition = 'transform 260ms ease, background-color 160ms ease'; });
        for (let i = 0; i < lights.length; i++) {
            await delay(240);
            lights[i].classList.add('on', 'red');
            lights[i].style.transform = 'scale(1.06)';
        }
        await delay(420);
        lights.forEach(l => { l.classList.remove('red'); l.classList.add('on', 'green'); l.style.transform = 'scale(1)'; });
        await delay(520);
        lights.forEach(l => l.classList.remove('on', 'green'));
        const data = await fetchLastWinner();
        showCard(data);
    }

    document.getElementById('flagGo')?.addEventListener('click', e => { e.stopPropagation(); runSequence(); });
    overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.getElementById('year').textContent = new Date().getFullYear();

    function centerLights() {
        if (!lightsWrap) return;
        lightsWrap.style.justifyContent = 'center';
    }
    centerLights();
    window.addEventListener('resize', centerLights, { passive: true });
})();
