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
  "United Kingdom": "GB", "Great Britain": "GB", "Britain": "GB", "UK": "GB",
  "U.S.A.": "US", "USA": "US", "United States": "US",
  "United Arab Emirates": "AE", "UAE": "AE", "Saudi Arabia": "SA", "Bahrain": "BH", "Qatar": "QA", "Azerbaijan": "AZ",
  "Brazil": "BR", "Mexico": "MX", "Canada": "CA", "Spain": "ES", "Italy": "IT", "San Marino": "SM", "Monaco": "MC", "France": "FR", "Belgium": "BE",
  "Netherlands": "NL", "Austria": "AT", "Germany": "DE", "Hungary": "HU", "Czech Republic": "CZ", "Singapore": "SG", "Japan": "JP", "China": "CN",
  "Australia": "AU", "New Zealand": "NZ", "South Africa": "ZA", "Argentina": "AR"
};
const ccFromCountryName = (n) => COUNTRY_CC[n] || "";


function resetLights() { lights.forEach(l => l.className = "seq-light"); }
function animateLights() {
  resetLights(); let i = 0;
  return new Promise(res => {
    const t = setInterval(() => {
      if (i < 5) { lights[i].classList.add("on", "red"); i++; }
      else { clearInterval(t); setTimeout(res, 220); }
    }, 160);
  });
}
function goGreen() {
  lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green"); });
  setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 850);
}


const CACHE_KEY = "kc-latest-f1-winner";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; 

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    if (!t || !data) return null;
    if (Date.now() - t > CACHE_TTL_MS) return null;
    return data;
  } catch { return null; }
}
function writeCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch { }
}

async function fetchWinnerWikidata(signal) {
  const year = new Date().getUTCFullYear();
  const today = new Date().toISOString().slice(0, 10);
  const seasonLabel = `${year} Formula One World Championship`;

  const sparql = `
    SELECT ?race ?raceLabel ?date ?winner ?winnerLabel ?teamLabel ?driverNumber ?driverCC ?countryLabel WHERE {
      ?season rdfs:label "${seasonLabel}"@en .
      ?season wdt:P527 ?race .
      ?race wdt:P585 ?date .
      FILTER (?date <= "${today}"^^xsd:date)
      ?race wdt:P1346 ?winner .
      OPTIONAL { ?winner wdt:P493 ?driverNumber. }           # car number (if present)
      OPTIONAL { ?winner wdt:P27 ?driverCountry . ?driverCountry wdt:P297 ?driverCC . } # 2-letter cc
      OPTIONAL { ?race wdt:P17 ?hostCountry . ?hostCountry rdfs:label ?countryLabel FILTER (lang(?countryLabel)="en") }
      OPTIONAL {
        ?race p:P1346 ?st .
        ?st ps:P1346 ?winner .
        OPTIONAL { ?st pq:P54 ?team . }      # team as qualifier (often set)
        OPTIONAL { ?st pq:P642 ?team . }     # sometimes stored as 'of' relation
        OPTIONAL { ?team rdfs:label ?teamLabel FILTER(lang(?teamLabel)="en") }
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY DESC(?date) LIMIT 1
  `;
  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
  const res = await fetch(url, { headers: { "Accept": "application/sparql-results+json" }, signal });
  if (!res.ok) throw new Error("wikidata-http");
  const json = await res.json();
  const b = json?.results?.bindings?.[0];
  if (!b) throw new Error("wikidata-empty");

  const driver = b.winnerLabel?.value || "Winner";
  const number = b.driverNumber?.value || "";
  const team = b.teamLabel?.value || "";
  const gp = b.raceLabel?.value || "Grand Prix";
  const cc = (b.driverCC?.value || ccFromCountryName(b.countryLabel?.value || "")).toUpperCase();
  const flag = flagFromCC(cc);
  const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[driver] && window.DRIVER_IMAGES[driver].img) || "";

  return { name: driver, number, team, flag, gp, img };
}


async function prefetchWinner() {
  try {
    if (readCache()) return;
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 2500); 
    const w = await fetchWinnerWikidata(ctl.signal);
    clearTimeout(to);
    writeCache(w);
  } catch { }
}


async function getLatestWinner() {
  const cached = readCache();
  if (cached) return cached;

  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 2500); 
  try {
    const w = await fetchWinnerWikidata(ctl.signal);
    clearTimeout(to);
    writeCache(w);
    return w;
  } catch (e) {
    clearTimeout(to);
    return null; 
  }
}


function showWinner(w) {
  if (!w) { 
    winCard.style.display = "none";
    if (hint) hint.textContent = "Couldn’t fetch — tap 🏁 to try again";
    if (flagBtn) flagBtn.textContent = "🏁";
    return;
  }
  winCard.style.display = "grid";
  winName.textContent = w.name || "Winner";
  winNum.textContent = w.number ? ("#" + w.number) : "#";
  winTeam.textContent = w.team || "Team";
  winNat.textContent = w.flag || "";
  winGP.textContent = (w.gp || "Grand Prix") + (w.team ? " • " + w.team : "");
  if (w.img) { winImg.src = w.img; winImg.alt = w.name; }
  else { winImg.src = "https://images.placeholders.dev/?width=192&height=192&text=%F0%9F%8F%81"; winImg.alt = ""; }

  if (hint) hint.textContent = `Tap ${w.flag || "🏁"} to replay`;
  if (flagBtn) flagBtn.textContent = w.flag || "🏁";
}

async function runSequence() {
  overlay.style.display = "flex";
  winCard.style.display = "none";
  document.getElementById("seqSub").textContent = "Starting…";

  await animateLights();
  document.getElementById("seqSub").textContent = "Fetching winner…";

  const w = await getLatestWinner();
  goGreen();

  if (w && w.team && window.startTeamConfetti) startTeamConfetti(w.team);
  else if (window.startNormalConfetti) startNormalConfetti();

  showWinner(w);
  setTimeout(() => { overlay.style.display = "none"; resetLights(); }, 1900);
}

if (flagBtn) flagBtn.addEventListener("click", (e) => { e.stopPropagation(); runSequence(); }, { passive: true });
window.addEventListener("load", prefetchWinner, { once: true });
