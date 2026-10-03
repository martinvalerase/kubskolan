// Kubmotor: kubens modell + 3D-vy byggd med CSS-transformer (inga beroenden).
// Koordinater: x åt höger, y uppåt, z mot betraktaren. Gul upp, grön fram.

export const COLORS = {
  U: '#FFD500', D: '#FFFFFF', F: '#00A651', B: '#1565D8', R: '#FF7A00', L: '#E3172B',
};
const GRAY = '#80858f';
const SIZE = 100; // cubie-storlek i px innan skalning

const DIRS = { R: [1, 0, 0], L: [-1, 0, 0], U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1] };
const FACE_CSS = {
  F: 'translateZ(50px)', B: 'rotateY(180deg) translateZ(50px)',
  R: 'rotateY(90deg) translateZ(50px)', L: 'rotateY(-90deg) translateZ(50px)',
  U: 'rotateX(90deg) translateZ(50px)', D: 'rotateX(-90deg) translateZ(50px)',
};

// axel, vilka lager, riktning (kvartsvarv kring +axeln, högerhandsregeln)
const ALL = [-1, 0, 1];
const MOVES = {
  R: [0, [1], -1], L: [0, [-1], 1], M: [0, [0], 1],
  U: [1, [1], -1], D: [1, [-1], 1], E: [1, [0], 1],
  F: [2, [1], -1], B: [2, [-1], 1], S: [2, [0], -1],
  r: [0, [0, 1], -1], l: [0, [-1, 0], 1],
  u: [1, [0, 1], -1], d: [1, [-1, 0], 1],
  f: [2, [0, 1], -1], b: [2, [-1, 0], 1],
  x: [0, ALL, -1], y: [1, ALL, -1], z: [2, ALL, -1],
};

const ARROWS = {
  R: '↑', L: '↓', M: '↓', U: '←', D: '→', E: '→', F: '↻', B: '↺', S: '↻',
  r: '↑', l: '↓', u: '←', d: '→', f: '↻', b: '↺', x: '↑', y: '←', z: '↻',
};
const FLIP = { '↑': '↓', '↓': '↑', '←': '→', '→': '←', '↻': '↺', '↺': '↻' };
const NAMES = {
  R: 'Höger', L: 'Vänster', M: 'Mitten', U: 'Toppen', D: 'Botten', E: 'Mittenvåning',
  F: 'Framsidan', B: 'Baksidan', S: 'Mittskiva',
  r: 'Höger + mitten', l: 'Vänster + mitten', u: 'Toppen + mitten', d: 'Botten + mitten',
  f: 'Fram + mitten', b: 'Bak + mitten', x: 'Vänd hela kuben', y: 'Vrid hela kuben', z: 'Tippa hela kuben',
};

// ---------- Algoritmer ----------

export function parseAlg(str) {
  const out = [];
  const re = /([RLUDFBMESxyzrludfb])(w?)(\d?)('?)(\d?)/g;
  let m;
  while ((m = re.exec(str || ''))) {
    let base = m[1];
    if (m[2] && 'RLUDFB'.includes(base)) base = base.toLowerCase();
    let n = parseInt(m[3] || m[5] || '1', 10);
    if (m[4]) n = -n;
    n = ((n % 4) + 4) % 4;
    if (n === 0) continue;
    out.push(makeToken(base, n === 3 ? -1 : n));
  }
  return out;
}

function makeToken(base, amount) {
  return { base, amount, text: base + (amount === 2 ? '2' : amount === -1 ? "'" : '') };
}

export function invertAlg(tokens) {
  return tokens.slice().reverse().map(t => makeToken(t.base, t.amount === 2 ? 2 : -t.amount));
}

export function algToString(tokens) {
  return tokens.map(t => t.text).join(' ');
}

export function moveHint(t) {
  let arrow = ARROWS[t.base];
  if (t.amount === -1) arrow = FLIP[arrow];
  return { arrow: t.amount === 2 ? arrow + arrow : arrow, name: NAMES[t.base] + (t.amount === 2 ? ' två gånger' : '') };
}

export function randomScramble(len = 20) {
  const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
  const axis = { U: 1, D: 1, R: 0, L: 0, F: 2, B: 2 };
  const out = [];
  let last = null, prevAxis = null, prevPrevAxis = null;
  while (out.length < len) {
    const f = faces[Math.floor(Math.random() * 6)];
    if (f === last) continue;
    if (axis[f] === prevAxis && axis[f] === prevPrevAxis) continue;
    const amount = [1, -1, 2][Math.floor(Math.random() * 3)];
    out.push(makeToken(f, amount));
    prevPrevAxis = prevAxis; prevAxis = axis[f]; last = f;
  }
  return out;
}

// ---------- Matematik ----------

function rotVec(v, axis, q) {
  let [x, y, z] = v;
  q = ((q % 4) + 4) % 4;
  for (let i = 0; i < q; i++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [x, z] = [z, -x];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}

function rotMatrix(axis, a) {
  const c = Math.cos(a), s = Math.sin(a);
  if (axis === 0) return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axis === 1) return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

function mulMV(m, v) {
  return [0, 1, 2].map(i => m[i][0] * v[0] + m[i][1] * v[1] + m[i][2] * v[2]);
}

// ---------- Masker (vilka klistermärken som visas i färg) ----------

const kind = h => h.filter(v => v !== 0).length; // 1 mitt, 2 kant, 3 hörn
export const MASKS = {
  full: () => true,
  centers: h => kind(h) === 1,
  edges: h => kind(h) === 2,
  corners: h => kind(h) === 3,
  daisy: h => kind(h) === 1 || (kind(h) === 2 && h[1] === -1),
  cross: h => kind(h) === 1 || (kind(h) === 2 && h[1] === -1),
  firstLayer: h => kind(h) === 1 || h[1] === -1,
  f2l: h => kind(h) === 1 || h[1] <= 0,
  oll: (h, d) => kind(h) === 1 || h[1] <= 0 || d === 'U',
};

// ---------- Vy ----------

export class CubeView {
  constructor(host, { mask = 'full', pitch = -28, yaw = -38 } = {}) {
    this.host = host;
    this.mask = mask;
    this.defaultView = [pitch, yaw];
    this.pitch = pitch; this.yaw = yaw;
    this.queue = Promise.resolve();
    this.speed = 380;

    host.classList.add('cv-scene');
    host.innerHTML = '<div class="cv-cube"></div><div class="cv-move"></div>';
    this.cubeEl = host.querySelector('.cv-cube');
    this.moveEl = host.querySelector('.cv-move');

    this.cubies = [];
    for (const x of ALL) for (const y of ALL) for (const z of ALL) {
      if (!x && !y && !z) continue;
      const el = document.createElement('div');
      el.className = 'cv-cubie';
      const faces = {};
      for (const [name, css] of Object.entries(FACE_CSS)) {
        const f = document.createElement('div');
        f.className = 'cv-face';
        f.style.transform = css;
        el.appendChild(f);
        faces[name] = f;
      }
      this.cubeEl.appendChild(el);
      this.cubies.push({ el, faces, home: [x, y, z] });
    }
    this.reset();
    this.paint();
    this.setupDrag();
    this.resizeObs = new ResizeObserver(() => this.applyCamera());
    this.resizeObs.observe(host);
  }

  destroy() { this.resizeObs.disconnect(); this.dead = true; }

  reset() {
    for (const c of this.cubies) {
      c.pos = c.home.slice();
      c.cols = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    }
    this.render();
  }

  setMask(mask) { this.mask = mask; this.paint(); }

  paint() {
    const maskFn = MASKS[this.mask] || MASKS.full;
    for (const c of this.cubies) {
      for (const [name, d] of Object.entries(DIRS)) {
        const f = c.faces[name];
        const axis = d.findIndex(v => v !== 0);
        const outer = c.home[axis] === d[axis];
        f.classList.toggle('inner', !outer);
        if (outer) f.style.setProperty('--c', maskFn(c.home, name) ? COLORS[name] : GRAY);
      }
    }
  }

  applyTokens(tokens) {
    for (const t of tokens) this.applyModel(t);
    this.render();
  }

  applyModel(t) {
    const [axis, layers, dir] = MOVES[t.base];
    const q = dir * t.amount;
    for (const c of this.cubies) {
      if (!layers.includes(c.pos[axis])) continue;
      c.pos = rotVec(c.pos, axis, q);
      c.cols = c.cols.map(v => rotVec(v, axis, q));
    }
  }

  render(anim) {
    for (const c of this.cubies) {
      let cols = c.cols, pos = c.pos;
      if (anim && anim.layers.includes(c.pos[anim.axis])) {
        cols = cols.map(v => mulMV(anim.m, v));
        pos = mulMV(anim.m, pos);
      }
      // matematiska koordinater -> CSS (y nedåt): spegla y
      const s = [1, -1, 1];
      const m = [];
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) m.push(cols[j][i] * s[i] * s[j]);
      const t = pos.map((v, i) => v * SIZE * s[i]);
      c.el.style.transform =
        `matrix3d(${m[0]},${m[1]},${m[2]},0,${m[3]},${m[4]},${m[5]},0,${m[6]},${m[7]},${m[8]},0,${t[0]},${t[1]},${t[2]},1)`;
    }
  }

  // Lägger draget i kön och animerar det. Returnerar ett promise.
  animate(t, ms) {
    this.queue = this.queue.then(() => this.runAnim(t, ms ?? this.speed));
    return this.queue;
  }

  runAnim(t, ms) {
    if (this.dead) return Promise.resolve();
    const [axis, layers, dir] = MOVES[t.base];
    const target = dir * t.amount * Math.PI / 2;
    const dur = t.amount === 2 ? ms * 1.5 : ms;
    const hint = moveHint(t);
    this.moveEl.innerHTML = `<b>${t.text}</b><span>${hint.arrow}</span>`;
    this.moveEl.classList.add('show');
    return new Promise(resolve => {
      const start = performance.now();
      const step = now => {
        if (this.dead) return resolve();
        const p = Math.min(1, (now - start) / dur);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        if (p < 1) {
          this.render({ axis, layers, m: rotMatrix(axis, target * e) });
          requestAnimationFrame(step);
        } else {
          this.applyModel(t);
          this.render();
          this.moveEl.classList.remove('show');
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // Avbryter väntande drag (det pågående draget får avslutas).
  clearQueue() {
    const done = this.queue;
    this.queue = Promise.resolve();
    return done;
  }

  applyCamera() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    const k = Math.min(w, h) / 560;
    this.cubeEl.style.transform = `scale(${k}) rotateX(${this.pitch}deg) rotateY(${this.yaw}deg)`;
  }

  resetView() {
    [this.pitch, this.yaw] = this.defaultView;
    this.applyCamera();
  }

  setupDrag() {
    let last = null, lastTap = 0;
    this.host.addEventListener('pointerdown', e => {
      last = [e.clientX, e.clientY];
      this.host.setPointerCapture(e.pointerId);
      const now = Date.now();
      if (now - lastTap < 300) this.resetView();
      lastTap = now;
    });
    this.host.addEventListener('pointermove', e => {
      if (!last) return;
      this.yaw += (e.clientX - last[0]) * 0.5;
      this.pitch = Math.max(-85, Math.min(85, this.pitch - (e.clientY - last[1]) * 0.5));
      last = [e.clientX, e.clientY];
      this.applyCamera();
    });
    const end = () => { last = null; };
    this.host.addEventListener('pointerup', end);
    this.host.addEventListener('pointercancel', end);
  }
}
