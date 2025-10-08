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

function flagFromCC(cc) {
    if (!cc) return "🏁";
    const c = cc.toUpperCase();
    if (c.length !== 2) return "🏁";
    const A = 0x1F1E6, a = "A".charCodeAt(0);
    return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a));
}

const COUNTRY_CC = {
    "United Kingdom": "GB", "Great Britain": "GB", "Britain": "GB", "UK": "GB", "U.S.A.": "US", "USA": "US", "United States": "US",
    "United Arab Emirates": "AE", "UAE": "AE", "Saudi Arabia": "SA", "Bahrain": "BH", "Qatar": "QA", "Azerbaijan": "AZ",
    "Brazil": "BR", "Mexico": "MX", "Canada": "CA", "Spain": "ES", "Italy": "IT", "San Marino": "SM", "Monaco": "MC", "France": "FR", "Belgium": "BE",
    "Netherlands": "NL", "Austria": "AT", "Germany": "DE", "Hungary": "HU", "Czech Republic": "CZ", "Singapore": "SG", "Japan": "JP", "China": "CN",
    "Australia": "AU", "New Zealand": "NZ", "South Africa": "ZA", "Argentina": "AR"
};

function ccFromCountryName(name) { return COUNTRY_CC[name] || ""; }

function resetLights() { lights.forEach(l => l.className = "seq-light"); }
function animateLights() { resetLights(); let i = 0; return new Promise(res => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++; } else { clearInterval(t); setTimeout(res, 360); } }, 200); }); }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green"); }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 1000); }

async function getLatestWinner() {
    const year = new Date().getUTCFullYear();
    const seasonLabel = `${year} Formula One World Championship`;
    const today = new Date().toISOString().slice(0, 10);

    const sparql = `
    SELECT ?race ?raceLabel ?date ?winner ?winnerLabel ?teamLabel ?driverNumber ?driverCC ?countryLabel WHERE {
      ?season rdfs:label "${seasonLabel}"@en .
      ?season wdt:P527 ?race .
      ?race wdt:P585 ?date .
      FILTER (?date <= "${today}"^^xsd:date)
      ?race wdt:P1346 ?winner .
      OPTIONAL { ?winner wdt:P493 ?driverNumber. }            # racing number
      OPTIONAL { ?winner wdt:P27 ?driverCountry .             # country of citizenship
                 ?driverCountry wdt:P297 ?driverCC . }        # ISO 3166-1 alpha-2
      OPTIONAL { ?race wdt:P17 ?hostCountry . ?hostCountry rdfs:label ?countryLabel FILTER (lang(?countryLabel)="en") }
      OPTIONAL {
        ?race p:P1346 ?st .
        ?st ps:P1346 ?winner .
        OPTIONAL { ?st pq:P54 ?team . }
        OPTIONAL { ?st pq:P642 ?team . }                      # "of" sometimes holds constructor
        OPTIONAL { ?team rdfs:label ?teamLabel FILTER(lang(?teamLabel)="en") }
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY DESC(?date)
    LIMIT 1
  `;

    const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
    const res = await fetch(url, { headers: { "Accept": "application/sparql-results+json" } });
    const json = await res.json();
    const b = json?.results?.bindings?.[0];
    if (!b) return null;

    const gp = b.raceLabel?.value || "Grand Prix";
    const team = b.teamLabel?.value || "";
    const number = b.driverNumber?.value || "";
    const driver = b.winnerLabel?.value || "Winner";
    const cc = (b.driverCC?.value || ccFromCountryName(b.countryLabel?.value || "")).toUpperCase();
    const flag = flagFromCC(cc);

    const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[driver] && window.DRIVER_IMAGES[driver].img) || "";
    return { name: driver, number, team, flag, gp, img };
}

async function runSequence() {
    overlay.style.display = "flex";
    winCard.style.display = "none";
    document.getElementById("seqSub").textContent = "Starting…";
    await animateLights();
    document.getElementById("seqSub").textContent = "Fetching winner…";

    let w = null;
    try { w = await getLatestWinner(); } catch { }
    goGreen();

    if (w && w.team && window.startTeamConfetti) startTeamConfetti(w.team);
    else if (window.startNormalConfetti) startNormalConfetti();

    if (w) {
        winCard.style.display = "grid";
        winName.textContent = w.name;
        winNum.textContent = w.number ? ("#" + w.number) : "#";
        winTeam.textContent = w.team || "Team";
        winNat.textContent = w.flag || "";
        winGP.textContent = w.gp + (w.team ? " • " + w.team : "");
        if (w.img) { winImg.src = w.img; winImg.alt = w.name; }
        else { winImg.src = "https://images.placeholders.dev/?width=192&height=192&text=%F0%9F%8F%81"; winImg.alt = ""; }

        if (hint) hint.textContent = `Tap ${w.flag} to replay`;
        if (flagBtn) flagBtn.textContent = w.flag;         
    } else {
        winCard.style.display = "none";
        if (hint) hint.textContent = "Tap 🏁 to replay";
        if (flagBtn) flagBtn.textContent = "🏁";
    }

    setTimeout(() => { overlay.style.display = "none"; resetLights(); }, 1800);
}

if (flagBtn) flagBtn.addEventListener("click", e => { e.stopPropagation(); runSequence(); }, { passive: true });
