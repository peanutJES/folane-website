// Folane 모션 장(#field): 형광펜 색 구체가 떠다니다가 → 밑줄처럼 내려앉고 → F 리본 모양으로 모였다가 → 화면 너머로 날아가요.
// three.js는 이 장이 가까워질 때만 CDN에서 불러와요. 못 불러오면 배경 그라데이션과 글만 보여요.
const sec = document.getElementById('field');
const stage = document.getElementById('field-stage');
const canvas = document.getElementById('field-canvas');
if (sec && stage && canvas) start();

function start() {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
  // F 리본 안쪽에 고르게 뿌린 자리(아이콘 마스크에서 뽑음, x·y는 -1~1)
  const F_TARGETS = /*FTARGETS*/{"96":{"d":0.0894,"p":[[-0.663,-0.012],[0.514,0.004],[0.373,0.616],[-0.733,0.129],[-0.122,-0.49],[-0.239,-0.412],[-0.694,-0.82],[-0.247,0.537],[0.475,0.592],[-0.129,0.686],[0.247,0.012],[-0.506,0.545],[0.075,0.631],[0.459,0.765],[0.239,0.459],[-0.255,0.741],[0.153,-0.529],[-0.114,-0.333],[-0.231,0.631],[0.71,0.914],[-0.6,-0.161],[0.153,0.333],[-0.224,0.451],[0.569,-0.082],[0.106,-0.169],[-0.725,-0.624],[-0.231,0.02],[0.09,-0.388],[-0.459,-0.231],[0.325,-0.498],[0.059,0.051],[0.42,0.906],[-0.357,0.773],[-0.608,-0.694],[-0.788,-0.906],[-0.78,-0.765],[0.624,0.035],[0.396,0.482],[-0.318,-0.286],[-0.639,0.098],[-0.42,0.49],[0.537,0.475],[0.365,0.725],[-0.529,0.122],[-0.129,-0.224],[0.373,-0.373],[0.271,0.773],[-0.467,-0.592],[-0.694,0.318],[0.647,0.576],[-0.137,0.553],[-0.482,-0.38],[-0.561,-0.443],[-0.576,0.459],[-0.004,0.341],[0.153,0.529],[0.576,0.843],[-0.176,0.114],[0.404,-0.027],[0.71,0.671],[0.027,-0.286],[-0.388,-0.059],[-0.02,0.561],[-0.624,-0.325],[0.184,0.686],[0.451,-0.184],[-0.333,-0.686],[-0.388,0.388],[0.757,0.788],[-0.498,0.396],[0.012,0.749],[-0.137,0.859],[0.396,0.349],[0.294,-0.169],[-0.208,-0.137],[-0.302,0.161],[0.192,0.875],[0.239,0.576],[-0.09,0.027],[-0.718,-0.475],[-0.349,0.561],[0.153,-0.02],[-0.098,0.404],[0.224,-0.31],[-0.576,-0.592],[0.075,0.843],[0.553,0.671],[0.027,0.459],[-0.012,0.89],[-0.514,-0.051],[-0.333,-0.161],[-0.051,-0.145],[-0.388,-0.451],[0.271,0.31],[-0.004,-0.482],[-0.467,-0.757]]},"54":{"d":0.124,"p":[[0.647,0.843],[-0.02,-0.506],[0.153,-0.506],[0.263,-0.404],[-0.757,-0.631],[0.286,0.482],[0.004,0.569],[0.263,0.749],[-0.365,0.404],[-0.38,0.725],[0.435,0.89],[-0.208,-0.161],[-0.137,0.373],[-0.302,0.176],[-0.773,-0.898],[0.082,0.012],[0.529,0.02],[0.004,0.882],[-0.467,-0.302],[-0.349,-0.208],[0.145,-0.137],[0.145,0.608],[-0.412,-0.451],[-0.035,-0.169],[-0.529,-0.6],[0.106,0.459],[0.137,0.773],[0.302,-0.075],[0.396,-0.349],[-0.075,0.733],[-0.514,-0.145],[-0.051,0.106],[-0.2,-0.004],[-0.655,-0.835],[0.176,-0.302],[0.435,-0.2],[-0.153,0.537],[0.671,0.639],[-0.224,-0.42],[-0.647,0.122],[-0.341,-0.694],[0.42,0.639],[-0.529,0.584],[0.592,0.451],[-0.655,-0.043],[-0.624,-0.318],[-0.506,0.027],[0.325,0.31],[0.255,0.882],[-0.129,-0.278],[-0.325,0.569],[-0.537,-0.796],[-0.576,0.357],[-0.2,0.812]]}}/*END*/;
  const motionQ = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  let reduce = motionQ.matches;
  const nav = document.getElementById('nav');

  const control = { progress: -1, started: false };
  const mouse = { x: 99, y: 99, isDown: false };
  let stageNow = -1, visible = false, built = false, loading = false, api = null;

  const vh = () => window.innerHeight || 1;
  function readProgress() {
    const top = sec.getBoundingClientRect().top;
    control.progress = -top / vh();
    const p = control.progress;
    // 어두운 AI 구역에서 들어올 때는 무대도 어둡게 시작했다가, 장이 화면을 덮을 즈음 조명이 켜져요
    const s = p > 2.45 ? 3 : p > 1.55 ? 2 : p > 0.7 ? 1 : p > -0.1 ? 0 : 3;
    if (s !== stageNow) { stageNow = s; stage.dataset.stage = s; sec.dataset.stage = s; }
    // 넷째 막은 무대가 어두워져요. 메뉴도 그 위에서는 어두운 쪽으로 맞춰요.
    if (nav) {
      const r = stage.getBoundingClientRect();
      if (s === 3 && r.top <= 26 && r.bottom > 26 && scrollY > 8) { nav.classList.add('dark'); nav.classList.remove('light', 'top'); }
    }
    if (!control.started && p > -0.62) control.started = true;
  }
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { readProgress(); ticking = false; }); }, { passive: true });
  addEventListener('resize', readProgress);
  readProgress();

  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / Math.max(1, r.height)) * 2 + 1;
  }, { passive: true });
  addEventListener('pointerdown', () => { mouse.isDown = true; }, { passive: true });
  addEventListener('pointerup', () => { mouse.isDown = false; }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { mouse.x = 99; mouse.y = 99; });

  // 가까워지면 불러오고, 보일 때만 그려요
  const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near.disconnect(); load(); } }, { rootMargin: '120% 0px' });
  near.observe(sec);
  const seen = new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (api) visible ? api.play() : api.pause(); }), { rootMargin: '10% 0px' });
  seen.observe(stage);
  document.addEventListener('visibilitychange', () => { if (!api) return; document.hidden ? api.pause() : visible && api.play(); });
  motionQ.addEventListener?.('change', e => { reduce = e.matches; if (api) api.setReduce(reduce); });

  async function load() {
    if (loading || built || saveData) return; loading = true;
    let THREE;
    try { THREE = await import(THREE_URL); } catch (err) { sec.classList.add('no-webgl'); return; }
    try { api = build(THREE); built = true; sec.classList.add('webgl-on'); if (visible) api.play(); }
    catch (err) { sec.classList.add('no-webgl'); console.warn('field', err); }
  }

  function build(THREE) {
    const container = stage;
    const W0 = () => container.clientWidth || innerWidth, H0 = () => container.clientHeight || innerHeight;
    const isMobile = innerWidth < 768;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W0() / H0(), 0.1, 100);
    camera.position.set(0, 0, 11);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 1.75));
    renderer.setSize(W0(), H0(), false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 형광펜 다섯 색 중 파랑 → 노랑 → 분홍 순서로 장마다 색이 바뀌어요
    const fam = (pastel, light, medium, deep, glass) => ({ pastel: new THREE.Color(pastel), light: new THREE.Color(light), medium: new THREE.Color(medium), deep: new THREE.Color(deep), glass: new THREE.Color(glass) });
    const palBlue = fam('#EEF1FF', '#B9C8FF', '#6F8DFF', '#3048D6', '#8EA6FF');
    const palYellow = fam('#FFF9DD', '#FFEB8C', '#FFD84A', '#F0A800', '#FFE36B');
    const palPink = fam('#FFF2F5', '#FFD0DC', '#FF8CAA', '#E8456F', '#FF9DB7');
    const ROLES = ['pastel', 'light', 'medium', 'deep', 'glass'];
    const curPal = fam('#000', '#000', '#000', '#000', '#000');
    for (const r of ROLES) curPal[r].copy(palBlue[r]);

    const hemiLight = new THREE.HemisphereLight(0xffffff, palBlue.medium.clone(), 1.6); scene.add(hemiLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(-6, 10, 8); keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
    Object.assign(keyLight.shadow.camera, { near: 0.5, far: 30, left: -8, right: 8, top: 8, bottom: -8 });
    keyLight.shadow.bias = -0.0003; keyLight.shadow.radius = 12.0; scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.25); rimLight.position.set(8, 7, -8); scene.add(rimLight);
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4); frontLight.position.set(0, 0, 11); scene.add(frontLight);
    const sideLight = new THREE.DirectionalLight(0xffffff, 0.3); sideLight.position.set(-9, -2, 4); scene.add(sideLight);

    let viewportWidth = 10, viewportHeight = 6;
    // 떠 있는 덩어리의 중심: 글이 놓이는 쪽(넓은 화면은 왼쪽 아래, 휴대폰은 아래)을 피해요
    const cc = new THREE.Vector3();
    const updateFrustum = () => {
      viewportHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z; viewportWidth = viewportHeight * (W0() / H0());
      const wide = viewportWidth / viewportHeight > 1.2; cc.set(wide ? viewportWidth * 0.09 : 0, viewportHeight * (wide ? 0.07 : 0.17), 0);
    };
    updateFrustum();

    const ballCount = isMobile ? 54 : 96;
    const targets = F_TARGETS[String(ballCount)];
    const geo = new THREE.SphereGeometry(1, isMobile ? 32 : 48, isMobile ? 32 : 48);
    const balls = [];
    for (let i = 0; i < ballCount; i++) {
      const rand = Math.random();
      const radius = rand < 0.3 ? 0.27 + Math.random() * 0.12 : rand < 0.8 ? 0.42 + Math.random() * 0.18 : 0.66 + Math.random() * 0.21;
      const isGlass = Math.random() < 0.22;
      let role = 'glass', mat;
      if (isGlass) {
        mat = new THREE.MeshPhysicalMaterial({ color: palBlue.glass, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, transmission: 0.95, ior: 1.485, thickness: 2.2, specularColor: new THREE.Color('#ffffff'), specularIntensity: 1, attenuationColor: palBlue.pastel, attenuationDistance: 1, emissive: palBlue.glass, emissiveIntensity: 0.12, transparent: true });
      } else {
        const c = Math.random();
        role = c < 0.25 ? 'pastel' : c < 0.55 ? 'light' : c < 0.85 ? 'medium' : 'deep';
        mat = new THREE.MeshPhysicalMaterial({ color: palBlue[role], roughness: 0.44, metalness: 0, clearcoat: 0.24, clearcoatRoughness: 0.35, emissive: palBlue[role], emissiveIntensity: 0.08, transparent: true });
      }
      const group = new THREE.Group(); const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(radius); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); scene.add(group);
      balls.push({ id: i, radius, mass: radius ** 3, position: new THREE.Vector3(), velocity: new THREE.Vector3(), group, mesh, mat, role, isGlass, visualScale: radius, shapeTarget: new THREE.Vector3() });
    }
    const meanRadius = balls.reduce((s, b) => s + b.radius, 0) / balls.length;
    let shapeScale = 1;

    // F 리본 자리: 화면 가운데에서 살짝 위, 글과 겹치지 않을 만큼
    const assignTargets = () => {
      const wide = viewportWidth / viewportHeight > 1.2;
      const S = wide ? Math.min(viewportWidth * 0.22, viewportHeight * 0.32) : Math.min(viewportWidth * 0.42, viewportHeight * 0.3);
      const cx = wide ? viewportWidth * 0.07 : 0, cy = viewportHeight * (wide ? 0.0 : 0.03);
      shapeScale = Math.max(0.3, Math.min(1, (targets.d * S * 0.56) / meanRadius));
      balls.forEach((b, i) => { const [x, y] = targets.p[i % targets.p.length]; b.shapeTarget.set(x * S + cx, y * S + cy, (Math.random() - 0.5) * 0.35); });
    };
    assignTargets();

    const scatterFar = inward => {
      const R = Math.max(viewportWidth, viewportHeight) * 1.5;
      for (const b of balls) {
        const a = Math.random() * Math.PI * 2, px = Math.cos(a) * R * 1.25, py = Math.sin(a) * R * 0.85, pz = (Math.random() - 0.5) * 4;
        b.position.set(px, py, pz); b.group.position.copy(b.position);
        inward ? b.velocity.set(-px, -py, -pz).normalize().multiplyScalar(0.08 + Math.random() * 0.05) : b.velocity.set(0, 0, 0);
      }
    };
    scatterFar(false);

    const params = { rebound: -0.3, mouseRepelForce: 0.05, mouseRepelRadius: 4.4, centerAttractForce: 0.0035, bounciness: 0.02 };
    const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
    const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const mProj = new THREE.Vector3(), mWorld = new THREE.Vector3(), prevMouse = new THREE.Vector3();
    const diffVec = new THREE.Vector3(), cDiff = new THREE.Vector3(), relVel = new THREE.Vector3(), dPos = new THREE.Vector3(), rotAxis = new THREE.Vector3();
    const updateMouse3D = () => {
      mProj.set(mouse.x, mouse.y, 0.5).unproject(camera);
      const dir = mProj.sub(camera.position).normalize();
      mWorld.copy(camera.position).add(dir.multiplyScalar(-camera.position.z / dir.z));
    };

    let raf = 0, localStarted = false, entranceStart = 0, mouseSpeed = 0;

    // 움직임 줄이기: F 모양으로 모인 한 장면만 그려요
    function still() {
      for (const r of ROLES) curPal[r].copy(palBlue[r]);
      for (const b of balls) {
        b.position.copy(b.shapeTarget); b.visualScale = b.radius * shapeScale; b.mesh.scale.setScalar(b.visualScale);
        b.group.position.copy(b.position); b.mat.opacity = 1;
        const c = b.isGlass ? curPal.glass : curPal[b.role]; b.mat.color.copy(c); b.mat.emissive.copy(c);
      }
      hemiLight.groundColor.copy(curPal.medium);
      renderer.render(scene, camera);
    }

    // 화면 주사율(60·120Hz)과 상관없이 물리는 1초에 60번만 계산하고, 그리기는 매 프레임 해요
    const STEP = 1 / 60;
    let acc = 0, simTime = 0, lastNow = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const ts = now / 1000, dt = lastNow ? Math.min(0.1, ts - lastNow) : STEP; lastNow = ts;
      updateMouse3D();
      if (control.started && !localStarted) { localStarted = true; entranceStart = simTime; scatterFar(true); }
      if (!localStarted) { renderer.render(scene, camera); return; }
      acc += dt; let steps = 0;
      while (acc >= STEP && steps < 3) { simTime += STEP; simulate(simTime); acc -= STEP; steps++; }
      if (steps === 3) acc = 0;
      renderer.render(scene, camera);
    }
    function simulate(time) {
      const progress = control.progress;

      const heroF = 1 - smoothstep(0.30, 0.80, progress);
      const dropRaw = smoothstep(0.40, 0.95, progress);
      const flyF = smoothstep(2.45, 3.1, progress);
      const shapeF = smoothstep(1.40, 2.05, progress) * (1 - smoothstep(2.3, 2.75, progress));
      const dropF = dropRaw * (1 - smoothstep(1.25, 1.75, progress));

      const bY = smoothstep(0.55, 1.05, progress), bP = smoothstep(1.40, 1.95, progress);
      for (const r of ROLES) curPal[r].copy(palBlue[r]).lerp(palYellow[r], bY).lerp(palPink[r], bP);
      hemiLight.groundColor.copy(curPal.medium);

      const entranceT = easeOutCubic(clamp01((time - entranceStart) / 2.2));
      const attractionBoost = lerp(7.5, 1, entranceT);
      const interacting = Math.abs(mouse.x) < 0.99 && Math.abs(mouse.y) < 0.99;
      mouseSpeed = interacting ? Math.min(3, mWorld.distanceTo(prevMouse)) : 0;
      prevMouse.copy(mWorld);

      let damping = 0.91;
      damping = lerp(damping, 0.992, dropF); damping = lerp(damping, 0.90, shapeF); damping = lerp(damping, 0.985, flyF);
      const camZ = camera.position.z;
      const clusterActive = Math.max(heroF, entranceT < 1 ? 1 : 0);

      for (const b of balls) {
        if (heroF > 0.01) {
          b.velocity.x += Math.sin(time * 0.4 + b.id * 1.5) * 0.0004 * b.radius * heroF;
          b.velocity.y += Math.cos(time * 0.5 + b.id * 1.2) * 0.0004 * b.radius * heroF;
          b.velocity.z += Math.sin(time * 0.35 + b.id) * 0.0001 * heroF;
        }
        const cs = params.centerAttractForce * attractionBoost * clusterActive;
        if (cs > 0.00001) { b.velocity.x += (cc.x - b.position.x) * cs * 0.38; b.velocity.y += (cc.y - b.position.y) * cs * 1.85; b.velocity.z += -b.position.z * cs * 1.8; }
        if (dropF > 0.001) b.velocity.y -= 0.011 * dropF;
        if (shapeF > 0.001) { const k = 0.06 * shapeF; b.velocity.x += (b.shapeTarget.x - b.position.x) * k; b.velocity.y += (b.shapeTarget.y - b.position.y) * k; b.velocity.z += (b.shapeTarget.z - b.position.z) * k; }
        if (flyF > 0.001) {
          const stagger = (b.id * 0.6180339887) % 1, local = smoothstep(stagger * 0.55, stagger * 0.55 + 0.45, flyF);
          b.velocity.z += 0.05 * local; b.velocity.x += b.position.x * 0.006 * local; b.velocity.y += b.position.y * 0.006 * local;
        }
        if (interacting) {
          diffVec.subVectors(b.position, mWorld);
          const dist = diffVec.length(), rad = mouse.isDown ? params.mouseRepelRadius * 1.4 : params.mouseRepelRadius, force = mouse.isDown ? params.mouseRepelForce * 1.7 : params.mouseRepelForce;
          if (dist < rad && dist > 0.0001) {
            const q = dist / rad, smooth = 1 - q * q * (3 - 2 * q);
            diffVec.normalize(); diffVec.z *= 0.12; diffVec.normalize();
            b.velocity.addScaledVector(diffVec, smooth * force * (1 + mouseSpeed * 3.2));
          }
        }
        b.velocity.multiplyScalar(damping);
        b.position.addScaledVector(b.velocity, 1);
        const c = b.isGlass ? curPal.glass : curPal[b.role];
        b.mat.color.copy(c); b.mat.emissive.copy(c);
        b.mat.opacity = flyF > 0.001 ? 1 - smoothstep(camZ - 2.6, camZ - 0.3, b.position.z) : 1;
        const targetVis = b.radius * (1 - (1 - shapeScale) * shapeF);
        b.visualScale += (targetVis - b.visualScale) * 0.12;
        b.mesh.scale.setScalar(b.visualScale);
      }

      // 서로 부딪힘(모양을 만들 때는 거의 끄고, 날아갈 때는 꺼요)
      const collideScale = 0.28 * (1 - 0.93 * shapeF) * (1 - flyF);
      if (collideScale > 0.0005) for (let step = 0; step < 4; step++) for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        const b1 = balls[i], b2 = balls[j];
        cDiff.subVectors(b2.position, b1.position);
        const dist = cDiff.length(), minDist = b1.visualScale + b2.visualScale;
        if (dist < minDist && dist > 0.001) {
          const overlap = minDist - dist; cDiff.multiplyScalar(1 / dist);
          const tm = b1.mass + b2.mass;
          b1.position.addScaledVector(cDiff, -overlap * (b2.mass / tm) * collideScale);
          b2.position.addScaledVector(cDiff, overlap * (b1.mass / tm) * collideScale);
          relVel.subVectors(b2.velocity, b1.velocity);
          const van = relVel.dot(cDiff);
          if (van < -0.0001) { const imp = -(1 + params.bounciness) * van / (1 / b1.mass + 1 / b2.mass); b1.velocity.addScaledVector(cDiff, -imp / b1.mass); b2.velocity.addScaledVector(cDiff, imp / b2.mass); }
        }
      }

      // 화면 벽과 튀는 바닥
      const xBound = viewportWidth / 2 - 0.2, topY = viewportHeight / 2 - 0.05, floorY = -viewportHeight / 2 + 0.05, zBound = 2.0;
      const restitution = 0.30 + 0.35 * dropF, contain = flyF < 0.5, zContain = flyF < 0.02;
      for (const b of balls) {
        const r = b.visualScale;
        if (contain) {
          if (b.position.x < -xBound - r) { b.position.x = -xBound - r; b.velocity.x *= params.rebound; }
          else if (b.position.x > xBound + r) { b.position.x = xBound + r; b.velocity.x *= params.rebound; }
          if (b.position.y - r < floorY) { b.position.y = floorY + r; if (b.velocity.y < 0) b.velocity.y = -b.velocity.y * restitution; if (dropF > 0.3) { b.velocity.x *= 0.86; b.velocity.z *= 0.86; } }
          if (b.position.y + r > topY) { b.position.y = topY - r; if (b.velocity.y > 0) b.velocity.y *= params.rebound; }
        }
        if (zContain) { if (b.position.z < -zBound) { b.position.z = -zBound; b.velocity.z *= params.rebound; } else if (b.position.z > zBound) { b.position.z = zBound; b.velocity.z *= params.rebound; } }
        dPos.copy(b.position).sub(b.group.position);
        if (dPos.lengthSq() > 0.000001) { rotAxis.set(dPos.y, -dPos.x, 0).normalize(); b.group.rotateOnWorldAxis(rotAxis, (dPos.length() / b.radius) * 0.95); }
        b.group.position.copy(b.position);
      }
    }

    const onResize = () => {
      camera.aspect = W0() / H0(); camera.updateProjectionMatrix(); renderer.setSize(W0(), H0(), false);
      updateFrustum(); assignTargets(); if (reduce) still();
    };
    new ResizeObserver(onResize).observe(container);

    let running = false;
    const api = {
      play() { if (reduce) { still(); return; } if (running) return; running = true; lastNow = 0; raf = requestAnimationFrame(frame); },
      pause() { running = false; cancelAnimationFrame(raf); raf = 0; },
      setReduce(v) { reduce = v; if (v) { api.pause(); still(); } else if (visible) api.play(); }
    };
    if (reduce) still();
    return api;
  }
}
