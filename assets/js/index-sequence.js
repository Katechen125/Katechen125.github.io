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

const DRIVER_FLAG_EMOJI = {
  "Max Verstappen": "🇳🇱", "Yuki Tsunoda": "🇯🇵", "Charles Leclerc": "🇲🇨", "Lewis Hamilton": "🇬🇧", "George Russell": "🇬🇧", "Kimi Antonelli": "🇮🇹", "Lando Norris": "🇬🇧", "Oscar Piastri": "🇦🇺", "Liam Lawson": "🇳🇿", "Isack Hadjar": "🇫🇷", "Fernando Alonso": "🇪🇸", "Lance Stroll": "🇨🇦", "Alexander Albon": "🇹🇭", "Carlos Sainz": "🇪🇸", "Pierre Gasly": "🇫🇷", "Franco Colapinto": "🇦🇷", "Esteban Ocon": "🇫🇷", "Oliver Bearman": "🇬🇧", "Nico Hülkenberg": "🇩🇪", "Gabriel Bortoleto": "🇧🇷"
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
function animateLights() { resetLights(); let i = 0; return new Promise(res => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++ } else { clearInterval(t); setTimeout(res, 260) } }, 200) }) }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green") }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 900) }

function flagFromCC(cc) {
  if (!cc) return "";
  const c = cc.toUpperCase();
  if (c.length !== 2) return "";
  const A = 0x1F1E6, a = "A".charCodeAt(0);
  return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a));
}

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

async function getLatestWinner() {
  const origin = window.location.origin || "";
  const tries = [
    `${origin}/data/latest.json`,
    `data/latest.json`,
    `./data/latest.json`
  ];
  for (const url of tries) {
    try {
      const r = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) continue;
      const j = await r.json();
      if (!j || !j.name) continue;
      const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[j.name]?.img) || "";
      const flag = j.flag || (j.flag_cc ? flagFromCC(j.flag_cc) : (DRIVER_FLAG_EMOJI[j.name] || ""));
      const gp = j.gp || j.race || j.grand_prix || j.event || "Grand Prix";
      return { name: j.name, number: String(j.number || ""), team: j.team || "", gp, flag, img };
    } catch (e) { }
  }
  const f = window.DRIVER_IMAGES?.["Lando Norris"] || { number: "4", img: "" };
  return { name: "Lando Norris", number: f.number || "4", team: "McLaren", gp: "Grand Prix", flag: DRIVER_FLAG_EMOJI["Lando Norris"], img: f.img || "" };
}

function showWinner(w) {
  winCard.style.display = "grid";
  winName.textContent = w.name || "";
  winNum.textContent = w.number ? ("#" + w.number) : "#";
  winTeam.textContent = w.team || "";
  winNat.textContent = w.flag || "";
  winNat.classList.add("emoji-text");
  winGP.textContent = (w.gp || "") + (w.team ? " • " + w.team : "");
  if (w.img) { winImg.src = w.img; winImg.alt = w.name }
}

function runSequence() {
  overlay.style.display = "flex";
  animateLights().then(async () => {
    const w = await getLatestWinner();
    goGreen();
    const palette = TEAM_COLORS[w.team] || null;
    if (palette && window.startCustomConfetti) { startCustomConfetti({ colors: palette, count: 320 }) }
    else if (window.startNormalConfetti) { startNormalConfetti() }
    showWinner(w);
    setTimeout(() => { overlay.style.display = "none"; resetLights() }, 1600);
  })
}
window.runSequence = runSequence;
