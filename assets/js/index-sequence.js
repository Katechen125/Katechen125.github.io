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
function flagFromCC(cc) { if (!cc) return "🏁"; const c = cc.toUpperCase(); if (c.length !== 2) return "🏁"; const A = 0x1F1E6, a = "A".charCodeAt(0); return String.fromCodePoint(A + (c.charCodeAt(0) - a), A + (c.charCodeAt(1) - a)) }
async function getLatestWinner() {
  try {
    const r = await fetch(`data/latest.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j || !j.name) return null;
    const img = (window.DRIVER_IMAGES && window.DRIVER_IMAGES[j.name]?.img) || "";
    return { name: j.name, number: String(j.number || ""), team: j.team || "", gp: j.gp || "Grand Prix", flag: flagFromCC(j.flag_cc || ""), img };
  } catch { return null }
}
function showWinner(w) {
  winCard.style.display = "grid";
  const name = w?.name || "";
  const num = w?.number ? ("#" + w.number) : "#";
  const team = w?.team || "";
  const flag = w?.flag || "";
  const gp = w?.gp || "";
  winName.textContent = name;
  winNum.textContent = num;
  winTeam.textContent = team;
  winNat.textContent = flag;
  winGP.textContent = gp + (team ? " • " + team : "");
  if (w?.img) { winImg.src = w.img; winImg.alt = name }
}
function runSequence() {
  overlay.style.display = "flex";
  animateLights().then(async () => {
    const w = await getLatestWinner();
    goGreen();
    if (window.startNormalConfetti) startNormalConfetti();
    showWinner(w);
    setTimeout(() => { overlay.style.display = "none"; resetLights() }, 1500);
  })
}
window.runSequence = runSequence;
