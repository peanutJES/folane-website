// 첫 방문 로더, 히어로 글 등장, 휠 스크롤을 부드럽게 이어 주는 장치. app.js와 따로 두어 서로의 상태를 건드리지 않아요.
(function () {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 로더: 첫 맥북 프레임과 글꼴이 준비될 때까지(최대 2.4초) ── */
  const pre = document.getElementById('preroll');
  const finishIntro = () => { root.classList.add('intro-go'); setTimeout(() => root.classList.remove('intro', 'intro-go'), 1800); };
  if (pre && root.classList.contains('preroll-on')) {
    const fill = document.getElementById('preroll-fill'), count = document.getElementById('preroll-count'), status = document.getElementById('preroll-status');
    let value = 0, ready = false, last = performance.now(), leaving = false;
    const first = new Image(); first.decoding = 'async'; first.src = 'assets/mac/f001.webp?v=7';
    Promise.all([
      (first.decode ? first.decode() : Promise.resolve()).catch(() => {}),
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).catch(() => {})
      , new Promise(r => setTimeout(r, 1100)) // 너무 빨리 끝나면 빈 화면이 번쩍이는 것처럼 보여서 잠깐은 보여 줘요
    ]).then(() => { ready = true; });
    setTimeout(() => { ready = true; }, 2400);
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      value += ready ? (100 - value) * 6 * dt : (92 - value) * 1.7 * dt;
      if (ready && value >= 99.4) value = 100;
      fill.style.transform = 'scaleX(' + (value / 100).toFixed(4) + ')';
      count.textContent = String(Math.floor(value)).padStart(3, '0') + '%';
      if (value >= 100) status.textContent = '다 펼쳤어요';
      if (value >= 99.9 && ready && !leaving) {
        leaving = true;
        setTimeout(() => { pre.classList.add('leaving'); }, 140);
        setTimeout(() => { root.classList.remove('preroll-on'); pre.remove(); finishIntro(); try { sessionStorage.setItem('folane-preroll', '1'); } catch (e) {} }, 140 + 520);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else {
    if (pre) pre.remove();
    requestAnimationFrame(() => requestAnimationFrame(finishIntro));
  }

  /* ── 휠 스크롤을 천천히 따라가게(정밀 포인터에서만, 안쪽 스크롤 칸과 대화창은 그대로) ── */
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const hero = document.getElementById('hero');
  let target = scrollY, current = scrollY, raf = 0, active = false, lastT = 0;
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
  const stop = () => { if (!active) return; cancelAnimationFrame(raf); raf = 0; active = false; target = current = scrollY; };
  function step(now) {
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60; lastT = now;
    current += (target - current) * (1 - Math.pow(1 - 0.09, dt * 60));
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo({ top: current, behavior: 'instant' });
    if (current !== target) raf = requestAnimationFrame(step); else { raf = 0; active = false; lastT = 0; }
  }
  addEventListener('wheel', e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.querySelector('dialog[open]') || scrollsInside(e.target, e.deltaY)) return;
    // 맥북 히어로는 프레임을 스스로 보간하고 휠로 재생을 멈추므로 그 안에서는 원래 스크롤을 써요
    if (hero && scrollY + innerHeight * 0.5 < hero.offsetTop + hero.offsetHeight - innerHeight) return;
    e.preventDefault();
    if (!active) { target = current = scrollY; active = true; }
    const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    target = Math.max(0, Math.min(maxScroll(), target + dy));
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: false });
  // 키보드·스크롤 막대·링크 이동은 원래대로 두고, 그 순간 따라가기를 멈춰요
  addEventListener('keydown', stop, true);
  addEventListener('pointerdown', stop, true);
  addEventListener('scroll', () => { if (!active) target = current = scrollY; }, { passive: true });
})();
