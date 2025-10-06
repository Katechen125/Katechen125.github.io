(function(global){
  const Confetti = {};
  let canvas, ctx, W=0, H=0, DPR=1, rafId=null;

  const logos = {};
  const logoFiles = {
    williams: "https://brandlogo.org/wp-content/uploads/2025/02/Williams-Racing-Icon-2020.png.webp",
    chili: "https://cdn.inspireuplift.com/uploads/images/seller_products/29868/1702918490_SmoothOperatorCarlosSainzChillionly.png",
    mclaren: "https://img.icons8.com/m_sharp/512/FD7E14/mclaren.png",
    ln4: "https://images.seeklogo.com/logo-png/44/2/lando-norris-logo-png_seeklogo-445536.png"
  };
  for (const k in logoFiles){ logos[k]=new Image(); logos[k].src=logoFiles[k]; }

  function size(){
    if(!canvas) return;
    DPR = Math.max(1, window.devicePixelRatio || 1);
    W = canvas.width  = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
  }

  function runConfetti(opts){
    const {
      colors=['#ddd'],
      labels=[],        
      useImages=false,  
      durationMs=2800,
      fadeMs=800,
      imgSize=24,
      textPx=16
    } = opts || {};

    if (rafId) cancelAnimationFrame(rafId);

    const N = 320;
    const parts = [];
    const start = performance.now();

    for (let i=0;i<N;i++){
      parts.push({
        x: Math.random()*W,
        y: -Math.random()*H*0.6,
        vx: (Math.random()*2-1)*0.8*DPR,
        vy: (2+Math.random()*2)*DPR,
        rot: Math.random()*Math.PI,
        vr: (Math.random()*0.2 - 0.1),
        color: colors[(Math.random()*colors.length)|0],
        label: labels.length ? labels[(Math.random()*labels.length)|0] : null,
        useImage: useImages
      });
    }

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const clamp01 = v => Math.max(0, Math.min(1, v));

    function tick(t){
      const elapsed = t - start;
      const remaining = Math.max(0, durationMs - elapsed);
      const fadeProgress = 1 - clamp01(remaining / fadeMs);
      const alpha = 1 - easeOutCubic(fadeProgress);

      ctx.clearRect(0,0,W,H);

      parts.forEach(p=>{
        const damp = 1 - 0.12 * fadeProgress;
        p.vy += 0.01 * DPR;
        p.vx *= damp; p.vy *= damp; p.rot += p.vr * damp;
        p.x += p.vx;  p.y += p.vy;
      });

      parts.forEach(p=>{
        if (p.y > H + 40*DPR){ p.y = -20*DPR; p.x = Math.random()*W; }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.useImage && p.label && logos[p.label] && logos[p.label].complete){
          const s = imgSize * DPR;
          ctx.drawImage(logos[p.label], -s/2, -s/2, s, s);
        } else if (!p.useImage && p.label){
          ctx.font = (textPx * DPR) + "px Playfair Display, serif";
          ctx.fillStyle = p.color;
          const w = ctx.measureText(p.label).width;
          ctx.fillText(p.label, -w/2, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-4, -4, 8, 8);
        }
        ctx.restore();
      });

      if (elapsed < durationMs){
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0,0,W,H);
        ctx.globalAlpha = 1;
        rafId = null;
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function setTheme(name){
    const root = document.documentElement;
    if (name === 'carlos'){
      root.setAttribute('data-theme','carlos');
      runConfetti({
        colors:['#0f3d91','#ffffff'],
        labels:['williams','chili'],
        useImages:true,
        durationMs:3000,
        imgSize:22
      });
    } else if (name === 'lando'){
      root.setAttribute('data-theme','lando');
      runConfetti({
        colors:['#ff8000','#0c0c0d','#ffffff'],
        labels:['mclaren','ln4'],
        useImages:true,
        durationMs:3000,
        imgSize:22
      });
    }
  }

  function resetTheme(){
    document.documentElement.removeAttribute('data-theme');
    runConfetti({
      colors:['#e07b97','#6fa387','#6aa9d8'],
      labels:['🫀','🏎️','💻'],
      useImages:false,
      durationMs:2600,
      textPx:18
    });
  }


  function sequence(){
    startLights().then(wavingFlag);
  }

  function startLights(){
    return new Promise((resolve)=>{

      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position:'fixed', inset:'0', zIndex:30, display:'grid', placeItems:'center',
        background:'rgba(0,0,0,.35)'
        });
      const wrap = document.createElement('div');
      Object.assign(wrap.style, {display:'flex', gap:'10px'});
      const lights = Array.from({length:5}, ()=> {
        const d=document.createElement('div');
        Object.assign(d.style,{width:'32px',height:'32px',borderRadius:'50%',background:'#b70000',boxShadow:'0 0 14px rgba(255,0,0,.6) inset, 0 0 10px rgba(255,0,0,.5)'});
        return d;
      });
      lights.forEach(l=>wrap.appendChild(l));
      overlay.appendChild(wrap);
      document.body.appendChild(overlay);

      let i=0;
      const redTick = setInterval(()=>{
        if (i<lights.length){ lights[i].style.filter='brightness(1.2)'; i++; }
        else { clearInterval(redTick);

          lights.forEach(l=>{
            l.style.background='#0dbb3d';
            l.style.boxShadow='0 0 14px rgba(13,187,61,.6) inset, 0 0 10px rgba(13,187,61,.5)';
          });
          setTimeout(()=>{ document.body.removeChild(overlay); resolve(); }, 600);
        }
      }, 300);
    });
  }

  function wavingFlag(){

    runConfetti({ colors:['#111','#fff'], labels:[], useImages:false, durationMs:1800 });

    const flag = document.createElement('canvas');
    Object.assign(flag.style,{
      position:'fixed', left:'50%', top:'18%', transform:'translateX(-50%)',
      width:'220px', height:'140px', zIndex:25, pointerEvents:'none'
    });
    document.body.appendChild(flag);

    const fctx = flag.getContext('2d');
    const FW = flag.width = 440; 
    const FH = flag.height = 280;

    let t0 = performance.now();
    function draw(t){
      const elapsed = (t - t0)/1000;
      fctx.clearRect(0,0,FW,FH);

      fctx.fillStyle = '#444'; fctx.fillRect(12, 0, 10, FH);

      const cols=10, rows=8, cellW=36, cellH=28;
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const phase = (c/cols)*Math.PI*2 + elapsed*2.2;
          const yOff = Math.sin(phase) * 8 * (1 + r/rows*0.8);
          const x = 28 + c*cellW;
          const y = 16 + r*cellH + yOff;
          fctx.fillStyle = ((r+c)%2===0) ? '#000' : '#fff';
          fctx.fillRect(x, y, cellW, cellH);
        }
      }

      if (elapsed < 2.6) requestAnimationFrame(draw);
      else document.body.removeChild(flag);
    }
    requestAnimationFrame(draw);
  }

  Confetti.init = function(canvasId){
    canvas = document.getElementById(canvasId);
    if (!canvas){ console.warn('Confetti canvas not found'); return; }
    ctx = canvas.getContext('2d');
    size(); addEventListener('resize', size);
  };
  Confetti.carlos = ()=> setTheme('carlos');
  Confetti.lando  = ()=> setTheme('lando');
  Confetti.reset  = ()=> resetTheme();
  Confetti.sequence = ()=> sequence();

  global.Confetti = Confetti;
})(window);
