const root = document.documentElement;
(function () { const saved = localStorage.getItem("kc-theme"); if (saved) { root.setAttribute("data-theme", saved); } })();
function setThemeAndConfetti(name) {
    if (name === "carlos") { root.setAttribute("data-theme", "carlos"); localStorage.setItem("kc-theme", "carlos"); if (window.startThemedConfetti) startThemedConfetti("carlos"); }
    if (name === "lando") { root.setAttribute("data-theme", "lando"); localStorage.setItem("kc-theme", "lando"); if (window.startThemedConfetti) startThemedConfetti("lando"); }
}
function resetTheme() { root.removeAttribute("data-theme"); localStorage.removeItem("kc-theme"); if (window.startEmojiConfetti) startEmojiConfetti(); }
window.setThemeAndConfetti = setThemeAndConfetti;
window.resetTheme = resetTheme;
