/* cursor.js — context-aware cursor + magnetic elements (fine pointers only) */
window.Cursor = {
  init() {
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;
    const c = document.createElement('div');
    c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span></span>';
    document.body.appendChild(c); document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * (reduce ? 1 : 0.2); cy += (y - cy) * (reduce ? 1 : 0.2);
      c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => {
      const v = e.target.closest('[data-cursor]');
      const l = e.target.closest('a, button');
      c.classList.toggle('is-view', !!v);
      c.classList.toggle('is-link', !v && !!l);
      c.querySelector('span').textContent = v ? v.dataset.cursor : '';
    });
    document.addEventListener('pointerleave', () => (c.style.opacity = 0));
    document.addEventListener('pointerenter', () => (c.style.opacity = 1));

    if (reduce) return;
    document.querySelectorAll('.magnetic').forEach(m => {
      m.addEventListener('pointermove', e => {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
      });
      m.addEventListener('pointerleave', () => (m.style.transform = ''));
    });
  },
};
