const root = document.documentElement;
(function () {
    const saved = localStorage.getItem('kc-theme');
    if (saved) root.setAttribute('data-theme', saved);
    applyBadge(saved || null);
})();
function applyBadge(theme) {
    const badge = document.querySelector('.avatar-badge');
    if (!badge) return;
    const candidates = theme === 'carlos'
        ? ["assets/img/mclogos/Williams_logo.png", "assets/img/Williams_logo.png", "assets/img/williams.png"]
        : theme === 'lando'
            ? ["assets/img/mclogos/mclaren_logo.png", "assets/img/mclaren_logo.png", "assets/img/mclaren.png"]
            : [];
    if (!candidates.length) { badge.style.backgroundImage = ""; badge.replaceChildren(); return }
    let set = false;
    function tryNext(i) {
        if (i >= candidates.length) { if (!set) { badge.style.backgroundImage = ""; badge.replaceChildren() } return }
        const url = candidates[i];
        const img = new Image();
        img.onload = () => { set = true; badge.style.backgroundImage = `url("${url}")`; badge.replaceChildren() };
        img.onerror = () => tryNext(i + 1);
        img.src = url;
    }
    tryNext(0);
}
function setThemeAndConfetti(name) {
    if (name === 'carlos') { root.setAttribute('data-theme', 'carlos'); localStorage.setItem('kc-theme', 'carlos'); applyBadge('carlos'); if (window.startThemedConfetti) startThemedConfetti('carlos') }
    if (name === 'lando') { root.setAttribute('data-theme', 'lando'); localStorage.setItem('kc-theme', 'lando'); applyBadge('lando'); if (window.startThemedConfetti) startThemedConfetti('lando') }
}
function resetTheme() {
    root.removeAttribute('data-theme'); localStorage.removeItem('kc-theme'); applyBadge(null);
    if (window.startEmojiConfetti) startEmojiConfetti()
}
window.setThemeAndConfetti = setThemeAndConfetti;
window.resetTheme = resetTheme;
