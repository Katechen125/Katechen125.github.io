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

window.FLAG_ASSETS = {
  NL: { svg: "assets/img/NL.svg", emoji: "🇳🇱", country: "Netherlands" },
  JP: { svg: "assets/img/JP.svg", emoji: "🇯🇵", country: "Japan" },
  MC: { svg: "assets/img/MC.svg", emoji: "🇲🇨", country: "Monaco" },
  GB: { svg: "assets/img/GB.svg", emoji: "🇬🇧", country: "United Kingdom" },
  IT: { svg: "assets/img/IT.svg", emoji: "🇮🇹", country: "Italy" },
  AUS: { svg: "assets/img/AUS.svg", emoji: "🇦🇺", country: "Australia" },
  NZ: { svg: "assets/img/NZ.svg", emoji: "🇳🇿", country: "New Zealand" },
  FR: { svg: "assets/img/FR.svg", emoji: "🇫🇷", country: "France" },
  ES: { svg: "assets/img/ES.svg", emoji: "🇪🇸", country: "Spain" },
  CA: { svg: "assets/img/CA.svg", emoji: "🇨🇦", country: "Canada" },
  TH: { svg: "assets/img/TH.svg", emoji: "🇹🇭", country: "Thailand" },
  AR: { svg: "assets/img/AR.svg", emoji: "🇦🇷", country: "Argentina" },
  DE: { svg: "assets/img/DE.svg", emoji: "🇩🇪", country: "Germany" },
  BR: { svg: "assets/img/BR.svg", emoji: "🇧🇷", country: "Brazil" }
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

function resetLights() { lights.forEach(l => l?.classList.remove("on", "red", "green")); }
function animateLights() { resetLights(); let i = 0; return new Promise(res => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++; } else { clearInterval(t); setTimeout(res, 240); } }, 200); }); }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green"); }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 900); }

const NAT_TO_CODE = { Dutch: "NL", Japanese: "JP", Monegasque: "MC", British: "GB", Italian: "IT", Australian: "AUS", "New Zealander": "NZ", French: "FR", Spanish: "ES", Canadian: "CA", Thai: "TH", Argentine: "AR", German: "DE", Brazilian: "BR" };

async function getLatestWinner() {
  try {
    const r = await fetch(`data/latest.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j || !j.name) return null;
    const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[j.name]?.img) || "";
    let code = (j.flag_code || j.flagCode || j.flag_cc || j.flag || j.cc || j.nat || "").toString().toUpperCase();
    if (!code && j.nationality) { const n = j.nationality.trim(); code = NAT_TO_CODE[n] || ""; }
    const nat = window.FLAG_ASSETS && window.FLAG_ASSETS[code] ? window.FLAG_ASSETS[code] : null;
    return { name: j.name, number: String(j.number || ""), team: j.team || "", gp: j.gp || "Grand Prix", code, nat, img };
  } catch { return null; }
}

function showWinner(w) {
  if (!w) { winCard.style.display = "none"; return; }
  winCard.style.display = "grid";
  winName.textContent = w.name || "";
  winNum.textContent = w.number ? ("#" + w.number) : "#";
  winTeam.textContent = w.team || "";
  if (w.nat) {
    winNat.classList.add("flag");
    winNat.innerHTML = `<img src="${w.nat.svg}" alt="${w.code}" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px;border-radius:2px"> ${w.nat.emoji} ${w.code}`;
  } else {
    winNat.textContent = w.code || "";
  }
  winGP.textContent = (w.gp || "") + (w.team ? " • " + w.team : "");
  if (w.img) { winImg.src = w.img; winImg.alt = w.name; }
}

function runSequence() {
  overlay.style.display = "flex";
  animateLights().then(async () => {
    const w = await getLatestWinner();
    goGreen();
    if (window.startNormalConfetti) startNormalConfetti();
    showWinner(w);
    setTimeout(() => { overlay.style.display = "none"; resetLights(); }, 1500);
  });
}

window.runSequence = runSequence;
