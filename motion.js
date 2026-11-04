// 명세의 로더·등장·부드러운 스크롤·팔레트 서랍. 장면(gravity.js)과는 이벤트로만 이어져요.
(function () {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(0.16,1,0.3,1)';

  // 스프링(질량 1)을 따라가며 linear() 곡선을 만들어요. 지원하지 않는 브라우저는 EASE로.
  function spring(stiffness, damping) {
    let x = 0, v = 0; const dt = 1 / 120, pts = [];
    for (let t = 0; t < 3; t += dt) { v += (stiffness * (1 - x) - damping * v) * dt; x += v * dt; pts.push(x); if (t > 0.3 && Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.001) break; }
    const step = Math.max(1, Math.floor(pts.length / 40)), out = [0];
    for (let i = step; i < pts.length; i += step) out.push(+pts[i].toFixed(4));
    out.push(1);
    const easing = 'linear(' + out.join(',') + ')';
    return { easing: CSS.supports('transition-timing-function', easing) ? easing : EASE, duration: Math.round(pts.length * dt * 1000) };
  }

  /* ── 로더 ── */
  const loader = document.getElementById('g-loader');
  let ready = false;
  addEventListener('gravity:ready', () => { ready = true; });
  setTimeout(() => { ready = true; }, 4000); // 장면을 못 불러와도 페이지는 열려요
  const start = () => { window.__gravityStarted = true; dispatchEvent(new Event('gravity:start')); root.classList.add('g-go'); setTimeout(() => root.classList.remove('g-pre'), 1600); };

  if (loader && root.classList.contains('g-pre')) {
    const fill = document.getElementById('g-l-fill'), count = document.getElementById('g-l-count'), status = document.getElementById('g-l-status');
    const sp = spring(90, 15);
    [...loader.querySelector('.g-loader-col').children].forEach((el, i) => {
      el.animate([{ opacity: 0, transform: 'translateY(18px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: sp.duration, easing: sp.easing, delay: 100 + i * 160, fill: 'forwards' });
    });
    let value = 0, last = performance.now(), leaving = false;
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!ready) value += (92 - value) * 1.7 * dt;
      else { value += (100 - value) * 6 * dt; if (value >= 99.4) value = 100; }
      fill.style.width = value + '%';
      count.textContent = String(Math.round(value)).padStart(3, '0') + '%';
      status.textContent = value < 100 ? 'Calibrating gravity field' : 'Entering orbit';
      if (value >= 99.9 && ready && !leaving) {
        leaving = true;
        setTimeout(() => loader.classList.add('leaving'), 140);
        setTimeout(() => { loader.remove(); start(); }, 140 + 520);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else {
    if (loader) loader.remove();
    start();
  }

  /* ── 흐림이 걷히는 등장: 45% 보이면 한 번 ── */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('g-shown'); io.unobserve(e.target); } }), { threshold: 0.45 });
  document.querySelectorAll('.g-reveal, .g-reveal-up').forEach(el => io.observe(el));

  /* ── 명세 밖: 네 구역을 지나면 머리말에 유리 막대 ── */
  const header = document.getElementById('nav'), release = document.getElementById('g-release');
  const solid = () => { if (header && release) header.classList.toggle('g-solid', release.getBoundingClientRect().bottom < 90); };
  addEventListener('scroll', solid, { passive: true }); solid();

  /* ── 팔레트 서랍 ── */
  const drawer = document.getElementById('g-drawer'), scrim = document.getElementById('g-scrim'), openBtn = document.getElementById('g-open'), closeBtn = document.getElementById('g-close');
  let anim = null, isOpen = false;
  const sd = spring(220, 28);
  function setDrawer(open) {
    if (!drawer || open === isOpen) return; isOpen = open;
    if (open) { drawer.hidden = false; scrim.hidden = false; }
    const from = getComputedStyle(drawer).transform; // 움직이는 중이면 지금 자리에서 이어요
    requestAnimationFrame(() => scrim.classList.toggle('open', open));
    anim?.cancel();
    anim = drawer.animate([{ transform: from === 'none' ? 'translateX(0)' : from }, { transform: open ? 'translateX(0)' : 'translateX(100%)' }],
      { duration: reduce ? 1 : sd.duration, easing: sd.easing, fill: 'forwards' });
    openBtn?.setAttribute('aria-expanded', String(open));
    if (open) { root.classList.add('g-drawer-open'); (drawer.querySelector('[aria-checked="true"]') || closeBtn)?.focus({ preventScroll: true }); }
    else { root.classList.remove('g-drawer-open'); anim.onfinish = () => { if (!isOpen) { drawer.hidden = true; scrim.hidden = true; } }; openBtn?.focus({ preventScroll: true }); }
  }
  openBtn?.addEventListener('click', () => setDrawer(true));
  closeBtn?.addEventListener('click', () => setDrawer(false));
  scrim?.addEventListener('click', () => setDrawer(false));
  addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); setDrawer(false); }
    if (e.key === 'Tab') { // 서랍 안에서만 돌아요
      const f = [...drawer.querySelectorAll('button')]; const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  drawer?.addEventListener('keydown', e => { // 라디오 묶음: 화살표로 고르기
    if (!e.target.classList.contains('g-theme') || !/Arrow(Up|Down|Left|Right)/.test(e.key)) return;
    e.preventDefault(); const t = [...drawer.querySelectorAll('.g-theme')]; const i = t.indexOf(e.target);
    const n = t[(i + (/Down|Right/.test(e.key) ? 1 : t.length - 1)) % t.length]; n.focus(); n.click();
  });

  /* ── 부드러운 스크롤(lerp 0.09). 명세 밖: 안쪽 스크롤 칸·대화창·서랍·맥북 장면 안은 원래대로 ── */
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const mac = document.getElementById('hero');
  let target = scrollY, current = scrollY, raf = 0, active = false;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const scrollsInside = (el, dy) => {
    for (; el && el !== document.body && el !== root; el = el.parentElement) {
      if (!(el instanceof Element)) continue;
      const oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
    }
    return false;
  };
  const inMac = () => { if (!mac) return false; const r = mac.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 1.5; };
  const stop = () => { if (!active) return; cancelAnimationFrame(raf); raf = 0; active = false; target = current = scrollY; };
  function step() {
    current += (target - current) * 0.09;
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo({ top: current, behavior: 'instant' });
    if (current !== target) raf = requestAnimationFrame(step); else { raf = 0; active = false; }
  }
  addEventListener('wheel', e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (isOpen || document.querySelector('dialog[open]') || scrollsInside(e.target, e.deltaY) || inMac()) { stop(); return; }
    e.preventDefault();
    if (!active) { target = current = scrollY; active = true; }
    const dy = (e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY) * 1;
    target = Math.max(0, Math.min(maxScroll(), target + dy));
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: false });
  addEventListener('keydown', stop, true);
  addEventListener('pointerdown', stop, true);
  addEventListener('scroll', () => { if (!active) target = current = scrollY; }, { passive: true });
})();
