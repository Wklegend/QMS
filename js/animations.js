/* animations.js — generative art: mashrabiya light (hero), project compositions,
   service previews, orthographic globe. No libraries. */
window.Art = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* ---------- hero: light passing through an abstract mashrabiya ---------- */
  function hero(cv) {
    const ctx = cv.getContext('2d');
    const ink = cv.dataset.ink || css('--color-ink'), acc = css('--color-accent');
    let w, h, s, dpr, L = { x: 0, y: 0 }, T = { x: 0, y: 0 }, t = 0, run = true, pointer = false;
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = Math.max(58, Math.min(110, w / 14));
    };
    const star = (x, y, r) => {
      ctx.beginPath();
      for (let k = 0; k < 2; k++) {
        const a0 = k * Math.PI / 4;
        for (let i = 0; i <= 4; i++) { const a = a0 + i * Math.PI / 2; const px = x + r * Math.cos(a), py = y + r * Math.sin(a); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      }
      ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!pointer) { T.x = w * (0.28 + 0.12 * Math.sin(t * 0.00021)); T.y = h * (0.42 + 0.16 * Math.sin(t * 0.00033 + 1)); }
      L.x += (T.x - L.x) * 0.04; L.y += (T.y - L.y) * 0.04;
      const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, Math.max(w, h) * 0.45);
      g.addColorStop(0, hexA(acc, .16)); g.addColorStop(1, hexA(acc, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const sig = Math.max(w, h) * 0.16;
      const rtlFade = x => { const u = x / w; return w < 700 ? 0.32 * Math.max(0, 1 - u * 0.5) : Math.max(0, Math.min(1, (0.78 - u) / 0.5)); };
      ctx.lineWidth = 1;
      for (let y = s / 2, row = 0; y < h + s; y += s * 0.86, row++) {
        for (let x = (row % 2 ? s : s / 2); x < w + s; x += s) {
          const dx = x - L.x, dy = y - L.y, d2 = dx * dx + dy * dy;
          const k = Math.exp(-d2 / (2 * sig * sig));
          const fade = rtlFade(x);                           // lattice thins toward the reading start (right), where the type lives
          if (fade < 0.02) continue;
          const shift = k * 6;                              // shadow drift away from the light
          ctx.strokeStyle = k > 0.55 ? hexA(acc, (0.18 + k * 0.5) * fade) : hexA(ink, (0.025 + k * 0.16) * fade);
          star(x + (dx / Math.sqrt(d2 + 1)) * shift, y + (dy / Math.sqrt(d2 + 1)) * shift, s * 0.34);
        }
      }
    };
    const loop = ts => { t = ts; if (run) draw(); if (!reduce) requestAnimationFrame(loop); };
    size(); L.x = T.x = w * .3; L.y = T.y = h * .45; draw();
    addEventListener('resize', () => { size(); draw(); });
    const host = cv.parentElement;
    host.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); pointer = true; T.x = e.clientX - r.left; T.y = e.clientY - r.top; });
    host.addEventListener('pointerleave', () => (pointer = false));
    new IntersectionObserver(([e]) => (run = e.isIntersecting)).observe(cv);
    if (!reduce) requestAnimationFrame(loop);
  }
  function hexA(c, a) {
    c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a.toFixed(3)})`;
  }

  /* ---------- project compositions (SVG, deterministic) ---------- */
  const ART = {
    arches(acc, ink, bg) {           // receding pointed arches — architecture in perspective
      let p = '';
      for (let i = 0; i < 9; i++) {
        const k = 1 - i * 0.095, cx = 800, w = 520 * k, h = 760 * k, y0 = 900 - (1 - k) * 260;
        const x0 = cx - w / 2, x1 = cx + w / 2, top = y0 - h;
        const d = `M${x0} ${y0} V${top + w * .55} Q${x0} ${top + w * .12} ${cx} ${top} Q${x1} ${top + w * .12} ${x1} ${top + w * .55} V${y0}`;
        p += `<path d="${d}" fill="none" stroke="${i === 3 ? acc : bg}" stroke-opacity="${i === 3 ? 1 : 0.18 + i * 0.07}" stroke-width="${i === 3 ? 3 : 1.5}"/>`;
      }
      return `<rect width="1600" height="900" fill="${ink}"/><rect x="0" y="880" width="1600" height="20" fill="${acc}" opacity=".9"/>${p}`;
    },
    grid(acc, ink, bg) {             // muqarnas-like stepped cells
      const r = rnd(7); let p = '';
      for (let y = 0; y < 900; y += 60) for (let x = 0; x < 1600; x += 60) {
        const v = r(); const o = (Math.sin(x / 260) + Math.cos(y / 180)) * 0.25 + 0.3;
        if (v < o) p += `<rect x="${x + 6}" y="${y + 6}" width="48" height="48" fill="${v < 0.035 ? acc : bg}" opacity="${v < 0.035 ? 1 : (0.08 + v * 0.5).toFixed(2)}"/>`;
      }
      return `<rect width="1600" height="900" fill="${ink}"/>${p}`;
    },
    orbit(acc, ink, bg) {            // concentric rhythm + one calligraphic sweep
      let p = '';
      for (let i = 1; i < 16; i++) p += `<circle cx="1050" cy="450" r="${i * 46}" fill="none" stroke="${ink}" stroke-opacity="${(0.05 + i * 0.012).toFixed(3)}"/>`;
      p += `<path d="M180 640 C 520 120, 900 860, 1420 260" fill="none" stroke="${acc}" stroke-width="22" stroke-linecap="round"/>`;
      p += `<circle cx="1420" cy="260" r="14" fill="${ink}"/>`;
      return `<rect width="1600" height="900" fill="${bg}"/>${p}`;
    },
    dunes(acc, ink, bg) {            // desert rhythm as layered bands
      let p = ''; const n = 9;
      for (let i = 0; i < n; i++) {
        const y = 300 + i * 70, a = 40 + i * 6, f = 0.004 + i * 0.0006;
        let d = `M0 ${y}`; for (let x = 0; x <= 1600; x += 40) d += ` L${x} ${(y + Math.sin(x * f + i) * a).toFixed(1)}`;
        d += ' L1600 900 L0 900Z';
        p += `<path d="${d}" fill="${i === 4 ? acc : ink}" opacity="${i === 4 ? 1 : (0.1 + i * 0.1).toFixed(2)}"/>`;
      }
      return `<rect width="1600" height="900" fill="${bg}"/>${p}`;
    },
    kufic(acc, ink, bg) {            // square-kufic-like block rhythm (abstract, not text)
      const r = rnd(19); let p = ''; const u = 50;
      for (let y = 100; y < 800; y += u) for (let x = 100; x < 1500; x += u) {
        const edge = ((x / u) % 4 === 0) || ((y / u) % 3 === 0);
        if (edge && r() > 0.22) p += `<rect x="${x}" y="${y}" width="${u - 4}" height="${u - 4}" fill="${r() > 0.97 ? acc : bg}"/>`;
      }
      return `<rect width="1600" height="900" fill="${ink}"/>${p}`;
    },
  };
  function arts() {
    const acc = css('--color-accent'), ink = css('--color-ink'), bg = css('--color-bg');
    document.querySelectorAll('[data-art]').forEach(el => {
      const f = ART[el.dataset.art]; if (!f) return;
      el.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label="${el.dataset.label || ''}">${f(acc, ink, bg)}</svg>`;
    });
  }

  /* ---------- service preview following the pointer ---------- */
  function services() {
    const list = document.querySelector('.services'); if (!list || !matchMedia('(hover:hover)').matches) return;
    const fl = document.createElement('div'); fl.className = 'svc-float'; fl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fl);
    let x = 0, y = 0, cx = 0, cy = 0;
    list.addEventListener('pointermove', e => { x = e.clientX - 160; y = e.clientY; });
    list.querySelectorAll('.service').forEach(s => {
      s.addEventListener('pointerenter', () => {
        const a = ART[s.dataset.preview]; if (!a) return;
        fl.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">${a(css('--color-accent'), css('--color-ink'), css('--color-bg'))}</svg>`;
        fl.classList.add('on');
      });
      s.addEventListener('pointerleave', () => fl.classList.remove('on'));
    });
    const loop = () => { cx += (x - cx) * .14; cy += (y - cy) * .14; fl.style.left = cx + 'px'; fl.style.top = cy + 'px'; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- orthographic globe ---------- */
  function globe(wrap) {
    const cities = JSON.parse(document.getElementById(wrap.dataset.cities).textContent);
    const card = wrap.querySelector('.city-card');
    const R = 300, C = 320, zoom = parseFloat(wrap.dataset.zoom || 1), step = parseFloat(wrap.dataset.step || 15);
    let lon0 = parseFloat(wrap.dataset.lon || 30), lat0 = parseFloat(wrap.dataset.lat || 22), spin = !reduce && wrap.dataset.spin !== 'off', hover = false;
    const svg = wrap.querySelector('svg');
    const rad = Math.PI / 180;
    const proj = (lat, lon) => {
      const φ = lat * rad, λ = (lon - lon0) * rad, φ0 = lat0 * rad;
      const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ);
      const x = R * zoom * Math.cos(φ) * Math.sin(λ);
      const y = R * zoom * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ));
      return { x: C + x, y: C - y, v: cosc > 0 && Math.hypot(x, y) < R + 1 };
    };
    const line = pts => { let d = '', pen = false; pts.forEach(p => { if (p.v) { d += (pen ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); pen = true; } else pen = false; }); return d; };
    const render = () => {
      let g = '';
      for (let lon = -180; lon < 180; lon += step) { const pts = []; for (let lat = -90; lat <= 90; lat += 2) pts.push(proj(lat, lon)); g += `<path class="meridian" d="${line(pts)}"/>`; }
      for (let lat = -90 + step; lat < 90; lat += step) { const pts = []; for (let lon = -180; lon <= 180; lon += 2) pts.push(proj(lat, lon)); g += `<path class="meridian" d="${line(pts)}"/>`; }
      let dots = '';
      cities.forEach((c, i) => { const p = proj(c.lat, c.lon); if (!p.v) return;
        const r = 4 + (c.weight || 1) * 1.6;
        dots += `<g class="city" tabindex="0" data-i="${i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" aria-label="${c.name} — ${c.country}"><circle class="halo" r="${r}"/><circle class="core" r="${r * 0.6}"/></g>`; });
      svg.innerHTML = `<defs><radialGradient id="gl" cx="40%" cy="35%"><stop offset="0" stop-color="rgba(245,242,234,.10)"/><stop offset="1" stop-color="rgba(245,242,234,0)"/></radialGradient></defs><circle cx="${C}" cy="${C}" r="${R}" fill="url(#gl)" stroke="rgba(245,242,234,.22)"/>${g}${dots}`;
    };
    svg.setAttribute('viewBox', '0 0 640 640');
    render();
    const show = g => {
      const c = cities[g.dataset.i], b = g.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      card.innerHTML = `<b>${c.name}</b>${c.country}<br><span style="color:var(--color-muted)">${c.info}</span>`;
      card.style.left = Math.min(w.width - 220, Math.max(0, b.left - w.left + 16)) + 'px'; card.style.top = (b.top - w.top + 16) + 'px';
      card.classList.add('on');
    };
    svg.addEventListener('pointerover', e => { const g = e.target.closest('.city'); if (g) { hover = true; show(g); } });
    svg.addEventListener('pointerout', e => { if (e.target.closest('.city')) { hover = false; card.classList.remove('on'); } });
    svg.addEventListener('focusin', e => { const g = e.target.closest('.city'); if (g) { hover = true; show(g); } });
    svg.addEventListener('focusout', () => { hover = false; card.classList.remove('on'); });
    let vis = false; new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(wrap);
    const base = lon0;
    const loop = t => { if (spin && vis && !hover) { lon0 = base + Math.sin(t * 0.00012) * (parseFloat(wrap.dataset.sway || 18)); render(); } requestAnimationFrame(loop); };
    if (spin) requestAnimationFrame(loop);
  }

  return {
    init() {
      document.querySelectorAll('.hero-canvas').forEach(hero);
      arts();
      services();
      document.querySelectorAll('.globe-wrap').forEach(globe);
      /* CTA: section warms to the accent while the link is hovered */
      document.querySelectorAll('.cta-link').forEach(a => {
        const s = a.closest('.cta');
        a.addEventListener('pointerenter', () => s.classList.add('is-hover'));
        a.addEventListener('pointerleave', () => s.classList.remove('is-hover'));
      });
    },
  };
})();
