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
        ctx.save()
        ctx.globalAlpha = q.a
        ctx.translate(q.x, q.y)
        ctx.rotate(q.rot)
        if (q.type === 'rect') {
          ctx.fillStyle = q.c
          ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h)
        } else if (q.type === 'emoji') {
          ctx.font = (q.s * DPR) + "px Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,system-ui"
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(q.e, 0, 0)
        } else if (q.type === 'image' && q.img && q.img.complete) {
          ctx.drawImage(q.img, -q.s / 2, -q.s / 2, q.s, q.s)
        }
        ctx.restore()
      }
      if (dt < dur) { rafId = requestAnimationFrame(tick) } else { ctx.clearRect(0, 0, W, H); rafId = null }
    }
    rafId = requestAnimationFrame(tick)
  }
  function rectBurst(colors, count, loop, dur) {
    var parts = []
    for (var i = 0; i < count; i++) {
      parts.push({ type: 'rect', x: Math.random() * W, y: -Math.random() * H * 0.5, vx: (Math.random() * 2 - 1) * DPR, vy: (1.6 + Math.random() * 2.2) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * 0.3 - 0.15), w: 6 * DPR, h: 10 * DPR, c: colors[(Math.random() * colors.length) | 0], g: 0.01 * DPR, a: 1, loop: loop })
    }
    run(parts, dur)
  }
  var IMGSRC = { williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp", chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png", mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png", ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png" }
  var IMAGES = {}
  for (var k in IMGSRC) { var img = new Image(); img.src = IMGSRC[k]; IMAGES[k] = img }
  function labeledBurst(colors, labels, count, dur) {
    var parts = []
    for (var i = 0; i < count; i++) {
      var label = labels[(Math.random() * labels.length) | 0]
      var type = 'rect', e = null, im = null, s = 24 * DPR
      if (label === 'KCIMG:williams') { type = 'image'; im = IMAGES.williams }
      else if (label === 'KCIMG:chili') { type = 'image'; im = IMAGES.chili }
      else if (label === 'KCIMG:mclaren') { type = 'image'; im = IMAGES.mclaren }
      else if (label === 'KCIMG:ln4') { type = 'image'; im = IMAGES.ln4 }
      else if (/[\u2190-\u2BFF\u{1F300}-\u{1FAFF}]/u.test(label)) { type = 'emoji'; e = label; s = 22 * DPR }
      parts.push({ type: type, img: im, e: e, s: s, x: Math.random() * W, y: -Math.random() * H * 0.5, vx: (Math.random() * 2 - 1) * 0.8 * DPR, vy: (2 + Math.random() * 2) * DPR, rot: Math.random() * Math.PI, vr: (Math.random() * 0.2 - 0.1), c: colors[(Math.random() * colors.length) | 0], g: 0.01 * DPR, a: 1, loop: true, w: 8 * DPR, h: 8 * DPR })
    }
    run(parts, dur)
  }
  window.startThemedConfetti = function (theme) {
    if (theme === 'carlos') { labeledBurst(['#0f3d91', '#ffffff'], ['KCIMG:williams', 'KCIMG:chili'], 260, 2800) }
    else if (theme === 'lando') { labeledBurst(['#ff8000', '#ffffff', '#0c0c0d'], ['KCIMG:mclaren', 'KCIMG:ln4'], 260, 2800) }
  }
  window.startWinnerConfetti = function (colors) { rectBurst(colors, 240, true, 3000) }
  window.startEmojiConfetti = function () { labeledBurst(['#e07b97', '#6fa387', '#6aa9d8'], ['🏎️', '🫀', '💻'], 240, 2800) }
  window.startEmojiConfettiFast = function () { labeledBurst(['#e07b97', '#6fa387', '#6aa9d8'], ['🏎️', '🫀', '💻'], 280, 2200) }
})();
