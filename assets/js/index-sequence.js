const overlay = document.getElementById("seqOverlay");
const lights = [1, 2, 3, 4, 5].map(i => document.getElementById("L" + i));
const winCard = document.getElementById("winnerCard");
const winImg = document.getElementById("winImg");
const winName = document.getElementById("winName");
const winNum = document.getElementById("winNum");
const winTeam = document.getElementById("winTeam");
const winNat = document.getElementById("winNat");
const winGP = document.getElementById("winGP");

const FLAG_ASSETS = {
  NL: { svg: "assets/img/flags/NL.svg", country: "Netherlands" },
  JP: { svg: "assets/img/flags/JP.svg", country: "Japan" },
  MC: { svg: "assets/img/flags/MC.svg", country: "Monaco" },
  GB: { svg: "assets/img/flags/GB.svg", country: "United Kingdom" },
  IT: { svg: "assets/img/flags/IT.svg", country: "Italy" },
  AUS:{ svg: "assets/img/flags/AUS.svg",country:"Australia" },
  NZ: { svg: "assets/img/flags/NZ.svg", country: "New Zealand" },
  FR: { svg: "assets/img/flags/FR.svg", country: "France" },
  ES: { svg: "assets/img/flags/ES.svg", country: "Spain" },
  CA: { svg: "assets/img/flags/CA.svg", country: "Canada" },
  TH: { svg: "assets/img/flags/TH.svg", country: "Thailand" },
  AR: { svg: "assets/img/flags/AR.svg", country: "Argentina" },
  DE: { svg: "assets/img/flags/DE.svg", country: "Germany" },
  BR: { svg: "assets/img/flags/BR.svg", country: "Brazil" }
};

const DRIVER_POOL = [
  { name:"Max Verstappen",   number:"1",  team:"Red Bull",      code:"NL", img:"assets/img/drivers/Max.jpg",     gp:"Netherlands Grand Prix" },
  { name:"Yuki Tsunoda",     number:"22", team:"Red Bull",            code:"JP", img:"assets/img/drivers/Yuki.jpg",    gp:"Japan Grand Prix" },
  { name:"Charles Leclerc",  number:"16", team:"Ferrari",       code:"MC", img:"assets/img/drivers/Charles.jpg", gp:"Monaco Grand Prix" },
  { name:"Lewis Hamilton",   number:"44", team:"Ferrari",       code:"GB", img:"assets/img/drivers/Lewis.jpg",   gp:"Qatar Grand Prix" },
  { name:"George Russell",   number:"63", team:"Mercedes",      code:"GB", img:"assets/img/drivers/George.jpg",  gp:"China Grand Prix" },
  { name:"Kimi Antonelli",   number:"12", team:"Mercedes",      code:"IT", img:"assets/img/drivers/Kimi.jpg",    gp:"Italy Grand Prix" },
  { name:"Lando Norris",     number:"4",  team:"McLaren",       code:"GB", img:"assets/img/drivers/Lando.jpg",   gp:"Great Britain Grand Prix" },
  { name:"Oscar Piastri",    number:"81", team:"McLaren",       code:"AUS",img:"assets/img/drivers/Oscar.jpg",   gp:"Australia Grand Prix" },
  { name:"Liam Lawson",      number:"30", team:"RB",            code:"NZ", img:"assets/img/drivers/Liam.jpg",    gp:"Miami Grand Prix" },
  { name:"Isack Hadjar",     number:"6",  team:"RB",            code:"FR", img:"assets/img/drivers/Isack.jpg",   gp:"Las Vegas Grand Prix" },
  { name:"Fernando Alonso",  number:"14", team:"Aston Martin",  code:"ES", img:"assets/img/drivers/Fernando.jpg",gp:"Hugary Grand Prix" },
  { name:"Lance Stroll",     number:"18", team:"Aston Martin",  code:"CA", img:"assets/img/drivers/Lance.jpg",   gp:"Canada Grand Prix" },
  { name:"Alexander Albon",  number:"23", team:"Williams",      code:"TH", img:"assets/img/drivers/ALex.jpg",    gp:"Singapore Grand Prix" },
  { name:"Carlos Sainz",     number:"55", team:"Williams",      code:"ES", img:"assets/img/drivers/Carlos.jpg",  gp:"Spain Grand Prix" },
  { name:"Pierre Gasly",     number:"10", team:"Alpine",        code:"FR", img:"assets/img/drivers/Pierre.jpg",  gp:"Austria Grand Prix" },
  { name:"Franco Colapinto", number:"7",  team:"Alpine",      code:"AR", img:"assets/img/drivers/Franco.jpg",  gp:"Bahrain Grand Prix" },
  { name:"Esteban Ocon",     number:"31", team:"Haas",          code:"FR", img:"assets/img/drivers/Estie.jpg",   gp:"COTA Grand Prix" },
  { name:"Oliver Bearman",   number:"87", team:"Haas",          code:"GB", img:"assets/img/drivers/Ollie.jpg",   gp:"Mexico Grand Prix" },
  { name:"Nico Hülkenberg",  number:"27", team:"Sauber",        code:"DE", img:"assets/img/drivers/Niko.jpg",    gp:"Belgium Grand Prix" },
  { name:"Gabriel Bortoleto",number:"5",  team:"Sauber",        code:"BR", img:"assets/img/drivers/Bortoleto.jpg",gp:"Brazil Grand Prix" }
];

let lastName = "";

function resetLights() { lights.forEach(l => l?.classList.remove("on", "red", "green")); }
function animateLights() { resetLights(); let i = 0; return new Promise(res => { const t = setInterval(() => { if (i < 5) { lights[i].classList.add("on", "red"); i++; } else { clearInterval(t); setTimeout(res, 240); } }, 200); }); }
function goGreen() { lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green"); }); setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 900); }

function pickRandomDriver() {
  if (DRIVER_POOL.length === 0) return null;
  let d = null, tries = 0;
  do { d = DRIVER_POOL[(Math.random() * DRIVER_POOL.length) | 0]; tries++; } while (d && d.name === lastName && tries < 10);
  lastName = d ? d.name : "";
  return d;
}

function clearCard() {
  winCard.style.display = "none";
  winImg.removeAttribute("src");
  winImg.removeAttribute("alt");
  winName.textContent = "";
  winNum.textContent = "";
  winTeam.textContent = "";
  winNat.innerHTML = "";
  winGP.textContent = "";
}

function showWinner(w) {
  if (!w) { winCard.style.display = "none"; return; }
  winCard.style.display = "grid";
  winName.textContent = w.name || "";
  winNum.textContent = w.number ? ("#" + w.number) : "#";
  winTeam.textContent = w.team || "";
  const nat = FLAG_ASSETS[w.code] || null;
  if (nat) {
    winNat.innerHTML = `<img src="${nat.svg}" alt="${w.code}" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px;border-radius:2px"> ${w.code}`;
  } else {
    winNat.textContent = w.code || "";
  }
  winGP.textContent = w.gp || "Grand Prix";
  if (w.img) { winImg.src = w.img; winImg.alt = w.name; }
}

function runSequence() {
  overlay.style.display = "flex";
  clearCard();
  if (window.stopConfetti) window.stopConfetti();
  animateLights().then(() => {
    const w = pickRandomDriver();
    goGreen();
    showWinner(w);
    if (window.startDriverConfettiForTeam) window.startDriverConfettiForTeam(w?.team || "");
    setTimeout(() => { overlay.style.display = "none"; resetLights(); }, 4000);
  });
}

window.runSequence = runSequence;
