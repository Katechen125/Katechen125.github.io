const overlay = document.getElementById("seqOverlay");
const lights = [1, 2, 3, 4, 5].map(i => document.getElementById("L" + i));
const flagBtn = document.getElementById("flagGo");
const hint = document.getElementById("flagHint");
const winCard = document.getElementById("winnerCard");
const winImg = document.getElementById("winImg");
const winName = document.getElementById("winName");
const winNum = document.getElementById("winNum");
const winTeam = document.getElementById("winTeam");
const winNat = document.getElementById("winNat");
const winGP = document.getElementById("winGP");

const NAT_TO_CC = { British: "GB", English: "GB", Monegasque: "MC", Dutch: "NL", Mexican: "MX", Spanish: "ES", Australian: "AU", Japanese: "JP", French: "FR", German: "DE", Canadian: "CA", Thai: "TH", Danish: "DK", Finnish: "FI", Italian: "IT", Swiss: "CH", Chinese: "CN", American: "US", Austrian: "AT", NewZealander: "NZ", Brazilian: "BR", Argentine: "AR" };
const COUNTRY_CC = { UK: "GB", "United Kingdom": "GB", "Great Britain": "GB", "Britain": "GB", "United States": "US", "USA": "US", "U.S.A.": "US", "UAE": "AE", "United Arab Emirates": "AE", "Saudi Arabia": "SA", "Bahrain": "BH", "Qatar": "QA", "Azerbaijan": "AZ", "São Paulo": "BR", "Brazil": "BR", "Mexico": "MX", "Canada": "CA", "Spain": "ES", "Italy": "IT", "San Marino": "SM", "Monaco": "MC", "France": "FR", "Belgium": "BE", "Netherlands": "NL", "Austria": "AT", "Germany": "DE", "Hungary": "HU", "Czech Republic": "CZ", "Singapore": "SG", "Japan": "JP", "China": "CN", "Australia": "AU", "New Zealand": "NZ", "South Africa": "ZA", "Argentina": "AR" };
function flagFromCC(cc) { if (!cc) return "🏁"; const c = cc.toUpperCase(); if (c.length === 2) { const A = 0x1F1E6, a = "A".charCodeAt(0); return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a)); } return "🏁"; }
function flagFromNationality(n) { const cc = NAT_TO_CC[n] || ""; return flagFromCC(cc); }
function flagFromCountryName(name) { const cc = COUNTRY_CC[name] || ""; return flagFromCC(cc); }

const FALLBACK = { raceName: "British Grand Prix", driver: { givenName: "George", familyName: "Russell", permanentNumber: "63", nationality: "British" }, constructor: { name: "Mercedes" } };

async function getLatestWinner() {
    try {
        const r = await fetch("https://ergast.com/api/f1/current/last/results.json", { cache: "no-store" });
        const j = await r.json();
        const race = (j && j.MRData && j.MRData.RaceTable && j.MRData.RaceTable.Races && j.MRData.RaceTable.Races[0]) || null;
        if (!race) throw 0;
        const res = race.Results && race.Results[0]; if (!res) throw 0;
        const d = res.Driver || {}; const c = res.Constructor || {};
        const fullName = (d.givenName || "") + " " + (d.familyName || "");
        const natFlag = flagFromNationality(d.nationality || "");
        const gpName = race.raceName || "Grand Prix";
        const gpFlag = flagFromCountryName((race.Circuit && race.Circuit.Location && race.Circuit.Location.country) || "");
        const showFlag = natFlag !== "🏁" ? natFlag : gpFlag;
        const number = String(d.permanentNumber || res.number || res.positionText || "");
        const team = c.name || "";
        const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[fullName] && window.DRIVER_IMAGES[fullName].img) || "";
        return { name: fullName.trim(), number, team, flag: showFlag, gp: gpName, img };
    } catch (e) {
        const d = FALLBACK.driver, c = FALLBACK.constructor;
        const fullName = d.givenName + " " + d.familyName;
        const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[fullName] && window.DRIVER_IMAGES[fullName].img) || "";
        return { name: fullName, number: String(d.permanentNumber || "63"), team: c.name, flag: flagFromNationality(d.nationality), gp: FALLBACK.raceName, img, fallback: true };
    }
}

function resetLights() { lights.forEach(l => l.className = "seq-light"); }
function animateLights() { resetLights(); let i = 0; return new Promise(resolve => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++; } else { clearInterval(t); setTimeout(resolve, 420); } }, 240); }); }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green"); }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 1100); }

async function runSequence() {
    overlay.style.display = "flex";
    winCard.style.display = "none";
    document.getElementById("seqSub").textContent = "Starting…";
    await animateLights();
    document.getElementById("seqSub").textContent = "Fetching winner…";
    const w = await getLatestWinner();
    goGreen();
    if (w && w.team) { if (window.startTeamConfetti) startTeamConfetti(w.team); else if (window.startNormalConfetti) startNormalConfetti(); }
    else if (window.startNormalConfetti) startNormalConfetti();
    if (w) {
        winCard.style.display = "grid";
        winName.textContent = w.name;
        winNum.textContent = "#" + w.number;
        winTeam.textContent = w.team || "Team";
        winNat.textContent = w.flag || "";
        winGP.textContent = w.gp + (w.team ? " • " + w.team : "");
        if (w.img) { winImg.src = w.img; winImg.alt = w.name; } else { winImg.src = "https://images.placeholders.dev/?width=192&height=192&text=%F0%9F%8F%81"; winImg.alt = ""; }
        if (hint) hint.textContent = "Tap " + (w.flag || "🏁") + " again to replay";
    } else {
        winCard.style.display = "none";
        if (hint) hint.textContent = "Tap 🏁 again to replay";
    }
    setTimeout(() => { overlay.style.display = "none"; resetLights(); }, 2200);
}

if (flagBtn) { flagBtn.addEventListener("click", e => { e.stopPropagation(); runSequence(); }); }
