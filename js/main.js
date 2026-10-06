/* main.js — header, menu, language, page intro; boots the other modules */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: transparent → glass, hides on scroll down, returns on scroll up */
  const header = document.querySelector('.site-header');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (!root.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > 520 && y > lastY + 4);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    root.classList.toggle('scroll-up', y < lastY);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* header colour over dark spreads */
  const darks = [...document.querySelectorAll('[data-dark]')];
  if (darks.length) {
    const check = () => {
      const probe = 40;
      const over = darks.some(s => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
      header.classList.toggle('on-dark', over);
    };
    addEventListener('scroll', check, { passive: true }); check();
  }

  /* full-screen menu */
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const setMenu = open => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('span').textContent = open ? 'إغلاق' : 'القائمة';
    menu.toggleAttribute('inert', !open);
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  };
  btn?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  menu?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); btn.focus(); } });
  menu?.setAttribute('inert', '');

  /* language switch — the English edition is not published yet */
  document.querySelectorAll('[data-lang-en]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault(); toast('النسخة الإنجليزية قيد الإعداد');
  }));

  /* year */
  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* copy e-mail */
  document.querySelectorAll('[data-copy]').forEach(el => el.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(el.dataset.copy); toast('نُسخ البريد'); }
    catch { const r = document.createRange(); r.selectNodeContents(el); getSelection().removeAllRanges(); getSelection().addRange(r); }
  }));

  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2400);
  }
  window.SiteToast = toast;

  /* intro: reveal once fonts are ready (or after a short ceiling) */
  const ready = () => root.classList.add('is-loaded');
  if (reduce) ready();
  else Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(ready));

  window.Cursor?.init();
  window.ScrollFX?.init();
  window.Art?.init();
})();
