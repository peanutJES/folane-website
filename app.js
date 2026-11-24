
const STILLS = /*STILLS*/{"reading":{"size":[1280,846],"spots":{"toolbar":{"x":0,"y":0,"w":1280,"h":31},"highlight":{"x":585,"y":166,"w":113,"h":15},"wiki":{"x":1076,"y":108,"w":195,"h":202},"ai":{"x":1076,"y":317,"w":195,"h":394},"memo":{"x":1076,"y":52,"w":195,"h":50},"hide":{"x":661,"y":4,"w":24,"h":22},"ask":{"x":1198,"y":4,"w":24,"h":22},"lane":{"x":1068,"y":31,"w":213,"h":816}}},"ask":{"size":[1280,846],"spots":{"panel":{"x":900,"y":44,"w":380,"h":802},"input":{"x":956,"y":782,"w":269,"h":27}}},"translate":{"size":[1280,846],"spots":{"dialog":{"x":360,"y":252,"w":560,"h":343}}}}/*END*/;
const MACSEQ = /*MACSEQ*/{"frames": 84, "w": 1440, "h": 900, "top0": 0.47556, "bot0": 0.84889, "screen": {"x": 0.09062638878822327, "y": 0.07467681169509888, "w": 0.8187471926212311, "h": 0.8506463393568993}}/*END*/;


(function(){
  const root = document.documentElement; root.classList.add('js');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = motionQuery.matches;
  const saveData = !!navigator.connection?.saveData;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let keyboardInput = false;
  document.addEventListener('keydown', () => { keyboardInput = true; root.classList.add('keyboard-input'); }, true);
  document.addEventListener('pointerdown', () => { keyboardInput = false; root.classList.remove('keyboard-input'); }, true);
  function moveTo(el) { el.scrollIntoView({ behavior: reduce || keyboardInput ? 'instant' : 'smooth', block: 'start' }); }
  function changed(el) {
    el.getAnimations().forEach(a => a.cancel());
    if (!reduce && !keyboardInput) el.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 200, easing: 'cubic-bezier(.23,1,.32,1)' });
  }

  /* ── 최신 버전과 받기 링크 ── */
  const REPO = 'peanutJES/folane-releases', BASE = 'https://github.com/' + REPO + '/releases/download/';
  const platforms = ['mac', 'win', 'android'];
  const FB = {
    tag: 'v1.35.0',
    date: '2026-11-24T16:21:16Z',
    mac: { name: 'Folane-1.35.0-mac.dmg', size: 30626911 },
    win: { name: 'Folane-Setup-1.35.0.exe', size: 146629416 },
    android: { name: 'Folane-1.35.0-android.apk', size: 36447991 }
  };
  platforms.forEach(k => FB[k].url = BASE + FB.tag + '/' + FB[k].name);
  const ua = navigator.userAgent; let os = 'other';
  if (/Android/i.test(ua)) os = 'android'; else if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) os = 'ios'; else if (/Mac/.test(ua)) os = 'mac'; else if (/Win/.test(ua)) os = 'win';
  if (os === 'ios') root.classList.add('is-ios');
  const LABEL = { mac: '맥용 받기', win: '윈도우용 받기', android: '안드로이드용 받기' };
  const mb = b => { const m = b / 1e6; return (m >= 100 ? Math.round(m) : m.toFixed(1)) + 'MB'; };
  const kst = iso => { try { return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso)); } catch (e) { return ''; } };
  function apply(rel) {
    const v = rel.tag.replace(/^v/, ''); $$('[data-version]').forEach(e => e.textContent = v);
    const d = kst(rel.date); if (d) $$('[data-date]').forEach(e => e.textContent = d);
    platforms.forEach(k => { const a = rel[k];
      $$('[data-dl="' + k + '"]').forEach(e => e.href = a.url); $$('[data-size="' + k + '"]').forEach(e => e.textContent = mb(a.size)); $$('[data-file="' + k + '"]').forEach(e => e.textContent = a.name); });
    if (rel[os]) ['hero', 'outro'].forEach(p => { $('#' + p + '-dl').href = rel[os].url; $('#' + p + '-dl-label').textContent = LABEL[os]; $('#' + p + '-dl-size').textContent = mb(rel[os].size); });
    const schemaElement = $('#folane-app-schema');
    if (schemaElement) {
      const schema = JSON.parse(schemaElement.textContent);
      schema.softwareVersion = v;
      schema.downloadUrl = platforms.map(k => rel[k].url).concat((schema.downloadUrl || []).filter(u => /apps\.microsoft\.com/.test(u)));
      schemaElement.textContent = JSON.stringify(schema);
    }
  }
  const mine = $('.dl[data-os="' + os + '"]'); if (mine) mine.classList.add('mine');
  apply(FB);
  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } }).then(r => { if (!r.ok) throw 0; return r.json(); }).then(j => {
    const rel = { tag: j.tag_name, date: j.published_at };
    (j.assets || []).forEach(a => { const o = { name: a.name, size: a.size, url: a.browser_download_url };
      if (/-mac\.dmg$/i.test(a.name)) rel.mac = o; else if (/^Folane-Setup-.*\.exe$/i.test(a.name)) rel.win = o; else if (/-android\.apk$/i.test(a.name)) rel.android = o; });
    if (rel.tag && rel.mac && rel.win && rel.android) apply(rel);
  }).catch(() => {});

  /* ── 메뉴 색 ── */
  const nav = $('#nav'), hero = $('#hero');
  const darkEls = [$('#hero-stage'), ...$$('.dark-sec')];
  const navLinks = $$('.nav-links a, .nav-buy, .nav-try');
  const navSections = ['translate', 'ai', 'features', 'research', 'try', 'look', 'download', 'faq'].map(id => document.getElementById(id));
  function navTone() {
    const over = darkEls.some(s => { const r = s.getBoundingClientRect(); return r.top <= 26 && r.bottom > 26; });
    const atTop = scrollY < 8;
    nav.classList.toggle('top', atTop); nav.classList.toggle('dark', over && !atTop); nav.classList.toggle('light', !over && !atTop);
    const active = navSections.find(s => { const r = s.getBoundingClientRect(); return r.top < innerHeight * .4 && r.bottom > 70; });
    navLinks.forEach(a => { if (active && a.hash === '#' + active.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  }

  /* ── 맥북: scroll and scene controls share one interruptible timeline ── */
  const cvs = $('#mac-seq'), cx = cvs.getContext('2d'), hi = $('#mac-hi');
  const copy = $('#hero-copy'), cap = $('#hero-cap'), hint = $('#hero-hint');
  const heroControls = $('#hero-controls'), heroSteps = $$('[data-hero-step]');
  let heroOpenRequested = false;
  const N = MACSEQ.frames, FW = MACSEQ.w, FH = MACSEQ.h;
  const imgs = new Array(N); let want = 0, shown = -1, primed = false;
  const src = i => 'assets/mac/f' + String(i + 1).padStart(3, '0') + '.webp?v=7';
  function load(i) {
    if (imgs[i]) return imgs[i].ready;
    const im = new Image(); im.decoding = 'async'; imgs[i] = im;
    im.ready = new Promise(resolve => {
      im.onload = () => { im.ok = true; if (Math.abs(i - want) < 3 || shown < 0) draw(); resolve(); };
      im.onerror = () => { im.failed = true; resolve(); };
    });
    im.src = src(i); return im.ready;
  }
  function preloadNearby(i) {
    if (reduce || saveData) return;
    load(i); for (let d = 1; d <= 3; d++) { if (i + d < N) load(i + d); if (i - d >= 0) load(i - d); }
  }
  // Only four frames load on entry. The rest warm in four lanes after interaction.
  function primeSequence() {
    if (primed || reduce || saveData) return; primed = true;
    let next = 0;
    const worker = async () => { while (next < N && !reduce && !saveData) await load(next++); if (reduce || saveData) primed = false; };
    for (let n = 0; n < 4; n++) worker();
  }
  if (!reduce && !saveData) preloadNearby(0);
  let box = { x: 0, y: 0, w: 0, h: 0 }, base = 1, tall = false, lastP = 0;
  let viewW = 0, viewH = 0, below = 0, displayP = 0, followFrame = 0, lastTime = 0;
  let motionFrame = 0;
  function size() {
    viewW = cvs.clientWidth; viewH = cvs.clientHeight;
    const d = Math.min(devicePixelRatio || 1, 2);
    cvs.width = Math.round(viewW * d); cvs.height = Math.round(viewH * d); cx.setTransform(d, 0, 0, d, 0, 0);
    tall = viewW / viewH < 1; base = Math.min(viewW / FW, viewH / FH);
    below = copy.offsetTop + copy.offsetHeight + (tall ? 20 : 28);
    place(lastP); shown = -1; draw();
  }
  const zoomAt = p => p < .3 ? 1.7 : p < .6 ? 1.7 - (p - .3) / .3 * .2 : Math.max(1.2, 1.5 - (p - .6) / .32 * .3);
  function place(p = 0) {
    lastP = p; const w = viewW, h = viewH, T0 = MACSEQ.top0 || .48, B0 = MACSEQ.bot0 || .85;
    const sFull = base * (tall ? zoomAt(p) : 1), s0 = Math.max(sFull * .4, Math.min(base * (tall ? zoomAt(0) : 1), (h - 12 - below) / ((B0 - T0) * FH)));
    const t = clamp(p / .2), e = t * t * (3 - 2 * t), s = s0 + (sFull - s0) * e, bw = FW * s, bh = FH * s;
    const yMid = (h - bh) / 2, yLow = Math.max(yMid, below - T0 * bh), y = yLow + (yMid - yLow) * e;
    const moved = Math.abs(y - box.y) > .1 || Math.abs(bw - box.w) > .1;
    box = { x: (w - bw) / 2, y, w: bw, h: bh };
    if (MACSEQ.screen) { const r = MACSEQ.screen; Object.assign(hi.style, { left: box.x + r.x * box.w + 'px', top: box.y + r.y * box.h + 'px', width: r.w * box.w + 'px', height: r.h * box.h + 'px' }); }
    return moved;
  }
  function draw() {
    let i = want;
    if (!imgs[i]?.ok) { let best = Infinity; for (let j = 0; j < N; j++) if (imgs[j]?.ok && Math.abs(j - want) < best) { i = j; best = Math.abs(j - want); } }
    if (!imgs[i]?.ok || i === shown) return;
    cx.clearRect(0, 0, cvs.width, cvs.height); cx.drawImage(imgs[i], box.x, box.y, box.w, box.h); shown = i;
  }
  function heroProgress() { const r = hero.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }
  function renderHero(p) {
    if (place(p)) shown = -1;
    want = Math.round(clamp(p / .92) * (N - 1)); preloadNearby(want); draw();
    const fade = clamp(p / .14);
    copy.style.opacity = String(1 - fade); copy.style.transform = `translateY(${-fade * 48}px)`;
    copy.style.pointerEvents = fade > .6 ? 'none' : 'auto'; copy.inert = fade > .6;
    hint.style.opacity = String(1 - clamp(p / .04)); hint.inert = p > .04;
    if (MACSEQ.screen) hi.style.opacity = String(clamp((p - .92) / .06));
    cap.style.opacity = String(clamp((p - .88) / .08)); cap.inert = p < .96;
    hero.classList.toggle('is-open', p >= .88);
    heroControls.style.setProperty('--hero-progress', String(p));
    const phase = p < .3 ? 0 : p < .8 ? 1 : 2;
    heroSteps.forEach((b, i) => { if (i === phase) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
    if ((copy.inert && copy.contains(document.activeElement)) || (cap.inert && cap.contains(document.activeElement)) || (hint.inert && document.activeElement === hint)) heroSteps[phase].focus({preventScroll:true});
    if (heroOpenRequested && p >= .96 && !motionFrame) { heroOpenRequested = false; $('a', cap).focus({ preventScroll: true }); }
  }
  function follow(now) {
    followFrame = 0;
    const target = heroProgress(), dt = Math.min(50, now - (lastTime || now - 16)); lastTime = now;
    // Pointer/trackpad scrolling settles quickly; explicit controls stay exactly in sync.
    displayP += (target - displayP) * (1 - Math.exp(-dt / 55));
    if (Math.abs(target - displayP) < .0005) displayP = target;
    renderHero(displayP);
    if (displayP !== target) followFrame = requestAnimationFrame(follow); else lastTime = 0;
  }
  function heroFrame(immediate = false) {
    if (reduce || saveData) {
      cancelAnimationFrame(followFrame); followFrame = 0; lastTime = 0;
      copy.style.opacity = '1'; copy.style.transform = ''; copy.inert = false;
      cap.style.opacity = ''; cap.inert = false;
      return;
    }
    const p = heroProgress(); if (p > .005 && p < 1) primeSequence();
    if (immediate === true || keyboardInput || motionFrame) {
      cancelAnimationFrame(followFrame); followFrame = 0; lastTime = 0; displayP = p; renderHero(p);
    } else if (!followFrame) followFrame = requestAnimationFrame(follow);
  }
  function stopHeroMotion() { cancelAnimationFrame(motionFrame); motionFrame = 0; heroOpenRequested = false; heroControls.removeAttribute('aria-busy'); }
  function goHero(to, { replay = false, focusScreen = false } = {}) {
    stopHeroMotion(); primeSequence();
    const start = scrollY, heroTop = scrollY + hero.getBoundingClientRect().top, span = hero.offsetHeight - innerHeight;
    const end = heroTop + span * to;
    heroOpenRequested = focusScreen;
    if ((keyboardInput && !replay) || reduce || saveData) { scrollTo({ top: end, behavior: 'instant' }); heroFrame(true); return; }
    const from = replay ? heroTop : start, duration = replay ? 3200 : Math.max(850, Math.abs(end - from) / Math.max(1, span) * 2800);
    let elapsed = 0, lastTick = performance.now(), lastWritten = scrollY;
    const tick = now => {
      // A link, scrollbar drag, or focus move takes priority over this animation.
      if (Math.abs(scrollY - lastWritten) > 2) { stopHeroMotion(); return; }
      const dt = Math.min(40, now - lastTick); lastTick = now;
      const t = clamp((elapsed + dt) / duration), e = t * t * (3 - 2 * t);
      const position = from + (end - from) * e;
      const frame = Math.round(clamp(((position - heroTop) / Math.max(1,span)) / .92) * (N - 1));
      // Hold the timeline at its current pose while a required frame loads.
      if (!imgs[frame]?.ok && !imgs[frame]?.failed) {
        load(frame); heroControls.setAttribute('aria-busy','true');
        motionFrame = requestAnimationFrame(tick); return;
      }
      heroControls.removeAttribute('aria-busy'); elapsed += dt;
      scrollTo({ top: position, behavior: 'instant' }); lastWritten = scrollY;
      motionFrame = t < 1 ? requestAnimationFrame(tick) : 0; heroFrame(true);
    };
    motionFrame = requestAnimationFrame(tick);
  }
  hint.addEventListener('click', () => goHero(.98, { focusScreen: true }));
  heroSteps.forEach(b => b.addEventListener('click', () => goHero(Number(b.dataset.heroStep))));
  $('#hero-replay').addEventListener('click', () => goHero(.98, { replay: true }));
  addEventListener('wheel', stopHeroMotion, { passive: true });
  addEventListener('touchstart', stopHeroMotion, { passive: true });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#hero-controls,#hero-hint')) stopHeroMotion(); }, { capture: true, passive: true });
  addEventListener('keydown', e => { if (['Escape','Tab','PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key)) stopHeroMotion(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopHeroMotion(); cancelAnimationFrame(followFrame); followFrame = 0; } else heroFrame(true); });
  hero.classList.toggle('static', reduce || saveData);
  motionQuery.addEventListener('change', e => {
    const controlsFocused = heroControls.contains(document.activeElement) || document.activeElement === hint;
    stopHeroMotion(); reduce = e.matches; hero.classList.toggle('static', reduce || saveData);
    if (reduce) $$('video').forEach(v => v.pause()); size(); heroFrame(true);
    if (reduce && controlsFocused) $('a', cap).focus({preventScroll:true});
  });
  addEventListener('resize', () => { stopHeroMotion(); size(); heroFrame(true); });
  size();
  if ('ResizeObserver' in window) new ResizeObserver(() => { size(); heroFrame(true); }).observe(copy);
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { navTone(); heroFrame(); ticking = false; }); }, { passive: true });
  navTone(); heroFrame(true);

  /* ── 영상 ── */
  const vids = $$('video[data-feature-video]'), userPaused = new Set();
  const vload = v => { if (v.dataset.src && !v.dataset.loaded) { v.src = v.dataset.src; v.dataset.loaded = 1; } };
  function setBtn(v) { const b = $('.vbtn[data-for="' + v.id + '"]'); if (!b) return; b.classList.toggle('paused', v.paused); b.setAttribute('aria-label', v.paused ? '영상 재생' : '영상 멈추기'); }
  vids.forEach(v => { v.addEventListener('play', () => setBtn(v)); v.addEventListener('pause', () => setBtn(v)); setBtn(v); });
  $$('.vbtn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const v = document.getElementById(b.dataset.for); vload(v); if (v.paused) { userPaused.delete(v); v.play().catch(() => {}); } else { userPaused.add(v); v.pause(); } }));
  const near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { vload(e.target); near.unobserve(e.target); } }), { rootMargin: '600px 0px' });
  const vis = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && e.intersectionRatio > .35) { if (!reduce && !saveData && !document.hidden && !userPaused.has(v)) { vload(v); v.play().catch(() => {}); } } else if (!v.paused) v.pause(); }), { threshold: [0, .35, .6] });
  vids.forEach(v => { if (!saveData) near.observe(v); vis.observe(v); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) vids.forEach(v => v.pause()); });

  const featureTabs = $$('.feature-tabs [role="tab"]');
  const featureSeek = $('#feature-seek'), featureTime = $('#feature-time'), featureAction = $('#feature-action');
  const featureActions = [
    ['lookup', '직접 찾아보기'], ['ai', 'AI 화면 살펴보기'], ['highlight', '직접 칠해 보기'],
    ['memo', '직접 메모하기'], ['note', '직접 그어 보기'], ['note', '종이 골라 보기']
  ];
  const activeVideo = () => $('.feature-panel:not([hidden]) video');
  const timeText = n => { n = Math.floor(Number.isFinite(n) ? n : 0); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0'); };
  function videoPosition() {
    const v = activeVideo(), ready = Number.isFinite(v.duration) && v.duration > 0;
    featureSeek.disabled = !ready; featureSeek.max = ready ? v.duration : 100;
    featureSeek.value = ready ? v.currentTime : 0;
    featureSeek.style.setProperty('--progress', (ready ? v.currentTime / v.duration * 100 : 0) + '%');
    featureSeek.setAttribute('aria-valuetext', timeText(v.currentTime) + ' / ' + timeText(v.duration));
    featureTime.textContent = timeText(v.currentTime) + ' / ' + timeText(v.duration);
  }
  vids.forEach(v => ['loadedmetadata', 'durationchange', 'timeupdate', 'emptied'].forEach(type => v.addEventListener(type, () => { if (v === activeVideo()) videoPosition(); })));
  featureSeek.addEventListener('input', () => { const v = activeVideo(); if (Number.isFinite(v.duration)) v.currentTime = Number(featureSeek.value); videoPosition(); });
  $('#feature-restart').addEventListener('click', () => { const v = activeVideo(); vload(v); v.currentTime = 0; userPaused.delete(v); v.play().catch(() => {}); });
  function selectFeature(t) {
    featureTabs.forEach(b => { const on = b === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; const panel = document.getElementById(b.getAttribute('aria-controls')); panel.hidden = !on; const v = $('video', panel); if (!on) v.pause(); else { vload(v); if (!reduce && !saveData && !userPaused.has(v)) v.play().catch(() => {}); } });
    t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const [action, label] = featureActions[featureTabs.indexOf(t)];
    featureAction.dataset.tryAction = action; featureAction.href = action === 'ai' ? '#look' : '#try';
    featureAction.innerHTML = label + ' <span aria-hidden="true">↗</span>';
    videoPosition(); changed($('#' + t.getAttribute('aria-controls')));
  }
  featureTabs.forEach(t => t.addEventListener('click', () => selectFeature(t)));
  function tabKeys(e, bs, select) { const i = bs.indexOf(document.activeElement); if (i < 0) return; const j = e.key === 'ArrowRight' ? (i + 1) % bs.length : e.key === 'ArrowLeft' ? (i - 1 + bs.length) % bs.length : e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : -1; if (j < 0) return; e.preventDefault(); bs[j].focus(); select(bs[j]); }
  $('.feature-tabs').addEventListener('keydown', e => tabKeys(e, featureTabs, selectFeature));
  videoPosition();

  /* Translation comparison is a labeled explanation, not a live AI response. */
  const compare = $('#translation-compare'), split = $('#translation-split');
  const replayTranslation = $('#translation-replay'), translatedPage = $('#translated-page');
  const languageLabel = $('#translation-language-label');
  const exampleLanguages = {
    ko: { label: '한국어', text: $$('[data-translation-text]', translatedPage).map(el => el.textContent) },
    ja: { label: '일본어', text: ['言葉の先を読む', '同じページで、より広い文脈へ。', '01 / 文脈', '言葉の意味は、前後の文章とともに読むことで明確になります。文書の構造は、考えがつながる順序を示します。', '02 / レイアウト', '見出し、本文、図や表は、読み進める道筋をつくります。言語が変わっても、その関係をたどれることが大切です。', '読む', '理解する', '記録する', '図1. 文章から考えへとつながる流れ', '考えを残す場所', '読んでいた場所に質問やメモを残せば、開き直したときも文脈をたどれます。'] },
    de: { label: '독일어', text: ['Über die Worte hinaus', 'Mehr Kontext. Auf derselben Seite.', '01 / KONTEXT', 'Ein Wort wird klarer, wenn wir die Sätze davor und danach lesen. Die Struktur zeigt, wie ein Gedanke zum nächsten führt.', '02 / LAYOUT', 'Überschriften, Absätze, Bilder und Tabellen lenken unseren Blick. Ihre Beziehungen sollen auch in einer anderen Sprache erkennbar bleiben.', 'Lesen', 'Verstehen', 'Notieren', 'Abb. 1. Vom Satz zum Gedanken', 'Raum für Gedanken', 'Fragen und Notizen bleiben neben dem Text. So bleibt der Zusammenhang beim erneuten Lesen erhalten.'] }
  };
  let translationRAF = 0, translationSeen = false;
  function setSplit(value) {
    const n = Math.round(clamp(value, 0, 100));
    split.value = n; compare.style.setProperty('--split', n + '%');
    split.setAttribute('aria-valuetext', `원문 ${n}%, ${languageLabel.textContent} ${100 - n}%`);
  }
  function stopTranslation() {
    cancelAnimationFrame(translationRAF); translationRAF = 0;
    replayTranslation.innerHTML = '다시 보기 <span aria-hidden="true">↺</span>';
    replayTranslation.setAttribute('aria-label', '번역 배치 전환 다시 보기');
  }
  function playTranslation() {
    stopTranslation(); translationSeen = true;
    if (reduce || saveData) { setSplit(50); return; }
    const began = performance.now();
    replayTranslation.innerHTML = '멈추기 <span aria-hidden="true">Ⅱ</span>';
    replayTranslation.setAttribute('aria-label', '번역 배치 전환 멈추기');
    const frame = now => {
      const t = clamp((now - began) / 1800);
      setSplit(100 * Math.pow(1 - t, 3));
      if (t < 1) translationRAF = requestAnimationFrame(frame); else stopTranslation();
    };
    translationRAF = requestAnimationFrame(frame);
  }
  $('.translation-controls').hidden = false;
  split.setAttribute('aria-describedby', 'translation-caption');
  split.addEventListener('input', () => { translationSeen = true; stopTranslation(); setSplit(Number(split.value)); });
  split.addEventListener('pointerdown', stopTranslation);
  split.addEventListener('keydown', stopTranslation);
  replayTranslation.addEventListener('click', () => translationRAF ? stopTranslation() : playTranslation());
  // Keep native range keyboard support and allow direct dragging on the document.
  let comparePointer = null;
  const pointerSplit = e => { const r = compare.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width * 100); };
  compare.addEventListener('pointerdown', e => { if (!e.isPrimary || e.button !== 0) return; stopTranslation(); translationSeen = true; comparePointer = e.pointerId; compare.setPointerCapture(e.pointerId); pointerSplit(e); });
  compare.addEventListener('pointermove', e => { if (e.pointerId === comparePointer) pointerSplit(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => compare.addEventListener(type, () => { comparePointer = null; }));
  $$('[data-translation-lang]').forEach(button => button.addEventListener('click', () => {
    const code = button.dataset.translationLang, language = exampleLanguages[code];
    stopTranslation(); translationSeen = true;
    $$('[data-translation-lang]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $$('[data-translation-text]', translatedPage).forEach((el, i) => { el.textContent = language.text[i]; });
    translatedPage.lang = code; languageLabel.textContent = language.label;
    setSplit(0); changed(translatedPage);
  }));
  const comparisonObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= .55 && !translationSeen) { translationSeen = true; if (!reduce && !saveData && !document.hidden) playTranslation(); }
    if (!entry.isIntersecting) stopTranslation();
  }), { threshold: [0, .55] });
  comparisonObserver.observe(compare);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTranslation(); });
  motionQuery.addEventListener('change', () => { stopTranslation(); translatedPage.getAnimations().forEach(a => a.cancel()); });

  const aiStoryTabs = $$('.ai-story-tabs [role="tab"]');
  function selectAIStory(button) {
    aiStoryTabs.forEach(b => { const on = b === button; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; document.getElementById(b.getAttribute('aria-controls')).hidden = !on; });
    changed(document.getElementById(button.getAttribute('aria-controls')));
  }
  aiStoryTabs.forEach(b => b.addEventListener('click', () => selectAIStory(b)));
  $('.ai-story-tabs').addEventListener('keydown', e => tabKeys(e, aiStoryTabs, selectAIStory));

  /* ── Large video with native controls and focus return ── */
  const film = $('#film'), fv = $('#film-video'); let filmTrigger = null, resumeVideos = [];
  function openFilm(trigger, source) {
    filmTrigger = trigger;
    resumeVideos = vids.filter(v => !v.paused); vids.forEach(v => v.pause());
    const url = source ? source.dataset.src : 'assets/video/intro.mp4';
    if (typeof film.showModal !== 'function') { location.href = url; return; }
    fv.pause(); fv.src = url; fv.poster = source ? source.poster : 'assets/video/intro.jpg';
    const track = $('track', fv); if (track) track.track.mode = 'disabled';
    $('#film-title').textContent = source ? source.getAttribute('aria-label') + ' · 1.32 · AI 답은 시연용 예시' : 'Folane 소개 · 1.32 · AI 답·받아쓰기·번역문은 녹화용 예시';
    film.showModal(); document.body.classList.add('film-open'); fv.load(); fv.play().catch(() => {});
  }
  $$('[data-film]').forEach(b => b.addEventListener('click', () => openFilm(b)));
  $$('[data-ai-film]').forEach(b => b.addEventListener('click', () => openFilm(b, $('#v-ai'))));
  $$('[data-expand]').forEach(b => b.addEventListener('click', () => openFilm(b, document.getElementById(b.dataset.expand))));
  $('#film-close').addEventListener('click', () => film.close());
  film.addEventListener('close', () => { fv.pause(); document.body.classList.remove('film-open'); filmTrigger?.focus({ preventScroll: true }); if (!reduce && !saveData && !document.hidden) resumeVideos.forEach(v => { const r = v.getBoundingClientRect(); if (!v.closest('[hidden]') && r.bottom > 0 && r.top < innerHeight) v.play().catch(() => {}); }); });
  film.addEventListener('click', e => { const r = film.getBoundingClientRect(); if (e.target === film && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) film.close(); });

  /* ── 스크롤 등장 ── */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* ── 자세히 보기 ── */
  const sizeOf = id => (STILLS[id] && STILLS[id].size) || [1280, 760];
  const SHOTS = [
    { id: 'mac', label: '맥', src: 'assets/shots/mac.jpg', w: 1320, h: 846, note: '맥용 Folane 1.21.17로 윈도우에서 칠하고 메모한 PDF를 연 화면이에요. AI 카드의 답은 녹화용 시험 서버가 보낸 예시예요.', spots: [] },
    { id: 'reading', label: '읽기 화면', src: 'assets/shots/reading.jpg', w: sizeOf('reading')[0], h: sizeOf('reading')[1], note: '윈도우용 1.21.16. AI 카드의 답은 녹화용 시험 서버가 보낸 예시예요.', spots: [
      ['toolbar', '도구 막대', '하이라이트·밑줄·취소선·펜·메모·지우개·글자 도구·자, 글자 인식·문서 번역이 한 줄에 있어요.'],
      ['highlight', '하이라이트', '글을 끌고 떠 있는 막대에서 색을 고르면 바로 칠해져요.'],
      ['wiki', '위키백과 카드', '찾아본 낱말의 사진과 첫 문단이 메모 칸에 붙어요. 나무위키·구글 단추도 함께 나와요.'],
      ['ai', 'AI 설명 카드', '고른 말이 이 문서에서 무슨 뜻인지 적고, 근거와 쓴 AI를 함께 보여 줘요.'],
      ['memo', '내 메모', '고른 줄 높이에 붙은 메모 카드예요.'] ] },
    { id: 'ask', label: 'AI 물어보기', src: 'assets/shots/ask.jpg', w: sizeOf('ask')[0], h: sizeOf('ask')[1], note: '답은 녹화용 시험 서버가 보낸 예시예요.', spots: [
      ['panel', '물어보기 칸', '고른 부분·이 쪽·앞뒤 쪽·문서 전체 가운데 범위를 골라 물어요.'],
      ['input', '입력 칸', '+로 PDF·텍스트·그림을 붙여 함께 물어요.'] ] },
    { id: 'note', label: '새 노트', src: 'assets/shots/note.jpg', w: sizeOf('note')[0], h: sizeOf('note')[1], note: '모눈·미색 종이로 만든 새 노트예요.', spots: [] },
    { id: 'translate', label: '문서 번역', src: 'assets/shots/translate.jpg', w: sizeOf('translate')[0], h: sizeOf('translate')[1], note: '번역 언어와 범위를 고르는 창이에요.', spots: [
      ['dialog', '문서 번역 창', '일부 쪽만 고르면 번역한 쪽만 담은 PDF나, 나머지는 원문 그대로 둔 전체 파일을 받아요.'] ] },
    { id: 'captions', label: '실시간 자막', src: 'assets/screens/win-live-captions.jpg', w: 1400, h: 749, note: '녹음 중 자막과 번역 예시예요. 자막 글은 시험용 가짜 AI 서버가 만든 글이에요.', spots: [] },
    { id: 'phone', label: '휴대폰', src: 'assets/screens/android-panel.jpg', w: 405, h: 900, tall: true, note: '안드로이드 휴대폰. 메모 칸이 화면 아래쪽 반에 떠요.', spots: [] },
  ];
  const tabsEl = $('#look-tabs'), lens = $('#lens'), inner = $('#lens-in'), img = $('#lens-img');
  const capH = $('#cap-h'), capP = $('#cap-p'), capBack = $('#cap-back'), lensNote = $('#lens-note');
  let cur = SHOTS[0], zoomed = false, zoom = 1, panX = 0, panY = 0, drag = null, dragged = false;
  const lensReset = $('#lens-reset');
  SHOTS.forEach((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'lt-' + s.id; b.setAttribute('aria-controls', 'lens'); b.textContent = s.label; b.setAttribute('aria-selected', i === 0); b.tabIndex = i === 0 ? 0 : -1; b.addEventListener('click', () => show(s)); tabsEl.appendChild(b); });
  tabsEl.addEventListener('keydown', e => tabKeys(e, $$('button', tabsEl), b => b.click()));
  function panTo(x, y) {
    panX = clamp(x, lens.clientWidth * (1 - zoom), 0); panY = clamp(y, lens.clientHeight * (1 - zoom), 0);
    inner.style.transform = `translate(${panX}px,${panY}px) scale(${zoom})`;
  }
  function zoomTo(x, y, w, h, title, text) {
    const LW = lens.clientWidth, LH = lens.clientHeight, s0 = LW / cur.w;
    const z = Math.min(3, Math.max(1.8, Math.min(cur.w / (w + 80), cur.h / (h + 80))));
    let tx = LW / 2 - (x + w / 2) * s0 * z, ty = LH / 2 - (y + h / 2) * s0 * z;
    tx = Math.min(0, Math.max(LW - LW * z, tx)); ty = Math.min(0, Math.max(LH - LH * z, ty));
    zoom = z; panTo(tx, ty); zoomed = true; lens.classList.add('zoomed');
    capH.textContent = title; capP.textContent = text + ' 끌거나 방향키로 화면을 옮길 수 있어요.';
    capBack.hidden = false; lensReset.hidden = false; $$('.plus', inner).forEach(b => b.tabIndex = -1);
    lens.focus({ preventScroll: true });
  }
  function unzoom() { inner.style.transform = ''; zoomed = false; zoom = 1; drag = null; dragged = false; lens.classList.remove('zoomed', 'panning'); capH.textContent = cur.label; capP.textContent = cur.spots.some(([k]) => STILLS[cur.id] && STILLS[cur.id].spots && STILLS[cur.id].spots[k]) ? '+를 눌러 원하는 부분을 살펴보세요.' : '누르면 확대돼요. 확대 후에는 끌어서 옮길 수 있어요.'; capBack.hidden = true; lensReset.hidden = true; $$('.plus', inner).forEach(b => b.tabIndex = 0); }
  function show(s) {
    cur = s; lens.setAttribute('aria-labelledby', 'lt-' + s.id); img.width = s.w; img.height = s.h; $$('button', tabsEl).forEach(b => { const on = b.id === 'lt-' + s.id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    img.src = s.src; img.alt = s.label + ' 실제 화면'; lens.classList.toggle('tall', !!s.tall); lens.setAttribute('aria-label', s.label + ' 실제 화면');
    $$('.plus', inner).forEach(x => x.remove()); unzoom(); lensNote.textContent = s.note || ''; changed(inner);
    const data = (STILLS[s.id] && STILLS[s.id].spots) || {};
    s.spots.forEach(([key, title, text]) => { const r = data[key]; if (!r) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'plus'; b.setAttribute('aria-label', title + ' 크게 보기');
      b.style.left = ((r.x + r.w / 2) / s.w * 100) + '%'; b.style.top = ((r.y + Math.min(r.h / 2, 24)) / s.h * 100) + '%';
      b.addEventListener('click', e => { e.stopPropagation(); zoomTo(r.x, r.y, r.w, r.h, title, text); }); inner.appendChild(b); });
  }
  lens.addEventListener('click', e => { if (e.target.closest('button')) return; if (dragged) { dragged = false; return; } if (zoomed) { unzoom(); return; } const rc = lens.getBoundingClientRect(), s0 = rc.width / cur.w; const x = (e.clientX - rc.left) / s0, y = (e.clientY - rc.top) / s0; zoomTo(x - 160, y - 100, 320, 200, cur.label, '전체 보기로 돌아갈 수 있어요.'); });
  [capBack, lensReset].forEach(b => b.addEventListener('click', e => { e.stopPropagation(); unzoom(); lens.focus({ preventScroll: true }); }));
  lens.addEventListener('pointerdown', e => {
    if (!zoomed || drag || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragged = false; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: panX, py: panY };
    lens.setPointerCapture(e.pointerId); lens.classList.add('panning');
  });
  lens.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 5) dragged = true;
    if (dragged) panTo(drag.px + dx, drag.py + dy);
  });
  function stopPan(e) { if (!drag || e.pointerId !== drag.id) return; drag = null; lens.classList.remove('panning'); }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => lens.addEventListener(type, stopPan));
  lens.addEventListener('dragstart', e => e.preventDefault());
  lens.addEventListener('keydown', e => {
    if (e.target !== lens) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (zoomed) unzoom(); else zoomTo(cur.w * .3, cur.h * .2, cur.w * .4, cur.h * .4, cur.label, 'Escape로 전체 화면으로 돌아가세요.'); }
    if (zoomed && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); panTo(panX + (e.key === 'ArrowLeft' ? 80 : e.key === 'ArrowRight' ? -80 : 0), panY + (e.key === 'ArrowUp' ? 80 : e.key === 'ArrowDown' ? -80 : 0)); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && zoomed) unzoom(); });
  addEventListener('resize', () => { if (zoomed) unzoom(); });
  show(SHOTS[0]);

  /* ── 써 보기: 연습 PDF ── */
  const sheet = $('#sheet'), textBox = $('#sheet-text'), fbar = $('#fbar'), cardsEl = $('#cards'), empty = $('#lane-empty'), count = $('#lane-count');
  const KEY = 'folane-site-marks-v1';
  const textLength = textBox.textContent.length;
  const validMark = m => m && typeof m.id === 'string' && /^m[0-9]+$/.test(m.id) && Number.isInteger(m.start) && Number.isInteger(m.end) && m.start >= 0 && m.end > m.start && m.end <= textLength && ['hl','ul','st','memo','wiki'].includes(m.kind) && typeof m.text === 'string';
  let marks = [];
  try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(data)) marks = data.filter(validMark).slice(-100).map(m => ({ ...m, color: ['yellow','green','blue','pink','violet'].includes(m.color) ? m.color : 'yellow', note: typeof m.note === 'string' ? m.note.slice(0, 5000) : '', wiki: null })); } catch (_) {}
  const status = $('#demo-status'), markHistory = [];
  const announce = text => { status.textContent = text; };
  function rememberMarks() { markHistory.push(JSON.stringify(marks)); if (markHistory.length > 30) markHistory.shift(); $('#mark-undo').disabled = false; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(marks)); } catch (_) { announce('브라우저 저장 공간을 사용할 수 없어 이번 표시는 새로고침 전까지만 남아요.'); } };
  function textNodes() { const w = document.createTreeWalker(textBox, NodeFilter.SHOW_TEXT); const out = []; let n; while ((n = w.nextNode())) out.push(n); return out; }
  function offsetOf(node, off) { let t = 0; for (const n of textNodes()) { if (n === node) return t + off; t += n.length; } return t; }
  function rangeFromOffsets(a, b) { let t = 0; const r = document.createRange(); let sa = false; for (const n of textNodes()) { const L = n.length; if (!sa && a <= t + L) { r.setStart(n, a - t); sa = true; } if (sa && b <= t + L) { r.setEnd(n, b - t); return r; } t += L; } return null; }
  function wrap(m) {
    const r = rangeFromOffsets(m.start, m.end); if (!r) return;
    const nodes = textNodes().filter(n => r.intersectsNode(n)); const cls = ['pm'];
    if (m.kind === 'hl' || m.kind === 'memo') cls.push('c-' + (m.color || 'yellow'));
    if (m.kind === 'ul' || m.kind === 'wiki') cls.push('k-ul');
    if (m.kind === 'st') cls.push('k-st');
    nodes.forEach(n => { let s = 0, e = n.length; if (n === r.startContainer) s = r.startOffset; if (n === r.endContainer) e = r.endOffset; if (e <= s || !n.data.slice(s, e).trim()) return;
      let mid = n; if (s > 0) mid = n.splitText(s); if (e - s < mid.length) mid.splitText(e - s);
      const sp = document.createElement('span'); sp.className = cls.join(' '); sp.dataset.id = m.id; mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid);
      if (m.kind === 'memo' || m.kind === 'wiki') {
        sp.tabIndex = 0; sp.setAttribute('role', 'button'); sp.setAttribute('aria-label', m.text + (m.kind === 'memo' ? ' 메모로 이동' : ' 위키백과 카드로 이동'));
        const open = () => { setReaderView('memo'); const card = $('.pcard[data-id="' + m.id + '"]', cardsEl); if (!card) return; card.scrollIntoView({ behavior: reduce || keyboardInput ? 'instant' : 'smooth', block: 'nearest' }); (card.querySelector('textarea, a') || card).focus({ preventScroll: true }); };
        sp.addEventListener('click', () => { if (getSelection().isCollapsed) open(); });
        sp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        sp.addEventListener('focus', () => hot(m.id, true)); sp.addEventListener('blur', () => hot(m.id, false));
      }
      sp.addEventListener('mouseenter', () => hot(m.id, true)); sp.addEventListener('mouseleave', () => hot(m.id, false)); });
  }
  function unwrapAll() { $$('.pm', textBox).forEach(sp => { const p = sp.parentNode; while (sp.firstChild) p.insertBefore(sp.firstChild, sp); p.removeChild(sp); }); textBox.normalize(); }
  function render() {
    unwrapAll(); marks.slice().sort((a, b) => a.start - b.start).forEach(wrap);
    const cardMarks = marks.filter(m => m.kind === 'memo' || m.kind === 'wiki');
    $$('.pcard', cardsEl).forEach(c => { if (!cardMarks.find(m => m.id === c.dataset.id)) c.remove(); });
    cardMarks.forEach(m => { if (!$('.pcard[data-id="' + m.id + '"]', cardsEl)) cardsEl.appendChild(makeCard(m)); });
    empty.hidden = cardMarks.length > 0; count.textContent = cardMarks.length + '개'; layout(); syncReaderContext();
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const echoPaper = ['The echo chamber effect on social media', 'Matteo Cinelli 외', 'PNAS · 2021', '10.1073/pnas.2023301118'];
  const filterPaper = ['Filter Bubbles, Echo Chambers, and Online News Consumption', 'Seth Flaxman, Sharad Goel, Justin M. Rao', 'Public Opinion Quarterly · 2016', '10.1093/poq/nfw006'];
  const studyTerms = [
    { word:'에코챔버', aliases:['에코챔버','반향실','echo chamber'], title:'반향실 효과',
      extract:'비슷한 의견이 주로 오가는 집단에서 같은 주장이 반복되고 강화되는 현상이에요.',
      context:'여기서 에코챔버는 비슷한 의견이 되풀이되는 정보 환경을 뜻해요. 본문은 추천이 익숙한 관점을 자주 보여 줄 때 그 환경이 더 굳어질 수 있다고 설명해요.',
      example:'같은 관점의 계정만 팔로우하다 보면, 의견이 되풀이되어 마치 대부분이 같은 생각을 하는 것처럼 느낄 수 있어요.',
      papers:[echoPaper,filterPaper] },
    { word:'아비투스', aliases:['아비투스','habitus'], title:'아비투스',
      extract:'살아온 사회적 환경을 통해 몸에 밴 사고와 행동의 성향을 가리키는 개념이에요.',
      context:'본문은 취향이 살아온 환경과 연결된다고 설명해요. 아비투스는 그 환경 속에서 몸에 밴 취향과 판단, 행동의 성향을 가리켜요.',
      example:'어릴 때 자주 접한 음악이나 말투가 어른이 된 뒤에도 편안하게 느껴질 수 있어요. 아비투스는 그렇게 익숙함이 형성되는 과정과 관련돼요.',
      papers:[['A concise genealogy and anatomy of habitus','Loïc Wacquant','The Sociological Review · 2016','10.1111/1467-954X.12356']] },
    { word:'필터 버블', aliases:['필터 버블','filter bubble'], title:'필터 버블',
      extract:'개인화된 검색이나 추천으로 접하는 정보의 범위가 좁아지는 현상을 가리켜요.',
      context:'이 문장에서 필터 버블은 검색과 추천이 사람마다 다른 정보를 보여 주면서, 일부 관점을 보기 어렵게 만드는 환경이에요.',
      example:'비슷한 영상을 계속 보면 추천 목록도 비슷해질 수 있어요. 그러면 같은 주제를 다른 관점에서 다룬 영상은 찾기 어려워져요.',
      papers:[filterPaper,['Exposure to ideologically diverse news and opinion on Facebook','Eytan Bakshy, Solomon Messing, Lada A. Adamic','Science · 2015','10.1126/science.aaa1160']] }
  ];
  const normalizeStudy = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const findStudy = s => { const key = normalizeStudy(s); return studyTerms.find(item => item.aliases.some(a => key.includes(normalizeStudy(a)))); };
  const wikiSource = item => 'https://ko.wikipedia.org/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_'));
  const study = $('#study'), lane = $('#reader-lane'), notes = $('#reader-notes');
  const studyQuery = $('#study-query'), studyResult = $('#study-result');
  const paperWindow = $('#paper-window'), paperResults = $('#paper-results');
  const noExample = '<p>준비된 예시가 없어요. 에코챔버, 아비투스, 필터 버블 중 하나를 골라 보세요.</p>';
  let studySelection = { text:studyTerms[0].word, example:true }, studyMode = 'ai', studyScope = 'selection';
  let paperReturn = null;
  function syncReaderContext() {
    if (!window.Highlight || !window.CSS?.highlights) return;
    CSS.highlights.delete('reader-context');
    if (studyMode !== 'wiki' && (studyMode !== 'ai' || studyScope !== 'selection')) return;
    if (!Number.isInteger(studySelection.start)) return;
    const range = rangeFromOffsets(studySelection.start, studySelection.end);
    if (range) CSS.highlights.set('reader-context', new Highlight(range));
  }
  function setReaderView(mode) {
    studyMode = mode;
    lane.dataset.view = mode;
    lane.hidden = mode === 'closed';
    $('#pane-pdf').classList.toggle('reader-lane-closed', lane.hidden);
    study.hidden = mode === 'closed' || mode === 'memo';
    notes.hidden = mode !== 'memo' && mode !== 'wiki';
    for (const [id, view] of [['study-ai','ai'],['reader-memo','memo']]) {
      $('#' + id).setAttribute('aria-pressed', String(mode === view || (view === 'memo' && mode === 'wiki')));
    }
    layout(); syncReaderContext();
  }
  function studyOutput(q) {
    const item = findStudy(studyMode === 'ai' ? studySelection.text : q);
    if (studyMode === 'wiki') {
      studyResult.innerHTML = item ? '<div class="reader-wiki-card"><div class="wiki-note-heading">“' + esc(item.word) + '” <span>1쪽</span></div><div class="wiki-extract"><p class="study-meta">위키백과</p><h4>' + esc(item.title) + '</h4><p>' + esc(item.extract) + '</p><a href="' + wikiSource(item) + '" target="_blank" rel="noopener noreferrer">위키백과 ↗</a></div></div>' : noExample;
    } else {
      const example = /예시|예를|사례/.test(q), meaning = /뜻|의미|설명|무슨|뭐야|뭔가요|문맥/.test(q);
      const answer = studyScope !== 'selection'
        ? (/요약|정리|내용|설명|문맥|뜻/.test(q) ? '이 쪽은 추천 알고리즘과 정보 환경의 관계를 설명하고, 아비투스와 문화자본을 통해 취향이 사회적 환경과 연결된다고 소개해요.' : '이 범위의 시연에서는 “이 쪽을 요약해 주세요”라고 물어볼 수 있어요.')
        : !item ? '준비된 설명이 없어요. 에코챔버, 아비투스, 필터 버블을 골라 보세요.'
        : example ? item.example : meaning ? item.context : '이 시연에는 개념의 뜻과 간단한 예시가 준비돼 있어요. 아래 예시 질문을 눌러 보세요.';
      studyResult.innerHTML = '<p class="reader-question">' + esc(q) + '</p><p class="study-meta">시연 답변' + (item && studyScope === 'selection' ? ' · ' + esc(item.word) : '') + '</p><p>' + esc(answer) + '</p>';
    }
    layout();
  }
  function refreshStudy() {
    syncReaderContext();
    if (studyMode !== 'ai' && studyMode !== 'wiki') return;
    const isAI = studyMode === 'ai', isSelection = studyScope === 'selection';
    $('#study-title').textContent = isAI ? '지금 쓰는 AI' : '1쪽 메모';
    $('#study-subtitle').textContent = isAI ? '시연용 모델' : '위키백과 · 개념 요약';
    $('#study-context-label').textContent = isAI && !isSelection ? '질문 범위' : studySelection.example ? '예시 낱말' : '고른 글';
    $('#study-context').textContent = isAI && !isSelection ? (studyScope === 'page' ? '이 쪽' : '문서 전체') : studySelection.text.length > 90 ? studySelection.text.slice(0,90) + '…' : studySelection.text;
    $('#study-label').textContent = isAI ? 'AI 질문' : '위키백과 검색어';
    $('#study-submit').textContent = isAI ? '↑' : '검색';
    $('#study-submit').setAttribute('aria-label', isAI ? '질문 보내기' : '위키백과 검색');
    $('#reader-scope').hidden = !isAI;
    $('#study-prompts').hidden = !isAI;
    $('#study-reset').hidden = !isAI;
    $('#study-form').hidden = !isAI;
    studyQuery.placeholder = isAI ? (isSelection ? '이 문장에서 무슨 뜻인가요?' : '이 쪽을 요약해 주세요.') : '위키백과 검색어';
    studyQuery.value = isAI ? '' : studySelection.text.slice(0,160);
    if (isAI) studyResult.innerHTML = '<p class="reader-empty">' + (isSelection ? '고른 문장의 뜻을 물어보세요.' : '읽고 있는 쪽의 내용을 물어보세요.') + '</p>';
    else studyOutput(studySelection.text);
  }
  function chooseScope(scope) {
    studyScope = scope;
    $$('[data-reader-scope]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.readerScope === scope)));
    refreshStudy();
  }
  function renderPapers(q) {
    const item = findStudy(q);
    const label = q.length > 56 ? q.slice(0,56) + '…' : q;
    $('#paper-window-title').textContent = '‘' + label + '’와 관련된 논문';
    $('#paper-keyword').textContent = label;
    $('#paper-count').textContent = (item?.papers.length ?? 0) + '편';
    paperResults.innerHTML = item
      ? '<ol class="study-papers">' + item.papers.map(([title, authors, venue, doi]) =>
        '<li><a href="https://doi.org/' + esc(doi) + '" target="_blank" rel="noopener noreferrer" lang="en">' + esc(title) + '</a><p>' + esc(authors) + ' · ' + esc(venue) + '</p><p class="paper-abstract-note">초록은 논문 페이지에서 확인할 수 있어요.</p><button type="button" data-paper-copy="' + esc(doi) + '">링크 복사</button></li>').join('') + '</ol>'
      : noExample;
  }
  function openStudy(mode, sel, trigger = document.activeElement) {
    if (mode === 'papers') {
      const fromToolbar = trigger instanceof HTMLElement && trigger.closest('#app') && !trigger.closest('#fbar');
      paperReturn = fromToolbar ? trigger : sheet;
      renderPapers((sel || studySelection).text);
      $('#app').scrollIntoView({block:'center',behavior:'instant'});
      if (!paperWindow.open) paperWindow.showModal();
      return;
    }
    if (sel) studySelection = sel;
    setReaderView(mode);
    if (mode === 'ai' && sel) chooseScope('selection'); else refreshStudy();
    $('#study-panel').focus({preventScroll:true});
    study.scrollIntoView({block:'nearest', behavior:reduce || keyboardInput ? 'instant' : 'smooth'});
  }
  for (const mode of ['ai']) {
    $('#study-' + mode).addEventListener('click', e => {
      const selection = selectionInSheet() || pending;
      if (mode !== 'papers' && studyMode === mode && !selection) {
        setReaderView('closed'); return;
      }
      if (selection) getSelection().removeAllRanges();
      hideBar(); openStudy(mode, selection, e.currentTarget);
    });
  }
  $('#reader-memo').addEventListener('click', () => setReaderView(studyMode === 'memo' ? 'closed' : 'memo'));
  $('#study-close').addEventListener('click', () => { const button = $(studyMode === 'wiki' ? '#reader-memo' : '#study-ai'); setReaderView('closed'); button?.focus({preventScroll:true}); });
  $('#study-reset').addEventListener('click', () => { refreshStudy(); studyQuery.focus({preventScroll:true}); });
  $$('[data-reader-scope]').forEach(b => b.addEventListener('click', () => chooseScope(b.dataset.readerScope)));
  $('#study-form').addEventListener('submit', e => { e.preventDefault(); const q = studyQuery.value.trim(); if (q) { studyOutput(q); if (studyMode === 'ai') studyQuery.value = ''; } });
  $$('[data-study-question]').forEach(b => b.addEventListener('click', () => { studyOutput(studyScope === 'selection' ? b.dataset.studyQuestion : '이 쪽을 요약해 주세요.'); }));
  $('#reader-thumbs-toggle').addEventListener('click', e => {
    const hidden = $('#pane-pdf').classList.toggle('thumbs-closed');
    $('#reader-thumbs').hidden = hidden;
    e.currentTarget.setAttribute('aria-expanded', String(!hidden));
    e.currentTarget.setAttribute('aria-label', hidden ? '쪽 미리보기 펼치기' : '쪽 미리보기 접기');
    layout();
  });
  $('#reader-page-one').addEventListener('click', () => { sheet.focus({preventScroll:true}); sheet.scrollIntoView({block:'nearest',behavior:'instant'}); });
  $('#reader-select').addEventListener('click', () => { sheet.focus({preventScroll:true}); announce('PDF에서 글을 드래그해 선택하세요.'); });
  paperResults.addEventListener('click', async e => {
    const button = e.target.closest('[data-paper-copy]');
    if (!button) return;
    try { await navigator.clipboard.writeText('https://doi.org/' + button.dataset.paperCopy); button.textContent = '복사했어요'; }
    catch (_) { button.textContent = '제목에서 링크를 복사해 주세요'; }
  });
  paperWindow.addEventListener('close', () => { paperReturn?.focus({preventScroll:true}); paperReturn = null; });
  function makeCard(m) { const c = document.createElement('div'); c.className = 'pcard enter'; c.tabIndex = -1; c.dataset.id = m.id; c.addEventListener('mouseenter', () => hot(m.id, true)); c.addEventListener('mouseleave', () => hot(m.id, false)); c.addEventListener('focusin', () => hot(m.id, true)); c.addEventListener('focusout', e => { if (!c.contains(e.relatedTarget)) hot(m.id, false); }); fillCard(c, m); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('enter'))); return c; }
  function fillCard(c, m) {
    const head = `<div class="k"><i style="background:${m.kind === 'wiki' ? 'var(--blue)' : '#FFD84A'}"></i>${m.kind === 'wiki' ? '위키백과' : '내 메모'} · “${esc(m.text.slice(0, 14))}”<button class="x" type="button" aria-label="이 카드 지우기">×</button></div>`;
    if (m.kind === 'memo') { c.innerHTML = head + `<textarea aria-label="메모 쓰기" placeholder="여기에 메모를 써요">${esc(m.note || '')}</textarea>`; const ta = c.querySelector('textarea'); ta.maxLength = 5000; ta.addEventListener('input', () => { m.note = ta.value; save(); layout(); }); }
    else { const w = m.wiki; c.innerHTML = head + (!w ? `<p class="loading">‘${esc(m.text)}’ 찾는 중…</p>` : !w.ok ? `<p>${esc(w.msg)}</p>` : `${w.img ? `<img class="wthumb" src="${esc(w.img)}" alt="">` : ''}${w.near ? '<p class="loading">가장 가까운 문서</p>' : ''}<h4>${esc(w.title)}</h4><p>${esc(w.extract)}</p><a href="${esc(w.url)}" target="_blank" rel="noopener">위키백과에서 보기 ↗</a>`); }
    c.querySelector('.x').addEventListener('click', () => { rememberMarks(); marks = marks.filter(x => x.id !== m.id); save(); render(); announce('카드를 지웠어요. 되돌리기로 복원할 수 있어요.'); });
  }
  function layout() {
    if (innerWidth <= 860) { $$('.pcard', cardsEl).forEach(c => c.style.top = ''); cardsEl.style.height = ''; return; }
    const base = cardsEl.getBoundingClientRect().top; let next = 0;
    const items = $$('.pcard', cardsEl).map(c => { const sp = $('.pm[data-id="' + c.dataset.id + '"]', textBox); return { c, y: sp ? sp.getBoundingClientRect().top - base - 10 : 0 }; }).sort((a, b) => a.y - b.y);
    items.forEach(({ c, y }) => { const top = Math.max(y, next); c.style.top = top + 'px'; next = top + c.offsetHeight + 10; });
    cardsEl.style.height = next + 'px';
  }
  function hot(id, on) { $$('[data-id="' + id + '"]').forEach(e => e.classList.toggle('hot', on)); }
  let pending = null;
  function selectionInSheet() { const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return null; const r = s.getRangeAt(0); if (!textBox.contains(r.startContainer) || !textBox.contains(r.endContainer)) return null; const start = offsetOf(r.startContainer, r.startOffset), end = offsetOf(r.endContainer, r.endOffset); const text = r.toString().trim(); if (!text || end <= start) return null; return { start, end, text, rect: r.getBoundingClientRect() }; }
  function showBar(sel) {
    if (studyMode === 'ai' && (studySelection.example || studySelection.start !== sel.start || studySelection.end !== sel.end)) {
      studySelection = {start:sel.start,end:sel.end,text:sel.text}; refreshStudy();
    }
    pending = sel; fbar.inert = false; const col = $('.sheet-col').getBoundingClientRect(); fbar.classList.add('show'); const bw = fbar.offsetWidth, bh = fbar.offsetHeight;
    let x = sel.rect.left + sel.rect.width / 2 - col.left - bw / 2; x = Math.max(8, Math.min(col.width - bw - 8, x));
    let y = sel.rect.top - col.top - bh - 10; const above = y >= 4; if (!above) y = sel.rect.bottom - col.top + 10;
    fbar.style.left = x + 'px'; fbar.style.top = y + 'px'; fbar.style.transformOrigin = `${Math.round(sel.rect.left + sel.rect.width / 2 - col.left - x)}px ${above ? '100%' : '0%'}`;
  }
  function hideBar() { fbar.classList.remove('show'); fbar.inert = true; pending = null; }
  const onSel = () => setTimeout(() => { const s = selectionInSheet(); if (s) showBar(s); else if (!fbar.contains(document.activeElement)) hideBar(); }, 10);
  sheet.addEventListener('mouseup', onSel); sheet.addEventListener('touchend', onSel); sheet.addEventListener('keyup', onSel);
  document.addEventListener('mousedown', e => { if (!fbar.contains(e.target) && !sheet.contains(e.target) && !e.target.closest('.reader-tools')) hideBar(); });
  fbar.addEventListener('mousedown', e => e.preventDefault());
  $$('.reader-tools button').forEach(b => b.addEventListener('mousedown', e => e.preventDefault()));
  $$('[data-reader-mark]').forEach(b => b.addEventListener('click', () => {
    const sel = selectionInSheet() || pending;
    if (!sel) { announce('본문을 드래그하거나 예시 낱말을 고른 뒤 도구를 눌러 보세요.'); $('.quick button').focus(); return; }
    showBar(sel);
    const mark = b.dataset.readerMark;
    $(mark === 'yellow' ? '[data-color="yellow"]' : '[data-kind="' + mark + '"]', fbar).click();
  }));
  $$('.quick [data-pick]').forEach(b => b.addEventListener('click', () => { if ($('#pane-pdf').hidden) selectApp($('#tab-pdf')); const word = b.dataset.pick, full = textNodes().map(n => n.data).join(''), i = full.indexOf(word); if (i < 0) return; const r = rangeFromOffsets(i, i + word.length); const s = getSelection(); s.removeAllRanges(); s.addRange(r); showBar({ start: i, end: i + word.length, text: word, rect: r.getBoundingClientRect() }); fbar.querySelector('button').focus({ preventScroll: true }); }));
  fbar.addEventListener('keydown', e => { if (e.key === 'Escape') { hideBar(); getSelection().removeAllRanges(); } });
  let seq = Date.now();
  $$('button', fbar).forEach(b => b.addEventListener('click', () => {
    if (!pending) return;
    if (b.dataset.study) {
      const { start, end, text } = pending;
      getSelection().removeAllRanges(); hideBar(); openStudy(b.dataset.study, {start,end,text}); return;
    }
    rememberMarks(); const { start, end, text } = pending; marks = marks.filter(m => m.end <= start || m.start >= end);
    const m = { id: 'm' + (seq++), start, end, text, color: b.dataset.color || 'yellow', kind: b.dataset.color ? 'hl' : b.dataset.kind };
    marks.push(m); getSelection().removeAllRanges(); hideBar(); render(); save(); sheet.focus({preventScroll:true}); announce('선택한 글에 표시를 남겼어요.');
    if (m.kind === 'memo') { setReaderView('memo'); const ta = $('.pcard[data-id="' + m.id + '"] textarea', cardsEl); if (ta) ta.focus({ preventScroll: true }); }
  }));
  // Older browser saves may contain Wikipedia cards. Keep them readable offline.
  function lookup(m) {
    const item = findStudy(m.text);
    m.wiki = item
      ? {ok:true,title:item.title,extract:item.extract,url:wikiSource(item)}
      : {ok:false,msg:'이 낱말의 위키백과 예시는 준비되어 있지 않아요.'};
    const card = $('.pcard[data-id="' + m.id + '"]', cardsEl);
    if (card) fillCard(card, m);
    layout();
  }
  const hideBtn = $('#hide-btn');
  function toggleHide() { const on = !textBox.classList.contains('hide-marks'); textBox.classList.toggle('hide-marks', on); hideBtn.setAttribute('aria-pressed', on); hideBtn.textContent = on ? '표시 보이기' : '표시 숨기기'; announce(on ? '표시를 잠시 숨겼어요. 다시 누르면 돌아와요.' : '표시를 다시 보여 드려요.'); }
  hideBtn.addEventListener('click', toggleHide);
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'H' || e.key === 'h') && $('#app').matches(':hover, :focus-within')) { e.preventDefault(); toggleHide(); } });
  $('#reset-btn').addEventListener('click', () => { if (!marks.length) return; rememberMarks(); marks = []; save(); render(); announce('모든 표시를 지웠어요. 되돌리기로 복원할 수 있어요.'); });
  $('#mark-undo').addEventListener('click', () => { if (!markHistory.length) return; marks = JSON.parse(markHistory.pop()); $$('.pcard', cardsEl).forEach(c => c.remove()); save(); render(); $('#mark-undo').disabled = !markHistory.length; announce('이전 표시로 되돌렸어요.'); });
  addEventListener('resize', () => requestAnimationFrame(layout));
  render(); marks.filter(m => m.kind === 'wiki' && !m.wiki).forEach(lookup);
  if (marks.some(m => m.kind === 'memo' || m.kind === 'wiki')) setReaderView('memo');

  const appTabs = $$('.app-tab');
  function selectApp(t) { hideBar(); getSelection()?.removeAllRanges(); appTabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); $('#pdf-tools').style.visibility = t.id === 'tab-pdf' ? 'visible' : 'hidden'; if (t.id === 'tab-note') sizeInk(); else layout(); }
  appTabs.forEach((t, i) => { t.addEventListener('click', () => selectApp(t)); t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = appTabs[(i + 1) % 2]; n.focus(); selectApp(n); } }); });

  /* ── Notebook: persistence, pointer identity, geometric erasing, undo ── */
  const paper = $('#paper'), cv = $('#ink'), ctx = cv.getContext('2d'), snap = $('#snap');
  const INK_KEY = 'folane-site-ink-v1';
  let strokes = [], cur2 = null, ink = '#1F2233', erasing = false, holdTimer, lastPt, pointerId = null;
  const history = [];
  const validPoint = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite) && p[0] >= -.1 && p[0] <= 1.1 && p[1] >= -.1 && p[1] <= 2 && p[2] >= 0 && p[2] <= 1;
  try { const data = JSON.parse(localStorage.getItem(INK_KEY) || '[]'); if (Array.isArray(data)) strokes = data.filter(s => s && /^#[0-9a-f]{6}$/i.test(s.color) && Array.isArray(s.pts) && s.pts.length > 0 && s.pts.length <= 3000 && s.pts.every(validPoint)).slice(-150); } catch (_) {}
  function saveInk() { try { localStorage.setItem(INK_KEY, JSON.stringify(strokes)); } catch (_) { announce('필기를 저장할 공간이 부족해요. 현재 화면에서는 계속 쓸 수 있어요.'); } }
  function inkState() { paper.classList.toggle('used', !!strokes.length || !!cur2); $('#undo-btn').disabled = !history.length; $('#clear-btn').disabled = !strokes.length; }
  function rememberInk() { history.push(JSON.stringify(strokes)); if (history.length > 30) history.shift(); }
  function sizeInk() { const r = paper.getBoundingClientRect(); if (!r.width) return; const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); redraw(); }
  function drawStroke(s) {
    const W = paper.clientWidth, pts = s.pts.map(p => [p[0] * W, p[1] * W, p[2]]); if (!pts.length) return;
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], 1.5, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    if (s.straight) ctx.lineTo(pts.at(-1)[0], pts.at(-1)[1]); else pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.stroke();
  }
  function redraw() { ctx.clearRect(0, 0, cv.width, cv.height); strokes.forEach(drawStroke); if (cur2 && !cur2.erase) drawStroke(cur2); inkState(); }
  const pt = e => { const r = paper.getBoundingClientRect(), W = r.width; return [(e.clientX - r.left) / W, (e.clientY - r.top) / W, e.pointerType === 'pen' ? (e.pressure || .5) : .5]; };
  function distance(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy; const t = l ? clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l) : 0; return Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy); }
  function eraseAt(p) { const R = 14 / paper.clientWidth; strokes = strokes.filter(s => { const ps = s.straight ? [s.pts[0],s.pts.at(-1)] : s.pts; return !ps.some((q,i) => distance(p, q, ps[i+1] || q) < R); }); redraw(); }
  function armHold() { clearTimeout(holdTimer); holdTimer = setTimeout(() => { if (!cur2 || cur2.erase || cur2.pts.length < 4) return; cur2.straight = true; redraw(); snap.style.left = '16px'; snap.style.top = '16px'; snap.classList.add('on'); setTimeout(() => snap.classList.remove('on'), 700); }, 480); }
  cv.addEventListener('pointerdown', e => { if (cur2 || (e.pointerType === 'mouse' && e.button !== 0)) return; pointerId = e.pointerId; cv.setPointerCapture(pointerId); rememberInk(); const p = pt(e); lastPt = p; cur2 = erasing ? { erase: true, pts: [] } : { color: ink, pts: [p] }; if (erasing) eraseAt(p); else { armHold(); redraw(); } });
  cv.addEventListener('pointermove', e => { if (!cur2 || e.pointerId !== pointerId) return; const p = pt(e); if (cur2.erase) { eraseAt(p); return; } if (cur2.straight) { cur2.pts[cur2.pts.length-1] = p; redraw(); return; } if (Math.hypot(p[0]-lastPt[0],p[1]-lastPt[1])*paper.clientWidth > 3) { lastPt = p; armHold(); } if (cur2.pts.length < 3000) cur2.pts.push(p); redraw(); });
  function endStroke(e) { if (e.pointerId !== pointerId) return; clearTimeout(holdTimer); if (cur2 && !cur2.erase && cur2.pts.length) { strokes.push(cur2); strokes = strokes.slice(-150); } cur2 = null; pointerId = null; snap.classList.remove('on'); redraw(); saveInk(); }
  cv.addEventListener('pointerup', endStroke); cv.addEventListener('pointercancel', endStroke); cv.addEventListener('lostpointercapture', endStroke);
  $$('[data-paper]').forEach(b => b.addEventListener('click', () => { $$('[data-paper]').forEach(x => x.setAttribute('aria-pressed', x === b)); paper.classList.remove('p-lines', 'p-grid', 'p-dots'); if (b.dataset.paper !== 'blank') paper.classList.add('p-' + b.dataset.paper); }));
  $$('[data-tone]').forEach(b => b.addEventListener('click', () => { $$('[data-tone]').forEach(x => x.setAttribute('aria-pressed', x === b)); paper.classList.toggle('cream', b.dataset.tone === 'cream'); }));
  $$('[data-ink]').forEach(b => b.addEventListener('click', () => { $$('[data-ink]').forEach(x => x.setAttribute('aria-pressed', x === b)); ink = b.dataset.ink; erasing = false; $('#erase-btn').setAttribute('aria-pressed', 'false'); }));
  $('#erase-btn').addEventListener('click', e => { erasing = !erasing; e.currentTarget.setAttribute('aria-pressed', erasing); cv.style.cursor = erasing ? 'cell' : 'crosshair'; });
  $('#undo-btn').addEventListener('click', () => { if (!history.length) return; strokes = JSON.parse(history.pop()); redraw(); saveInk(); announce('이전 필기로 되돌렸어요.'); });
  $('#clear-btn').addEventListener('click', () => { if (!strokes.length) return; rememberInk(); strokes = []; redraw(); saveInk(); announce('필기를 비웠어요. 되돌리기로 복원할 수 있어요.'); });
  addEventListener('resize', () => { if (!$('#pane-note').hidden) sizeInk(); });
  inkState();

  /* ── From a feature to the real control, without replacing someone's notes ── */
  function openShot(id) {
    const shot = SHOTS.find(s => s.id === id); if (!shot) return;
    show(shot); moveTo($('#look')); $('#lt-' + id).focus({ preventScroll: true });
  }
  function startDemo(action) {
    if (action === 'ai') { openShot('ask'); return; }
    selectApp($('#' + (action === 'note' ? 'tab-note' : 'tab-pdf')));
    if (action === 'papers' || action === 'lookup' || action === 'question') {
      openStudy(action === 'lookup' ? 'wiki' : action === 'question' ? 'ai' : 'papers', {text:studyTerms[0].word,example:true}); return;
    }
    if (action === 'note') { moveTo($('#app')); $('#tab-note').focus({ preventScroll: true }); announce('종이와 펜 색을 골라 그어 보세요. 끝에서 멈추면 직선이 돼요.'); return; }
    const kind = action === 'memo' ? 'memo' : 'hl';
    const existing = marks.find(m => m.kind === kind);
    if (existing) {
      if (kind === 'memo') setReaderView('memo');
      const target = kind === 'memo' ? $('.pcard[data-id="' + existing.id + '"] textarea', cardsEl) : $('.pm[data-id="' + existing.id + '"]', textBox);
      if (target) { if (!target.hasAttribute('tabindex')) target.tabIndex = -1; target.focus({ preventScroll: true }); target.scrollIntoView({ behavior: reduce || keyboardInput ? 'instant' : 'smooth', block: 'center' }); }
      announce(kind === 'memo' ? '남겨 둔 메모를 이어 써 보세요.' : '남겨 둔 표시가 있어요. 다른 낱말도 골라 보세요.'); return;
    }
    // Pick an unused word so a demo shortcut never erases an existing annotation.
    const words = kind === 'memo' ? ['아비투스', '필터 버블', '에코챔버'] : ['에코챔버', '필터 버블', '아비투스'];
    const word = words.find(w => { const i = textBox.textContent.indexOf(w); return !marks.some(m => m.start < i + w.length && m.end > i); });
    if (!word) { sheet.focus({ preventScroll: true }); moveTo($('#app')); announce('다른 문장을 드래그해 새 표시를 남겨 보세요. 기존 메모는 그대로 있어요.'); return; }
    $('.quick [data-pick="' + word + '"]').click();
    if (textBox.classList.contains('hide-marks')) toggleHide();
    {
      $(kind === 'memo' ? '[data-kind="memo"]' : '[data-color="yellow"]', fbar).click();
      const target = kind === 'memo' ? $('.pcard textarea:focus', cardsEl) : $('.pm.c-yellow', textBox);
      target?.scrollIntoView({ behavior: reduce || keyboardInput ? 'instant' : 'smooth', block: 'center' });
      announce(kind === 'memo' ? '문장 옆에 메모 칸을 열었어요. 생각을 적어 보세요.' : '문장에 노란 표시를 남겼어요. 다른 글도 드래그해 보세요.');
    }
  }
  document.addEventListener('click', e => {
    const shot = e.target.closest('[data-show-shot]'), action = e.target.closest('[data-try-action]');
    if (shot || action) { e.preventDefault(); if (shot) openShot(shot.dataset.showShot); else startDemo(action.dataset.tryAction); }
  });
  // These existing features have a concrete screen or control to explore.
  const moreTargets = { '문서 번역': ['translate', '번역 화면 보기'], '음성 메모·실시간 자막': ['captions', '자막 화면 보기'], '지우개': ['note', '펜과 지우개 써 보기'] };
  $$('.mcard').forEach(card => {
    const target = moreTargets[$('h3', card).textContent]; if (!target) return;
    const a = document.createElement('a'); a.className = 'text-action'; a.href = target[0] === 'note' ? '#try' : '#look';
    a.dataset[target[0] === 'note' ? 'tryAction' : 'showShot'] = target[0]; a.textContent = target[1] + ' ↗'; card.appendChild(a);
  });
})();
