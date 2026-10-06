/* scroll.js — reveals, word-by-word statement, parallax, counters, direction */
window.ScrollFX = {
  init() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* reveals */
    /* clipped elements report no intersection of their own, so their parent is observed instead */
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { (e.target._revealTarget || e.target).classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal, .reveal-x, .stagger').forEach(el => io.observe(el));
    document.querySelectorAll('.reveal-clip').forEach(el => { const p = el.parentElement; p._revealTarget = el; io.observe(p); });

    /* statement: words light up as the reader moves through it */
    const blocks = [...document.querySelectorAll('.words')];
    blocks.forEach(b => {
      b.querySelectorAll('.line').forEach(line => {
        const nodes = [...line.childNodes];
        line.textContent = '';
        nodes.forEach(n => {
          if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) line.append(t);
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; line.append(s); }
          });
          else { n.classList.add('w'); line.append(n); }
        });
      });
    });
    const lightWords = () => blocks.forEach(b => {
      const r = b.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const ws = b.querySelectorAll('.w');
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });

    /* parallax */
    const par = [...document.querySelectorAll('[data-speed]')];
    const parallax = () => par.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const d = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed);
      el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
    });

    let ticking = false;
    const frame = () => { lightWords(); if (!reduce) parallax(); ticking = false; };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', frame);
    frame();

    /* counters */
    const fmt = new Intl.NumberFormat('en-US');
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = parseFloat(el.dataset.count), dur = reduce ? 1 : 1600, t0 = performance.now();
      const step = t => {
        const k = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - k, 4);
        el.firstChild.nodeValue = fmt.format(Math.round(end * eased));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step); cio.unobserve(el);
    }), { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => { if (!el.firstChild || el.firstChild.nodeType !== 3) el.prepend(document.createTextNode('0')); else if (!reduce) el.firstChild.nodeValue = '0'; cio.observe(el); });
  },
};
