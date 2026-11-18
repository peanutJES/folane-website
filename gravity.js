// 명세(Gravity field)대로 만든 첫 네 구역의 WebGL 장면.
// 화면 전체에 고정된 캔버스, 구체 96개(휴대폰 54개), 스크롤로 떠 있음 → 떨어짐 → 하트 → 렌즈 속으로.
// 명세와 다른 점: 명세 페이지에는 없는 아래쪽 구역 때문에 다 날아간 뒤(진행 3.8 넘음)에는 그리기를 쉬고,
// 움직임 줄이기에서는 날아드는 장면을 미리 계산해 한 장면만 그려요.
import * as THREE from 'three';

const control = { progress: 0, started: !!window.__gravityStarted };
const mousePos = { x: 99, y: 99, isDown: false };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const host = document.getElementById('g-canvas-host');
const bg = document.getElementById('g-bg');
let current = null;

/* ── 스크롤 → 진행도, 배경 단계 ── */
let ticking = false;
function onScroll() {
  const vh = window.innerHeight || 1;
  const progress = window.scrollY / vh;
  control.progress = progress;
  const stage = progress > 1.55 ? 2 : progress > 0.7 ? 1 : 0;
  if (bg && bg.dataset.stage !== String(stage)) bg.dataset.stage = stage;
  if (current) current.wake();
}
addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); }, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ── 커서 ── */
window.addEventListener('pointermove', e => {
  mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('mousedown', () => mousePos.isDown = true);
window.addEventListener('mouseup', () => mousePos.isDown = false);

addEventListener('gravity:start', () => { control.started = true; });

// 아래 구역이 다 덮고 있을 때는 고정 캔버스·배경을 숨겨 합성 비용을 없애요
function setLayers(on) { const v = on ? '' : 'hidden'; host.style.visibility = v; if (bg) bg.style.visibility = v; }
addEventListener('scroll', () => { if (reduce && control.progress > 3.8) setLayers(false); else if (reduce) setLayers(true); }, { passive: true });

/* ── 장면 ── */
function createScene(ballColor, onReady) {
  const canvas = document.createElement('canvas');
  canvas.className = 'g-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.replaceChildren(canvas);
  const container = host;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemiLight = new THREE.HemisphereLight(0xffffff, new THREE.Color(ballColor), 1.6);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(-6, 10, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.radius = 12.0;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.25);
  rimLight.position.set(8, 7, -8);
  scene.add(rimLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
  frontLight.position.set(0, 0, 11);
  scene.add(frontLight);

  const sideBounceLight = new THREE.DirectionalLight(0xffffff, 0.3);
  sideBounceLight.position.set(-9, -2, 4);
  scene.add(sideBounceLight);

  let viewportWidth = 10;
  let viewportHeight = 6;
  const updateFrustumBounds = () => {
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    viewportHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
    viewportWidth = viewportHeight * (container.clientWidth / container.clientHeight);
  };
  updateFrustumBounds();

  const isMobile = window.innerWidth < 768;
  const ballCount = isMobile ? 54 : 96;

  const getDynamicColors = (baseColor) => {
    const hex = baseColor.toLowerCase();
    if (hex === '#e1fc03') {
      // 애플식(2026-11-19): 연두 공 → 은색 공
      return { pastel: new THREE.Color('#FFFFFF'), light: new THREE.Color('#F2F2F5'),
        medium: new THREE.Color('#D2D2D7'), deep: new THREE.Color('#A1A1A6'), glass: new THREE.Color('#E8E8ED') };
    } else if (hex === '#ffc5c2' || hex === '#ffa19e') {
      // 애플식(2026-11-19): 분홍 공 → 진주색 공
      return { pastel: new THREE.Color('#FFFFFF'), light: new THREE.Color('#F5F5F7'),
        medium: new THREE.Color('#E5E5EA'), deep: new THREE.Color('#C7C7CC'), glass: new THREE.Color('#EEF3FA') };
    } else if (hex === '#96e5ff') {
      return { pastel: new THREE.Color('#F0F9FF'), light: new THREE.Color('#C9F1FF'),
        medium: new THREE.Color('#96E5FF'), deep: new THREE.Color('#2BA5FF'), glass: new THREE.Color('#98E4FF') };
    } else if (hex === '#2f69ff') {
      // 애플식(2026-11-19): 파랑은 #0071E3 하나
      return { pastel: new THREE.Color('#F2F7FF'), light: new THREE.Color('#BFD8FF'),
        medium: new THREE.Color('#0071E3'), deep: new THREE.Color('#0058B0'), glass: new THREE.Color('#5AA2F0') };
    } else if (hex === '#141414' || hex === '#000000') {
      return { pastel: new THREE.Color('#D8D8D8'), light: new THREE.Color('#555555'),
        medium: new THREE.Color('#242424'), deep: new THREE.Color('#0A0A0A'), glass: new THREE.Color('#1F1F1F') };
    }
    const c = new THREE.Color(baseColor);
    return { pastel: c.clone().offsetHSL(0, -0.15, 0.25), light: c.clone().offsetHSL(0, -0.05, 0.12),
      medium: c.clone(), deep: c.clone().offsetHSL(0.01, 0.1, -0.12), glass: c.clone() };
  };

  const palette = getDynamicColors(ballColor);
  const isBlack = ['#141414', '#18181b', '#000000'].includes(ballColor.toLowerCase());

  const palHero = palette;
  const palLime = getDynamicColors('#E1FC03');
  const palPink = getDynamicColors('#FFC5C2');
  const ROLES = ['pastel', 'light', 'medium', 'deep', 'glass'];
  const curPal = { pastel: new THREE.Color(), light: new THREE.Color(), medium: new THREE.Color(),
    deep: new THREE.Color(), glass: new THREE.Color() };

  const sphereGeometry = new THREE.SphereGeometry(1, 48, 48);
  const balls = [];
  for (let i = 0; i < ballCount; i++) {
    let radius = 0.33;
    const rand = Math.random();
    if (rand < 0.3) radius = 0.27 + Math.random() * 0.12;
    else if (rand < 0.8) radius = 0.42 + Math.random() * 0.18;
    else radius = 0.66 + Math.random() * 0.21;

    const mass = Math.pow(radius, 3);

    let chosenColor = palette.medium;
    let color = palette.medium;
    let sphereMat;
    let role = 'medium';

    const isGlass = Math.random() < 0.22 && !isBlack;

    if (isGlass) {
      sphereMat = new THREE.MeshPhysicalMaterial({
        color: palette.glass, roughness: 0.08, metalness: 0.0,
        clearcoat: 1.0, clearcoatRoughness: 0.03, transmission: 0.95,
        ior: 1.485, thickness: 2.2,
        specularColor: new THREE.Color('#ffffff'), specularIntensity: 1.0,
        attenuationColor: palette.pastel, attenuationDistance: 1.0,
        emissive: palette.glass, emissiveIntensity: 0.12,
        transparent: true,
      });
      color = palette.glass;
      role = 'glass';
    } else {
      const colorRand = Math.random();
      if (colorRand < 0.25) { chosenColor = palette.pastel; role = 'pastel'; }
      else if (colorRand < 0.55) { chosenColor = palette.light; role = 'light'; }
      else if (colorRand < 0.85) { chosenColor = palette.medium; role = 'medium'; }
      else { chosenColor = palette.deep; role = 'deep'; }

      sphereMat = new THREE.MeshPhysicalMaterial({
        color: chosenColor, roughness: 0.44, metalness: 0.0,
        clearcoat: 0.24, clearcoatRoughness: 0.35,
        emissive: isBlack ? new THREE.Color('#000000') : chosenColor,
        emissiveIntensity: isBlack ? 0.0 : 0.08,
        transparent: true,
      });
      color = chosenColor;
    }

    const group = new THREE.Group();
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMat);
    sphereMesh.scale.setScalar(radius);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    group.add(sphereMesh);
    scene.add(group);

    balls.push({
      id: i, radius, mass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(),
      meshGroup: group, sphere: sphereMesh, material: sphereMat, role, isGlass,
      visualScale: radius, color,
      restPosition: new THREE.Vector3(0, 0, 0),
      shapeTarget: new THREE.Vector3(),
      angleY: Math.random() * Math.PI * 2,
      angleZ: 0.1 + Math.random() * 0.45,
    });
  }

  const meanRadius = balls.reduce((sum, b) => sum + b.radius, 0) / balls.length;
  let shapeScale = 1;

  const inHeart = (x, y) => {
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y <= 0;
  };
  const assignHeartTargets = () => {
    const S = Math.min(viewportWidth * 0.30, viewportHeight * 0.27);
    const baseCY = -viewportHeight * 0.03;
    shapeScale = Math.max(0.3, Math.min(1, (S * 0.45 / 2.3) / meanRadius));
    for (let i = 0; i < balls.length; i++) {
      let x = 0, y = 0, tries = 0;
      do {
        x = (Math.random() * 2 - 1) * 1.25;
        y = Math.random() * 2.55 - 1.4;
        tries++;
      } while (!inHeart(x, y) && tries < 60);
      balls[i].shapeTarget.set(x * S, (y + 0.12) * S + baseCY, (Math.random() - 0.5) * 0.35);
    }
  };
  assignHeartTargets();

  const scatterFar = (withInwardVelocity) => {
    const R = Math.max(viewportWidth, viewportHeight) * 1.5;
    for (const b of balls) {
      const a = Math.random() * Math.PI * 2;
      const px = Math.cos(a) * R * 1.25;
      const py = Math.sin(a) * R * 0.85;
      const pz = (Math.random() - 0.5) * 4;
      b.position.set(px, py, pz);
      b.meshGroup.position.copy(b.position);
      if (withInwardVelocity) {
        b.velocity.set(-px, -py, -pz).normalize().multiplyScalar(0.08 + Math.random() * 0.05);
      } else {
        b.velocity.set(0, 0, 0);
      }
    }
  };
  scatterFar(false);

  const params = {
    gravity: 0, rebound: -0.3,
    mouseRepelForce: 0.05, mouseRepelRadius: 4.4,
    damping: 0.91, centerAttractForce: 0.0035, bounciness: 0.02,
  };

  const mouseProjVec = new THREE.Vector3();
  const mouseWorld3D = new THREE.Vector3();
  const updateMouse3D = () => {
    if (!mousePos) return;
    mouseProjVec.set(mousePos.x, mousePos.y, 0.5);
    mouseProjVec.unproject(camera);
    const dir = mouseProjVec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    mouseWorld3D.copy(camera.position).add(dir.multiplyScalar(distance));
  };

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  let animationFrameId = 0;
  const clock = new THREE.Clock();
  let localStarted = false;
  let entranceStart = 0;
  let reportedReady = false;

  const diffVec = new THREE.Vector3();
  const collideDiff = new THREE.Vector3();
  const relVel = new THREE.Vector3();
  const deltaPos = new THREE.Vector3();
  const rotAxis = new THREE.Vector3();
  const prevMouseWorld = new THREE.Vector3();
  let mouseSpeed = 0;
  let sleeping = false;

  // 한 단계 물리(명세의 루프 본문). time은 명세처럼 장면 시계.
  const step = (time, ctrl) => {
    const progress = ctrl?.progress ?? 0;

    const heroF = 1 - smoothstep(0.30, 0.80, progress);
    const dropRaw = smoothstep(0.40, 0.95, progress);
    const flyF = smoothstep(2.7, 3.45, progress);
    const shapeF = smoothstep(1.40, 2.05, progress) * (1 - smoothstep(2.55, 3.0, progress));
    const dropF = dropRaw * (1 - smoothstep(1.25, 1.75, progress));

    const bLime = smoothstep(0.55, 1.05, progress);
    const bPink = smoothstep(1.40, 1.95, progress);
    for (const role of ROLES) {
      curPal[role].copy(palHero[role]).lerp(palLime[role], bLime).lerp(palPink[role], bPink);
    }
    hemiLight.groundColor.copy(curPal.medium);

    const entranceT = easeOutCubic(clamp01((time - entranceStart) / 2.2));
    const attractionBoost = lerp(7.5, 1, entranceT);

    const isMouseInteracting = !!mousePos &&
      (Math.abs(mousePos.x) < 0.99 || Math.abs(mousePos.y) < 0.99);

    mouseSpeed = isMouseInteracting ? mouseWorld3D.distanceTo(prevMouseWorld) : 0;
    if (mouseSpeed > 3) mouseSpeed = 3;
    prevMouseWorld.copy(mouseWorld3D);

    let damping = 0.91;
    damping = lerp(damping, 0.992, dropF);
    damping = lerp(damping, 0.90, shapeF);
    damping = lerp(damping, 0.985, flyF);

    const camZ = camera.position.z;
    const clusterActive = Math.max(heroF, entranceT < 1 ? 1 : 0);

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];

      if (heroF > 0.01) {
        b.velocity.x += Math.sin(time * 0.4 + b.id * 1.5) * 0.0004 * b.radius * heroF;
        b.velocity.y += Math.cos(time * 0.5 + b.id * 1.2) * 0.0004 * b.radius * heroF;
        b.velocity.z += Math.sin(time * 0.35 + b.id) * 0.0001 * heroF;
      }

      const clusterStrength = params.centerAttractForce * attractionBoost * clusterActive;
      if (clusterStrength > 0.00001) {
        b.velocity.x += (0 - b.position.x) * clusterStrength * 0.38;
        b.velocity.y += (0 - b.position.y) * clusterStrength * 1.85;
        b.velocity.z += (0 - b.position.z) * clusterStrength * 1.8;
      }

      if (dropF > 0.001) {
        b.velocity.y -= 0.011 * dropF;
      }

      if (shapeF > 0.001) {
        const k = 0.06 * shapeF;
        b.velocity.x += (b.shapeTarget.x - b.position.x) * k;
        b.velocity.y += (b.shapeTarget.y - b.position.y) * k;
        b.velocity.z += (b.shapeTarget.z - b.position.z) * k;
      }

      if (flyF > 0.001) {
        const stagger = (b.id * 0.6180339887) % 1;
        const local = smoothstep(stagger * 0.55, stagger * 0.55 + 0.45, flyF);
        b.velocity.z += 0.05 * local;
        b.velocity.x += b.position.x * 0.006 * local;
        b.velocity.y += b.position.y * 0.006 * local;
      }

      if (mousePos && isMouseInteracting) {
        diffVec.subVectors(b.position, mouseWorld3D);
        const rawDist = diffVec.length();
        const down = mousePos.isDown;
        const activeRepelRadius = down ? params.mouseRepelRadius * 1.4 : params.mouseRepelRadius;
        const activeRepelForce = down ? params.mouseRepelForce * 1.7 : params.mouseRepelForce;
        if (rawDist < activeRepelRadius && rawDist > 0.0001) {
          const ratio = rawDist / activeRepelRadius;
          const smoothFactor = 1.0 - (ratio * ratio * (3.0 - 2.0 * ratio));
          const speedBoost = 1 + mouseSpeed * 3.2;
          const push = smoothFactor * activeRepelForce * speedBoost;
          diffVec.normalize();
          diffVec.z *= 0.12;
          diffVec.normalize();
          b.velocity.addScaledVector(diffVec, push);
        }
      }

      b.velocity.multiplyScalar(damping);
      b.position.addScaledVector(b.velocity, 1);

      const c = b.isGlass ? curPal.glass : curPal[b.role];
      b.material.color.copy(c);
      if (!isBlack) b.material.emissive.copy(c);

      b.material.opacity = flyF > 0.001
        ? 1 - smoothstep(camZ - 2.6, camZ - 0.3, b.position.z)
        : 1;

      const targetVis = b.radius * (1 - (1 - shapeScale) * shapeF);
      b.visualScale += (targetVis - b.visualScale) * 0.12;
      b.sphere.scale.setScalar(b.visualScale);
    }

    const collideScale = 0.28 * (1 - 0.93 * shapeF) * (1 - flyF);
    const subSteps = 4;
    for (let s = 0; s < subSteps; s++) {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          collideDiff.subVectors(b2.position, b1.position);
          const dist = collideDiff.length();
          const minDist = b1.visualScale + b2.visualScale;
          if (dist < minDist && dist > 0.001) {
            const overlap = minDist - dist;
            collideDiff.multiplyScalar(1 / dist);
            const totalMass = b1.mass + b2.mass;
            const ratio1 = b2.mass / totalMass;
            const ratio2 = b1.mass / totalMass;
            b1.position.addScaledVector(collideDiff, -overlap * ratio1 * collideScale);
            b2.position.addScaledVector(collideDiff, overlap * ratio2 * collideScale);

            relVel.subVectors(b2.velocity, b1.velocity);
            const velAlongNormal = relVel.dot(collideDiff);
            if (velAlongNormal < -0.0001) {
              const impulse = -(1 + params.bounciness) * velAlongNormal / (1 / b1.mass + 1 / b2.mass);
              b1.velocity.addScaledVector(collideDiff, -impulse / b1.mass);
              b2.velocity.addScaledVector(collideDiff, impulse / b2.mass);
            }
          }
        }
      }
    }

    const borderPad = 0.2;
    const xBound = viewportWidth / 2 - borderPad;
    const topY = viewportHeight / 2 - 0.05;
    const floorY = -viewportHeight / 2 + 0.05;
    const zBound = 2.0;
    const restitution = 0.30 + 0.35 * dropF;

    const contain = flyF < 0.5;
    const zContain = flyF < 0.02;

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const r = b.visualScale;

      if (contain) {
        if (b.position.x < -xBound - r) { b.position.x = -xBound - r; b.velocity.x *= params.rebound; }
        else if (b.position.x > xBound + r) { b.position.x = xBound + r; b.velocity.x *= params.rebound; }

        if (b.position.y - r < floorY) {
          b.position.y = floorY + r;
          if (b.velocity.y < 0) b.velocity.y = -b.velocity.y * restitution;
          if (dropF > 0.3) { b.velocity.x *= 0.86; b.velocity.z *= 0.86; }
        }
        if (b.position.y + r > topY) {
          b.position.y = topY - r;
          if (b.velocity.y > 0) b.velocity.y *= params.rebound;
        }
      }

      if (zContain) {
        if (b.position.z < -zBound) { b.position.z = -zBound; b.velocity.z *= params.rebound; }
        else if (b.position.z > zBound) { b.position.z = zBound; b.velocity.z *= params.rebound; }
      }

      deltaPos.copy(b.position).sub(b.meshGroup.position);
      if (deltaPos.lengthSq() > 0.000001) {
        rotAxis.set(deltaPos.y, -deltaPos.x, 0).normalize();
        const rotAngle = (deltaPos.length() / b.radius) * 0.95;
        b.meshGroup.rotateOnWorldAxis(rotAxis, rotAngle);
      }
      b.meshGroup.position.copy(b.position);
    }
  };

  const simulateAndRender = () => {
    animationFrameId = requestAnimationFrame(simulateAndRender);

    const time = clock.getElapsedTime();
    clock.getDelta();
    updateMouse3D();

    const ctrl = control;

    if (ctrl?.started && !localStarted) {
      localStarted = true;
      entranceStart = time;
      scatterFar(true);
    }

    if (!localStarted) {
      renderer.render(scene, camera);
      if (!reportedReady) { reportedReady = true; onReady(); }
      return;
    }

    step(time, ctrl);

    renderer.render(scene, camera);
    if (!reportedReady) { reportedReady = true; onReady(); }

    // 명세 밖: 다 날아간 뒤 아래 구역을 볼 때는 쉬어요(스크롤로 돌아오면 깨어남)
    if (ctrl.progress > 3.8) { cancelAnimationFrame(animationFrameId); animationFrameId = 0; sleeping = true; setLayers(false); }
  };

  const handleResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    updateFrustumBounds();
    assignHeartTargets();
    if (reduce) renderer.render(scene, camera);
  };
  const ro = new ResizeObserver(handleResize);
  ro.observe(container);

  // 움직임 줄이기: 날아들어 모인 덩어리를 미리 계산해 한 장면만 그려요
  const still = () => {
    localStarted = true; scatterFar(true);
    const saved = { x: mousePos.x, y: mousePos.y };
    mousePos.x = 99; mousePos.y = 99; updateMouse3D();
    for (let n = 0; n < 420; n++) step(n / 60, { progress: 0 });
    mousePos.x = saved.x; mousePos.y = saved.y;
    renderer.render(scene, camera);
    if (!reportedReady) { reportedReady = true; onReady(); }
  };

  if (reduce) still(); else simulateAndRender();

  return {
    wake() { if (!reduce && sleeping && control.progress <= 3.8) { sleeping = false; setLayers(true); animationFrameId = requestAnimationFrame(simulateAndRender); } },
    dispose() {
      cancelAnimationFrame(animationFrameId); ro.disconnect();
      sphereGeometry.dispose(); balls.forEach(b => b.material.dispose());
      renderer.dispose(); renderer.forceContextLoss?.();
    }
  };
}

/* ── 팔레트 서랍(Studio Controls) ── */
const THEMES = { roseGold: '#2F69FF', pinkBlush: '#FFC5C2', voltLime: '#E1FC03', arcticBlue: '#96E5FF' };
let selected = 'roseGold';
function mount(id) {
  selected = id;
  if (current) current.dispose();
  current = createScene(THEMES[id], () => dispatchEvent(new Event('gravity:ready')));
  document.querySelectorAll('.g-theme').forEach(b => b.setAttribute('aria-checked', String(b.dataset.theme === id)));
}
document.querySelectorAll('.g-theme').forEach(b => b.addEventListener('click', () => { if (b.dataset.theme !== selected) mount(b.dataset.theme); }));
document.getElementById('g-reset')?.addEventListener('click', () => { if (selected !== 'roseGold') mount('roseGold'); });

try { mount('roseGold'); }
catch (err) { console.warn('gravity', err); document.documentElement.classList.add('no-webgl'); dispatchEvent(new Event('gravity:ready')); }
