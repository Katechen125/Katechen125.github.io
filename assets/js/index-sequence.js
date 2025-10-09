const overlay = document.getElementById("seqOverlay");
const lights = [1, 2, 3, 4, 5].map(i => document.getElementById("L" + i));
const winCard = document.getElementById("winnerCard");
const winImg = document.getElementById("winImg");
const winName = document.getElementById("winName");
const winNum = document.getElementById("winNum");
const winTeam = document.getElementById("winTeam");
const winNat = document.getElementById("winNat");
const winGP = document.getElementById("winGP");
const flagSVG = document.getElementById("flagSVG");
function resetLights() { lights.forEach(l => l.classList.remove("on", "red", "green")) }
function animateLights() { resetLights(); let i = 0; return new Promise(res => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++ } else { clearInterval(t); setTimeout(res, 220) } }, 180) }) }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green") }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 900) }
function flagFromCC(cc) { if (!cc) return "🏁"; const c = cc.toUpperCase(); if (c.length !== 2) return "🏁"; const A = 0x1F1E6, a = "A".charCodeAt(0); return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a)) }
const COUNTRY_MAP = { "United Kingdom": "GB", "Great Britain": "GB", "Britain": "GB", "United States": "US", "USA": "US", "United Arab Emirates": "AE", "UAE": "AE", "Saudi Arabia": "SA", "Bahrain": "BH", "Qatar": "QA", "Azerbaijan": "AZ", "Brazil": "BR", "Mexico": "MX", "Canada": "CA", "Spain": "ES", "Italy": "IT", "San Marino": "SM", "Monaco": "MC", "France": "FR", "Belgium": "BE", "Netherlands": "NL", "Austria": "AT", "Germany": "DE", "Hungary": "HU", "Czech Republic": "CZ", "Singapore": "SG", "Japan": "JP", "China": "CN", "Australia": "AU", "New Zealand": "NZ", "South Africa": "ZA", "Argentina": "AR" };
const CACHE_KEY = "kc-wp-rest-latest", CACHE_TTL = 60 * 60 * 1000;
function readCache() { try { const r = sessionStorage.getItem(CACHE_KEY); if (!r) return null; const { t, data } = JSON.parse(r); if (!t || !data) return null; if (Date.now() - t > CACHE_TTL) return null; return data } catch { return null } }
function writeCache(d) { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: d })) } catch { } }
async function fetchLatestFromWikimedia(signal) {
  const year = new Date().getUTCFullYear();
  const page = `${year}_Formula_One_World_Championship`;
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(page)}`;
  const r = await fetch(url, { signal, headers: { "Accept": "text/html" } }); if (!r.ok) throw 0;
  const html = await r.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const tables = [...doc.querySelectorAll("table")];
  let table = null;
  for (const t of tables) {
    const cap = t.querySelector("caption")?.textContent?.toLowerCase() || "";
    const th = t.querySelector("th")?.textContent?.toLowerCase() || "";
    if (cap.includes("grand prix") || cap.includes("race") || th.includes("grand prix") || th.includes("race")) { table = t; break }
  }
  if (!table) throw 0;
  const rows = [...table.querySelectorAll("tr")].filter(tr => tr.querySelectorAll("td").length >= 2);
  let row = null;
  for (let i = rows.length - 1; i >= 0; i--) {
    const tr = rows[i];
    const bold = tr.querySelector("b a, b span[rel='mw:WikiLink']");
    const gpCell = tr.querySelector("td");
    if ((bold || tr.querySelector("td:nth-child(2) a")) && gpCell) { row = tr; break }
  }
  if (!row) throw 0;
  const tds = row.querySelectorAll("td");
  const gpText = (tds[0]?.textContent || "").replace(/\[\d+\]/g, "").trim();
  const winnerLink = row.querySelector("b a, b span[rel='mw:WikiLink']") || tds[1]?.querySelector("a, span[rel='mw:WikiLink']");
  const name = (winnerLink?.textContent || "").trim();
  let team = "";
  if (tds[1]) { const ls = [...tds[1].querySelectorAll("a, span[rel='mw:WikiLink]")].map(a => a.textContent.trim()).filter(Boolean); if (ls.length >= 2) team = ls[ls.length - 1] }
  let cc = "";
  const flagEl = tds[0]?.querySelector("span[title], img[alt]");
  const hint = flagEl?.getAttribute("title") || flagEl?.getAttribute("alt") || "";
  if (hint) cc = (COUNTRY_MAP[hint] || "");
  let number = "";
  if (tds[1]) { const txt = tds[1].textContent; const m = txt.match(/#\s?(\d{1,2})/); if (m) number = m[1] }
  const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[name] && window.DRIVER_IMAGES[name].img) || "";
  return { name, number, team, gp: gpText, flag: flagFromCC(cc), img }
}
async function getLatestWinner() {
  const c = readCache(); if (c) return c;
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 3000);
  try { const w = await fetchLatestFromWikimedia(ctl.signal); clearTimeout(to); writeCache(w); return w } catch { clearTimeout(to); return null }
}
function showWinner(w) {
  if (!w) { winCard.style.display = "none"; return }
  winCard.style.display = "grid";
  winName.textContent = w.name || "Winner";
  winNum.textContent = w.number ? ("#" + w.number) : "#";
  winTeam.textContent = w.team || "Team";
  winNat.textContent = w.flag || "";
  winGP.textContent = (w.gp || "Grand Prix") + (w.team ? " • " + w.team : "");
  if (w.img) { winImg.src = w.img; winImg.alt = w.name }
}
function runSequence() {
  overlay.style.display = "flex";
  document.getElementById("seqSub").textContent = "Starting…";
  lights.forEach(l => l.classList.remove("on", "red", "green"));
  animateLights().then(async () => {
    document.getElementById("seqSub").textContent = "Fetching winner…";
    const w = await getLatestWinner();
    goGreen();
    if (w && w.team && window.startTeamConfetti) startTeamConfetti(w.team); else if (window.startNormalConfetti) startNormalConfetti();
    showWinner(w);
    flagSVG.classList.remove("flag-wave"); void flagSVG.offsetWidth; flagSVG.classList.add("flag-wave");
    setTimeout(() => { overlay.style.display = "none"; resetLights() }, 1500);
  })
}
window.runSequence = runSequence;
window.addEventListener("load", () => { getLatestWinner().catch(() => { }) }, { once: true });
