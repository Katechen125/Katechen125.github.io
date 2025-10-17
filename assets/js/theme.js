const root = document.documentElement;

(function () {
    const saved = localStorage.getItem('kc-theme');
    if (saved) root.setAttribute('data-theme', saved);
})();

function setThemeAndConfetti(name) {
    if (!name) return;
    root.setAttribute('data-theme', name);
    localStorage.setItem('kc-theme', name);
    if (window.startThemedConfetti) window.startThemedConfetti(name);
}

function resetTheme() {
    root.removeAttribute('data-theme');
    localStorage.removeItem('kc-theme');
    if (window.startResetConfetti) window.startResetConfetti();
}

window.setThemeAndConfetti = setThemeAndConfetti;
window.resetTheme = resetTheme;
