/* The room — Nicho's studio at night, in Three.js.
   Light comes from the room itself: a cool window, a warm LED strip under the shelf, an accent wash on the wall behind the desk,
   the screens and a desk lamp. A wall switch turns on the overhead light. Nothing follows the cursor.
   On the shelf: kuwaGO's owl, Cinematheque's popcorn and xpera's boxed graphics card; under it, a keychain that was a gift.
   On the glass desk: the ASUS laptop (its screen is the landing page; click to dive in) and the phone.
   In the drawer: one folder per project; they pop up and can be dragged into a new order.
   On the wall behind the laptop: a desk-wide task board, one note for each part of the main page, photos and sticky notes; drag them around. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.documentElement;
const embed = root.classList.contains('embed');
const motion = root.classList.contains('motion');
const canvas = document.getElementById('roomCanvas');
const roomEl = document.querySelector('.room');
const loader = document.querySelector('.r-load');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const G = window.gsap;
// ?shot: a still of the room for the About section (renders on demand, even in a background tab)
if (/[?&]shot/.test(location.search)) window.__shot = home => { if (home && typeof home === 'object') Object.assign(cam, home); else if (home) { cam.px = HOME.pos.x; cam.py = HOME.pos.y; cam.pz = HOME.pos.z; cam.lx = HOME.look.x; cam.ly = HOME.look.y; cam.lz = HOME.look.z; } Object.assign(view, cam); for (let i = 0; i < 3; i++) frame(); return canvas; };
const setLoad = p => { if (!loader) return; loader.style.setProperty('--p', p.toFixed(3)); const o = loader.querySelector('.rl-pct'); if (o) o.textContent = Math.round(p * 100); };

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: /[?&]shot/.test(location.search) }); }
catch (e) { document.body.classList.add('no-webgl'); loader && loader.classList.add('done'); throw e; }
let maxDpr = embed ? 1 : 1.25;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, maxDpr));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const shadowsDirty = () => { renderer.shadowMap.needsUpdate = true; };
RectAreaLightUniformsLib.init();

const manager = new THREE.LoadingManager();
manager.onProgress = (u, a, b) => setLoad(.35 + .55 * a / b);
const texLoader = new THREE.TextureLoader(manager);
const loadTex = url => texLoader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; });
setLoad(.3);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0c10');
scene.fog = new THREE.Fog('#0b0c10', 4.5, 10);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
const camera = new THREE.PerspectiveCamera(36, 1, .03, 30);

/* ---------- helpers ---------- */
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .72, metalness: 0, envMapIntensity: .25, ...o });
const glow = (color, k = 2) => new THREE.MeshStandardMaterial({ color: '#000', emissive: color, emissiveIntensity: k, roughness: 1 });
const box = (w, h, d, m, r = 0) => { const g = r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d); const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; };
const cyl = (rt, rb, h, m, s = 28, open = false) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s, 1, open), m); o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x, y, z, parent = scene) => { o.position.set(x, y, z); parent.add(o); return o; };
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// textures with text are redrawn once the web fonts have loaded
const redraws = [];
const liveTex = (w, h, draw) => { const t = canvasTex(w, h, draw); const redraw = () => { const g = t.image.getContext('2d'); g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }; t.userData.redraw = redraw; redraws.push(redraw); return t; };
const tween = (target, vars) => (G && motion ? G.to(target, vars) : (Object.assign(target, Object.fromEntries(Object.entries(vars).filter(([k]) => !['duration', 'ease', 'delay', 'onUpdate', 'onComplete', 'overwrite', 'stagger'].includes(k)))), vars.onUpdate && vars.onUpdate(), vars.onComplete && vars.onComplete()));

const WALNUT = mat('#4a3324', { roughness: .55 });
const BLACK = mat('#141518', { roughness: .45, metalness: .4 });
const DESK_Y = .75;

/* ---------- the room ---------- */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat('#141518', { roughness: .92 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), mat('#1f2025', { roughness: .95 }));
back.position.set(0, 2.5, -.62); back.receiveShadow = true; scene.add(back);
const left = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), mat('#1b1c21', { roughness: .95 }));
left.rotation.y = Math.PI / 2; left.position.set(-2.1, 2.5, 0); scene.add(left);
const right = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), mat('#1b1c21', { roughness: .95 }));
right.rotation.y = -Math.PI / 2; right.position.set(1.4, 2.5, 0); scene.add(right);
at(box(2.2, .008, 1.5, mat('#24262c', { roughness: 1 }), .003), 0, .004, .45);   // rug

// an acoustic slat panel behind the desk: the LED light rakes across it
const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(.035, 1.9, .025), mat('#3b291d', { roughness: .6 }), 34);
for (let i = 0; i < 34; i++) slats.setMatrixAt(i, new THREE.Matrix4().makeTranslation(-1.05 + i * .064, 1.75, -.6));
slats.receiveShadow = true; scene.add(slats);
at(box(2.2, 1.95, .01, mat('#0f1013', { roughness: 1 })), 0, 1.75, -.615);

/* ---------- window with blinds ---------- */
const nightTex = canvasTex(512, 512, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#0a1430'); sky.addColorStop(.6, '#16284f'); sky.addColorStop(1, '#2b2f55');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const moon = g.createRadialGradient(380, 110, 4, 380, 110, 90); moon.addColorStop(0, 'rgba(220,230,255,.9)'); moon.addColorStop(.12, 'rgba(200,215,255,.35)'); moon.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = moon; g.fillRect(0, 0, w, h);
  let x = 0; while (x < w) { const bw = 30 + Math.random() * 60, bh = 120 + Math.random() * 220; g.fillStyle = '#070a14'; g.fillRect(x, h - bh, bw, bh);
    for (let yy = h - bh + 8; yy < h - 6; yy += 12) for (let xx = x + 5; xx < x + bw - 6; xx += 10) if (Math.random() < .28) { g.fillStyle = Math.random() < .7 ? 'rgba(255,196,120,.85)' : 'rgba(170,200,255,.8)'; g.fillRect(xx, yy, 4, 5); }
    x += bw + 4; }
});
const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), new THREE.MeshBasicMaterial({ map: nightTex, toneMapped: false, color: '#9fb0d6' }));
win.rotation.y = -Math.PI / 2; win.position.set(1.39, 1.55, .15); scene.add(win);
const frameM = mat('#101114', { roughness: .5 });
[.52, -.52].forEach(y => at(box(.06, .05, 1.16, frameM), 1.37, 1.55 + y, .15));
[-.57, .57].forEach(z => at(box(.06, 1.09, .05, frameM), 1.37, 1.55, .15 + z));
for (let i = 0; i < 17; i++) { const s = box(.004, .045, 1.1, mat('#2a221c', { roughness: .8 })); s.rotation.z = .9; at(s, 1.31, 1.06 + i * .06, .15); }

/* ---------- light switch on the wall ---------- */
const sw = new THREE.Group(); at(sw, 1.12, 1.18, -.6);
at(box(.075, .115, .008, mat('#E9E3D6', { roughness: .5 }), .003), 0, 0, 0, sw);
const rocker = at(box(.032, .052, .012, mat('#F4EFE6', { roughness: .45 }), .004), 0, 0, .008, sw);
rocker.rotation.x = .2;
const swDot = at(box(.006, .006, .002, glow('#FFB070', 1.4)), 0, -.04, .006, sw);

/* ---------- the glass desk ---------- */
const GLASS = new THREE.MeshStandardMaterial({ color: '#a9c4bf', transparent: true, opacity: .2, roughness: .03, metalness: .1, envMapIntensity: 1.6, depthWrite: false });
const glassTop = new THREE.Mesh(new RoundedBoxGeometry(1.8, .014, .74, 2, .004), GLASS); glassTop.position.set(0, DESK_Y - .007, -.2); glassTop.renderOrder = 2; scene.add(glassTop);
const edgeM = new THREE.MeshStandardMaterial({ color: '#86b6ad', transparent: true, opacity: .55, roughness: .1, metalness: .2, depthWrite: false });
[[1.8, .14], [1.8, -.57]].forEach(([w, z]) => { const e = new THREE.Mesh(new THREE.BoxGeometry(w, .014, .002), edgeM); e.position.set(0, DESK_Y - .007, z + (z > 0 ? .03 : 0)); scene.add(e); });
[[-.86, -.52], [.86, -.52], [-.86, .1], [.86, .1]].forEach(([x, z]) => at(box(.03, DESK_Y - .03, .03, BLACK), x, (DESK_Y - .03) / 2, z));
[[1.74, .02, .02, 0, .1], [1.74, .02, .02, 0, -.52]].forEach(([w, h, d, x, z]) => at(box(w, h, d, BLACK), x, DESK_Y - .025, z));
[[-.86], [.86]].forEach(([x]) => at(box(.02, .02, .64, BLACK), x, DESK_Y - .025, -.21));
// a leather desk mat: it catches the lamp's pool of light
at(box(1.0, .004, .42, mat('#2a2219', { roughness: .85 }), .002), .0, DESK_Y + .002, -.02);

/* ---------- the laptop's screen: the same desktop that opens when you dive in (painted by js/os.js) ---------- */
const DESK_W = 1280, DESK_H = 800;
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const screenTex = liveTex(DESK_W, DESK_H, (g, w, h) => { if (window.ndOS) window.ndOS.paint(g, w, h); else { g.fillStyle = '#07080A'; g.fillRect(0, 0, w, h); } });
if (window.ndOS) {
  let queued = false;
  // repaint when an icon image arrives or the desktop changes; while the desktop is open nobody sees the laptop, so wait
  window.ndOS.onChange = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; if (!window.ndOS.isOpen) screenTex.userData.redraw(); }); };
  setInterval(() => { if (!window.ndOS.isOpen) screenTex.userData.redraw(); }, 30000);   // the taskbar clock
}
/* ---------- keyboard, mouse, sketchbook, mug, plant ---------- */
const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat('#1c1d22', { roughness: .4 })); mouse.scale.set(.03, .016, .05); mouse.castShadow = true; at(mouse, .38, DESK_Y + .01, .08);

const sketch = new THREE.Group(); at(sketch, -.52, DESK_Y, .05); sketch.rotation.y = .32;
at(box(.24, .02, .17, mat('#B8432F', { roughness: .8 }), .004), 0, .01, 0, sketch);
at(box(.243, .016, .165, mat('#ECE6D8', { roughness: .9 })), .001, .01, 0, sketch);
at(box(.008, .021, .172, mat('#1b1b1b')), .07, .011, 0, sketch);
const pencil = cyl(.0035, .0035, .17, mat('#E8B04A', { roughness: .6 }), 6); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = .5; at(pencil, -.01, .026, .03, sketch);

const mug = new THREE.Group(); at(mug, -.7, DESK_Y, .1);
at(cyl(.035, .032, .09, mat('#E9E3D6', { roughness: .45 }), 32), 0, .045, 0, mug);
const handle = new THREE.Mesh(new THREE.TorusGeometry(.022, .006, 10, 20), mat('#E9E3D6', { roughness: .45 })); handle.position.set(.037, .048, 0); mug.add(handle);
at(cyl(.031, .031, .002, mat('#2a170d', { roughness: .2 })), 0, .084, 0, mug);

const plant = new THREE.Group(); at(plant, .78, DESK_Y, -.44);
at(cyl(.06, .045, .11, mat('#2d2f35', { roughness: .8 }), 24), 0, .055, 0, plant);
const leafG = new THREE.SphereGeometry(1, 14, 10), leafM = mat('#2f6b3d', { roughness: .6, side: THREE.DoubleSide });
for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(leafG, leafM); const a = i / 9 * Math.PI * 2; l.scale.set(.05, .006, .025); l.position.set(Math.cos(a) * .05, .16 + (i % 3) * .05, Math.sin(a) * .05); l.rotation.set(Math.random() * .5, -a, .5 + Math.random() * .4); l.castShadow = true; plant.add(l); }

/* ---------- the ASUS laptop: the way into the portfolio (its screen is the landing page) ---------- */
const ALU = mat('#23262d', { roughness: .42, metalness: .45, envMapIntensity: .5 });   // Vivobook "indie black"
const laptop = new THREE.Group(); at(laptop, -.02, DESK_Y, -.15); laptop.scale.setScalar(1.6);
at(box(.31, .014, .215, ALU, .005), 0, .007, 0, laptop);
const deckTex = liveTex(1240, 856, (g, w, h) => {
  g.fillStyle = '#20232a'; g.fillRect(0, 0, w, h);
  const key = (x, y, kw, kh, label, small) => {
    g.fillStyle = '#121419'; g.beginPath(); g.roundRect ? g.roundRect(x, y, kw, kh, 6) : g.rect(x, y, kw, kh); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1.5; g.stroke();
    if (!label) return;
    g.fillStyle = 'rgba(214,224,240,.82)'; g.font = `500 ${small ? 15 : label.length > 1 ? 17 : 24}px "IBM Plex Sans", Arial, sans-serif`;
    if (label.length > 1 && !small) { g.fillText(label, x + 10, y + kh - 12); } else { g.textAlign = 'center'; g.fillText(label, x + kw / 2, y + kh / 2 + (small ? 5 : 8)); g.textAlign = 'left'; }
  };
  // function row across the whole width
  const FN = ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrtSc', 'Ins', 'Del', '⏻'];
  const fw = (w - 80 - (FN.length - 1) * 8) / FN.length;
  FN.forEach((l, i) => key(40 + i * (fw + 8), 36, fw, 34, l, true));
  // the main block, in key units
  const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', ['Backspace', 2]],
    [['Tab', 1.5], 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', ['\\', 1.5]],
    [['Caps Lock', 1.75], 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", ['Enter', 2.25]],
    [['Shift', 2.25], 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', ['Shift', 2.75]],
    [['Ctrl', 1], ['Fn', 1], ['⊞', 1], ['Alt', 1], ['', 6], ['Alt', 1], ['Ctrl', 1], ['◀', 1], ['▲', 1], ['▶', 1]]
  ];
  const u = 880 / 15, kh = 58;
  ROWS.forEach((row, r) => { let x = 40; const y = 84 + r * (kh + 8);
    row.forEach(k => { const [l, n] = Array.isArray(k) ? k : [k, 1]; key(x, y, n * u - 8, kh, l, l.length === 1 && /[◀▲▶]/.test(l)); x += n * u; }); });
  // the number pad
  const NP = [['Num', '/', '*', '−'], ['7', '8', '9', '+'], ['4', '5', '6', '+'], ['1', '2', '3', '⏎'], ['0', '0', '.', '⏎']];
  const nu = (w - 40 - 940) / 4;
  NP.forEach((row, r) => row.forEach((l, c) => key(940 + c * nu, 84 + r * (kh + 8), nu - 8, kh, l, l.length > 1)));
  // the touchpad, left of centre because of the number pad
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 3; g.beginPath(); g.roundRect ? g.roundRect(380, 450, 430, 330, 12) : g.rect(380, 450, 430, 330); g.stroke();
  // the stickers
  const rr = (x, y, rw, rh, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, rw, rh, r) : g.rect(x, y, rw, rh); };
  // AMD Ryzen 5
  rr(56, 470, 96, 96, 8); g.fillStyle = '#16181c'; g.fill(); g.strokeStyle = '#b9bec6'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#e8eaee'; g.font = '700 13px Arial, sans-serif'; g.fillText('AMD', 68, 494); g.font = '800 21px Arial, sans-serif'; g.fillText('RYZEN', 66, 528);
  g.fillStyle = '#E8762B'; g.fillRect(126, 540, 20, 20); g.fillStyle = '#fff'; g.font = '800 15px Arial'; g.fillText('5', 131, 556);
  // AMD Radeon graphics
  rr(166, 470, 96, 96, 8); g.fillStyle = '#C8102E'; g.fill();
  g.fillStyle = '#fff'; g.font = '700 13px Arial, sans-serif'; g.fillText('AMD', 178, 494); g.font = '800 19px Arial, sans-serif'; g.fillText('RADEON', 174, 528); g.font = '600 10px Arial'; g.fillText('GRAPHICS', 182, 552);
  // the green script sticker, white outline
  g.save(); g.translate(50, 700); g.rotate(-.06);
  g.font = `italic 700 128px "Caveat", "Brush Script MT", cursive`; g.lineJoin = 'round';
  g.strokeStyle = '#ffffff'; g.lineWidth = 22; g.strokeText('Yeim', 0, 0);
  g.fillStyle = '#2F7A4C'; g.fillText('Yeim', 0, 0);
  g.strokeStyle = '#1d5233'; g.lineWidth = 2; g.strokeText('Yeim', 0, 0);
  g.restore();
  // ASUS support sticker with its QR code, and the small Office sticker
  rr(40, 740, 176, 76, 6); g.fillStyle = '#D9B44A'; g.fill();
  g.fillStyle = '#1b1b1b'; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i * 7 + j * 13 + i * j) % 3 === 0 || (i < 3 && j < 3)) g.fillRect(50 + i * 6, 752 + j * 6, 5, 5);
  g.fillStyle = '#4a3a10'; g.font = '700 14px Arial'; g.fillText('ASUS SUPPORT', 112, 770); g.font = '500 10px Arial'; g.fillText('PH V1.3', 170, 806);
  rr(226, 740, 80, 76, 4); g.fillStyle = '#F4F4F2'; g.fill(); g.fillStyle = '#6b6f76'; g.font = '600 12px Arial'; g.fillText('Office', 238, 762); g.fillText('Home 2024', 236, 778);
  ['#2B7CD3', '#21A366', '#D35230'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(246 + i * 18, 800, 6, 0, 7); g.fill(); });
  // the model sticker on the right
  rr(930, 560, 290, 250, 6); g.fillStyle = '#F7F6F2'; g.fill();
  g.fillStyle = '#E2BD32'; g.fillRect(930, 560, 290, 52);
  g.fillStyle = '#5a4a12'; g.font = '700 17px Arial'; g.fillText('ASUS Vivobook Go 15', 946, 593);
  [[970, 650], [1110, 650], [970, 740], [1110, 740]].forEach(([x, y]) => { g.strokeStyle = '#9aa0a8'; g.lineWidth = 3; g.beginPath(); g.arc(x + 30, y, 18, 0, 7); g.stroke(); g.fillStyle = '#b2b6bc'; g.fillRect(x, y + 28, 64, 5); g.fillRect(x + 6, y + 38, 52, 5); });
});
const deck = new THREE.Mesh(new THREE.PlaneGeometry(.29, .2), mat('#ffffff', { map: deckTex, roughness: .6 }));
deck.rotation.x = -Math.PI / 2; deck.position.set(0, .0142, .002); laptop.add(deck);
const lid = new THREE.Group(); at(lid, 0, .014, -.1075, laptop); lid.rotation.x = -1.9;
at(box(.31, .008, .215, ALU, .004), 0, .004, .1075, lid);
const lapScreen = new THREE.Mesh(new THREE.PlaneGeometry(.29, .18125), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false, color: '#d9d9d9' }));
lapScreen.rotation.x = Math.PI / 2; lapScreen.position.set(0, -.0005, .1155); lid.add(lapScreen);
const asusTex = liveTex(420, 48, (g, w, h) => { g.fillStyle = '#0d0e10'; g.fillRect(0, 0, w, h); g.fillStyle = '#8d939c'; g.font = '500 28px "IBM Plex Sans", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('ASUS Vivobook', w / 2, 34); });
const asus = new THREE.Mesh(new THREE.PlaneGeometry(.075, .0086), new THREE.MeshBasicMaterial({ map: asusTex }));
asus.rotation.x = Math.PI / 2; asus.position.set(0, -.0006, .016); lid.add(asus);

/* ---------- desk lamp ---------- */
const lamp = new THREE.Group(); at(lamp, -.8, DESK_Y, -.44); lamp.rotation.y = -1.05;
at(cyl(.07, .075, .02, BLACK, 32), 0, .01, 0, lamp);
const arm1 = cyl(.007, .007, .42, BLACK, 10); arm1.rotation.z = -.35; at(arm1, .07, .21, 0, lamp);
const arm2 = cyl(.007, .007, .32, BLACK, 10); arm2.rotation.z = -1.25; at(arm2, .27, .44, 0, lamp);
const head = new THREE.Group(); at(head, .42, .5, 0, lamp); head.rotation.z = -2.2;
at(cyl(.035, .07, .1, mat('#16171a', { roughness: .4, metalness: .5, side: THREE.DoubleSide }), 28, true), 0, 0, 0, head);
const bulbM = glow('#FFC98A', 0); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.028, 16, 12), bulbM); bulb.position.y = -.02; head.add(bulb);
const lampLight = new THREE.SpotLight('#FFB774', 0, 3, .75, .55, 2);
lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.0004; lampLight.shadow.radius = 6;
head.add(lampLight); lampLight.position.set(0, -.03, 0);
const lampTarget = new THREE.Object3D(); at(lampTarget, -.42, DESK_Y, .06); lampLight.target = lampTarget;

/* ---------- the rest of the desk: things that are actually on it ---------- */
// a pen cup with pencils, by the lamp
const penCup = new THREE.Group(); at(penCup, -.56, DESK_Y, -.4);
at(cyl(.03, .027, .095, mat('#2a2d33', { roughness: .5, metalness: .3 }), 24), 0, .0475, 0, penCup);
[['#E8B04A', .08, .12], ['#E0533F', -.1, .13], ['#ECE9E2', .02, .11], ['#5BB06A', -.03, .125], ['#1b1b1b', .12, .12]].forEach(([c, tilt, h], i) => {
  const pc = cyl(.0032, .0032, h, mat(c, { roughness: .6 }), 6); const a = i / 5 * Math.PI * 2;
  pc.rotation.set(Math.sin(a) * tilt, 0, Math.cos(a) * tilt); at(pc, Math.cos(a) * .012, .06 + h / 2 - .02, Math.sin(a) * .012, penCup);
});
// a pad of sticky notes, top sheet written on
const padTex = liveTex(160, 160, (g, w, h) => { g.fillStyle = '#F2D64B'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2d33'; g.font = `700 34px "Caveat", cursive`; g.fillText('call', 16, 58); g.fillText('client 3pm', 16, 102); });
const pad = new THREE.Group(); at(pad, -.31, DESK_Y, .11); pad.rotation.y = .35;
at(box(.07, .012, .07, mat('#E8C93A', { roughness: .9 })), 0, .006, 0, pad);
const padTop = new THREE.Mesh(new THREE.PlaneGeometry(.07, .07), mat('#ffffff', { map: padTex, roughness: .9 })); padTop.rotation.x = -Math.PI / 2; padTop.position.y = .0125; pad.add(padTop);
// a game controller (games)
const ctrl = new THREE.Group(); at(ctrl, .47, DESK_Y, -.3); ctrl.rotation.y = -.5;
const padM = mat('#1d1f24', { roughness: .45 });
at(box(.11, .022, .055, padM, .01), 0, .013, 0, ctrl);
[-.045, .045].forEach(x => { const grip = new THREE.Mesh(new THREE.SphereGeometry(.026, 16, 12), padM); grip.scale.set(1, .45, 1.25); grip.castShadow = true; at(grip, x, .011, .02, ctrl); });
[[-.03, -.008], [.018, .012]].forEach(([x, z]) => { at(cyl(.008, .009, .008, mat('#2b2e35'), 14), x, .027, z, ctrl); });
[['#5BB06A', .04, -.016], ['#E0533F', .052, -.006], ['#6FA8DC', .028, -.006], ['#E8B04A', .04, .004]].forEach(([c, x, z]) => at(new THREE.Mesh(new THREE.SphereGeometry(.004, 8, 6), mat(c, { roughness: .3 })), x, .025, z, ctrl));
// a die-cast car (cars)
const car = new THREE.Group(); at(car, .32, DESK_Y, -.47); car.rotation.y = .6;
at(box(.09, .018, .038, mat('#C4432D', { roughness: .3, metalness: .5 }), .006), 0, .017, 0, car);
at(box(.044, .016, .032, mat('#15171b', { roughness: .2, metalness: .4 }), .005), -.006, .032, 0, car);
[[-.028, .02], [.028, .02], [-.028, -.02], [.028, -.02]].forEach(([x, z]) => { const wh = cyl(.01, .01, .008, mat('#0e0f12'), 14); wh.rotation.x = Math.PI / 2; at(wh, x, .01, z, car); });
// a shuttlecock (badminton)
const shuttle = new THREE.Group(); at(shuttle, .74, DESK_Y, .12); shuttle.rotation.set(0, .8, Math.PI / 2 - .25);
at(new THREE.Mesh(new THREE.SphereGeometry(.011, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#F2EFE8', { roughness: .6 })), 0, .012, 0, shuttle).rotation.x = Math.PI;
const skirt = cyl(.028, .01, .05, new THREE.MeshStandardMaterial({ color: '#F7F5F0', roughness: .8, side: THREE.DoubleSide, transparent: true, opacity: .92 }), 16, true); at(skirt, 0, .037, 0, shuttle);

/* ---------- shelf with its LED strip ---------- */
const SHELF_Y = 1.5;
at(box(1.36, .032, .22, WALNUT, .006), -.12, SHELF_Y, -.5);
[-.62, .4].forEach(x => at(box(.02, .12, .02, BLACK), x, SHELF_Y - .07, -.58));
const strip = at(box(1.26, .006, .012, glow('#FFB070', 0)), -.12, SHELF_Y - .02, -.43);
const shelfTop = SHELF_Y + .016;

// a little princess keychain, a gift from my girlfriend: it hangs from the shelf and sways a little
const keychain = new THREE.Group(); at(keychain, -.4, SHELF_Y - .016, -.392);
const kc = new THREE.Group(); keychain.add(kc);
const silver = mat('#cfd3d8', { roughness: .25, metalness: .9 }), pvc = o => mat(o, { roughness: .42 });
const SKIN = pvc('#F3CBB0'), HAIR = pvc('#6E4326'), GOWN = pvc('#F6D23C'), TRIM = pvc('#E2A923');
const tor = (r, t, m, x, y, z, rx = 0, ry = 0, arc = Math.PI * 2) => { const o = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 28, arc), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); kc.add(o); return o; };
const ball = (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; kc.add(o); return o; };
at(new THREE.Mesh(new THREE.TorusGeometry(.0035, .0008, 6, 16), silver), 0, -.002, 0, keychain);   // the screw eye under the shelf
tor(.008, .0011, silver, 0, -.011, 0);                         // key ring
tor(.0028, .0007, silver, 0, -.0215, 0, 0, Math.PI / 2);       // chain
tor(.0028, .0007, silver, 0, -.0265, 0);
// head and hair
ball(.0175, HAIR, 0, -.049, -.004, 1.05, 1, .95);
ball(.017, SKIN, 0, -.052, .001, 1, .95, .9);
ball(.0172, HAIR, 0, -.0425, .003, 1, .55, .95);
ball(.008, HAIR, 0, -.031, -.004);
tor(.0158, .0011, pvc('#F2C53A'), 0, -.04, -.001, Math.PI / 2 * .78);
[-1, 1].forEach(sd => ball(.0068, HAIR, sd * .0158, -.066, -.002, .8, 2.2, .8));
// face
[-1, 1].forEach(sd => { ball(.0032, pvc('#4a2a18'), sd * .0065, -.054, .0153); ball(.001, pvc('#ffffff'), sd * .0065 + .001, -.0528, .0181); ball(.0016, pvc('#F2C53A'), sd * .0168, -.0605, .004); });
ball(.0012, pvc('#E9B596'), 0, -.058, .0166);
tor(.0026, .0006, pvc('#C8463C'), 0, -.0615, .0152, 0, 0, Math.PI).rotation.z = Math.PI;
// gown
const neck = new THREE.Mesh(new THREE.CylinderGeometry(.005, .007, .011, 16), GOWN); neck.position.y = -.073; kc.add(neck);
[-1, 1].forEach(sd => { ball(.0055, GOWN, sd * .0085, -.072, 0, 1.1, .8, 1); const arm = new THREE.Mesh(new THREE.CylinderGeometry(.0017, .0017, .012, 8), SKIN); arm.position.set(sd * .0125, -.081, .001); arm.rotation.z = sd * .6; kc.add(arm); });
ball(.0016, pvc('#ffffff'), 0, -.0695, .0062);
const gownSkirt = new THREE.Mesh(new THREE.CylinderGeometry(.0075, .02, .03, 24), GOWN); gownSkirt.position.y = -.0935; gownSkirt.castShadow = true; kc.add(gownSkirt);
tor(.0158, .0013, TRIM, 0, -.091, 0, Math.PI / 2);
tor(.0198, .0013, TRIM, 0, -.1075, 0, Math.PI / 2);
[-1, 1].forEach(sd => ball(.003, GOWN, sd * .005, -.1095, .004));
keychain.userData.idle = t => { kc.rotation.z = Math.sin(t * 1.1) * .045; kc.rotation.y = Math.sin(t * .6) * .25; };

// kuwaGO — the pixel owl beside a sprouting pot
const owl = new THREE.Group(); at(owl, -.58, shelfTop, -.5);
const owlBody = new THREE.Group(); owl.add(owlBody); owlBody.rotation.y = .35;
const V = .012, vox = (x, y, z, c, w = 1, h = 1, d = 1) => at(box(V * w, V * h, V * d, typeof c === 'string' ? mat(c, { roughness: .8 }) : c), x * V, y * V + V * h / 2, z * V, owlBody);
vox(0, 0, 0, '#7a4e2d', 6, 7, 5); vox(0, 1, 2.6, '#d8b483', 4, 4, .3);
vox(-1.2, 5, 2.6, '#f2ead8', 2, 2, .3); vox(1.2, 5, 2.6, '#f2ead8', 2, 2, .3);
const pupilM = mat('#141414', { roughness: .3 });
const pupils = [vox(-1.1, 5.3, 2.8, pupilM, 1, 1.2, .3), vox(1.1, 5.3, 2.8, pupilM, 1, 1.2, .3)];
vox(0, 4.1, 2.75, '#E8A23C', 1, 1, .4);
vox(-2.5, 7, 0, '#5c3a20', 1, 1.6, 1); vox(2.5, 7, 0, '#5c3a20', 1, 1.6, 1);
vox(-3.3, 1.5, 0, '#5c3a20', .8, 4, 3.4); vox(3.3, 1.5, 0, '#5c3a20', .8, 4, 3.4);
vox(-1.2, -1, 1.2, '#E8A23C', 1.4, 1, 1.4); vox(1.2, -1, 1.2, '#E8A23C', 1.4, 1, 1.4);
owlBody.position.y = V;
const pot = new THREE.Group(); at(pot, .1, 0, .02, owl);
at(box(.045, .04, .045, mat('#B5643A', { roughness: .9 })), 0, .02, 0, pot);
at(box(.05, .008, .05, mat('#9A5230', { roughness: .9 })), 0, .044, 0, pot);
const sprout = new THREE.Group(); at(sprout, 0, .048, 0, pot);
const leafV = mat('#5BB06A', { roughness: .7 });
[[0, 0, 0, .006, .03, .006], [-.009, .026, 0, .016, .006, .01], [.01, .034, 0, .018, .006, .01], [0, .04, 0, .01, .01, .01]].forEach(([x, y, z, w, h, d]) => at(box(w, h, d, leafV), x, y + h / 2, z, sprout));
owl.userData.idle = t => { const b = (t % 5) < .12; pupils.forEach(p => (p.scale.y = b ? .15 : 1)); sprout.rotation.z = Math.sin(t * 1.3) * .06; };

// Cinematheque — a popcorn bucket, a clapperboard and a ticket
const cine = new THREE.Group(); at(cine, -.12, shelfTop, -.5);
const stripeTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#F4EFE6' : '#E2763F'; g.fillRect(i * w / 8, 0, w / 8, h); } });
const bucket = cyl(.042, .03, .095, mat('#ffffff', { map: stripeTex, roughness: .7, side: THREE.DoubleSide }), 32, true); at(bucket, 0, .0475, 0, cine);
at(cyl(.03, .03, .002, mat('#E2763F')), 0, .001, 0, cine);
const kernels = new THREE.Group(); at(kernels, 0, .095, 0, cine);
const kG = new THREE.IcosahedronGeometry(.0115, 0), kM = mat('#F6E7C1', { roughness: .85, flatShading: true });
const pop = [];
for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(kG, kM); const a = Math.random() * Math.PI * 2, r = Math.random() * .033; m.position.set(Math.cos(a) * r, Math.random() * .022, Math.sin(a) * r); m.rotation.set(Math.random() * 3, Math.random() * 3, 0); m.castShadow = true; kernels.add(m); pop.push(m); }
const clap = new THREE.Group(); at(clap, .085, 0, .01, cine); clap.rotation.set(0, -.5, -.18);
const clapTex = canvasTex(256, 32, (g, w, h) => { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); g.fillStyle = '#F4EFE6'; for (let i = -1; i < 9; i++) { g.beginPath(); g.moveTo(i * 32, h); g.lineTo(i * 32 + 16, 0); g.lineTo(i * 32 + 32, 0); g.lineTo(i * 32 + 16, h); g.fill(); } });
at(box(.075, .055, .006, mat('#141414', { roughness: .5 })), 0, .0275, 0, clap);
const clapBar = new THREE.Group(); at(clapBar, -.0375, .058, 0, clap);
const barMesh = box(.075, .012, .0062, mat('#ffffff', { map: clapTex, roughness: .5 })); barMesh.position.x = .0375; clapBar.add(barMesh); clapBar.rotation.z = .35;
const ticket = box(.06, .028, .0015, mat('#C9A227', { roughness: .5 })); ticket.rotation.set(-1.2, .2, .1); at(ticket, -.07, .004, .04, cine);
cine.userData.idle = t => { clapBar.rotation.z = .3 + Math.max(0, Math.sin(t * .7)) * .12; };

// xpera CRM — a boxed graphics card (xpera serves stores that sell gaming PC parts)
const gpu = new THREE.Group(); at(gpu, .2, shelfTop, -.5); gpu.rotation.y = -.35;
const gpuBoxTex = canvasTex(256, 180, (g, w, h) => {
  g.fillStyle = '#101318'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#F4506A'; g.fillRect(0, h - 26, w, 8);
  g.strokeStyle = '#F4506A'; g.lineWidth = 3; [70, 150].forEach(x => { g.beginPath(); g.arc(x, 82, 34, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x, 82, 8, 0, Math.PI * 2); g.stroke(); });
  g.fillStyle = '#E9ECF1'; g.font = '600 26px "IBM Plex Sans Condensed", Arial Narrow, sans-serif'; g.fillText('GRAPHICS CARD', 16, 30);
  g.fillStyle = '#9AA0AB'; g.font = '500 13px "IBM Plex Mono", monospace'; g.fillText('16 GB · RAY TRACING', 16, 150);
});
const gpuSide = mat('#16181d', { roughness: .5 });
const gpuBox = new THREE.Mesh(new THREE.BoxGeometry(.11, .078, .036), [gpuSide, gpuSide, gpuSide, gpuSide, mat('#ffffff', { map: gpuBoxTex, roughness: .5 }), gpuSide]);
gpuBox.castShadow = gpuBox.receiveShadow = true; gpuBox.position.set(-.02, .039, -.02); gpu.add(gpuBox);
const card3d = new THREE.Group(); at(card3d, .065, .006, .035, gpu); card3d.rotation.set(-Math.PI / 2 + .05, 0, .25);
at(box(.09, .034, .009, mat('#1a1d24', { roughness: .45, metalness: .4 }), .002), 0, 0, 0, card3d);
const gpuRing = glow('#F4506A', 0), gpuFans = [];
[-.022, .022].forEach(x => { const r = new THREE.Mesh(new THREE.TorusGeometry(.012, .0018, 8, 24), gpuRing); r.position.set(x, 0, .0055); card3d.add(r);
  const bl = new THREE.Group(); bl.position.set(x, 0, .0058); card3d.add(bl);
  for (let b = 0; b < 6; b++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.009, .003, .0008), mat('#2a2e37')); m.position.x = .005; const piv = new THREE.Group(); piv.rotation.z = b / 6 * Math.PI * 2; piv.add(m); bl.add(piv); }
  gpuFans.push(bl); });
let fanSpeed = 1.5;
gpu.userData.idle = (t, dt) => gpuFans.forEach(f => (f.rotation.z += dt * fanSpeed));
// a short stack of books
[['#2D4B6B', .024, 0], ['#C4432D', .02, .024], ['#D9CFB8', .018, .044]].forEach(([c, h, y], i) => { const b = box(.16 - i * .01, h, .12, mat(c, { roughness: .8 }), .002); b.rotation.y = .08 * i; at(b, .45, shelfTop + y + h / 2, -.5); });

/* ---------- the task board: sketched notes for each part of the main page, and a few things I like ---------- */
const TASKS = [
  { id: 'work', no: '01', t: 'Work', d: 'three builds + case studies', c: '#E0533F', icon: 'frames' },
  { id: 'process', no: '02', t: 'Process', d: 'brief → sketch → ship', c: '#E8B04A', icon: 'arrows' },
  { id: 'about', no: '03', t: 'About', d: 'who I am, how I work', c: '#5BB06A', icon: 'face' },
  { id: 'skills', no: '04', t: 'Skills', d: 'tools behind each build', c: '#6FA8DC', icon: 'wrench' },
  { id: 'certs', no: '05', t: 'Certificates', d: 'three, from Certiport', c: '#C9A227', icon: 'medal' },
  { id: 'contact', no: '06', t: 'Contact', d: 'email · GitHub · resume', c: '#F4506A', icon: 'mail' }
];
const HAND = '"Caveat", "Comic Sans MS", cursive';
const BW = 1.8, BH = .48;   // the board is as wide as the desk
const board = new THREE.Group(); at(board, 0, 1.115, -.575);
const corkTex = canvasTex(1280, 340, (g, w, h) => {
  g.fillStyle = '#9b7653'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16000; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(70,45,25,.35)' : 'rgba(210,170,120,.28)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 1 + Math.random() * 2.5); }
});
at(box(BW, BH, .02, mat('#121315', { roughness: .5 })), 0, 0, 0, board);
const cork = new THREE.Mesh(new THREE.PlaneGeometry(BW - .04, BH - .04), mat('#ffffff', { map: corkTex, roughness: .95 })); cork.position.z = .0105; cork.receiveShadow = true; board.add(cork);

// a wobbly pencil line, so everything looks hand drawn
const wob = (g, pts, close) => {
  g.beginPath();
  pts.forEach(([x, y], i) => { const jx = x + (Math.random() - .5) * 2.2, jy = y + (Math.random() - .5) * 2.2; i ? g.lineTo(jx, jy) : g.moveTo(jx, jy); });
  if (close) g.closePath(); g.stroke();
};
const doodle = (g, kind, x, y, s, c) => {
  g.save(); g.translate(x, y); g.strokeStyle = c; g.lineWidth = 3; g.lineCap = g.lineJoin = 'round';
  const r = (a, b, w, h) => wob(g, [[a, b], [a + w, b], [a + w, b + h], [a, b + h]], true);
  if (kind === 'frames') { r(0, 6, s * .7, s * .55); r(s * .25, 0, s * .7, s * .55); }
  if (kind === 'arrows') { wob(g, [[0, s * .5], [s * .35, s * .2], [s * .6, s * .55], [s * .95, s * .25]]); wob(g, [[s * .8, s * .2], [s * .95, s * .25], [s * .92, s * .42]]); }
  if (kind === 'face') { g.beginPath(); g.arc(s * .45, s * .4, s * .38, 0, Math.PI * 2); g.stroke(); wob(g, [[s * .28, s * .52], [s * .45, s * .6], [s * .62, s * .52]]); g.fillStyle = c; [.32, .58].forEach(k => { g.beginPath(); g.arc(s * k, s * .32, 3, 0, 7); g.fill(); }); }
  if (kind === 'wrench') { wob(g, [[s * .15, s * .85], [s * .62, s * .38]]); g.beginPath(); g.arc(s * .72, s * .28, s * .18, -.6, 4.2); g.stroke(); }
  if (kind === 'medal') { wob(g, [[s * .3, 0], [s * .45, s * .4], [s * .6, 0]]); g.beginPath(); g.arc(s * .45, s * .6, s * .24, 0, Math.PI * 2); g.stroke(); wob(g, [[s * .4, s * .6], [s * .45, s * .52], [s * .45, s * .72]]); }
  if (kind === 'mail') { r(0, s * .1, s * .9, s * .6); wob(g, [[0, s * .1], [s * .45, s * .45], [s * .9, s * .1]]); }
  g.restore();
};
const noteTex = n => liveTex(320, 240, (g, w, h) => {
  // a torn sheet of sketch paper
  g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h);
  g.fillStyle = '#F3EEE1'; g.beginPath(); g.moveTo(6, 8);
  for (let x = 6; x <= w - 6; x += 12) g.lineTo(x, 6 + Math.random() * 6);
  g.lineTo(w - 6, h - 8); for (let x = w - 6; x >= 6; x -= 12) g.lineTo(x, h - 6 - Math.random() * 7);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(80,90,110,.14)'; g.lineWidth = 1.5; for (let y = 64; y < h - 14; y += 28) { g.beginPath(); g.moveTo(16, y); g.lineTo(w - 16, y); g.stroke(); }
  // the number, circled in coloured pencil
  g.strokeStyle = n.c; g.lineWidth = 3; g.beginPath(); g.ellipse(40, 44, 26, 21, -.2, 0, Math.PI * 2); g.stroke();
  g.fillStyle = n.c; g.font = `700 30px ${HAND}`; g.textAlign = 'center'; g.fillText(n.no, 40, 54); g.textAlign = 'left';
  // the title in pencil, underlined with a squiggle
  let fs = 50; g.fillStyle = '#2a2d33';
  do { g.font = `700 ${fs}px ${HAND}`; fs -= 2; } while (g.measureText(n.t).width > w - 168 && fs > 30);
  g.fillText(n.t, 80, 60);
  g.strokeStyle = '#2a2d33'; g.lineWidth = 2.2; wob(g, [[80, 70], [120, 74], [160, 69], [200, 73], [Math.min(w - 90, 80 + g.measureText(n.t).width), 70]]);
  g.fillStyle = '#4a4f59'; g.font = `500 30px ${HAND}`; g.fillText(n.d, 22, 124);
  g.fillStyle = n.c; g.font = `700 28px ${HAND}`; g.fillText('→ on the main page', 22, h - 32);
  doodle(g, n.icon, w - 82, 20, 62, n.c);
});
const NOTE_AT = [[-.71, .09], [-.49, .125], [-.25, .135], [.27, .12], [.5, .085], [.72, .11]];
const notes = TASKS.map((n, i) => {
  const g = new THREE.Group();
  at(g, NOTE_AT[i][0], NOTE_AT[i][1], .014, board);
  g.rotation.z = (Math.random() - .5) * .16;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(.16, .12), mat('#ffffff', { map: noteTex(n), roughness: .85, transparent: true, alphaTest: .5 }));
  paper.castShadow = true; g.add(paper);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(.0065, 12, 10), mat(n.c, { roughness: .35, metalness: .2 })); pin.position.set((Math.random() - .5) * .02, .047, .006); g.add(pin);
  g.userData = { n, z: .014 };
  return g;
});
const pinned = notes.slice();   // everything on the board that can be moved by hand

// three pinned photos of things I like: cars, games, badminton (drawn as sketches)
const photoTex = (kind, cap, tint) => liveTex(240, 290, (g, w, h) => {
  g.fillStyle = '#F7F4EC'; g.fillRect(0, 0, w, h);
  g.fillStyle = tint; g.fillRect(16, 16, w - 32, 200);
  g.strokeStyle = '#1f2228'; g.lineWidth = 3.2; g.lineCap = g.lineJoin = 'round';
  g.save(); g.translate(16, 16);
  if (kind === 'car') {
    wob(g, [[18, 130], [30, 102], [70, 96], [98, 70], [150, 68], [178, 96], [196, 102], [194, 130], [18, 130]]);
    wob(g, [[104, 76], [146, 74], [164, 96], [96, 96], [104, 76]]);
    [[58, 132], [158, 132]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 17, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, 6, 0, 7); g.stroke(); });
    wob(g, [[6, 156], [202, 156]]); wob(g, [[0, 112], [12, 112]]); wob(g, [[-2, 122], [10, 122]]);
  }
  if (kind === 'pad') {
    wob(g, [[40, 80], [168, 80], [196, 150], [176, 168], [142, 140], [66, 140], [32, 168], [12, 150], [40, 80]]);
    wob(g, [[56, 100], [56, 124]]); wob(g, [[44, 112], [68, 112]]);
    [[150, 100], [164, 112], [136, 112], [150, 124]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.stroke(); });
    wob(g, [[94, 104], [114, 104]]);
  }
  if (kind === 'shuttle') {
    g.beginPath(); g.ellipse(70, 70, 34, 44, -.5, 0, 7); g.stroke();
    for (let k = -2; k <= 2; k++) wob(g, [[70 + k * 12 - 14, 38 + Math.abs(k) * 6], [70 + k * 12 + 14, 102 - Math.abs(k) * 6]]);
    wob(g, [[92, 106], [150, 178]]);
    wob(g, [[150, 60], [178, 30], [196, 60], [180, 70], [164, 70], [150, 60]]); g.beginPath(); g.arc(173, 76, 9, 0, 7); g.stroke();
  }
  g.restore();
  g.fillStyle = '#2a2d33'; g.font = `700 40px ${HAND}`; g.textAlign = 'center'; g.fillText(cap, w / 2, h - 30);
});
const PHOTOS = [['car', 'cars', '#C9D6DF'], ['pad', 'games', '#D9CCE8'], ['shuttle', 'badminton', '#CFE3C8']];
const PHOTO_AT = [[-.6, -.11], [.42, -.1], [.66, -.12]];
PHOTOS.forEach(([k, cap, tint], i) => {
  const g = new THREE.Group(); at(g, PHOTO_AT[i][0], PHOTO_AT[i][1], .02 + i * .002, board); g.rotation.z = [-.12, .1, -.06][i];
  g.userData = { z: .02 + i * .002 }; pinned.push(g);
  const ph = new THREE.Mesh(new THREE.PlaneGeometry(.1, .121), mat('#ffffff', { map: photoTex(k, cap, tint), roughness: .7 })); ph.castShadow = true; g.add(ph);
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(.05, .016), new THREE.MeshStandardMaterial({ color: '#E8DDBF', transparent: true, opacity: .75, roughness: .9 }));
  tape.position.set(0, .058, .002); tape.rotation.z = (Math.random() - .5) * .3; g.add(tape);
});
// two sticky notes: what is on this week
const stickyTex = (txt, c) => liveTex(200, 200, (g, w, h) => {
  g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 0, w, 26);
  g.fillStyle = '#2a2d33'; g.font = `700 38px ${HAND}`; txt.split('|').forEach((l, i) => g.fillText(l, 18, 76 + i * 44));
});
[['ship xpera|lab 2 ✓', '#F2D64B', -.37, -.1, .08], ['ideas:|more games', '#9ED6C0', .2, -.09, -.1]].forEach(([t, c, x, y, r]) => {
  const g = new THREE.Group(); at(g, x, y, .016, board); g.rotation.z = r; g.userData = { z: .016 };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.075, .075), mat('#ffffff', { map: stickyTex(t, c), roughness: .9 })); m.castShadow = true; g.add(m);
  pinned.push(g);
});
// a loose bit of red string from the first note to the last, like a plan
const STRUNG = [0, 2, 3, 5];
const stringGeo = () => {
  const pts = STRUNG.map(i => { const n = notes[i]; return V3(n.position.x - Math.sin(n.rotation.z) * .047, n.position.y + .047, n.position.z + .008); });
  const path = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; path.push(V3((a.x + b.x) / 2, Math.min(a.y, b.y) - .04 - Math.abs(b.x - a.x) * .06, .03), b); }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 90, .0012, 5);
};
const stringLine = new THREE.Mesh(stringGeo(), mat('#C4432D', { roughness: .7 }));
board.add(stringLine);
const restring = () => { stringLine.geometry.dispose(); stringLine.geometry = stringGeo(); };

/* ---------- a framed print on the wall where the board used to be ---------- */
const printTex = liveTex(400, 540, (g, w, h) => {
  g.fillStyle = '#0b0c0f'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(236,233,226,.08)'; for (let x = 12; x < w; x += 24) for (let y = 12; y < h; y += 24) g.fillRect(x - 1, y - 1, 2, 2);
  g.fillStyle = '#ECE9E2'; g.font = '600 96px "IBM Plex Sans Condensed", Arial Narrow, sans-serif'; g.fillText('DRAW', 36, 170); g.fillText('IT', 36, 266);
  g.strokeStyle = '#ECE9E2'; g.lineWidth = 2; g.strokeText('FIRST', 36, 362); g.fillStyle = '#E0533F'; g.fillRect(266, 334, 26, 26);
  g.fillStyle = 'rgba(236,233,226,.5)'; g.font = '500 15px "IBM Plex Mono", monospace'; g.fillText('NICHO.DEV  ·  SHEET A-100', 36, h - 40);
});
const print = new THREE.Group(); at(print, -1.5, 1.1, -.6);
at(box(.44, .58, .02, mat('#1a1b1f', { roughness: .4, metalness: .3 })), 0, 0, 0, print);
const printM = new THREE.Mesh(new THREE.PlaneGeometry(.38, .52), mat('#ffffff', { map: printTex, roughness: .6 })); printM.position.z = .0105; print.add(printM);

/* ---------- the drawer: folders that pop up, and a phone ---------- */
const PROJ = [
  { id: 'kuwago', no: '01', name: 'kuwaGO', kind: 'Mobile app · 2026', c: '#5BB06A', thumb: 'assets/cs/kuwago-garden.jpg', line: 'A pixel-art study garden. Focus and your plant grows.',
    points: ['Pomodoro sessions grow a pixel plant', 'AI turns notes into quizzes', '18 testers · 72 tests'] },
  { id: 'cinematheque', no: '02', name: 'Cinematheque', kind: 'Web system · 2026', c: '#E2763F', thumb: 'assets/cs/cinematheque-title.jpg', line: 'Seat-picking, online payment and e-tickets for a real cinema.',
    points: ['Pick exact seats, pay online', 'Staff schedule films and admit guests', '129 tests · client approved'] },
  { id: 'xpera', no: '03', name: 'xpera CRM', kind: 'Desktop system · in progress', c: '#F4506A', thumb: 'assets/cs/xpera-logo.jpg', line: 'A customer system for stores that sell gaming PC parts.',
    points: ['Customers, sales and payments', 'One database per store', '15 use cases · 4 roles'] }
];
const DR = { x: -.2, top: DESK_Y - .036, z: -.2, open: .46 };
const HW = .76, HH = .12, HD = .66;
// the cabinet hangs under the glass, so its walnut shows through
const housing = new THREE.Group(); scene.add(housing);
at(box(HW + .016, .012, HD, WALNUT), DR.x, DR.top - .006, DR.z, housing);
at(box(.016, HH, HD, WALNUT), DR.x - HW / 2, DR.top - HH / 2, DR.z, housing);
at(box(.016, HH, HD, WALNUT), DR.x + HW / 2, DR.top - HH / 2, DR.z, housing);
at(box(HW + .016, .012, HD, WALNUT), DR.x, DR.top - HH, DR.z, housing);
at(box(HW, HH, .012, WALNUT), DR.x, DR.top - HH / 2, DR.z - HD / 2, housing);
const dW = .72, dH = .095, dD = .6;
const drawer = new THREE.Group(); at(drawer, DR.x, DR.top - HH + .007, DR.z);
const drawerFront = at(box(dW, dH + .006, .02, WALNUT, .004), 0, dH / 2 + .001, dD / 2, drawer);
at(box(.2, .012, .014, BLACK, .005), 0, dH / 2 + .004, dD / 2 + .016, drawer);
const innerWood = mat('#3a2a1e', { roughness: .8 });
at(box(dW - .03, .006, dD, mat('#2a1e16', { roughness: .9 })), 0, .003, 0, drawer);
[-1, 1].forEach(s => at(box(.008, dH - .02, dD, innerWood), s * (dW / 2 - .02), dH / 2 - .01, 0, drawer));
at(box(dW - .04, dH - .02, .008, innerWood), 0, dH / 2 - .01, -dD / 2 + .004, drawer);
const drawerLight = new THREE.PointLight('#FFD9A8', 0, .8, 2); at(drawerLight, 0, .2, .1, drawer);
// each project is a dark envelope of proofs: printed screens of the real thing, closed with a button and string
// the drawer is the archive: what happened before the polished case study
const ARCHIVE = {
  kuwago: { kind: 'The promo', count: 'v1 → v7', title: 'How the promo got better',
    text: 'Seven versions of the kuwaGO promo video. v1 opened on a phone mock-up; by v4 it asked a question first; v7 tightened the frame. Click a still to bring it forward.',
    items: [{ img: 'tinta/assets/archive/kuwago-promo-v1.jpg', tall: true, name: 'Draft v1', size: '30 s' },
            { img: 'tinta/assets/archive/kuwago-promo-v4.jpg', tall: true, name: 'Draft v4', size: '47 s' },
            { img: 'tinta/assets/archive/kuwago-promo-v7.jpg', tall: true, name: 'Final v7', size: '47.5 s' }] },
  cinematheque: { kind: 'What I cut', count: '3 cuts', title: 'What I cut',
    text: 'Features that were built or planned for the cinema, then removed. Taking things out was as much of the work as putting them in.',
    items: [{ card: ['Staff approval', 'Every booking waited in a "pending" list for staff to approve it, with an extra email.', 'A paid booking now confirms itself.'] },
            { card: ['Payment screenshots', 'Guests paid by QR code and uploaded a screenshot as proof.', 'Replaced by PayMongo checkout, checked by a signed webhook.'] },
            { card: ['Footer wordmark', 'A large photo wordmark at the bottom of the customer site.', 'Removed to keep the footer quiet.'] }] },
  xpera: { kind: 'Before the code', count: '2 diagrams · 1 lesson', title: 'Before the code',
    text: 'xpera was planned on paper first: which store gets which plan and database, and who can do what. Then the first real wall I hit.',
    items: [{ img: 'tinta/assets/archive/xpera-tenants.jpg', name: 'Tenants', size: 'Plans A–C' },
            { img: 'tinta/assets/archive/xpera-use-cases.jpg', name: 'Use cases', size: '4 roles' },
            { card: ['Lesson', '"There is already an object named Plans." SQL Server ignores letter case in names, so a new database clashed with an old one.', 'Delete the old databases first, and let EF own every table.'], stamp: 'LESSON' }] }
};
// the label printed on the pocket: a red rule, the number and what is inside, the name, the count
const labelTex = p => liveTex(520, 150, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#E0533F'; g.fillRect(0, 10, 5, h - 20);
  g.font = '500 22px "IBM Plex Mono", monospace'; g.fillText(`${p.no} · ${ARCHIVE[p.id].kind}`, 22, 34);
  g.fillStyle = '#ECE9E2'; let fs = 66; do { g.font = `600 ${fs}px "IBM Plex Sans Condensed", Arial Narrow, sans-serif`; fs -= 2; } while (g.measureText(p.name.toUpperCase()).width > w - 30 && fs > 30);
  g.fillText(p.name.toUpperCase(), 20, 96);
  g.fillStyle = 'rgba(236,233,226,.6)'; g.font = '500 20px "IBM Plex Mono", monospace'; g.fillText(ARCHIVE[p.id].count.toUpperCase(), 22, 132);
});
// wraps text to a width, line by line
const wrapLines = (g, text, maxW) => { const out = []; let line = ''; text.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); return out; };
// a proof: a picture (a still or a diagram) or a written card, with a white caption strip underneath
const proofTex = (p, item) => {
  const hold = { img: null };
  const t = liveTex(420, 330, (g, w, h) => {
    const ih = h - 46;
    if (item.card) {
      const [title, was, now] = item.card;
      g.fillStyle = '#F3EFE6'; g.fillRect(0, 0, w, ih);
      g.strokeStyle = 'rgba(40,50,70,.08)'; g.lineWidth = 1; for (let y = 52; y < ih - 6; y += 22) { g.beginPath(); g.moveTo(16, y + .5); g.lineTo(w - 16, y + .5); g.stroke(); }
      g.fillStyle = '#161B26'; g.font = '600 30px "IBM Plex Sans Condensed", Arial Narrow, sans-serif'; g.fillText(title.toUpperCase(), 18, 40);
      g.fillStyle = '#1f232a'; g.font = '500 16px "IBM Plex Sans", Arial, sans-serif'; let y = 72;
      wrapLines(g, was, w - 36).forEach(l => { g.fillText(l, 18, y); y += 21; });
      y += 8; g.fillStyle = '#C4432D'; g.font = '500 15px "IBM Plex Sans", Arial, sans-serif';
      wrapLines(g, '→ ' + now, w - 36).forEach(l => { g.fillText(l, 18, y); y += 20; });
      // a rubber stamp across the corner
      g.save(); g.translate(w - 78, 34); g.rotate(-.18); g.strokeStyle = 'rgba(196,67,45,.85)'; g.lineWidth = 3; g.strokeRect(-46, -17, 92, 34);
      g.fillStyle = 'rgba(196,67,45,.9)'; g.font = '700 18px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillText(item.stamp || 'CUT', 0, 7); g.restore(); g.textAlign = 'left';
    } else {
      if (item.tall) { const r = g.createRadialGradient(w / 2, ih * .3, 10, w / 2, ih * .3, w * .7); r.addColorStop(0, '#2f3d33'); r.addColorStop(1, '#121418'); g.fillStyle = r; } else g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, ih);
      const im = hold.img;
      if (im) {
        if (item.tall) { const k = (ih - 16) / im.height, iw = im.width * k; g.drawImage(im, (w - iw) / 2, 8, iw, ih - 16); }
        else { const k = Math.min((w - 16) / im.width, (ih - 12) / im.height); g.drawImage(im, (w - im.width * k) / 2, (ih - im.height * k) / 2, im.width * k, im.height * k); }
      }
    }
    g.fillStyle = '#ffffff'; g.fillRect(0, ih, w, h - ih);
    g.fillStyle = '#C4432D'; g.beginPath(); g.arc(20, ih + 23, 6, 0, 7); g.fill();
    g.fillStyle = '#161B26'; g.font = '600 17px "IBM Plex Mono", monospace'; g.fillText(p.name.toUpperCase(), 34, ih + 29);
    g.fillStyle = '#5C6270'; g.font = '500 15px "IBM Plex Mono", monospace'; g.textAlign = 'right';
    g.fillText(item.card ? ARCHIVE[p.id].kind.toUpperCase() : `${item.name.toUpperCase()}   ${item.size}`, w - 14, ih + 29); g.textAlign = 'left';
  });
  if (item.img) {
    const im = new Image(); manager.itemStart('proof-' + item.img);
    im.onload = () => { hold.img = im; t.userData.redraw(); manager.itemEnd('proof-' + item.img); };
    im.onerror = () => manager.itemEnd('proof-' + item.img);
    im.src = item.img;
  }
  return t;
};
const EW = .22, ED = .15;
const READ_AT = { x: -.08, z: .13 };      // where an opened envelope is read: the front of the drawer                    // an envelope, lying flat
const HOMES = [[-.12, .1, .05], [-.12, -.105, -.04], [.14, -.02, .07]];   // where each one lies: x, z, turn
const envBack = mat('#262b33', { roughness: .85 }), envFront = mat('#2f353f', { roughness: .8 }), envFlap = mat('#22262d', { roughness: .9, side: THREE.DoubleSide });
const btnM = mat('#E4E1D9', { roughness: .4 }), threadM = mat('#C4432D', { roughness: .7 });
const flapShape = new THREE.Shape([new THREE.Vector2(-EW / 2, 0), new THREE.Vector2(EW / 2, 0), new THREE.Vector2(.075, .058), new THREE.Vector2(-.075, .058)]);
const flat = m => { m.rotation.x = -Math.PI / 2; return m; };
const folders = PROJ.map((p, i) => {
  const [hx, hz, hr] = HOMES[i];
  const f = new THREE.Group(); at(f, hx, .006, hz, drawer); f.rotation.y = hr;
  at(box(EW, .003, ED, envBack, .002), 0, .0015, 0, f);                                   // the back
  // the proofs, tucked inside; they slide out when it is opened
  const proofs = ARCHIVE[p.id].items.map((pr, k) => {
    const m = flat(new THREE.Mesh(new THREE.PlaneGeometry(.19, .143), mat('#c9c9c9', { map: proofTex(p, pr), roughness: .9 })));
    m.position.set(0, .0032 + k * .0003, -.002); f.add(m); return m;
  });
  const pocket = at(box(EW, .002, .11, envFront, .0015), 0, .0052, .02, f);                // the front pocket
  const edge = flat(new THREE.Mesh(new THREE.PlaneGeometry(EW - .006, .0016), mat('#4a515d', { roughness: .7 }))); edge.position.set(0, .0063, -.034); f.add(edge);
  const lab = flat(new THREE.Mesh(new THREE.PlaneGeometry(.15, .0433), new THREE.MeshStandardMaterial({ map: labelTex(p), transparent: true, roughness: .7 })));
  lab.position.set(-.028, .0064, .046); f.add(lab);
  // the flap, hinged at the top edge: folded down over the pocket when closed, laid flat behind it when open
  const hinge = new THREE.Group(); at(hinge, 0, .0068, -ED / 2, f); hinge.rotation.x = Math.PI / 2;
  const flapM = new THREE.Mesh(new THREE.ShapeGeometry(flapShape), envFlap); flapM.castShadow = true; hinge.add(flapM);
  const bA = cyl(.0068, .0068, .0022, btnM, 18); bA.rotation.x = Math.PI / 2; bA.position.set(0, .046, -.0013); hinge.add(bA);   // button on the flap
  const bB = at(cyl(.0068, .0068, .0022, btnM, 18), 0, .0072, .006, f);                    // button on the pocket
  const string = new THREE.Group(); at(string, 0, .0085, 0, f);                           // the red string, wound in a figure eight
  [-.0125, .0005].forEach(z => { const loop = flat(new THREE.Mesh(new THREE.TorusGeometry(.0068, .0008, 6, 24), threadM)); loop.position.z = z; string.add(loop); });
  f.userData = { p, slot: i, proofs, hinge, string, pord: [0, 1, 2] };
  return f;
});
let order = [0, 1, 2];
let stack = [0, 1, 2];   // which envelope lies on top of which: the last one moved goes on top
const toTop = f => { const i = folders.indexOf(f); stack = stack.filter(x => x !== i).concat(i); };   // which folder sits in which slot

// the phone, lying face up at the front right of the drawer
const lockTex = canvasTex(360, 760, (g, w, h) => { g.fillStyle = '#0b0c10'; g.fillRect(0, 0, w, h); });
const drawLock = img => {
  const c = lockTex.image, g = c.getContext('2d'), w = c.width, h = c.height;
  const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  g.drawImage(img, (w - iw) / 2, (h - ih) / 2 - 20, iw, ih);
  const top = g.createLinearGradient(0, 0, 0, 260); top.addColorStop(0, 'rgba(0,0,0,.55)'); top.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = top; g.fillRect(0, 0, w, 260);
  let time = '', date = '';
  try { time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' }); date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Manila' }); } catch {}
  g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = '500 22px "IBM Plex Sans", sans-serif'; g.fillText(date, w / 2, 92);
  g.font = '600 96px "IBM Plex Sans Condensed", Arial Narrow, sans-serif'; g.fillText(time, w / 2, 186);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(w / 2 - 60, h - 26, 120, 5);
  lockTex.needsUpdate = true;
};
const lockImg = new Image(); manager.itemStart('lock'); lockImg.onload = () => { drawLock(lockImg); manager.itemEnd('lock'); }; lockImg.onerror = () => manager.itemEnd('lock'); lockImg.src = 'tinta/assets/photos/lockscreen.jpg';
const phone = new THREE.Group(); at(phone, .58, DESK_Y, .05); phone.rotation.y = -.35;
at(box(.074, .008, .152, mat('#101114', { roughness: .3, metalness: .6 }), .009), 0, .004, 0, phone);
const phoneScreenM = new THREE.MeshBasicMaterial({ map: lockTex, toneMapped: false, color: '#0a0a0a' });
const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(.068, .144), phoneScreenM); phoneScreen.rotation.x = -Math.PI / 2; phoneScreen.position.y = .0083; phone.add(phoneScreen);
const PHONE_HOME = { x: .58, y: DESK_Y, z: .05, rx: 0, ry: -.35 };

/* ---------- lights ---------- */
const hemi = new THREE.HemisphereLight('#3c4870', '#120e0a', 0); scene.add(hemi);
const winLight = new THREE.RectAreaLight('#88A8FF', 0, 1.0, .95); winLight.position.set(1.33, 1.55, .15); winLight.lookAt(0, 1.2, .15); scene.add(winLight);
const stripLight = new THREE.RectAreaLight('#FFB070', 0, 1.26, .03); stripLight.position.set(-.12, SHELF_Y - .025, -.43); stripLight.lookAt(-.12, 0, -.43); scene.add(stripLight);
const washLight = new THREE.RectAreaLight('#E5603F', 0, 1.1, .35); washLight.position.set(.04, 1.0, -.5); washLight.lookAt(.04, 1.2, -.62); scene.add(washLight);
const screenLight = new THREE.PointLight('#BFD0FF', 0, 1.4, 2); screenLight.position.set(-.02, DESK_Y + .26, .08); scene.add(screenLight);
const fill = new THREE.PointLight('#FFC9A0', 0, 4, 2); fill.position.set(-.1, 1.6, 1.6); scene.add(fill);
const boardLight = new THREE.SpotLight('#FFE2BC', 0, 2.6, .72, .7, 2); boardLight.position.set(0, 2.25, .45); boardLight.target = board; scene.add(boardLight);
const ceiling = new THREE.PointLight('#FFE7C8', 0, 0, 2); ceiling.position.set(0, 2.5, .6); scene.add(ceiling);
const L = { hemi: .42, win: 3.4, strip: 9, wash: 2.2, screen: .9, lamp: 7.5, bulb: 3, stripK: 3, fill: .7, board: 3, ceil: 16, ceilHemi: 2.2 };
const LK = { hemi: 0, win: 0, strip: 0, wash: 0, screen: 0, lamp: 0, lap: 0, ceil: 0 };
const lightsTo = k => {
  hemi.intensity = L.hemi * k.hemi + L.ceilHemi * k.ceil; winLight.intensity = L.win * k.win; stripLight.intensity = L.strip * k.strip; strip.material.emissiveIntensity = L.stripK * k.strip;
  washLight.intensity = L.wash * k.wash * (1 - .4 * k.ceil); screenLight.intensity = L.screen * k.screen;
  lampLight.intensity = L.lamp * k.lamp; bulbM.emissiveIntensity = L.bulb * k.lamp;
  lapScreen.material.color.setScalar(.1 + .85 * Math.max(k.lap, k.screen)); gpuRing.emissiveIntensity = 2.2 * k.lap;
  fill.intensity = L.fill * k.hemi; boardLight.intensity = L.board * k.hemi;
  ceiling.intensity = L.ceil * k.ceil; swDot.material.emissiveIntensity = k.ceil ? .2 : 1.4;
};
lightsTo(LK);

// dust drifting in the lamp light
const dustN = 90, dustG = new THREE.BufferGeometry(), dustP = new Float32Array(dustN * 3);
for (let i = 0; i < dustN; i++) { dustP[i * 3] = -.6 + Math.random() * .7; dustP[i * 3 + 1] = DESK_Y + Math.random() * .6; dustP[i * 3 + 2] = -.35 + Math.random() * .5; }
dustG.setAttribute('position', new THREE.BufferAttribute(dustP, 3));
const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: '#FFD9A8', size: .004, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);

/* ---------- camera ---------- */
const HOME = { pos: new THREE.Vector3(-.04, 1.27, 2.4), look: new THREE.Vector3(-.06, 1.06, -.3) };
const cam = { px: HOME.pos.x, py: HOME.pos.y, pz: HOME.pos.z, lx: HOME.look.x, ly: HOME.look.y, lz: HOME.look.z };
const view = { ...cam };   // where the camera actually is: it eases toward cam every frame
let focus = null, introRunning = false, introTl = null, dragging = null;
const fitHome = () => {
  const a = camera.aspect, k = a < 1 ? 1.35 + (1 - a) * 1.6 : a < 1.4 ? 1.12 : 1;
  HOME.pos.set(-.04, 1.27 + (k - 1) * .25, 2.4 * k);
};
const resize = () => {
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); fitHome();
  if (!focus && !introRunning) Object.assign(cam, { px: HOME.pos.x, py: HOME.pos.y, pz: HOME.pos.z, lx: HOME.look.x, ly: HOME.look.y, lz: HOME.look.z });
};
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); ptr.tx = (e.clientX - r.left) / r.width - .5; ptr.ty = (e.clientY - r.top) / r.height - .5; }, { passive: true });
const camTo = (pos, look, d = 1.1, done) => {
  if (!G || !motion) { Object.assign(cam, { px: pos.x, py: pos.y, pz: pos.z, lx: look.x, ly: look.y, lz: look.z }); done && done(); return; }
  G.to(cam, { px: pos.x, py: pos.y, pz: pos.z, lx: look.x, ly: look.y, lz: look.z, duration: d, ease: 'power2.inOut', overwrite: true, onComplete: done });
};
const wide = () => innerWidth > 760;

/* ---------- drawer behaviour ---------- */
let drawerOpen = false, chosen = null, hoverFolder = null, phoneUp = false;
const POP = .03, CHOSEN = .15;
const settleFolders = (instant) => folders.forEach(f => {
  const open = drawerOpen && f === chosen, d = instant ? 0 : 1;
  if (f === dragging) return;
  const y = .006 + stack.indexOf(folders.indexOf(f)) * .0045 + (open ? .02 : drawerOpen && f === hoverFolder ? .008 : 0);
  // an opened envelope comes to the front of the drawer to be read, then goes back to where it lay
  const u = f.userData, pos = { y };
  if (open) { if (!u.prev) u.prev = { x: f.position.x, z: f.position.z, r: f.rotation.y }; Object.assign(pos, READ_AT); tween(f.rotation, { y: 0, duration: .5 * d, ease: 'power3.out' }); }
  else if (u.prev) { Object.assign(pos, { x: u.prev.x, z: u.prev.z }); tween(f.rotation, { y: u.prev.r, duration: .5 * d, ease: 'power3.out' }); u.prev = null; }
  tween(f.position, { ...pos, duration: .55 * d, ease: 'power3.out', overwrite: true, onUpdate: shadowsDirty });
  // the string comes undone, then the flap opens back
  f.userData.string.visible = !open;
  tween(f.userData.hinge.rotation, { x: open ? -Math.PI / 2 : Math.PI / 2, duration: .7 * d, delay: open ? .1 * d : 0, ease: 'power3.inOut', overwrite: true, onUpdate: shadowsDirty });
  // the proofs slide out, one behind the other, so each one's caption shows
  f.userData.proofs.forEach((m, k) => {
    const r = f.userData.pord.indexOf(k);
    tween(m.position, { y: open ? .0078 + r * .0013 : .0032 + k * .0003, z: open ? -.088 + r * .034 : -.002, duration: .7 * d, delay: open ? (.35 + r * .07) * d : 0, ease: open ? 'power3.out' : 'power3.inOut', overwrite: true, onUpdate: shadowsDirty });
    tween(m.rotation, { z: open ? (r - 1) * -.025 : 0, duration: .6 * d, delay: open ? (.35 + r * .07) * d : 0, ease: 'power3.out', overwrite: true });
  });
});
const setDrawer = on => {
  drawerOpen = on; if (!on) { chosen = null; hoverFolder = null; }
  tween(drawer.position, { z: DR.z + (on ? DR.open : 0), duration: on ? 1.1 : .7, ease: on ? 'power3.out' : 'power3.inOut', overwrite: true, onUpdate: shadowsDirty });
  tween(drawerLight, { intensity: on ? .6 : 0, duration: .8 });
  // the folders pop up one after another once the drawer is out
  settleFolders();
};
const drawerView = () => {
  const c = V3(DR.x, DR.top - .06, DR.z + DR.open), side = wide() ? .1 : 0;
  const low = wide() ? 0 : .2;   // on phones the card sits at the bottom, so keep the drawer in the top half
  camTo(V3(c.x + side, c.y + .62 + low * .4, c.z + .62 + low), V3(c.x + side, c.y - low, c.z - .02));
};
const phoneUpNow = () => {
  phoneUp = true;
  const to = { x: .48, y: DESK_Y + .2, z: .3 };
  tween(phone.position, { ...to, duration: .9, ease: 'power3.out', overwrite: true, onUpdate: shadowsDirty });
  // the camera leans in, square to the screen (on phones, a little lower so the card stays clear of it)
  const w = V3(to.x, to.y, to.z), dist = wide() ? .34 : .5;
  camTo(V3(w.x + (wide() ? .06 : 0), w.y + .71 * dist, w.z + .7 * dist), V3(w.x + (wide() ? .06 : 0), w.y - (wide() ? 0 : .07), w.z), 1.1);
  tween(phone.rotation, { x: .78, y: 0, duration: .9, ease: 'power3.out', overwrite: true });
  G && motion ? G.to(phoneScreenM.color, { r: 1, g: 1, b: 1, duration: .5, delay: .35 }) : phoneScreenM.color.setScalar(1);
};
const phoneDown = instant => {
  const wasUp = phoneUp; phoneUp = false;
  if (wasUp && !instant && focus && focus.kind === 'phone') { focus = null; roomEl.classList.remove('focused'); hsEls.forEach(el => el.classList.remove('on')); camTo(HOME.pos, HOME.look, 1.2); }
  tween(phone.position, { x: PHONE_HOME.x, y: PHONE_HOME.y, z: PHONE_HOME.z, duration: instant ? 0 : .7, ease: 'power3.inOut', overwrite: true, onUpdate: shadowsDirty });
  tween(phone.rotation, { x: PHONE_HOME.rx, y: PHONE_HOME.ry, duration: instant ? 0 : .7, ease: 'power3.inOut', overwrite: true });
  G && motion && !instant ? G.to(phoneScreenM.color, { r: .04, g: .04, b: .04, duration: .3 }) : phoneScreenM.color.setScalar(.04);
};

/* ---------- task board behaviour ---------- */
let chosenNote = null, hoverNote = null;
const settleNotes = () => notes.forEach(n => tween(n.position, { z: n === chosenNote ? .06 : n === hoverNote ? .035 : n.userData.z, duration: .4, ease: 'power3.out', overwrite: true }));
const boardView = () => {
  const p = new THREE.Vector3(); board.getWorldPosition(p);
  const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight), t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const halfW = wide() ? 1.75 : 1.05;   // on wide screens the card sits to the right, so leave room for it
  const d = Math.min(4.2, Math.max(1.6, halfW / (t * aspect), (BH / 2 + .14) / t));
  const sx = wide() ? .36 : 0, dy = wide() ? 0 : -.1;
  // from a little above, so the view clears the laptop lid
  camTo(V3(p.x + sx, p.y + .55 + dy, p.z + d), V3(p.x + sx, p.y - .04 + dy, p.z));
};

/* ---------- light switch ---------- */
let roomLit = false;
const toggleRoom = () => {
  roomLit = !roomLit;
  tween(rocker.rotation, { x: roomLit ? -.2 : .2, duration: .15, ease: 'power2.out' });
  tween(LK, { ceil: roomLit ? 1 : 0, duration: roomLit ? .35 : .5, ease: roomLit ? 'steps(4)' : 'power2.out', onUpdate: () => lightsTo(LK) });
  shadowsDirty();
};
let lampOn = true;
const toggleLamp = () => { lampOn = !lampOn; tween(LK, { lamp: lampOn ? 1 : 0, duration: .5, onUpdate: () => { lightsTo(LK); shadowsDirty(); } }); };

/* ---------- what can be looked at ---------- */
const layersHref = id => `index.html?project=${id}`;
const SPOTS = [
  { id: 'drawer', obj: drawerFront, at: [0, 0, .012], label: 'Drawer', small: 'The archive', c: '#D8C49A', kind: 'drawer', side: 'left' },
  { id: 'board', obj: board, at: [.84, .2, .03], label: 'Task board', small: 'Every part of the main page', c: '#E8B04A', kind: 'board' },
  { id: 'kuwago', obj: owl, at: [0, .07, 0], label: 'kuwaGO', small: 'The study owl', c: '#5BB06A', title: 'The study owl',
    text: "kuwaGO's mascot on its pot. Finish a focus session and the sprout grows; give up and it wilts. It's pixel art, because the whole app is.",
    dl: [['System', 'kuwaGO · mobile app'], ['Built with', 'Flutter · Firebase · Gemini'], ['Status', 'v1.0.5 · 18 testers']], project: 'kuwago',
    view: [.18, .08, .52], focus: () => G && G.fromTo(owlBody.position, { y: V }, { y: V + .03, duration: .28, yoyo: true, repeat: 3, ease: 'power2.out' }) },
  { id: 'cinematheque', obj: cine, at: [0, .1, 0], label: 'Cinematheque', small: 'Popcorn and a clapper', c: '#E2763F', title: 'Popcorn night',
    text: 'For the cinema ticketing system: moviegoers pick exact seats, pay online and get an e-ticket. The clapper is for the staff side, where films get scheduled.',
    dl: [['System', 'Cinematheque · web'], ['Built with', 'Laravel 12 · MySQL · PayMongo'], ['Status', '129 tests · client approved']], project: 'cinematheque',
    view: [.12, .08, .5], focus: () => G && pop.slice(0, 5).forEach((m, i) => G.fromTo(m.position, { y: m.position.y }, { y: m.position.y + .05, duration: .3, yoyo: true, repeat: 1, delay: i * .12, ease: 'power2.out' })) },
  { id: 'xpera', obj: gpu, at: [0, .09, 0], label: 'xpera CRM', small: 'A boxed graphics card', c: '#F4506A', title: 'Fresh off the shelf',
    text: 'xpera CRM is for small stores that sell gaming PC parts, so its toy is a boxed graphics card. The fans spin up when you look closer.',
    dl: [['System', 'xpera CRM · desktop'], ['Built with', 'C# · WinForms · SQL Server'], ['Status', 'In progress · lab 1 done']], project: 'xpera',
    view: [.06, .07, .46], focus: () => G && G.to({ s: fanSpeed }, { s: 16, duration: .8, onUpdate() { fanSpeed = this.targets()[0].s; } }), blur: () => G && G.to({ s: fanSpeed }, { s: 1.5, duration: 1.2, onUpdate() { fanSpeed = this.targets()[0].s; } }) },
  { id: 'phone', obj: phone, at: [0, .02, 0], label: 'Phone', small: 'My lock screen', c: '#F4A6B8', kind: 'phone' },
  { id: 'sketch', obj: sketch, at: [0, .03, 0], label: 'Sketchbook', small: 'Where it starts', c: '#E0533F', title: 'Where it starts', side: 'left',
    text: 'Every project begins as a drawing in here: screens, flows, the database on the back pages. Then it goes to Figma, then to code.',
    dl: [['Habit', 'Draw first, build second'], ['Next', 'Figma, then code']], href: 'about.html', cta: 'Read my profile', view: [.05, .32, .42] },
  { id: 'keychain', obj: keychain, at: [0, -.06, .02], label: 'Keychain', small: 'A gift', c: '#F2C53A', title: 'A gift from her', side: 'left',
    text: 'A little Belle keychain my girlfriend gave me. It hangs under the shelf, where I can see it while I work.',
    dl: [['From', 'My girlfriend'], ['Kept', 'Under the shelf']], view: [.04, -.02, .34],
    focus: () => G && G.fromTo(keychain.rotation, { z: .5 }, { z: 0, duration: 2.4, ease: 'elastic.out(1, .25)' }) },
  { id: 'laptop', obj: laptop, at: [0, .16, -.06], label: 'My ASUS laptop', small: 'Use its desktop', c: '#BFD0FF', kind: 'desk' },
  { id: 'lamp', obj: head, at: [0, 0, 0], label: 'Lamp', small: 'Click to switch', c: '#FFB774', kind: 'lamp', side: 'left' },
  { id: 'switch', obj: sw, at: [0, 0, .01], label: 'Light switch', small: 'The room light', c: '#FFE7C8', kind: 'switch' }
];
const hots = document.getElementById('hots'), card = document.getElementById('card');
hots.innerHTML = SPOTS.map((s, i) => `<button class="hs${s.side === 'left' ? ' left' : ''}" type="button" data-i="${i}" style="--c:${s.c}" aria-label="${s.label}: ${s.small}"><i class="hs-lead" aria-hidden="true"></i><span class="hs-label">${s.label}<small>${s.small}</small></span></button>`).join('');
const hsEls = [...hots.children];
const wp = new THREE.Vector3();
const HS_DX = 22, HS_DY = 18;
const placeHots = () => SPOTS.forEach((s, i) => {
  s.obj.localToWorld(wp.set(...s.at)); wp.project(camera);
  const el = hsEls[i];
  // the dot sits a little to the side of the object, tied to it by a short line, so it never covers it
  const dx = s.side === 'left' ? -HS_DX : HS_DX;
  el.style.transform = `translate(${((wp.x + 1) / 2 * canvas.clientWidth + dx).toFixed(1)}px, ${((1 - wp.y) / 2 * canvas.clientHeight - HS_DY).toFixed(1)}px)`;
  el.style.visibility = wp.z < 1 ? 'visible' : 'hidden';
});

/* ---------- the card ---------- */
const pad2 = n => String(n).padStart(2, '0');
const cardList = SPOTS.filter(x => !['dive', 'lamp', 'switch', 'phone', 'desk'].includes(x.kind));
const topLine = (s, right) => `<div class="rc-top mono"><span><b>${pad2(cardList.indexOf(s) + 1)}</b> / ${pad2(cardList.length)}</span><span>${right}</span></div>`;
const navRow = (back = 'Step back') => `<div class="rc-nav"><button type="button" class="rc-prev" aria-label="Previous">←</button><button type="button" class="rc-next" aria-label="Next">→</button><button type="button" class="rc-back">${back}</button></div>`;
const wireNav = (s, prev, next, back) => {
  const j = cardList.indexOf(s);
  card.querySelector('.rc-back').onclick = back || unfocus;
  card.querySelector('.rc-prev').onclick = prev || (() => look(cardList[(j + cardList.length - 1) % cardList.length]));
  card.querySelector('.rc-next').onclick = next || (() => look(cardList[(j + 1) % cardList.length]));
};
const links = id => `<div class="rc-links"><a class="rc-go" href="${layersHref(id)}">See its layers <span aria-hidden="true">→</span></a><a class="rc-alt" href="projects.html?p=${id}">Case study</a></div>`;
const showCard = s => {
  card.style.setProperty('--c', s.c);
  card.innerHTML = `${topLine(s, s.label)}<h2 class="rc-title">${s.title}</h2><p class="rc-text">${s.text}</p>
    <dl class="rc-dl">${s.dl.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>${navRow()}
    ${s.project ? links(s.project) : s.href ? `<a class="rc-go" href="${s.href}">${s.cta} <span aria-hidden="true">→</span></a>` : ''}`;
  wireNav(s);
};
const drawerCard = () => {
  const s = SPOTS[0];
  if (false) {
    card.style.setProperty('--c', '#F4A6B8');
    card.innerHTML = `${topLine(s, 'Drawer · Phone')}<h2 class="rc-title">Lock screen</h2><p class="rc-text">The one who's always on my screen.</p>${navRow('Put it back')}`;
    wireNav(s, () => { phoneDown(); drawerCard(); }, () => { phoneDown(); drawerCard(); }, () => { phoneDown(); drawerCard(); });
    return;
  }
  if (chosen) {
    const p = chosen.userData.p, k = folders.indexOf(chosen);
    card.style.setProperty('--c', p.c);
    const a = ARCHIVE[p.id];
    card.innerHTML = `${topLine(s, 'Archive · ' + p.name)}<h2 class="rc-title">${a.title}</h2><p class="rc-text">${a.text}</p>
      <dl class="rc-dl"><div><dt>From</dt><dd>${p.name} · ${p.kind}</dd></div><div><dt>Inside</dt><dd>${a.count}</dd></div></dl>${navRow('All envelopes')}
      <a class="rc-go" href="projects.html?p=${p.id}">The finished case study <span aria-hidden="true">→</span></a>`;
    wireNav(s, () => choose(folders[(k + 2) % 3]), () => choose(folders[(k + 1) % 3]), () => choose(null));
    return;
  }
  card.style.setProperty('--c', s.c);
  card.innerHTML = `${topLine(s, 'Drawer')}<h2 class="rc-title">The archive</h2><p class="rc-text">What happened before the case studies: how the kuwaGO promo got better, what I cut from Cinematheque, and xpera before the code. Drag the envelopes around, or open one.</p>
    <div class="rc-files">${order.map(i => PROJ[i]).map(p => `<button type="button" data-f="${PROJ.indexOf(p)}" style="--fc:${p.c}"><i aria-hidden="true"></i><span><b>${p.name}</b><small class="mono">${ARCHIVE[p.id].kind} · ${ARCHIVE[p.id].count}</small></span><em aria-hidden="true">→</em></button>`).join('')}</div>${navRow()}`;
  card.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => choose(folders[+b.dataset.f])));
  wireNav(s);
};
const phoneCard = () => {
  card.style.setProperty('--c', '#F4A6B8');
  card.innerHTML = `<div class="rc-top mono"><span>Phone</span><span>On the desk</span></div><h2 class="rc-title">Lock screen</h2><p class="rc-text">The one who's always on my screen.</p>
    <div class="rc-nav rc-one"><button type="button" class="rc-back">Put it back</button></div>`;
  card.querySelector('.rc-back').onclick = () => { phoneDown(); };
};
const choose = f => {
  chosen = f; settleFolders(); drawerCard();
  if (!f) { drawerView(); return; }
  // lean in so the proofs can be read
  const c = drawer.localToWorld(V3(READ_AT.x, .02, READ_AT.z - .04)).add(V3(0, 0, DR.open - (drawer.position.z - DR.z)));
  const sx = wide() ? .1 : 0;
  camTo(V3(c.x + sx, c.y + .6, c.z + .34 + (wide() ? 0 : .14)), V3(c.x + sx, c.y - (wide() ? 0 : .06), c.z + .01), 1);
};
const boardCard = () => {
  const s = SPOTS[1];
  if (chosenNote) {
    const n = chosenNote.userData.n, k = notes.indexOf(chosenNote);
    card.style.setProperty('--c', n.c);
    card.innerHTML = `${topLine(s, 'Task board · ' + n.no)}<h2 class="rc-title">${n.t}</h2><p class="rc-text">${n.d.charAt(0).toUpperCase() + n.d.slice(1)}.</p>${navRow('All notes')}
      <a class="rc-go" href="index.html#${n.id}">Read it on the main page <span aria-hidden="true">→</span></a>`;
    wireNav(s, () => pickNote(notes[(k + 5) % 6]), () => pickNote(notes[(k + 1) % 6]), () => pickNote(null));
    return;
  }
  card.style.setProperty('--c', s.c);
  card.innerHTML = `${topLine(s, 'Task board')}<h2 class="rc-title">The task board</h2><p class="rc-text">One note for each part of the main page; pick one to jump straight to it. Drag any note or photo to move it around. The photos are cars, games and badminton, what I do off the clock.</p>
    <div class="rc-files">${TASKS.map((n, i) => `<button type="button" data-n="${i}" style="--fc:${n.c}"><i aria-hidden="true"></i><span><b>${n.no} · ${n.t}</b><small class="mono">${n.d}</small></span><em aria-hidden="true">→</em></button>`).join('')}</div>${navRow()}`;
  card.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => pickNote(notes[+b.dataset.n])));
  wireNav(s);
};
// picking a note brings the camera in close so it can be read; picking none goes back to the whole board
const noteView = n => {
  const p = new THREE.Vector3(); n.getWorldPosition(p);
  const sx = wide() ? .14 : 0, dy = wide() ? 0 : -.06;
  camTo(V3(p.x + sx, p.y + .16 + dy, p.z + .62), V3(p.x + sx, p.y + dy, p.z));
};
const pickNote = n => { chosenNote = n; settleNotes(); boardCard(); if (focus && focus.kind === 'board') n ? noteView(n) : boardView(); };

const openDesk = () => {
  // fly into the laptop screen, then the screen becomes a full desktop (js/os.js)
  const p = new THREE.Vector3(); lapScreen.getWorldPosition(p); const n = new THREE.Vector3(); lapScreen.getWorldDirection(n);
  roomEl.classList.add('desk-mode');
  const fade = document.querySelector('.r-fade');
  const show = () => { if (window.ndOS) window.ndOS.open(leaveDesk); };
  if (!G || !motion) { show(); return; }
  G.timeline()
    .to(cam, { px: p.x + n.x * .55, py: p.y + n.y * .55, pz: p.z + n.z * .55, lx: p.x, ly: p.y, lz: p.z, duration: .9, ease: 'power2.inOut', overwrite: true })
    .to(cam, { px: p.x + n.x * .14, py: p.y + n.y * .14, pz: p.z + n.z * .14, duration: .55, ease: 'power2.in' })
    .to(fade, { opacity: .9, duration: .3, ease: 'power1.in' }, '-=.25')
    .add(show)
    .to(fade, { opacity: 0, duration: .5, ease: 'power1.out' }, '+=.05');
};
// leaving the desktop: the camera pulls back out of the screen into the room
const leaveDesk = () => {
  roomEl.classList.remove('desk-mode');
  if (focus && focus.kind === 'desk') { focus = null; roomEl.classList.remove('focused'); hsEls.forEach(el => el.classList.remove('on')); }
  camTo(HOME.pos, HOME.look, 1.3);
};
const closeDesk = () => { if (window.ndOS && window.ndOS.isOpen) window.ndOS.exit(); roomEl.classList.remove('desk-mode'); };
// the laptop: the camera flies into the screen, and the screen becomes the landing page
const dive = () => {
  closeDesk(true);
  const p = new THREE.Vector3(); lapScreen.getWorldPosition(p); const n = new THREE.Vector3(); lapScreen.getWorldDirection(n);
  try { sessionStorage.setItem('nd-tx', JSON.stringify({ x: .5, y: .5, no: 'A-100', name: 'Nicho.dev' })); } catch {}
  roomEl.classList.add('diving');
  if (!G || !motion) { location.href = 'index.html'; return; }
  G.timeline({ onComplete: () => (location.href = 'index.html') })
    .to(cam, { px: p.x + n.x * .7, py: p.y + n.y * .7, pz: p.z + n.z * .7, lx: p.x, ly: p.y, lz: p.z, duration: 1, ease: 'power3.inOut', overwrite: true })
    .to(cam, { px: p.x + n.x * .1, py: p.y + n.y * .1, pz: p.z + n.z * .1, duration: .7, ease: 'power3.in' })
    .to('.r-fade', { opacity: 1, duration: .35, ease: 'power1.in' }, '-=.3');
};

const leaveFocus = was => {
  if (!was) return;
  if (was.blur) was.blur();
  if (was.kind === 'drawer') setDrawer(false);
  if (was.kind === 'board') { chosenNote = null; settleNotes(); }
  if (was.kind === 'phone' && phoneUp) phoneDown(true);
  if (was.kind === 'desk') closeDesk();
};
const look = s => {
  if (introRunning && introTl) introTl.progress(1);   // a click during the intro skips to the lit room
  if (s.kind === 'lamp') { toggleLamp(); return; }
  if (s.kind === 'switch') { toggleRoom(); return; }
  if (s.kind === 'dive') { dive(); return; }
  if (s.kind === 'desk') { if (focus !== s) leaveFocus(focus); focus = s; roomEl.classList.add('focused'); openDesk(); return; }
  if (s.kind === 'phone') { if (focus !== s) leaveFocus(focus); focus = s; roomEl.classList.add('focused'); phoneUpNow(); phoneCard(); return; }
  if (focus !== s) leaveFocus(focus);
  focus = s; roomEl.classList.add('focused');
  hsEls.forEach((el, i) => el.classList.toggle('on', SPOTS[i] === s));
  if (s.kind === 'drawer') { setDrawer(true); drawerView(); drawerCard(); }
  else if (s.kind === 'board') { boardView(); boardCard(); }
  else {
    const p = new THREE.Vector3(); s.obj.localToWorld(p.set(...s.at));
    const offset = new THREE.Vector3(...s.view);
    if (wide()) offset.x -= .12 * offset.z;
    camTo(p.clone().add(offset), p.clone().add(V3(wide() ? .1 * offset.z : 0, wide() ? 0 : -.06 * offset.z, 0)));
    showCard(s); s.focus && s.focus();
  }
  setTimeout(() => { const b = card.querySelector('.rc-go, .rc-files button'); b && b.focus({ preventScroll: true }); }, 700);
};
const unfocus = () => {
  if (!focus) return;
  const was = focus; leaveFocus(was);
  focus = null; roomEl.classList.remove('focused'); hsEls.forEach(el => el.classList.remove('on'));
  camTo(HOME.pos, HOME.look, 1.2);
  const i = SPOTS.indexOf(was); hsEls[i] && hsEls[i].focus({ preventScroll: true });
};
hsEls.forEach((el, i) => el.addEventListener('click', e => { e.stopPropagation(); look(SPOTS[i]); }));
addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !focus) return;
  if (focus.kind === 'phone' || focus.kind === 'desk') unfocus();
  else if (focus.kind === 'drawer' && chosen) choose(null);
  else if (focus.kind === 'board' && chosenNote) pickNote(null);
  else unfocus();
});

/* ---------- pointer: pick, hover and drag in 3D ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const spotObjs = SPOTS.map(s => s.obj).concat([drawer]);
const setRay = e => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
const owner = (o, list) => { while (o && !list.includes(o)) o = o.parent; return o; };
const hit = e => {
  setRay(e);
  if (drawerOpen) {
    const h = ray.intersectObjects(folders, true)[0];
    if (h) { const o = owner(h.object, folders); if (o) return { folder: o }; }
  }
  if (focus && focus.kind === 'board') {
    const h = ray.intersectObjects(pinned, true)[0];
    if (h) { const o = owner(h.object, pinned); return notes.includes(o) ? { note: o, pin: o } : { pin: o }; }
  }
  const h = ray.intersectObjects(spotObjs, true)[0]; if (!h) return null;
  const o = owner(h.object, spotObjs);
  if (o === drawer) return { spot: SPOTS[0] };
  const s = SPOTS.find(x => x.obj === o); return s ? { spot: s } : null;
};
// dragging a folder slides it along the drawer; the others make room
const dragPlane = new THREE.Plane(), dragHit = new THREE.Vector3(), local = new THREE.Vector3();
let downAt = null;
let pinDrag = null;
const boardPlane = new THREE.Plane();
canvas.addEventListener('pointerdown', e => {
  downAt = { x: e.clientX, y: e.clientY };
  const h = hit(e);
  if (h && h.pin) {   // a note or photo on the board: press and drag to move it
    pinDrag = { o: h.pin, moved: false, off: null }; try { canvas.setPointerCapture(e.pointerId); } catch {}
    const n = V3(0, 0, 1).applyQuaternion(board.getWorldQuaternion(new THREE.Quaternion())), wp = new THREE.Vector3(); board.getWorldPosition(wp);
    boardPlane.setFromNormalAndCoplanarPoint(n, wp.add(n.clone().multiplyScalar(.03)));
    G && G.killTweensOf(h.pin.position);
    return;
  }
  if (h && h.folder && focus && focus.kind === 'drawer') {
    dragging = h.folder; dragging.userData.moved = false; toTop(dragging); try { canvas.setPointerCapture(e.pointerId); } catch {}
    const wpos = new THREE.Vector3(); dragging.getWorldPosition(wpos);
    dragPlane.setFromNormalAndCoplanarPoint(V3(0, 1, 0), wpos);
    setRay(e); if (ray.ray.intersectPlane(dragPlane, dragHit)) { drawer.worldToLocal(local.copy(dragHit)); dragging.userData.grab = [dragging.position.x - local.x, dragging.position.z - local.z]; }
    G && G.killTweensOf(dragging.position);
  }
});
canvas.addEventListener('pointermove', e => {
  if (pinDrag) {
    if (!pinDrag.moved && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 5) return;
    setRay(e);
    if (ray.ray.intersectPlane(boardPlane, dragHit)) {
      board.worldToLocal(local.copy(dragHit));
      const o = pinDrag.o;
      if (!pinDrag.moved) { pinDrag.moved = true; pinDrag.off = [o.position.x - local.x, o.position.y - local.y]; document.body.classList.add('dragging'); tween(o.position, { z: .05, duration: .2 }); tween(o.scale, { x: 1.06, y: 1.06, z: 1, duration: .2 }); }
      const mx = BW / 2 - .1, my = BH / 2 - .08;
      o.position.x = Math.max(-mx, Math.min(mx, local.x + pinDrag.off[0])); o.position.y = Math.max(-my, Math.min(my, local.y + pinDrag.off[1]));
      if (notes.includes(o)) restring();
      shadowsDirty();
    }
    return;
  }
  if (dragging) {
    if (!dragging.userData.moved && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 5) return;
    dragging.userData.moved = true; document.body.classList.add('dragging');
    setRay(e);
    if (ray.ray.intersectPlane(dragPlane, dragHit)) {
      drawer.worldToLocal(local.copy(dragHit));
      const g = dragging.userData.grab || [0, 0], mx = (dW - .03) / 2 - EW / 2 - .01, mz0 = -dD / 2 + ED / 2 + .065, mz1 = dD / 2 - ED / 2 - .02;
      dragging.position.x = Math.max(-mx, Math.min(mx, local.x + g[0]));
      dragging.position.z = Math.max(mz0, Math.min(mz1, local.z + g[1]));
      dragging.position.y = .006 + .045; shadowsDirty();
    }
    return;
  }
  if (!fine) return;
  pendingHover = e;
});
let pendingHover = null;
const doHover = e => {
  const h = hit(e); document.body.classList.toggle('grabbing', !!h);
  const hf = h && h.folder ? h.folder : null;
  if (hf !== hoverFolder && drawerOpen) { hoverFolder = hf; settleFolders(); }
  const hn = h && h.note ? h.note : null;
  if (hn !== hoverNote && focus && focus.kind === 'board') { hoverNote = hn; settleNotes(); }
  hsEls.forEach((el, i) => el.classList.toggle('on', (h && SPOTS[i] === h.spot) || SPOTS[i] === focus));
};
const endDrag = e => {
  if (!dragging) return false;
  const moved = dragging.userData.moved, f = dragging;
  dragging = null; document.body.classList.remove('dragging');
  if (moved) {
    // it stays where it was dropped, landing with a slight new turn
    tween(f.rotation, { y: f.rotation.y + (Math.random() - .5) * .12, duration: .35, ease: 'power2.out' });
    // an open envelope that is dragged away closes and stays where it was dropped
    if (f === chosen) { f.userData.prev = null; choose(null); } else settleFolders();
    return true;
  }
  // on an open envelope, a click on a proof brings that proof to the front
  if (f === chosen && e) {
    setRay(e); const hp = ray.intersectObjects(f.userData.proofs, false)[0];
    if (hp) { const k = f.userData.proofs.indexOf(hp.object), o = f.userData.pord; o.splice(o.indexOf(k), 1); o.push(k); settleFolders(); return true; }
  }
  settleFolders();
  choose(f === chosen ? null : f); return true;
};
const endPin = () => {
  if (!pinDrag) return false;
  const { o, moved } = pinDrag; pinDrag = null;
  if (!moved) return false;   // a plain press: the click picks the note
  document.body.classList.remove('dragging');
  // pinned again where it was dropped, at a slightly new angle, like a real board
  const re = () => notes.includes(o) && restring();
  tween(o.position, { z: o === chosenNote ? .06 : o.userData.z, duration: .25, ease: 'power2.out', onUpdate: re });
  tween(o.scale, { x: 1, y: 1, z: 1, duration: .25 });
  tween(o.rotation, { z: (Math.random() - .5) * .22, duration: .3, ease: 'back.out(2)', onUpdate: re, onComplete: re });
  shadowsDirty();
  return true;
};
canvas.addEventListener('pointerup', e => { if (endPin() || endDrag(e)) downAt = null; });
canvas.addEventListener('click', e => {
  if (!downAt) return;   // a drag or a folder press already handled it
  const h = hit(e); downAt = null;
  if (h && h.note) { pickNote(h.note === chosenNote ? null : h.note); return; }
  if (h && h.spot && h.spot !== focus) look(h.spot);
  else if (!h && focus) unfocus();
});

/* ---------- loop ---------- */
const clock = new THREE.Clock();
let visible = true;
document.addEventListener('visibilitychange', () => (visible = !document.hidden));
const qs = { n: 0, sum: 0 };
const tune = avg => {
  if (avg > 1 / 40 && maxDpr > 1) { maxDpr = 1; renderer.setPixelRatio(1); resize(); }
  if (avg > 1 / 28) { renderer.shadowMap.enabled = false; scene.traverse(o => o.material && (o.material.needsUpdate = true)); }
};
let firstFrame = null;
const loop = () => { requestAnimationFrame(loop); if (visible) frame(); };
const frame = () => {
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  // the pointer is followed quickly; the camera itself glides after its target, so every move stays smooth
  const kp = 1 - Math.exp(-dt * 10), kc = 1 - Math.exp(-dt * 9);
  ptr.x += (ptr.tx - ptr.x) * kp; ptr.y += (ptr.ty - ptr.y) * kp;
  for (const key in view) view[key] += (cam[key] - view[key]) * kc;
  const drift = embed || dragging ? 0 : (focus ? .3 : 1);
  const sway = embed ? Math.sin(t * .25) * .12 : 0;
  camera.position.set(view.px + ptr.x * .18 * drift + sway, view.py - ptr.y * .09 * drift, view.pz);
  camera.lookAt(view.lx + ptr.x * .05 * drift + sway * .3, view.ly - ptr.y * .025 * drift, view.lz);
  if (pendingHover && !dragging) { doHover(pendingHover); pendingHover = null; }
  if (motion) {
    owl.userData.idle(t); cine.userData.idle(t); gpu.userData.idle(t, dt); keychain.userData.idle(t);
    const d = dustG.attributes.position;
    for (let i = 0; i < dustN; i++) { let y = d.getY(i) + dt * .012; if (y > DESK_Y + .65) y = DESK_Y; d.setY(i, y); d.setX(i, d.getX(i) + Math.sin(t + i) * dt * .003); }
    d.needsUpdate = true;
  }
  renderer.render(scene, camera);
  if (firstFrame) { const f = firstFrame; firstFrame = null; f(); }
  if (!embed) placeHots();
  if (!introRunning && qs.n < 90 && document.visibilityState === 'visible') { qs.n++; qs.sum += dt; if (qs.n === 90) tune(qs.sum / 90); }
};

/* ---------- start: the drawing fades into the room, then the lights come on ---------- */
const ready = () => roomEl.classList.add('ready');
const finishLoader = () => { setLoad(1); loader && loader.classList.add('done'); canvas.classList.add('on'); };
const start = () => {
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else addEventListener('resize', resize);
  const ON = { hemi: 1, win: 1, strip: 1, wash: 1, screen: 1, lamp: 1, lap: 1, ceil: 0 };
  if (!G || !motion || embed) {
    Object.assign(LK, ON); lightsTo(LK); dust.material.opacity = .55;
    firstFrame = () => { finishLoader(); ready(); renderer.shadowMap.autoUpdate = false; shadowsDirty(); };
    loop(); return;
  }
  introRunning = true;
  Object.assign(cam, { px: HOME.pos.x + .3, py: HOME.pos.y + .2, pz: HOME.pos.z + .8 }); Object.assign(view, cam);
  // the window glows first so the room is never fully black behind the drawing
  Object.assign(LK, { hemi: .35, win: .5 }); lightsTo(LK);
  firstFrame = () => {
    finishLoader();
    const tl = introTl = G.timeline({ delay: .2, onComplete: () => { introRunning = false; ready(); renderer.shadowMap.autoUpdate = false; shadowsDirty(); } });
    tl.to(LK, { hemi: 1, win: 1, duration: 1.2, ease: 'power2.out', onUpdate: () => lightsTo(LK) }, 0)
      .to(LK, { strip: 1, duration: .5, ease: 'steps(3)', onUpdate: () => lightsTo(LK) }, .6)
      .to(LK, { wash: 1, duration: 1.1, ease: 'power2.out', onUpdate: () => lightsTo(LK) }, .9)
      .to(LK, { screen: 1, lap: 1, duration: .8, ease: 'power2.out', onUpdate: () => lightsTo(LK) }, 1.2)
      .to(LK, { lamp: 1, duration: .25, ease: 'power4.in', onUpdate: () => lightsTo(LK) }, 1.7)
      .to(dust.material, { opacity: .55, duration: 1.5 }, 1.8)
      .to(cam, { px: HOME.pos.x, py: HOME.pos.y, pz: HOME.pos.z, duration: 3, ease: 'power3.inOut' }, 0);
  };
  loop();
};
const fontsReady = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('600 150px "IBM Plex Sans Condensed"'), document.fonts.load('500 20px "IBM Plex Mono"'), document.fonts.load('700 40px "Caveat"'), document.fonts.load('400 20px "IBM Plex Sans"')]).then(() => redraws.forEach(f => f())).catch(() => {}) : Promise.resolve();
// wait for the fonts and the textures (but never more than a few seconds)
let started = false;
const go = () => { if (started) return; started = true; start(); };
manager.onLoad = () => fontsReady.then(go);
setTimeout(go, 4000);

