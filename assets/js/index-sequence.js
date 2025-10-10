let seqBusy = false;

window.DRIVER_IMAGES = {
  "Max Verstappen": { number: "1", img: "assets/img/Max.jpg" },
  "Yuki Tsunoda": { number: "22", img: "assets/img/Yuki.jpg" },
  "Charles Leclerc": { number: "16", img: "assets/img/Charles.jpg" },
  "Lewis Hamilton": { number: "44", img: "assets/img/Lewis.jpg" },
  "George Russell": { number: "63", img: "assets/img/George.jpg" },
  "Kimi Antonelli": { number: "12", img: "assets/img/Kimi.jpg" },
  "Lando Norris": { number: "4", img: "assets/img/Lando.jpg" },
  "Oscar Piastri": { number: "81", img: "assets/img/Oscar.jpg" },
  "Liam Lawson": { number: "30", img: "assets/img/Liam.jpg" },
  "Isack Hadjar": { number: "6", img: "assets/img/Isack.jpg" },
  "Fernando Alonso": { number: "14", img: "assets/img/Fernando.jpg" },
  "Lance Stroll": { number: "18", img: "assets/img/Lance.jpg" },
  "Alexander Albon": { number: "23", img: "assets/img/ALex.jpg" },
  "Carlos Sainz": { number: "55", img: "assets/img/Carlos.jpg" },
  "Pierre Gasly": { number: "10", img: "assets/img/Pierre.jpg" },
  "Franco Colapinto": { number: "7", img: "assets/img/Franco.jpg" },
  "Esteban Ocon": { number: "31", img: "assets/img/Estie.jpg" },
  "Oliver Bearman": { number: "87", img: "assets/img/Ollie.jpg" },
  "Nico Hülkenberg": { number: "27", img: "assets/img/Niko.jpg" },
  "Gabriel Bortoleto": { number: "5", img: "assets/img/Bortoleto.jpg" }
};

const overlay = document.getElementById("seqOverlay");
const lights = [1, 2, 3, 4, 5].map(i => document.getElementById("L" + i));
const winCard = document.getElementById("winnerCard");
const winImg = document.getElementById("winImg");
const winName = document.getElementById("winName");
const winNum = document.getElementById("winNum");
const winTeam = document.getElementById("winTeam");
const winNat = document.getElementById("winNat");
const winGP = document.getElementById("winGP");

function resetLights() { lights.forEach(l => l?.classList.remove("on", "red", "green")) }
function animateLights() { resetLights(); let i = 0; return new Promise(res => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++ } else { clearInterval(t); setTimeout(res, 240) } }, 200) }) }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green") }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 900) }

const TEAM_COLORS = {
  "McLaren": ["#ff8000", "#141416", "#ffffff"],
  "Williams": ["#0d347e", "#c9d7ff", "#ffffff"],
  "Ferrari": ["#dc0000", "#ffd6d6", "#ffffff"],
  "Mercedes": ["#00a19c", "#101112", "#dff7f5"],
  "Red Bull": ["#00183f", "#ffdd00", "#f50100"],
  "Aston Martin": ["#00665e", "#b7ffe6", "#ffffff"],
  "RB": ["#2b2d83", "#ffffff", "#d7dcff"],
  "Haas": ["#e8e8e8", "#181818", "#b30000"],
  "Alpine": ["#0055ff", "#e6eeff", "#ffffff"]
};
function normTeam(t) { const s = (t || "").toLowerCase(); if (s.includes("mclaren")) return "McLaren"; if (s.includes("williams")) return "Williams"; if (s.includes("ferrari")) return "Ferrari"; if (s.includes("mercedes")) return "Mercedes"; if (s.includes("red bull")) return "Red Bull"; if (s.includes("aston")) return "Aston Martin"; if (s === "rb" || s.includes("rb ")) return "RB"; if (s.includes("haas")) return "Haas"; if (s.includes("alpine")) return "Alpine"; return t || "" }
function ccToFlag(cc) { if (!cc || cc.length !== 2) return ""; const A = 0x1F1E6, a = "A".charCodeAt(0); return String.fromCodePoint(A + (cc[0].toUpperCase().charCodeAt(0) - a), A + (cc[1].toUpperCase().charCodeAt(0) - a)) }

const CANDIDATES = ["data/latest.json", "./data/latest.json", "/data/latest.json", "https://katechen125.github.io/data/latest.json"];

async function getLatestWinner() {
  for (const u of CANDIDATES) {
    try {
      const r = await fetch(`${u}?ts=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) continue;
      const j = await r.json();
      const name = j.name || j.winner || j.driver || "";
      if (!name) continue;
      const team = normTeam(j.team || j.constructor || j.entry || "");
      const gp = j.gp || j.race || j.raceName || "Grand Prix";
      const number = String(j.number || window.DRIVER_IMAGES[name]?.number || "");
      const img = (window.DRIVER_IMAGES[name]?.img) || "";
      const flag = j.flag || ccToFlag(j.flag_cc || j.countryCode || "");
      return { name, team, gp, number, img, flag };
    } catch (e) { }
  }
  return { name: "George Russell", team: "Mercedes", gp: "Singapore Grand Prix", number: "63", img: window.DRIVER_IMAGES["George Russell"].img, flag: "🇬🇧" };
}

function teamConfetti(team) { const palette = TEAM_COLORS[team] || null; if (palette && window.startCustomConfetti) startCustomConfetti({ colors: palette, count: 360 }); else if (window.startNormalConfetti) startNormalConfetti() }

function showWinner(w) {
  winCard.style.display = "grid";
  winCard.style.opacity = "0";
  requestAnimationFrame(() => { winName.textContent = w.name || ""; winNum.textContent = w.number ? ("#" + w.number) : "#"; winTeam.textContent = w.team || ""; winNat.textContent = w.flag || ""; winGP.textContent = (w.gp || "") + (w.team ? " • " + w.team : ""); if (w.img) { winImg.src = w.img; winImg.alt = w.name } winCard.style.transition = "opacity .25s ease"; winCard.style.opacity = "1" });
}

async function runSequence() {
  if (seqBusy) return;
  seqBusy = true;
  overlay.style.display = "flex";
  await animateLights();
  const w = await getLatestWinner();
  goGreen();
  teamConfetti(w.team || "");
  showWinner(w);
  setTimeout(() => { overlay.style.display = "none"; resetLights(); seqBusy = false }, 2600);
}
window.runSequence = runSequence;
