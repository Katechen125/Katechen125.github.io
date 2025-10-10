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

function animateLights() {
  resetLights();
  let i = 0;
  return new Promise(res => {
    const t = setInterval(() => {
      if (i < 5) { lights[i].classList.add("on", "red"); i++; }
      else { clearInterval(t); setTimeout(res, 260); }
    }, 220);
  });
}

function goGreen() {
  lights.forEach(l => { l.classList.remove("red"); l.classList.add("on", "green"); });
  setTimeout(() => lights.forEach(l => l.classList.remove("on", "green")), 900);
}

function flagFromCC(cc) {
  if (!cc) return "🏁";
  const c = cc.toUpperCase(); if (c.length !== 2) return "🏁";
  const A = 0x1F1E6, a = "A".charCodeAt(0);
  return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a));
}

async function getLatestWinner() {
  const r = await fetch(`data/latest.json?ts=${Date.now()}`, { cache: "no-store" }).catch(() => null);
  if (!r || !r.ok) return null;
  const j = await r.json().catch(() => null);
  if (!j) return null;

  const name = j.name || j.driver || j.winner || "";
  if (!name) return null;

  const number = String(j.number ?? j.driver_number ?? j.no ?? "");
  const team = j.team || j.constructor || j.car || "";
  const gp = j.gp || j.grand_prix || j.event || "Grand Prix";
  const flag = flagFromCC(j.flag_cc || j.country_code || j.nat_cc || "");
  const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[name]?.img) || "";

  return { name, number, team, gp, flag, img };
}

function showWinner(w) {
  if (!w) { winCard.style.display = "none"; return; }
  winCard.style.display = "grid";
  winName.textContent = w.name || "";
  winNum.textContent = w.number ? ("#" + w.number) : "#";
  winTeam.textContent = w.team || "";
  winNat.textContent = w.flag || "";
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
    setTimeout(() => { overlay.style.display = "none"; resetLights(); }, 1600);
  });
}
window.runSequence = runSequence;
