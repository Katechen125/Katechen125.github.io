(function () {
  var cvs, ctx, W, H, DPR = Math.max(1, window.devicePixelRatio || 1), rafId = null
  function ensure() { if (cvs) return; cvs = document.createElement('canvas'); cvs.id = 'kc-confetti'; Object.assign(cvs.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999' }); document.body.appendChild(cvs); ctx = cvs.getContext('2d'); resize(); addEventListener('resize', resize) }
  function resize() { cvs.width = Math.floor(innerWidth * DPR); cvs.height = Math.floor(innerHeight * DPR); W = cvs.width; H = cvs.height }
  function run(parts, dur) {
    ensure()
    if (rafId) cancelAnimationFrame(rafId)
    var start = performance.now()
    function tick(t) {
      var dt = t - start
      ctx.clearRect(0, 0, W, H)
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]
        p.vy += p.g
        p.x += p.vx; p.y += p.vy; p.rot += p.vr
        if (p.loop && p.y > H + 40 * DPR) { p.y = -20 * DPR; p.x = Math.random() * W }
      }
      for (var j = 0; j < parts.length; j++) {
        var q = parts[j]
        ctx.save(); ctx.globalAlpha = q.a; ctx.translate(q.x, q.y); ctx.rotate(q.rot)
        if (q.type === 'rect') { ctx.fillStyle = q.c; ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h) }
        else if (q.type === 'emoji') { ctx.font = (q.s * DPR) + "px Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,system-ui"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(q.e, 0, 0) }
        else if (q.type === 'image' && q.img && q.img.complete) { ctx.drawImage(q.img, -q.s / 2, -q.s / 2, q.s, q.s) }
        ctx.restore()
      }
      if (dt < dur) { rafId = requestAnimationFrame(tick) } else { ctx.clearRect(0, 0, W, H); rafId = null }
    }
    rafId = requestAnimationFrame(tick)
  }
  function makeRect(colors, count, loop) {
    var arr = []
    for (var i = 0; i < count; i++) {
      arr.push({ type: 'rect', x: Math.random() * W, y: -Math.random() * H * 0.5, vx: (Math.random() * 2 - 1) * 0.9 * DPR, vy: (2 + Math.random() * 2.2) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * 0.3 - 0.15), w: 7 * DPR, h: 11 * DPR, c: colors[(Math.random() * colors.length) | 0], g: 0.012 * DPR, a: 1, loop: loop })
    }
    return arr
  }
  var IMGSRC = { williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp", chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png", mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png", ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png" }
  var IMAGES = {}
  for (var k in IMGSRC) { var img = new Image(); img.src = IMGSRC[k]; IMAGES[k] = img }
  function makeLabeled(colors, labels, count, loop) {
    var arr = []
    for (var i = 0; i < count; i++) {
      var label = labels[(Math.random() * labels.length) | 0], type = 'rect', e = null, im = null, s = 22 * DPR
      if (label === 'KCIMG:williams') { type = 'image'; im = IMAGES.williams }
      else if (label === 'KCIMG:chili') { type = 'image'; im = IMAGES.chili }
      else if (label === 'KCIMG:mclaren') { type = 'image'; im = IMAGES.mclaren }
      else if (label === 'KCIMG:ln4') { type = 'image'; im = IMAGES.ln4 }
      else { type = 'emoji'; e = label }
      arr.push({ type: type, img: im, e: e, s: s, x: Math.random() * W, y: -Math.random() * H * 0.5, vx: (Math.random() * 2 - 1) * 0.9 * DPR, vy: (2 + Math.random() * 2.2) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * 0.28 - 0.14), c: colors[(Math.random() * colors.length) | 0], g: 0.012 * DPR, a: 1, loop: loop, w: 8 * DPR, h: 8 * DPR })
    }
    return arr
  }
  function unifiedRun(parts) { run(parts, 2600) }
  window.startThemedConfetti = function (theme) {
    if (theme === 'carlos') { unifiedRun(makeLabeled(['#0f3d91', '#ffffff'], ['KCIMG:williams', 'KCIMG:chili'], 260, true)) }
    else if (theme === 'lando') { unifiedRun(makeLabeled(['#ff8000', '#ffffff', '#0c0c0d'], ['KCIMG:mclaren', 'KCIMG:ln4'], 260, true)) }
  }
  window.startWinnerConfetti = function (colors) { unifiedRun(makeRect(colors, 240, true)) }
  window.startEmojiConfettiUnified = function () { unifiedRun(makeLabeled(['#e07b97', '#6fa387', '#6aa9d8'], ['🏎️', '🫀', '💻'], 260, true)) }
})();
