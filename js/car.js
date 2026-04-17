/* js/car.js  —  ES module (importmap in index.html)
   Changes vs previous:
   - Hero camera is closer + wider FOV → car appears larger on load
   - 12 cinematic keyframes instead of 8, covering every angle
   - Drag-to-orbit: click+drag rotates car freely
   - Smooth theme transition: all light values lerp over 1.4s instead of snapping
   - Mouse parallax is stronger on hero
*/
import * as THREE from 'three';
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/* ══ LOADING SCREEN ══ */
const loaderEl = document.createElement('div');
loaderEl.id = 'car-loader';
loaderEl.innerHTML = `
  <div class="cl-inner">
    <div class="cl-logo">MXC</div>
    <div class="cl-bar-wrap"><div class="cl-bar" id="cl-bar"></div></div>
    <div class="cl-label" id="cl-label">Loading renderer…</div>
  </div>
  <style>
    #car-loader .cl-inner{text-align:center;}
    #car-loader .cl-logo{font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:6px;color:#fff;margin-bottom:2rem;}
    #car-loader .cl-bar-wrap{width:260px;height:2px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin:0 auto 1rem;}
    #car-loader .cl-bar{height:100%;width:0%;background:linear-gradient(90deg,#00e5ff,#1e60ff);border-radius:2px;transition:width .25s ease;}
    #car-loader .cl-label{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#3d4f6e;}
  </style>`;
Object.assign(loaderEl.style, {
  position:'fixed', inset:'0', zIndex:'9500',
  background:'#04080f', display:'flex',
  alignItems:'center', justifyContent:'center',
  transition:'opacity .8s ease',
});
document.body.appendChild(loaderEl);

function setProgress(pct, label) {
  const b = document.getElementById('cl-bar');
  const l = document.getElementById('cl-label');
  if (b) b.style.width = pct + '%';
  if (l) l.textContent = label;
}
function hideLoader() {
  loaderEl.style.opacity = '0';
  setTimeout(() => loaderEl.remove(), 900);
}

setProgress(20, 'Initialising scene…');

/* ══ RENDERER ══ */
const canvas   = document.getElementById('car-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled      = true;
renderer.shadowMap.type         = THREE.PCFSoftShadowMap;
renderer.toneMapping            = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure    = 1.3;
renderer.outputColorSpace       = THREE.SRGBColorSpace;

/* ══ SCENE ══ */
const scene = new THREE.Scene();
scene.fog   = new THREE.FogExp2(0x04080f, 0.038);

/* ══ CAMERA ══ */
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.01, 300);
camera.position.set(0, 0.9, 4.2);   // closer + higher FOV = bigger on screen

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

/* ══════════════════════════════════════════
   SMOOTH LIGHTING LERP SYSTEM
   Instead of snapping lights in/out, we lerp
   intensity of all lights over THEME_DURATION.
══════════════════════════════════════════ */
const THEME_DURATION = 1.4; // seconds
let themeT      = 0;       // 0 = dark, 1 = light
let themeTarget = 0;
let themePrev   = 0;
let themeTime   = 999;     // time since transition started

/* All lights live in scene always — we just lerp their intensities */
const ambD  = new THREE.AmbientLight(0x0a1628, 0);
const keyD  = new THREE.DirectionalLight(0x00e5ff, 0);
keyD.position.set(4, 6, 5); keyD.castShadow = true;
const rimD  = new THREE.DirectionalLight(0x1e60ff, 0);
rimD.position.set(-5, 2, -4);
const fillD = new THREE.DirectionalLight(0xffffff, 0);
fillD.position.set(0, -3, 3);
const hemiD = new THREE.HemisphereLight(0x0a1628, 0x000000, 0);

const ambL  = new THREE.AmbientLight(0xffffff, 0);
const keyL  = new THREE.DirectionalLight(0xffffff, 0);
keyL.position.set(5, 8, 5); keyL.castShadow = true;
const fillL = new THREE.DirectionalLight(0xd0e8ff, 0);
fillL.position.set(-4, 2, 3);
const hemiL = new THREE.HemisphereLight(0xffffff, 0x8899aa, 0);

// target intensities for each theme
const DARK_INT  = { amb:2.8, key:4.0, rim:2.2, fill:0.5, hemi:0.9 };
const LIGHT_INT = { amb:3.2, key:4.5, rim:0.0, fill:1.8, hemi:1.4 };

scene.add(ambD, keyD, rimD, fillD, hemiD, ambL, keyL, fillL, hemiL);

// fog colours
const FOG_DARK  = new THREE.Color(0x04080f);
const FOG_LIGHT = new THREE.Color(0xe8ecf5);
const fogColor  = new THREE.Color().copy(FOG_DARK);

function updateLighting(dt) {
  themeTime += dt;
  const raw = Math.min(themeTime / THEME_DURATION, 1);
  // ease in-out quart
  const t = raw < 0.5
    ? 8 * raw * raw * raw * raw
    : 1 - Math.pow(-2 * raw + 2, 4) / 2;

  themeT = themePrev + (themeTarget - themePrev) * t;

  const d = 1 - themeT;
  const l = themeT;

  ambD.intensity  = DARK_INT.amb  * d;
  keyD.intensity  = DARK_INT.key  * d;
  rimD.intensity  = DARK_INT.rim  * d;
  fillD.intensity = DARK_INT.fill * d;
  hemiD.intensity = DARK_INT.hemi * d;

  ambL.intensity  = LIGHT_INT.amb  * l;
  keyL.intensity  = LIGHT_INT.key  * l;
  fillL.intensity = LIGHT_INT.fill * l;
  hemiL.intensity = LIGHT_INT.hemi * l;

  // lerp fog colour
  fogColor.lerpColors(FOG_DARK, FOG_LIGHT, themeT);
  scene.fog.color.copy(fogColor);

  // lerp floor colour
  if (floor) floor.material.color.lerpColors(new THREE.Color(0x000000), new THREE.Color(0xcccccc), themeT);

  // lerp tone mapping exposure
  renderer.toneMappingExposure = 1.3 + themeT * 0.25;
}

// set dark intensities immediately
ambD.intensity  = DARK_INT.amb;
keyD.intensity  = DARK_INT.key;
rimD.intensity  = DARK_INT.rim;
fillD.intensity = DARK_INT.fill;
hemiD.intensity = DARK_INT.hemi;

/* ══ FLOOR ══ */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color:0x000000, metalness:0.85, roughness:0.25, transparent:true, opacity:0.45 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

/* ══ LOAD GLB ══ */
setProgress(35, 'Loading car model…  0%');

const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(draco);

let car = null;

gltfLoader.load(
  '../mclaren.glb',
  (gltf) => {
    setProgress(96, 'Preparing…');
    car = gltf.scene;

    const box    = new THREE.Box3().setFromObject(car);
    const centre = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const sc     = 3.8 / Math.max(size.x, size.y, size.z);  // slightly larger scale
    car.scale.setScalar(sc);
    car.position.sub(centre.multiplyScalar(sc));
    const b2 = new THREE.Box3().setFromObject(car);
    car.position.y -= b2.min.y;

    car.traverse(c => {
      if (c.isMesh) {
        c.castShadow = c.receiveShadow = true;
        if (c.material) {
          if (c.material.metalness !== undefined) c.material.metalness = Math.max(c.material.metalness, 0.5);
          if (c.material.roughness !== undefined) c.material.roughness = Math.min(c.material.roughness, 0.5);
          c.material.needsUpdate = true;
        }
      }
    });

    scene.add(car);
    setProgress(100, 'Ready');
    setTimeout(hideLoader, 500);
  },
  (xhr) => {
    if (xhr.lengthComputable) {
      const p = Math.round((xhr.loaded / xhr.total) * 57) + 35;
      setProgress(p, `Loading car…  ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
    }
  },
  (err) => {
    console.error('GLB error:', err);
    setProgress(100, '⚠ Could not load mclaren.glb');
  }
);

/* ══════════════════════════════════════════
   CAMERA KEYFRAMES  (12 angles, scroll 0→1)
   Covering: wide → front wing → nose → low
   belly → cockpit top → right side →
   rear wing → exhaust → left side →
   high rear → full pull-back → idle
══════════════════════════════════════════ */
const KF = [
  // 0.00 — big establishing shot, car fills frame
  { t:0.00, p:[ 0.0,  0.7,  3.8],  l:[0,    0.25, 0],  fov:52 },
  // 0.08 — drift right to front wing
  { t:0.08, p:[ 2.2,  0.5,  2.8],  l:[1.8,  0.2,  0],  fov:50 },
  // 0.18 — close on front nose / splitter
  { t:0.18, p:[ 3.4,  0.08, 0.6],  l:[2.8,  0.0,  0],  fov:65 },
  // 0.28 — sweep underneath — belly / floor
  { t:0.28, p:[ 1.0, -0.15, 2.6],  l:[0,   -0.05, 0],  fov:55 },
  // 0.38 — driver's side door level
  { t:0.38, p:[ 0.0,  0.55, 3.2],  l:[0,    0.4,  0],  fov:48 },
  // 0.46 — cockpit overhead, looking down into seat
  { t:0.46, p:[ 0.1,  3.2,  1.0],  l:[0,    0.6,  0],  fov:36 },
  // 0.55 — swoops around to right side
  { t:0.55, p:[ 0.0,  0.7, -3.4],  l:[0,    0.4,  0],  fov:48 },
  // 0.63 — rear-right 3/4 low
  { t:0.63, p:[-2.2,  0.35,-2.2],  l:[-1.6, 0.3,  0],  fov:54 },
  // 0.72 — rear wing tight close-up
  { t:0.72, p:[-2.8,  1.15, 0.5],  l:[-2.0, 0.85, 0],  fov:58 },
  // 0.81 — exhaust / diffuser low rear
  { t:0.81, p:[-3.6,  0.18, 0.8],  l:[-2.5, 0.1,  0],  fov:62 },
  // 0.90 — high rear aerial
  { t:0.90, p:[-2.0,  3.8,  2.5],  l:[0,    0.5,  0],  fov:44 },
  // 1.00 — wide idle / rev ready
  { t:1.00, p:[ 0.0,  0.9,  4.6],  l:[0,    0.3,  0],  fov:48 },
];

function lv(a, b, t) { return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
// smooth-step
function ss(t) { return t*t*(3-2*t); }
// smoother-step (Ken Perlin)
function sss(t) { return t*t*t*(t*(t*6-15)+10); }

function getCam(sf) {
  let lo = KF[0], hi = KF[KF.length-1];
  for (let i = 0; i < KF.length-1; i++) {
    if (sf >= KF[i].t && sf <= KF[i+1].t) { lo = KF[i]; hi = KF[i+1]; break; }
  }
  const st = sss(Math.min(1, (sf - lo.t) / Math.max(0.001, hi.t - lo.t)));
  return { p: lv(lo.p, hi.p, st), l: lv(lo.l, hi.l, st), fov: lo.fov + (hi.fov - lo.fov) * st };
}

const cPos = new THREE.Vector3(0, 0.9, 4.2);
const cTgt = new THREE.Vector3(0, 0.25, 0);
const _tv  = new THREE.Vector3();
let cFov   = 52;

/* ══ MOUSE PARALLAX ══ */
let mX = 0, mY = 0, mXs = 0, mYs = 0;
window.addEventListener('mousemove', e => {
  mX = (e.clientX / innerWidth  - 0.5) * 2;
  mY = (e.clientY / innerHeight - 0.5) * 2;
});

/* ══ DRAG TO ORBIT ══ */
let dragActive = false;
let dragStartX = 0, dragStartY = 0;
let dragRotY   = 0, dragRotX   = 0;
let dragVelY   = 0, dragVelX   = 0;  // momentum
let lastDragX  = 0, lastDragY  = 0;

canvas.addEventListener('mousedown', e => {
  dragActive = true;
  dragStartX = lastDragX = e.clientX;
  dragStartY = lastDragY = e.clientY;
  dragVelY = dragVelX = 0;
  canvas.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', e => {
  if (!dragActive) return;
  const dx = e.clientX - lastDragX;
  const dy = e.clientY - lastDragY;
  dragVelY = dx * 0.008;
  dragVelX = dy * 0.005;
  dragRotY += dx * 0.008;
  dragRotX += dy * 0.005;
  dragRotX  = Math.max(-0.7, Math.min(0.7, dragRotX));
  lastDragX = e.clientX;
  lastDragY = e.clientY;
});
window.addEventListener('mouseup', () => {
  dragActive = false;
  canvas.style.cursor = 'default';
});

// touch drag
canvas.addEventListener('touchstart', e => {
  dragActive = true;
  dragStartX = lastDragX = e.touches[0].clientX;
  dragStartY = lastDragY = e.touches[0].clientY;
  dragVelY = dragVelX = 0;
}, { passive:true });
window.addEventListener('touchmove', e => {
  if (!dragActive) return;
  const dx = e.touches[0].clientX - lastDragX;
  const dy = e.touches[0].clientY - lastDragY;
  dragVelY = dx * 0.008;
  dragVelX = dy * 0.005;
  dragRotY += dx * 0.008;
  dragRotX += dy * 0.005;
  dragRotX  = Math.max(-0.7, Math.min(0.7, dragRotX));
  lastDragX = e.touches[0].clientX;
  lastDragY = e.touches[0].clientY;
}, { passive:true });
window.addEventListener('touchend', () => { dragActive = false; });

/* ══ FLAME PARTICLES ══ */
const fc = document.createElement('canvas');
fc.width = fc.height = 64;
const fctx = fc.getContext('2d');
const fgrad = fctx.createRadialGradient(32,32,0,32,32,32);
fgrad.addColorStop(0,   'rgba(255,255,200,1)');
fgrad.addColorStop(0.3, 'rgba(255,110,0,0.85)');
fgrad.addColorStop(0.7, 'rgba(255,0,0,0.3)');
fgrad.addColorStop(1,   'rgba(0,0,0,0)');
fctx.fillStyle = fgrad;
fctx.fillRect(0,0,64,64);
const fTex = new THREE.CanvasTexture(fc);

const MAXF = 300;
const fArr = new Float32Array(MAXF * 3);
const fGeo = new THREE.BufferGeometry();
fGeo.setAttribute('position', new THREE.BufferAttribute(fArr, 3));
const fMat = new THREE.PointsMaterial({
  map:fTex, size:0.22, sizeAttenuation:true,
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
});
scene.add(new THREE.Points(fGeo, fMat));

const flames = [];
function spawnFlame(p) {
  for (let i = 0; i < 10; i++) {
    flames.push({
      x: p.x + (Math.random()-.5)*.2,
      y: p.y,
      z: p.z + (Math.random()-.5)*.2,
      vx: (Math.random()-.5)*.06,
      vy:  0.06 + Math.random()*.16,
      vz: (Math.random()-.5)*.06,
      life:  1,
      decay: 0.018 + Math.random()*.022,
    });
  }
}

/* ══ THEME SWAP ══
   flipCarLighting(goLight) — called mid-spin, only flips 3D lighting
   triggerThemeBurst()      — called after page class toggle, syncs to body.classList
*/
function applyLighting(goLight) {
  themePrev   = themeT;
  themeTarget = goLight ? 1 : 0;
  themeTime   = 0;
}

window.flipCarLighting  = function(goLight) { applyLighting(goLight); };
window.triggerThemeBurst = function() {
  applyLighting(document.body.classList.contains('light'));
};

/* ══ RENDER LOOP ══ */
let scrollY  = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive:true });

let revActive = false, revTime = 0, revDone = false;
let elapsed = 0, last = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now; elapsed += dt;

  updateLighting(dt);

  /* smooth mouse */
  mXs += (mX - mXs) * 0.08;
  mYs += (mY - mYs) * 0.08;

  /* drag momentum */
  if (!dragActive) {
    dragVelY *= 0.92;
    dragVelX *= 0.92;
    dragRotY += dragVelY;
    dragRotX += dragVelX;
    dragRotX  = Math.max(-0.7, Math.min(0.7, dragRotX));
  }

  const pageH = Math.max(1, document.body.scrollHeight - innerHeight);
  const sf    = Math.min(1, scrollY / pageH);

  /* rev at bottom */
  if (sf >= 0.995 && !revDone) { revDone = true; revActive = true; revTime = 0; }
  if (sf < 0.99)  revDone = false;
  if (revActive)  revTime += dt;

  /* camera */
  const kf = getCam(sf);
  const tPos = new THREE.Vector3(
    kf.p[0] + mXs * 0.38,
    kf.p[1] + mYs * 0.16,
    kf.p[2]
  );
  cPos.lerp(tPos, 0.04);
  _tv.set(...kf.l);
  cTgt.lerp(_tv, 0.04);
  cFov += (kf.fov - cFov) * 0.04;
  camera.position.copy(cPos);
  camera.lookAt(cTgt);
  camera.fov = cFov;
  camera.updateProjectionMatrix();

  /* car rotation from drag */
  if (car) {
    const targetY = dragRotY;
    const targetX = dragRotX;
    car.rotation.y += (targetY - car.rotation.y) * 0.12;
    car.rotation.x += (targetX - car.rotation.x) * 0.12;
    car.position.y += Math.sin(elapsed * 1.4) * 0.0003;

    if (revActive && revTime < 4) {
      car.position.x += (Math.random()-.5) * .003;
      car.position.y += (Math.random()-.5) * .003;
      if (Math.random() > .3)
        spawnFlame(new THREE.Vector3(car.position.x - 1.6, car.position.y + 0.3, car.position.z));
    }
  }

  /* flames */
  let fi = 0;
  for (let i = flames.length - 1; i >= 0; i--) {
    const f = flames[i];
    f.x += f.vx; f.y += f.vy; f.z += f.vz;
    f.vy -= 0.001; f.life -= f.decay;
    if (f.life <= 0) { flames.splice(i,1); continue; }
    if (fi < MAXF) { fArr[fi*3]=f.x; fArr[fi*3+1]=f.y; fArr[fi*3+2]=f.z; fi++; }
  }
  for (let i=fi; i<MAXF; i++) fArr[i*3]=fArr[i*3+1]=fArr[i*3+2]=9999;
  fGeo.attributes.position.needsUpdate = true;
  fMat.size = 0.18 + Math.sin(elapsed * 9) * 0.04;

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);